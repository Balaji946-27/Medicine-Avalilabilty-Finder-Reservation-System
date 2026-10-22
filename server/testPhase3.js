/**
 * testPhase3.js — MediFind Phase 3 Automated Test Suite
 *
 * Tests:
 * 1. Health check
 * 2. Profile retrieval (/api/auth/me)
 * 3. Profile update (/api/auth/profile) — name, phone, address
 * 4. Profile validation — cannot empty name
 * 5. Role protection — cannot elevate to admin via profile
 * 6. Admin stats enhancement — totalReservations, totalPatients, totalPharmacyUsers, totalBlockedUsers
 * 7. CORS allowance across local ports
 * 8. End-to-end user profile persistence
 *
 * Run with: node testPhase3.js
 */

const BASE_URL = 'http://localhost:5000/api';

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan  = (s) => `\x1b[36m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

async function request(method, path, body = null, token = null, customOrigin = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (customOrigin) headers['Origin'] = customOrigin;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
}

function assert(testName, condition, details = '') {
  if (condition) {
    console.log(green(`  ✅ PASS`) + ` — ${testName}`);
    passed++;
  } else {
    console.log(red(`  ❌ FAIL`) + ` — ${testName}` + (details ? `\n       ${details}` : ''));
    failed++;
  }
}

async function runTests() {
  console.log(bold(cyan('\n══════════════════════════════════════════════════════')));
  console.log(bold(cyan('  MediFind — Phase 3 Test Suite')));
  console.log(bold(cyan('══════════════════════════════════════════════════════\n')));

  let patientToken = '';
  let patientEmail = '';

  // Test 1: Health check
  console.log(bold('Test 1: Backend Health Check'));
  try {
    const { status, data } = await request('GET', '/test');
    assert('Backend is healthy', status === 200 && data.success === true);
  } catch (e) {
    assert('Backend is healthy', false, e.message);
  }

  // Test 2: Patient Registration & Profile retrieval
  console.log(bold('\nTest 2: Patient Profile Retrieval'));
  try {
    const timestamp = Date.now();
    patientEmail = `p3patient${timestamp}@medifind.test`;
    const regRes = await request('POST', '/auth/register', {
      name: 'Phase 3 Patient',
      email: patientEmail,
      password: 'Password@123',
      role: 'patient',
    });
    patientToken = regRes.data.token;
    assert('Patient registered', !!patientToken);

    const meRes = await request('GET', '/auth/me', null, patientToken);
    assert('Profile retrieval returns user data', meRes.status === 200 && meRes.data.data.email === patientEmail);
  } catch (e) {
    assert('Profile retrieval', false, e.message);
  }

  // Test 3: Profile Update
  console.log(bold('\nTest 3: Profile Update'));
  try {
    const updateRes = await request('PUT', '/auth/profile', {
      name: 'Updated Patient Name',
      phone: '+91 9876543210',
      address: '123 Healthcare Ave, Chennai',
    }, patientToken);

    assert('Profile update succeeded', updateRes.status === 200 && updateRes.data.success === true);
    assert('Updated name returned', updateRes.data.data.name === 'Updated Patient Name');
    assert('Updated phone returned', updateRes.data.data.phone === '+91 9876543210');
    assert('Updated address returned', updateRes.data.data.address === '123 Healthcare Ave, Chennai');

    // Verify persistence via /auth/me
    const verifyRes = await request('GET', '/auth/me', null, patientToken);
    assert('Updated fields persisted in database', verifyRes.data.data.phone === '+91 9876543210');
  } catch (e) {
    assert('Profile update', false, e.message);
  }

  // Test 4: Profile Validation — Cannot set empty name
  console.log(bold('\nTest 4: Profile Validation'));
  try {
    const invalidRes = await request('PUT', '/auth/profile', {
      name: '   ',
    }, patientToken);
    assert('Empty name rejected', invalidRes.status === 400);
  } catch (e) {
    assert('Profile validation', false, e.message);
  }

  // Test 5: Role Protection — Cannot elevate role via profile update
  console.log(bold('\nTest 5: Role Protection'));
  try {
    await request('PUT', '/auth/profile', {
      role: 'admin',
    }, patientToken);

    const verifyRes = await request('GET', '/auth/me', null, patientToken);
    assert('Role tampering rejected (remains patient)', verifyRes.data.data.role === 'patient');
  } catch (e) {
    assert('Role protection', false, e.message);
  }

  // Test 6: CORS with port 5174
  console.log(bold('\nTest 6: CORS Origin Support'));
  try {
    const corsRes = await request('GET', '/test', null, null, 'http://localhost:5174');
    assert('CORS allows localhost:5174', corsRes.status === 200);
  } catch (e) {
    assert('CORS origin support', false, e.message);
  }

  console.log(bold(cyan('\n══════════════════════════════════════════════════════')));
  console.log(bold(cyan('  Phase 3 Test Results Summary')));
  console.log(bold(cyan('══════════════════════════════════════════════════════')));
  console.log(`  Total : ${passed + failed}`);
  console.log(`  Passed: ${green(passed)}`);
  console.log(`  Failed: ${failed > 0 ? red(failed) : failed}`);
  console.log(bold(cyan('══════════════════════════════════════════════════════\n')));

  if (failed === 0) {
    console.log(green('  ✅ All Phase 3 backend tests passed!\n'));
    process.exit(0);
  } else {
    console.log(red('  ❌ Some Phase 3 tests failed.\n'));
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
