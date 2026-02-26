import { Amplify } from 'aws-amplify';
import { signIn, fetchAuthSession } from '@aws-amplify/auth';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const API_URL = 'https://api.staubracing.com/maintenance';
const COGNITO_CONFIG = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_Ea3Vj7Klq',
      userPoolClientId: '5gb5iivvi7e38q49iuu0js2kj5',
      loginWith: { username: true },
    },
  },
};

async function getToken() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(new GetSecretValueCommand({ SecretId: 'staubracing/cognito-credentials' }));
  const secret = JSON.parse(response.SecretString!);

  Amplify.configure(COGNITO_CONFIG);
  await signIn({ username: secret.username, password: secret.password });
  const session = await fetchAuthSession();
  return session.tokens!.idToken!.toString();
}

async function test() {
  console.log('🔐 Getting auth token...');
  const token = await getToken();
  console.log('✅ Authenticated\n');

  // 1. Create a test task
  console.log('📝 Creating test task...');
  const createRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'TEST TASK - DELETE ME', priority: 'low', notes: 'This is a test' })
  });

  if (!createRes.ok) {
    throw new Error(`Create failed: ${createRes.status}`);
  }
  const created = await createRes.json();
  console.log(`   Created task: ${created.id}\n`);

  // 2. Update the task
  console.log('✏️  Updating test task...');
  const updateRes = await fetch(`${API_URL}/${created.id}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'TEST TASK - UPDATED', priority: 'high' })
  });

  if (!updateRes.ok) {
    throw new Error(`Update failed: ${updateRes.status}`);
  }
  const updated = await updateRes.json();
  console.log(`   Updated title: "${updated.title}"`);
  console.log(`   Updated priority: "${updated.priority}"\n`);

  // 3. Delete the task
  console.log('🗑️  Deleting test task...');
  const deleteRes = await fetch(`${API_URL}/${created.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!deleteRes.ok) {
    throw new Error(`Delete failed: ${deleteRes.status}`);
  }
  console.log(`   Delete status: ${deleteRes.status} ${deleteRes.statusText}\n`);

  // 4. Verify it's gone
  console.log('🔍 Verifying deletion...');
  const verifyRes = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
  const tasks = await verifyRes.json();
  const stillExists = tasks.some((t: any) => t.id === created.id);

  if (stillExists) {
    throw new Error('Task still exists after delete!');
  }

  console.log('   Task confirmed deleted\n');
  console.log('✅ All API tests passed!');
}

test().catch(e => {
  console.error('\n❌ Test failed:', e.message);
  process.exit(1);
});
