/**
 * Sync Maintenance Data Script
 *
 * Fetches incomplete maintenance tasks from the API and writes them to
 * the static JSON file used by the public maintenance page.
 *
 * Usage: yarn sync:maintenance
 *
 * API fetches retry up to 3 times with backoff on transient 401/5xx/network errors.
 *
 * Authentication options (in order of preference):
 * 1. AWS credentials + Secrets Manager (recommended for CI/CD)
 *    - Requires: AWS credentials with secretsmanager:GetSecretValue permission
 *    - Secret: staubracing/cognito-credentials
 *
 * 2. Environment variables (for local development)
 *    - Requires: COGNITO_USERNAME and COGNITO_PASSWORD env vars
 */

import { Amplify } from 'aws-amplify';
import { signIn, fetchAuthSession } from '@aws-amplify/auth';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_URL = 'https://api.staubracing.com';
const MAINTENANCE_ENDPOINT = `${API_URL}/maintenance`;
const BIKES_ENDPOINT = `${API_URL}/bikes/me`;
const OUTPUT_FILE = join(__dirname, '../src/data/maintenance.json');
const SECRET_NAME = 'staubracing/cognito-credentials';
const COGNITO_USER_POOL_ID = 'us-east-1_Ea3Vj7Klq';
const COGNITO_CLIENT_ID = '5gb5iivvi7e38q49iuu0js2kj5';

// Cognito config (same as src/services/auth.ts)
const COGNITO_CONFIG = {
  Auth: {
    Cognito: {
      userPoolId: COGNITO_USER_POOL_ID,
      userPoolClientId: COGNITO_CLIENT_ID,
      loginWith: {
        username: true,
      },
    },
  },
};

interface Bike {
  id: string;
  make: string;
  model: string;
  year: number;
}

interface DbTask {
  id: string;
  bike_id: string | null;
  title: string;
  priority: string;
  notes: string | null;
  completed: boolean;
}

interface JsonTask {
  id: string;
  bike: string;
  task: string;
  priority: string;
  notes: string;
}

interface MaintenanceJson {
  lastUpdated: string;
  items: JsonTask[];
}

/**
 * Generate a kebab-case ID from bike name and task title
 */
function generateId(bikeName: string, title: string): string {
  const normalizedBike = bikeName.toLowerCase().replace(/\s+/g, '-');
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, '-');
  return `${normalizedBike}-${normalizedTitle}`;
}

/**
 * Get friendly bike name from bike ID
 */
function getBikeName(bikeId: string | null, bikeMap: Map<string, string>): string {
  if (!bikeId) return 'General';
  return bikeMap.get(bikeId) || 'Unknown';
}

/**
 * Authenticate with Cognito and return JWT token
 */
