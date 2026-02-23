import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  fetchAuthSession,
  getCurrentUser,
} from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';

/**
 * Configure Cognito authentication.
 * Must be called once before any auth operations.
 */
export function configureAuth(): void {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: 'us-east-1_Ea3Vj7Klq',
        userPoolClientId: '5gb5iivvi7e38q49iuu0js2kj5',
        loginWith: {
          username: true,
        },
      },
    },
  });
}

/**
 * Sign in a user with username and password.
 * @throws Cognito error if credentials are invalid
 */
export async function signIn(username: string, password: string): Promise<void> {
  await amplifySignIn({ username, password });
}

/**
 * Get the current JWT ID token for API authorization.
 * Returns null if no valid session exists.
 */
export async function getJwtToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if a user is currently authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Sign out the current user and clear the session.
 */
export async function signOut(): Promise<void> {
  await amplifySignOut();
}
