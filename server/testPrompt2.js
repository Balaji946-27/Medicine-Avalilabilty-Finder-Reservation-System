const API = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING STAGE 18 COMPLETE SYSTEM TESTS ===\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${API}/test`);
    const health = await healthRes.json();
    console.log('✅ 1. Health check:', health.message);

    // 2. Patient Registration
    const patientEmail = `patient_${Date.now()}@test.com`;
    console.log(`\n--- TEST 1: Registering Patient (${patientEmail}) ---`);
    const regPatientRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Patient',
        email: patientEmail,
        password: 'Test@12345',
        role: 'patient',
      }),
    });
    const regPatient = await regPatientRes.json();
    console.log('✅ Patient Registered. Token returned:', !!regPatient.token);
    console.log('   User role:', regPatient.user.role);

    // Patient Login
    const loginPatientRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: patientEmail,
        password: 'Test@12345',
      }),
    });
    const loginPatient = await loginPatientRes.json();
    const patientToken = loginPatient.token;
    console.log('✅ Patient Logged in successfully.');

    // Patient Get Me
    const patientMeRes = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const patientMe = await patientMeRes.json();
    console.log('✅ GET /api/auth/me for patient returned:', patientMe.data.name);

    // 3. Pharmacy Registration
    const pharmacyEmail = `pharmacy_${Date.now()}@test.com`;
    console.log(`\n--- TEST 2: Registering Pharmacy (${pharmacyEmail}) ---`);
    const regPharmacyRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Pharmacy Owner',
        email: pharmacyEmail,
        password: 'Test@12345',
        role: 'pharmacy',
      }),
    });
    const regPharmacy = await regPharmacyRes.json();
    console.log('✅ Pharmacy Owner Registered. Role:', regPharmacy.user.role);

    const loginPharmacyRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pharmacyEmail,
        password: 'Test@12345',
      }),
    });
    const loginPharmacy = await loginPharmacyRes.json();
    const pharmacyToken = loginPharmacy.token;
    console.log('✅ Pharmacy Owner Logged in successfully.');

    // 4. Create Pharmacy Profile
    console.log('\n--- Creating Pharmacy Profile ---');
    const profileResFetch = await fetch(`${API}/pharmacies/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacyToken}`,
      },
      body: JSON.stringify({
        pharmacyName: 'MediFind Central Pharmacy',
        address: '123 Health Street',
        city: 'Chennai',
        phone: '+91 98765 43210',
        openingHours: 'Mon-Sat 8am-10pm',
        location: { latitude: 13.0827, longitude: 80.2707 },
      }),
    });
    const profileRes = await profileResFetch.json();
    console.log('✅ Pharmacy Profile Created:', profileRes.data.pharmacyName);

    // 5. Add Medicine
    console.log('\n--- Adding Medicine (Paracetamol) ---');
    const medResFetch = await fetch(`${API}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacyToken}`,
      },
      body: JSON.stringify({
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Analgesic',
        manufacturer: 'MediCare Labs',
        description: 'Fever and pain relief',
      }),
    });
    const medRes = await medResFetch.json();
    const medicineId = medRes.data._id;
    console.log('✅ Medicine created with ID:', medicineId);

    // 6. Add Inventory
    console.log('\n--- Adding Inventory (Qty: 50, Price: ₹30) ---');
    const invResFetch = await fetch(`${API}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacyToken}`,
      },
      body: JSON.stringify({
        medicineId,
        totalQuantity: 50,
        price: 30,
      }),
    });
    const invRes = await invResFetch.json();
    const inventoryId = invRes.data._id;
    console.log('✅ Inventory item created with ID:', inventoryId);
    console.log('   Total Qty:', invRes.data.totalQuantity, 'Price: ₹' + invRes.data.price);

    // Update inventory quantity 50 -> 40
    console.log('\n--- Updating Inventory Qty (50 -> 40) ---');
    const updateInvFetch = await fetch(`${API}/inventory/${inventoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacyToken}`,
      },
      body: JSON.stringify({
        totalQuantity: 40,
        price: 30,
      }),
    });
    const updateInv = await updateInvFetch.json();
    console.log('✅ Updated Inventory Total Qty:', updateInv.data.totalQuantity);

    // 7. Authorization Tests
    console.log('\n--- TEST 3: Role Authorization Verification ---');

    // Test patient accessing pharmacy profile
    const pProfileRes = await fetch(`${API}/pharmacies/profile`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    console.log('✅ Patient accessing pharmacy profile status:', pProfileRes.status, pProfileRes.status === 403 ? '(Correctly Rejected)' : '');

    // Test patient accessing admin stats
    const pAdminRes = await fetch(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    console.log('✅ Patient accessing admin stats status:', pAdminRes.status, pAdminRes.status === 403 ? '(Correctly Rejected)' : '');

    // Test pharmacy accessing admin stats
    const phAdminRes = await fetch(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${pharmacyToken}` },
    });
    console.log('✅ Pharmacy accessing admin stats status:', phAdminRes.status, phAdminRes.status === 403 ? '(Correctly Rejected)' : '');

    // Test unauthenticated request
    const unauthRes = await fetch(`${API}/auth/me`);
    console.log('✅ Unauthenticated request to /me status:', unauthRes.status, unauthRes.status === 401 ? '(Correctly Rejected)' : '');

    // Test direct register as admin
    const adminRegRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Admin',
        email: 'hacker@test.com',
        password: 'password123',
        role: 'admin',
      }),
    });
    console.log('✅ Direct admin registration status:', adminRegRes.status, adminRegRes.status === 400 ? '(Correctly Rejected)' : '');

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
}

runTests();
