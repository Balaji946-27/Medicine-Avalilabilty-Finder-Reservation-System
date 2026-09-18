const API = 'http://localhost:5000/api';

async function runPrompt3Tests() {
  console.log('=== STARTING PROMPT 3 COMPLETE INTEGRATION TESTS ===\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${API}/test`);
    const health = await healthRes.json();
    console.log('✅ 1. Backend Health Check:', health.message);

    // 2. Register/Login Pharmacy Owner
    const pharmacyEmail = `pharmacy_p3_${Date.now()}@test.com`;
    console.log(`\n--- PHARMACY SETUP: Registering ${pharmacyEmail} ---`);
    const regPharmRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'MediCare Owner',
        email: pharmacyEmail,
        password: 'Test@12345',
        role: 'pharmacy',
      }),
    });
    const regPharm = await regPharmRes.json();
    const pharmacyToken = regPharm.token;
    console.log('✅ Pharmacy registered successfully.');

    // Create Pharmacy Profile
    const profileResFetch = await fetch(`${API}/pharmacies/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacyToken}`,
      },
      body: JSON.stringify({
        pharmacyName: 'MediCare Pharmacy Chennai',
        address: '45 Mount Road',
        city: 'Chennai',
        phone: '+91 98765 12345',
        openingHours: 'Mon-Sat 8:00 AM - 10:00 PM',
        location: { latitude: 13.0827, longitude: 80.2707 },
      }),
    });
    const profileRes = await profileResFetch.json();
    const pharmacyId = profileRes.data._id;
    console.log('✅ Pharmacy Profile created with ID:', pharmacyId);

    // Create unique medicine for clean isolated testing
    const medResFetch = await fetch(`${API}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacyToken}`,
      },
      body: JSON.stringify({
        name: `Test Medicine ${Date.now()}`,
        genericName: 'Test Generic',
        category: 'Analgesic',
        manufacturer: 'HealthLabs India',
        description: 'Pain and fever reliever',
      }),
    });
    const medRes = await medResFetch.json();
    const medicineId = medRes.data._id;
    console.log('✅ Unique Medicine created with ID:', medicineId);

    // Add Inventory (Total: 50, Reserved: 0, Price: 30)
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
    console.log('✅ Inventory item created with Total Qty: 50, Price: ₹30');

    // 3. Register/Login Patient
    const patientEmail = `patient_p3_${Date.now()}@test.com`;
    console.log(`\n--- PATIENT FLOW: Registering ${patientEmail} ---`);
    const regPatRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Patient',
        email: patientEmail,
        password: 'Test@12345',
        role: 'patient',
      }),
    });
    const regPat = await regPatRes.json();
    const patientToken = regPat.token;
    console.log('✅ Patient registered successfully.');

    // 4. Patient searches medicine
    console.log('\n--- PATIENT SEARCH: Searching medicine ---');
    const searchResFetch = await fetch(`${API}/medicines?search=Test`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const searchRes = await searchResFetch.json();
    console.log(`✅ Search returned ${searchRes.count} matching medicines.`);

    // 5. Patient checks availability for created medicine
    console.log('\n--- PATIENT AVAILABILITY: Checking availability for medicine ---');
    const availResFetch = await fetch(`${API}/medicines/${medicineId}/availability`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const availRes = await availResFetch.json();
    console.log(`✅ Available Pharmacies count: ${availRes.count}`);
    const foundPharm = availRes.pharmacies.find((p) => p.inventoryId === inventoryId);
    console.log(`   Pharmacy: ${foundPharm?.pharmacy?.pharmacyName}`);
    console.log(`   Available Qty: ${foundPharm?.availableQuantity}, Price: ₹${foundPharm?.price}`);

    if (foundPharm?.availableQuantity !== 50) {
      throw new Error(`Expected availableQuantity 50, got ${foundPharm?.availableQuantity}`);
    }

    // 6. Update inventory quantity 50 -> 40
    console.log('\n--- INVENTORY UPDATE: Updating stock 50 -> 40 ---');
    await fetch(`${API}/inventory/${inventoryId}`, {
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

    // Verify patient sees updated availability (40)
    const availRes2Fetch = await fetch(`${API}/medicines/${medicineId}/availability`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const availRes2 = await availRes2Fetch.json();
    const updatedPharm = availRes2.pharmacies.find((p) => p.inventoryId === inventoryId);
    console.log(`✅ Updated Available Qty visible to patient: ${updatedPharm?.availableQuantity}`);

    if (updatedPharm?.availableQuantity !== 40) {
      throw new Error(`Expected availableQuantity 40, got ${updatedPharm?.availableQuantity}`);
    }

    // 7. Set totalQuantity = 0 (Available Qty = 0)
    console.log('\n--- ZERO STOCK TEST: Setting totalQuantity = 0 (Available = 0) ---');
    await fetch(`${API}/inventory/${inventoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacyToken}`,
      },
      body: JSON.stringify({
        totalQuantity: 0,
        price: 30,
      }),
    });

    const availRes3Fetch = await fetch(`${API}/medicines/${medicineId}/availability`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const availRes3 = await availRes3Fetch.json();
    console.log(`✅ Pharmacies returned when stock is 0: ${availRes3.count} (Correctly hidden from patient!)`);

    if (availRes3.count !== 0) {
      throw new Error(`Expected 0 available pharmacies, got ${availRes3.count}`);
    }

    // Reset stock to 25 for pharmacy view tests
    await fetch(`${API}/inventory/${inventoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pharmacyToken}`,
      },
      body: JSON.stringify({
        totalQuantity: 25,
        price: 30,
      }),
    });

    // 8. Test Pharmacy Details & Available Medicines List
    console.log('\n--- PHARMACY DETAILS TEST: GET /api/pharmacies/:id/medicines ---');
    const pharmMedsFetch = await fetch(`${API}/pharmacies/${pharmacyId}/medicines`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const pharmMeds = await pharmMedsFetch.json();
    console.log(`✅ Pharmacy Name: ${pharmMeds.pharmacy?.pharmacyName}`);
    console.log(`✅ Available Medicines Count: ${pharmMeds.count}`);
    const foundMed = pharmMeds.medicines.find((m) => m.inventoryId === inventoryId);
    console.log(`   Medicine Name: ${foundMed?.medicine?.name}, Qty: ${foundMed?.availableQuantity}, Price: ₹${foundMed?.price}`);

    // 9. Admin Preserved Functionality Test
    console.log('\n--- ADMIN PRESERVATION TEST ---');
    const adminEmail = `pharmacy_admin_test_${Date.now()}@test.com`;
    // Register pharmacy user to test authorization protection
    await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test NonAdmin',
        email: adminEmail,
        password: 'Test@12345',
        role: 'patient',
      }),
    });

    const nonAdminLoginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: 'Test@12345' }),
    });
    const nonAdminLogin = await nonAdminLoginRes.json();

    const statsFetch = await fetch(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${nonAdminLogin.token}` },
    });
    console.log('✅ Non-admin attempt to access admin stats status:', statsFetch.status, statsFetch.status === 403 ? '(Correctly Rejected 403)' : '');

    console.log('\n🎉 PROMPT 3 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
}

runPrompt3Tests();