async function authenticateWithCognito(username: string, password: string): Promise<string> {
  Amplify.configure(COGNITO_CONFIG);

  try {
    await signIn({ username, password });
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error('No ID token in session');
    }

    return token;
  } catch (error) {
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get credentials from AWS Secrets Manager
 */
async function getCredentialsFromSecretsManager(): Promise<{ username: string; password: string } | null> {
  try {
    const client = new SecretsManagerClient({ region: 'us-east-1' });
    const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
    const response = await client.send(command);

    if (response.SecretString) {
      const secret = JSON.parse(response.SecretString);
      if (secret.username && secret.password) {
        return { username: secret.username, password: secret.password };
      }
    }
    return null;
  } catch {
    // Secret doesn't exist or no AWS credentials - return null to trigger fallback
    return null;
  }
}

/**
 * Get credentials from environment or Secrets Manager
 */
async function getCredentials(): Promise<{ username: string; password: string }> {
  // Try Secrets Manager first (for CI/CD with AWS credentials)
  const secretCredentials = await getCredentialsFromSecretsManager();
  if (secretCredentials) {
    return secretCredentials;
  }

  // Fall back to environment variables (for local development)
  const username = process.env.COGNITO_USERNAME;
  const password = process.env.COGNITO_PASSWORD;

  if (!username || !password) {
    console.error('Error: No credentials available.');
    console.error('');
    console.error('For CI/CD: Ensure AWS credentials are configured and secret exists:');
    console.error(`  aws secretsmanager create-secret --name ${SECRET_NAME} --secret-string '{"username":"...","password":"..."}'`);
    console.error('');
    console.error('For local dev: Set environment variables:');
    console.error('  COGNITO_USERNAME=xxx COGNITO_PASSWORD=xxx yarn sync:maintenance');
    process.exit(1);
  }

  return { username, password };
}

const MAX_FETCH_ATTEMPTS = 3;
const RETRYABLE_STATUS_CODES = new Set([401, 408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('401') ||
    message.includes('408') ||
    message.includes('425') ||
    message.includes('429') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('socket')
  );
}

/**
 * Fetch JSON from the API with retries for transient auth/network/server errors.
 */
async function fetchJsonWithRetry<T>(url: string, token: string, label: string): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = new Error(`Failed to fetch ${label}: ${response.status} ${response.statusText}`);
        if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === MAX_FETCH_ATTEMPTS) {
          throw error;
        }

        const delayMs = attempt * 2000;
        console.warn(`   ⚠️  ${error.message} — retrying in ${delayMs / 1000}s (${attempt}/${MAX_FETCH_ATTEMPTS})`);
        await sleep(delayMs);
        lastError = error;
        continue;
      }

      return (await response.json()) as T;
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      lastError = normalized;

      if (!isRetryableError(normalized) || attempt === MAX_FETCH_ATTEMPTS) {
        throw normalized;
      }

      const delayMs = attempt * 2000;
      console.warn(`   ⚠️  ${normalized.message} — retrying in ${delayMs / 1000}s (${attempt}/${MAX_FETCH_ATTEMPTS})`);
      await sleep(delayMs);
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${label} after ${MAX_FETCH_ATTEMPTS} attempts`);
}

/**
 * Fetch bikes from API and return ID → name mapping
 */
async function fetchBikes(token: string): Promise<Map<string, string>> {
  const bikes = await fetchJsonWithRetry<Bike[]>(BIKES_ENDPOINT, token, 'bikes');
  const bikeMap = new Map<string, string>();

  for (const bike of bikes) {
    bikeMap.set(bike.id, `${bike.make} ${bike.model}`);
  }

  return bikeMap;
}

/**
 * Fetch incomplete maintenance tasks from API
 */
async function fetchTasks(token: string): Promise<DbTask[]> {
  const tasks = await fetchJsonWithRetry<DbTask[]>(MAINTENANCE_ENDPOINT, token, 'tasks');

  // Filter out completed tasks - public page only shows pending work
  return tasks.filter(task => !task.completed);
}

/**
 * Transform database tasks to JSON format
 */
function transformTasks(tasks: DbTask[], bikeMap: Map<string, string>): JsonTask[] {
  return tasks.map(task => {
    const bikeName = getBikeName(task.bike_id, bikeMap);
    return {
      id: generateId(bikeName, task.title),
      bike: bikeName,
      task: task.title,
      priority: task.priority,
      notes: task.notes || '',
    };
  });
}

/**
 * Write maintenance data to JSON file
 */
function writeMaintenanceFile(items: JsonTask[]): void {
  const data: MaintenanceJson = {
    lastUpdated: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    items,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log('🔐 Getting credentials...');
  const { username, password } = await getCredentials();

  console.log('🔑 Authenticating with Cognito...');
  const token = await authenticateWithCognito(username, password);
  console.log('✅ Authenticated successfully');

  console.log('🏍️  Fetching bikes...');
  const bikeMap = await fetchBikes(token);
  console.log(`   Found ${bikeMap.size} bikes`);

  console.log('📋 Fetching maintenance tasks...');
  const tasks = await fetchTasks(token);
  console.log(`   Found ${tasks.length} incomplete tasks`);

  console.log('🔄 Transforming data...');
  const items = transformTasks(tasks, bikeMap);

  console.log('💾 Writing to maintenance.json...');
  writeMaintenanceFile(items);

  console.log(`✅ Sync complete! Wrote ${items.length} tasks to ${OUTPUT_FILE}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
});
