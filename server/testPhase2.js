/**
 * testPhase2.js — MediFind Phase 2 Automated Test Suite
 *
 * Tests: Location-based pharmacy discovery + reservation system
 *
 * Run with: node testPhase2.js
 * Requires backend running on http://localhost:5000
 */

const BASE_URL = 'http://localhost:5000/api';

// ── Colours ────────────────────────────────────────────────────────────────────
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan  = (s) => `\x1b[36m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;
const results = [];

// ── HTTP helpers ───────────────────────────────────────────────────────────────
async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function assert(testName, condition, details = '') {
  if (condition) {
    console.log(green(`  ✅ PASS`) + ` — ${testName}`);
    passed++;
    results.push({ test: testName, status: 'PASS' });
  } else {
    console.log(red(`  ❌ FAIL`) + ` — ${testName}` + (details ? `\n       ${details}` : ''));
    failed++;
    results.push({ test: testName, status: 'FAIL', details });
  }
}

// ── Shared test state ──────────────────────────────────────────────────────────
let patientToken = '';
let pharmacyToken = '';
let pharmacyId = '';
let medicineId = '';
let inventoryId = '';
let reservationId = '';

// ──────────────────────────────────────────────────────────────────────────────
async function runTests() {
  console.log(bold(cyan('\n══════════════════════════════════════════════════════')));
  console.log(bold(cyan('  MediFind — Phase 2 Test Suite')));
  console.log(bold(cyan('══════════════════════════════════════════════════════\n')));

  // ── Test 1: Backend health check ────────────────────────────────────────────
  console.log(bold('\nTest 1: Backend Health Check'));
  try {
    const { status, data } = await request('GET', '/../api/test');
    assert('Backend responds to /api/test', data.success === true);
  } catch (e) {
    assert('Backend responds to /api/test', false, e.message);
  }

  // ── Test 2: Patient authentication ──────────────────────────────────────────
  console.log(bold('\nTest 2: Patient Authentication'));
  try {
    const timestamp = Date.now();
    const registerRes = await request('POST', '/auth/register', {
      name: `Test Patient ${timestamp}`,
      email: `testpatient${timestamp}@medifind.test`,
      password: 'Test@1234',
      role: 'patient',
    });
    const loginRes = await request('POST', '/auth/login', {
      email: `testpatient${timestamp}@medifind.test`,
      password: 'Test@1234',
    });
    patientToken = loginRes.data.token;
    assert('Patient registers and logs in', !!patientToken);
    assert('Patient token is a string', typeof patientToken === 'string');
  } catch (e) {
    assert('Patient authentication', false, e.message);
  }

  // ── Test 3: Pharmacy authentication ─────────────────────────────────────────
  console.log(bold('\nTest 3: Pharmacy Authentication'));
  try {
    const timestamp = Date.now();
    const email = `testpharmacy${timestamp}@medifind.test`;
    await request('POST', '/auth/register', {
      name: `Test Pharmacy ${timestamp}`,
      email,
      password: 'Pharma@1234',
      role: 'pharmacy',
    });
    const loginRes = await request('POST', '/auth/login', { email, password: 'Pharma@1234' });
    pharmacyToken = loginRes.data.token;
    assert('Pharmacy registers and logs in', !!pharmacyToken);
  } catch (e) {
    assert('Pharmacy authentication', false, e.message);
  }

  // ── Test 4: Pharmacy creates profile with coordinates ────────────────────────
  console.log(bold('\nTest 4: Pharmacy Coordinates'));
  try {
    const res = await request('POST', '/pharmacies/profile', {
      pharmacyName: 'Phase2 Test Pharmacy',
      address: '123 Test Street',
      city: 'Chennai',
      phone: '+91 9876543210',
      openingHours: 'Mon-Sat: 9AM-9PM',
      location: { latitude: 13.0827, longitude: 80.2707 },
    }, pharmacyToken);

    pharmacyId = res.data?.data?._id;
    assert('Pharmacy profile created with coordinates', res.status === 201 || res.status === 200);
    assert('Pharmacy has latitude', res.data?.data?.location?.latitude === 13.0827);
    assert('Pharmacy has longitude', res.data?.data?.location?.longitude === 80.2707);
  } catch (e) {
    assert('Pharmacy coordinates', false, e.message);
  }

  // ── Test 5: Medicine availability check ─────────────────────────────────────
  console.log(bold('\nTest 5: Medicine Availability'));
  try {
    // Get a medicine from the system or create one via admin
    const medsRes = await request('GET', '/medicines?search=Paracetamol');
    let med = medsRes.data?.data?.[0];

    if (!med) {
      // Create a test medicine (admin flow would normally do this)
      console.log('  ℹ️  No existing medicines found — creating test medicine');
      const adminLogin = await request('POST', '/auth/login', {
        email: 'admin@medifind.com',
        password: 'Admin@1234',
      });
      if (adminLogin.data?.token) {
        const createMed = await request('POST', '/medicines', {
          name: 'Phase2 Paracetamol',
          genericName: 'Acetaminophen',
          manufacturer: 'TestPharma',
          category: 'Analgesic',
        }, adminLogin.data.token);
        med = createMed.data?.data;
      }
    }

    if (med) {
      medicineId = med._id;
      assert('Medicine found in system', !!medicineId);

      // Add inventory for the pharmacy
      if (pharmacyToken && pharmacyId) {
        const invRes = await request('POST', '/inventory', {
          medicineId,
          totalQuantity: 50,
          price: 25,
        }, pharmacyToken);

        inventoryId = invRes.data?.data?._id;
        assert('Pharmacy can add inventory', invRes.status === 200 || invRes.status === 201);
        assert('Inventory item created', !!inventoryId);
      }

      const availRes = await request('GET', `/medicines/${medicineId}/availability`);
      assert('Medicine availability endpoint works', availRes.data.success === true);
      assert('Availability response has pharmacies array', Array.isArray(availRes.data.pharmacies));
    } else {
      assert('Medicine exists in system', false, 'No medicine found and could not create one — run as admin');
    }
  } catch (e) {
    assert('Medicine availability', false, e.message);
  }

  // ── Test 6: Patient creates a valid reservation ──────────────────────────────
  console.log(bold('\nTest 6: Reservation Creation'));
  if (!inventoryId || !patientToken) {
    console.log('  ⚠️  Skipping — no inventoryId or patientToken available');
  } else {
    try {
      const res = await request('POST', '/reservations', {
        inventoryId,
        quantity: 3,
      }, patientToken);

      reservationId = res.data?.data?._id;
      assert('Reservation created successfully', res.status === 201);
      assert('Reservation has status=pending', res.data?.data?.status === 'pending');
      assert('Reservation has correct quantity', res.data?.data?.quantity === 3);
      assert('Reservation ID returned', !!reservationId);
    } catch (e) {
      assert('Reservation creation', false, e.message);
    }
  }

  // ── Test 7: Invalid reservation — zero quantity ──────────────────────────────
  console.log(bold('\nTest 7: Invalid Reservation Quantity'));
  if (!inventoryId || !patientToken) {
    console.log('  ⚠️  Skipping — no inventoryId or patientToken available');
  } else {
    try {
      const res = await request('POST', '/reservations', {
        inventoryId,
        quantity: 0,
      }, patientToken);
      assert('Zero quantity rejected', res.status === 400);
    } catch (e) {
      assert('Zero quantity rejection', false, e.message);
    }
  }

  // ── Test 8: Insufficient stock ───────────────────────────────────────────────
  console.log(bold('\nTest 8: Insufficient Stock Validation'));
  if (!inventoryId || !patientToken) {
    console.log('  ⚠️  Skipping — no inventoryId or patientToken available');
  } else {
    try {
      const res = await request('POST', '/reservations', {
        inventoryId,
        quantity: 9999,
      }, patientToken);
      assert('Excessive quantity rejected (stock check)', res.status === 400);
    } catch (e) {
      assert('Excessive quantity rejection', false, e.message);
    }
  }

  // ── Test 9: Patient retrieves their reservations ─────────────────────────────
  console.log(bold('\nTest 9: Patient Reservation Retrieval'));
  if (!patientToken) {
    console.log('  ⚠️  Skipping — no patientToken available');
  } else {
    try {
      const res = await request('GET', '/reservations/my', null, patientToken);
      assert('Patient can retrieve own reservations', res.status === 200);
      assert('Response is array', Array.isArray(res.data?.data));
    } catch (e) {
      assert('Patient reservation retrieval', false, e.message);
    }
  }

  // ── Test 10: Pharmacy retrieves incoming reservations ────────────────────────
  console.log(bold('\nTest 10: Pharmacy Reservation Retrieval'));
  if (!pharmacyToken) {
    console.log('  ⚠️  Skipping — no pharmacyToken available');
  } else {
    try {
      const res = await request('GET', '/reservations/pharmacy', null, pharmacyToken);
      assert('Pharmacy can retrieve incoming reservations', res.status === 200);
      assert('Response is array', Array.isArray(res.data?.data));
    } catch (e) {
      assert('Pharmacy reservation retrieval', false, e.message);
    }
  }

  // ── Test 11: Pharmacy confirms reservation ───────────────────────────────────
  console.log(bold('\nTest 11: Pharmacy Confirms Reservation'));
  if (!reservationId || !pharmacyToken) {
    console.log('  ⚠️  Skipping — no reservation or pharmacy token available');
  } else {
    try {
      const res = await request('PATCH', `/reservations/${reservationId}/confirm`, null, pharmacyToken);
      assert('Pharmacy can confirm reservation', res.status === 200);
      assert('Status changed to confirmed', res.data?.data?.status === 'confirmed');
    } catch (e) {
      assert('Pharmacy confirmation', false, e.message);
    }
  }

  // ── Test 12: Create another reservation for reject/cancel tests ──────────────
  console.log(bold('\nTest 12: Pharmacy Rejects Reservation'));
  if (!inventoryId || !patientToken || !pharmacyToken) {
    console.log('  ⚠️  Skipping — no inventory/tokens available');
  } else {
    try {
      const createRes = await request('POST', '/reservations', {
        inventoryId,
        quantity: 2,
      }, patientToken);
      const newReservationId = createRes.data?.data?._id;
      assert('New reservation created for rejection test', !!newReservationId);

      if (newReservationId) {
        const rejectRes = await request('PATCH', `/reservations/${newReservationId}/reject`, null, pharmacyToken);
        assert('Pharmacy can reject reservation', rejectRes.status === 200);
        assert('Status changed to rejected', rejectRes.data?.data?.status === 'rejected');
      }
    } catch (e) {
      assert('Pharmacy rejection', false, e.message);
    }
  }

  // ── Test 13: Patient cancels a reservation ───────────────────────────────────
  console.log(bold('\nTest 13: Patient Cancellation'));
  if (!inventoryId || !patientToken) {
    console.log('  ⚠️  Skipping — no inventory/patient token available');
  } else {
    try {
      const createRes = await request('POST', '/reservations', {
        inventoryId,
        quantity: 1,
      }, patientToken);
      const cancelReservationId = createRes.data?.data?._id;
      assert('New reservation created for cancel test', !!cancelReservationId);

      if (cancelReservationId) {
        const cancelRes = await request('PATCH', `/reservations/${cancelReservationId}/cancel`, null, patientToken);
        assert('Patient can cancel reservation', cancelRes.status === 200);
        assert('Status changed to cancelled', cancelRes.data?.data?.status === 'cancelled');
      }
    } catch (e) {
      assert('Patient cancellation', false, e.message);
    }
  }

  // ── Test 14: Unauthorized access ─────────────────────────────────────────────
  console.log(bold('\nTest 14: Unauthorized Access'));
  if (!reservationId || !pharmacyToken) {
    console.log('  ⚠️  Skipping — no reservation or pharmacy token');
  } else {
    try {
      // Pharmacy should NOT be able to cancel patient reservations
      const res = await request('PATCH', `/reservations/${reservationId}/cancel`, null, pharmacyToken);
      assert('Pharmacy cannot cancel patient reservation', res.status === 403);
    } catch (e) {
      assert('Unauthorized access blocked', false, e.message);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log(bold(cyan('\n══════════════════════════════════════════════════════')));
  console.log(bold('  Test Results Summary'));
  console.log(bold(cyan('══════════════════════════════════════════════════════')));
  console.log(`  Total : ${passed + failed}`);
  console.log(green(`  Passed: ${passed}`));
  console.log(red(`  Failed: ${failed}`));
  console.log(bold(cyan('══════════════════════════════════════════════════════\n')));

  if (failed > 0) {
    console.log(red('  ❌ Some tests failed. Check output above.\n'));
  } else {
    console.log(green('  ✅ All tests passed!\n'));
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(red('\nFatal test error:'), err.message);
  process.exit(1);
});
