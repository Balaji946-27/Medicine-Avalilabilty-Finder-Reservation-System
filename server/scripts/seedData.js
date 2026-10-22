/**
 * MediFind — Phase 3 Demo Data Seeder
 *
 * Populates MongoDB database with realistic demo data:
 * - 12 Fictional Pharmacies across Chennai, TN with approximate coordinates
 * - ~56 Indian Healthcare Medicines across 10 categories
 * - ~160+ Inventory stock records with realistic pricing and stock variations (high/medium/low/zero)
 *
 * IDEMPOTENT: Safe to run multiple times without creating duplicates or deleting existing data.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');

// 12 Fictional Demo Pharmacies in Chennai
const demoPharmacies = [
  {
    ownerEmail: 'medicareplus.owner@demo.medifind',
    ownerName: 'Dr. R. Sundaram',
    pharmacyName: 'MediCare Plus Pharmacy',
    address: '14, 2nd Avenue, Anna Nagar East',
    city: 'Chennai',
    phone: '044-26218900',
    openingHours: 'Mon-Sun: 7:00 AM - 11:00 PM',
    location: { latitude: 13.0850, longitude: 80.2100 }, // Anna Nagar
  },
  {
    ownerEmail: 'healthbridge.owner@demo.medifind',
    ownerName: 'V. Ramanathan',
    pharmacyName: 'HealthBridge Pharmacy',
    address: '45, Usman Road, T. Nagar',
    city: 'Chennai',
    phone: '044-24345678',
    openingHours: 'Mon-Sat: 8:00 AM - 10:30 PM, Sun: 9:00 AM - 9:00 PM',
    location: { latitude: 13.0418, longitude: 80.2341 }, // T. Nagar
  },
  {
    ownerEmail: 'carepoint.owner@demo.medifind',
    ownerName: 'Dr. Priya Shankar',
    pharmacyName: 'CarePoint Pharmacy',
    address: '72, Sardar Patel Road, Adyar',
    city: 'Chennai',
    phone: '044-24419876',
    openingHours: '24 Hours Open',
    location: { latitude: 13.0012, longitude: 80.2565 }, // Adyar
  },
  {
    ownerEmail: 'lifeline.owner@demo.medifind',
    ownerName: 'K. Balakrishnan',
    pharmacyName: 'LifeLine Medicals',
    address: '28, GST Road, Guindy',
    city: 'Chennai',
    phone: '044-22501234',
    openingHours: 'Mon-Sun: 8:00 AM - 10:00 PM',
    location: { latitude: 13.0067, longitude: 80.2026 }, // Guindy
  },
  {
    ownerEmail: 'greencross.owner@demo.medifind',
    ownerName: 'S. Jayakumar',
    pharmacyName: 'GreenCross Pharmacy',
    address: '102, 100 Feet Bypass Road, Velachery',
    city: 'Chennai',
    phone: '044-22445566',
    openingHours: 'Mon-Sun: 7:30 AM - 11:00 PM',
    location: { latitude: 12.9815, longitude: 80.2180 }, // Velachery
  },
  {
    ownerEmail: 'wellcare.owner@demo.medifind',
    ownerName: 'N. Muthusamy',
    pharmacyName: 'WellCare Medicals',
    address: '55, Shanmugam Road, West Tambaram',
    city: 'Chennai',
    phone: '044-22263456',
    openingHours: 'Mon-Sat: 8:00 AM - 10:00 PM',
    location: { latitude: 12.9249, longitude: 80.1000 }, // Tambaram
  },
  {
    ownerEmail: 'cityhealth.owner@demo.medifind',
    ownerName: 'Dr. G. Venkat',
    pharmacyName: 'CityHealth Pharmacy',
    address: '88, Trunk Road, Porur',
    city: 'Chennai',
    phone: '044-24827890',
    openingHours: 'Mon-Sun: 8:00 AM - 11:30 PM',
    location: { latitude: 13.0382, longitude: 80.1565 }, // Porur
  },
  {
    ownerEmail: 'primecare.owner@demo.medifind',
    ownerName: 'A. Subhashini',
    pharmacyName: 'PrimeCare Medicals',
    address: '210, Rajiv Gandhi Salai, Sholinganallur, OMR',
    city: 'Chennai',
    phone: '044-24508765',
    openingHours: '24 Hours Open',
    location: { latitude: 12.9010, longitude: 80.2279 }, // OMR / Sholinganallur
  },
  {
    ownerEmail: 'novahealth.owner@demo.medifind',
    ownerName: 'M. Sridhar',
    pharmacyName: 'NovaHealth Pharmacy',
    address: '33, Kutchery Road, Mylapore',
    city: 'Chennai',
    phone: '044-24981122',
    openingHours: 'Mon-Sun: 8:00 AM - 10:00 PM',
    location: { latitude: 13.0368, longitude: 80.2676 }, // Mylapore
  },
  {
    ownerEmail: 'trustcare.owner@demo.medifind',
    ownerName: 'P. Arumugam',
    pharmacyName: 'TrustCare Pharmacy',
    address: '19, Paper Mills Road, Perambur',
    city: 'Chennai',
    phone: '044-25514433',
    openingHours: 'Mon-Sat: 8:30 AM - 9:30 PM',
    location: { latitude: 13.1090, longitude: 80.2435 }, // Perambur
  },
  {
    ownerEmail: 'healthnest.owner@demo.medifind',
    ownerName: 'T. Karthikeyan',
    pharmacyName: 'HealthNest Medicals',
    address: '61, CTH Road, Ambattur OT',
    city: 'Chennai',
    phone: '044-26589900',
    openingHours: 'Mon-Sun: 8:00 AM - 10:00 PM',
    location: { latitude: 13.1143, longitude: 80.1548 }, // Ambattur
  },
  {
    ownerEmail: 'carebridge.owner@demo.medifind',
    ownerName: 'Dr. L. Meenakshi',
    pharmacyName: 'CareBridge Pharmacy',
    address: '15, Royapettah High Road, Royapettah',
    city: 'Chennai',
    phone: '044-28117788',
    openingHours: 'Mon-Sun: 7:00 AM - 10:30 PM',
    location: { latitude: 13.0538, longitude: 80.2612 }, // Royapettah
  },
];

// ~56 Indian Common Medicines across 10 categories
const demoMedicines = [
  // ── Analgesic (Pain relief / Fever) ──────────────────────
  {
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol / Acetaminophen',
    manufacturer: 'Cipla Ltd',
    category: 'Analgesic',
    description: 'Effective fever reducer and mild-to-moderate pain reliever.',
  },
  {
    name: 'Paracetamol 650mg',
    genericName: 'Paracetamol',
    manufacturer: 'Micro Labs Ltd (Dolo)',
    category: 'Analgesic',
    description: 'High strength antipyretic and analgesic for acute fever and body pain.',
  },
  {
    name: 'Ibuprofen 200mg',
    genericName: 'Ibuprofen',
    manufacturer: 'Abbott Healthcare',
    category: 'Analgesic',
    description: 'Non-steroidal anti-inflammatory drug (NSAID) for pain and swelling relief.',
  },
  {
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    manufacturer: 'Sun Pharma',
    category: 'Analgesic',
    description: 'Standard strength NSAID for arthritis, joint pain, toothache, and headache.',
  },
  {
    name: 'Diclofenac 50mg',
    genericName: 'Diclofenac Sodium',
    manufacturer: 'Novartis India',
    category: 'Analgesic',
    description: 'Potent NSAID for muscular aches, backache, and post-operative pain.',
  },
  {
    name: 'Aceclofenac 100mg',
    genericName: 'Aceclofenac',
    manufacturer: 'Aristo Pharma',
    category: 'Analgesic',
    description: 'Targeted anti-inflammatory analgesic with superior gastrointestinal tolerability.',
  },
  {
    name: 'Mefenamic Acid 500mg',
    genericName: 'Mefenamic Acid',
    manufacturer: 'Blue Cross Labs',
    category: 'Analgesic',
    description: 'Analgesic indicated for primary dysmenorrhea and mild to moderate pain.',
  },

  // ── Antibiotic ───────────────────────────────────────────
  {
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin Trihydrate',
    manufacturer: 'GlaxoSmithKline',
    category: 'Antibiotic',
    description: 'Broad-spectrum penicillin antibiotic for pediatric and mild bacterial infections.',
  },
  {
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    manufacturer: 'Alkem Laboratories',
    category: 'Antibiotic',
    description: 'First-line antibiotic for ear, nose, throat, and respiratory bacterial infections.',
  },
  {
    name: 'Azithromycin 250mg',
    genericName: 'Azithromycin Dihydrate',
    manufacturer: 'Lupin Ltd',
    category: 'Antibiotic',
    description: 'Macrolide antibiotic for mild respiratory tract infections and skin infections.',
  },
  {
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    manufacturer: 'Zydus Cadila',
    category: 'Antibiotic',
    description: 'Potent macrolide antibiotic taken once daily for bacterial respiratory infections.',
  },
  {
    name: 'Ciprofloxacin 500mg',
    genericName: 'Ciprofloxacin HCl',
    manufacturer: 'Dr. Reddy\'s Labs',
    category: 'Antibiotic',
    description: 'Fluoroquinolone antibiotic for urinary tract, gastrointestinal, and bone infections.',
  },
  {
    name: 'Cefixime 200mg',
    genericName: 'Cefixime Trihydrate',
    manufacturer: 'Mankind Pharma',
    category: 'Antibiotic',
    description: 'Third-generation cephalosporin antibiotic for typhoid, bronchitis, and UTI.',
  },
  {
    name: 'Doxycycline 100mg',
    genericName: 'Doxycycline Hyclate',
    manufacturer: 'Torrent Pharma',
    category: 'Antibiotic',
    description: 'Tetracycline antibiotic for acne, cholera, and atypical pneumonia infections.',
  },

  // ── Allergy / Antihistamine ──────────────────────────────
  {
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine Hydrochloride',
    manufacturer: 'Dr. Reddy\'s Labs (Cetzine)',
    category: 'Allergy',
    description: 'Non-drowsy second-generation antihistamine for allergic rhinitis and urticaria.',
  },
  {
    name: 'Levocetirizine 5mg',
    genericName: 'Levocetirizine Dihydrochloride',
    manufacturer: 'Cipla Ltd (Levocet)',
    category: 'Allergy',
    description: 'Purified active enantiomer of cetirizine for fast-acting allergy and itching relief.',
  },
  {
    name: 'Fexofenadine 120mg',
    genericName: 'Fexofenadine Hydrochloride',
    manufacturer: 'Sanofi India (Allegra)',
    category: 'Allergy',
    description: 'Non-sedating antihistamine for seasonal allergic rhinitis, sneezing, and runny nose.',
  },
  {
    name: 'Fexofenadine 180mg',
    genericName: 'Fexofenadine Hydrochloride',
    manufacturer: 'Sanofi India (Allegra 180)',
    category: 'Allergy',
    description: 'Maximum strength non-drowsy antihistamine for chronic idiopathic urticaria.',
  },
  {
    name: 'Loratadine 10mg',
    genericName: 'Loratadine',
    manufacturer: 'Bayer Pharmaceuticals',
    category: 'Allergy',
    description: 'Long-acting 24-hour allergy symptom relief with zero sedation.',
  },
  {
    name: 'Montelukast 10mg',
    genericName: 'Montelukast Sodium',
    manufacturer: 'Sun Pharma (Montek)',
    category: 'Allergy',
    description: 'Leukotriene receptor antagonist for allergic asthma and perennial allergic rhinitis.',
  },

  // ── Antidiabetic ─────────────────────────────────────────
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride',
    manufacturer: 'USV Pvt Ltd (Glycomet)',
    category: 'Antidiabetic',
    description: 'First-line biguanide oral antidiabetic medication for managing Type 2 diabetes.',
  },
  {
    name: 'Metformin 850mg',
    genericName: 'Metformin Hydrochloride',
    manufacturer: 'Sun Pharma',
    category: 'Antidiabetic',
    description: 'Intermediate strength biguanide to reduce hepatic glucose production.',
  },
  {
    name: 'Metformin 1000mg SR',
    genericName: 'Metformin Hydrochloride Sustained Release',
    manufacturer: 'Abbott India',
    category: 'Antidiabetic',
    description: 'Once-daily sustained-release formulation of Metformin for smooth glycaemic control.',
  },
  {
    name: 'Glimepiride 1mg',
    genericName: 'Glimepiride',
    manufacturer: 'Sanofi India (Amaryl)',
    category: 'Antidiabetic',
    description: 'Third-generation sulfonylurea that stimulates pancreatic insulin secretion.',
  },
  {
    name: 'Glimepiride 2mg',
    genericName: 'Glimepiride',
    manufacturer: 'Torrent Pharma',
    category: 'Antidiabetic',
    description: 'Standard strength sulfonylurea for Type 2 diabetes glycemic maintenance.',
  },
  {
    name: 'Vildagliptin 50mg',
    genericName: 'Vildagliptin',
    manufacturer: 'Novartis India (Galvus)',
    category: 'Antidiabetic',
    description: 'DPP-4 inhibitor that increases incretin levels to boost insulin when needed.',
  },
  {
    name: 'Dapagliflozin 10mg',
    genericName: 'Dapagliflozin',
    manufacturer: 'AstraZeneca India (Forxiga)',
    category: 'Antidiabetic',
    description: 'SGLT2 inhibitor that eliminates excess blood sugar via renal excretion.',
  },

  // ── Antihypertensive ─────────────────────────────────────
  {
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine Besylate',
    manufacturer: 'Pfizer India (Amlogard)',
    category: 'Antihypertensive',
    description: 'Calcium channel blocker for treating high blood pressure and angina.',
  },
  {
    name: 'Amlodipine 10mg',
    genericName: 'Amlodipine Besylate',
    manufacturer: 'Cipla Ltd',
    category: 'Antihypertensive',
    description: 'Higher dose calcium channel blocker for resistant essential hypertension.',
  },
  {
    name: 'Telmisartan 40mg',
    genericName: 'Telmisartan',
    manufacturer: 'Glenmark Pharma (Telma)',
    category: 'Antihypertensive',
    description: 'Angiotensin II receptor antagonist (ARB) for cardiovascular risk reduction.',
  },
  {
    name: 'Telmisartan 80mg',
    genericName: 'Telmisartan',
    manufacturer: 'Glenmark Pharma (Telma 80)',
    category: 'Antihypertensive',
    description: 'Maximum daily dose ARB for comprehensive 24-hour BP control.',
  },
  {
    name: 'Losartan 50mg',
    genericName: 'Losartan Potassium',
    manufacturer: 'Sun Pharma (Repace)',
    category: 'Antihypertensive',
    description: 'ARB that protects renal function in diabetic patients with hypertension.',
  },
  {
    name: 'Atenolol 50mg',
    genericName: 'Atenolol',
    manufacturer: 'Zydus Cadila',
    category: 'Antihypertensive',
    description: 'Beta-1 selective adrenergic blocker for hypertension, tachycardia, and post-MI.',
  },

  // ── Gastrointestinal / Anti-Ulcer ─────────────────────────
  {
    name: 'Pantoprazole 40mg',
    genericName: 'Pantoprazole Sodium',
    manufacturer: 'Alkem Labs (Pan 40)',
    category: 'Gastrointestinal',
    description: 'Proton pump inhibitor (PPI) for GERD, peptic ulcers, and acid reflux relief.',
  },
  {
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole Magnesium',
    manufacturer: 'Dr. Reddy\'s (Omez)',
    category: 'Gastrointestinal',
    description: 'Classic PPI providing round-the-clock acid suppression for heartburn.',
  },
  {
    name: 'Rabeprazole 20mg',
    genericName: 'Rabeprazole Sodium',
    manufacturer: 'Torrent Pharma (Razo)',
    category: 'Gastrointestinal',
    description: 'Fast-acting proton pump inhibitor providing rapid relief from hyperacidity.',
  },
  {
    name: 'Domperidone 10mg',
    genericName: 'Domperidone',
    manufacturer: 'Torrent Pharma',
    category: 'Gastrointestinal',
    description: 'Prokinetic antiemetic agent that relieves nausea, bloating, and vomiting.',
  },
  {
    name: 'Ondansetron 4mg',
    genericName: 'Ondansetron Hydrochloride',
    manufacturer: 'Cipla Ltd (Emeset)',
    category: 'Gastrointestinal',
    description: '5-HT3 receptor antagonist for fast control of acute nausea and vomiting.',
  },
  {
    name: 'Loperamide 2mg',
    genericName: 'Loperamide Hydrochloride',
    manufacturer: 'Johnson & Johnson (Imodium)',
    category: 'Gastrointestinal',
    description: 'Antidiarrheal medication that slows intestinal motility.',
  },

  // ── Antacid ──────────────────────────────────────────────
  {
    name: 'Antacid Gel Suspension 200ml',
    genericName: 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone',
    manufacturer: 'Abbott Healthcare (Digene)',
    category: 'Antacid',
    description: 'Liquid antacid that instantly neutralizes stomach acid and dispels gas.',
  },
  {
    name: 'Antacid Chewable Tablets',
    genericName: 'Calcium Carbonate + Magnesium Hydroxide',
    manufacturer: 'Piramal Healthcare (Gelusil)',
    category: 'Antacid',
    description: 'Pleasant-tasting chewable tablets for quick relief from burning heartburn.',
  },
  {
    name: 'Eno Fruit Salt Sachet 5g',
    genericName: 'Sodium Bicarbonate + Citric Acid',
    manufacturer: 'GSK Consumer Healthcare',
    category: 'Antacid',
    description: 'Fast effervescent antacid that acts within 6 seconds on acid indigestion.',
  },
  {
    name: 'Milk of Magnesia 170ml',
    genericName: 'Magnesium Hydroxide Suspension',
    manufacturer: 'Reckitt Benckiser',
    category: 'Antacid',
    description: 'Saline antacid and gentle laxative for constipation associated with heartburn.',
  },

  // ── Vitamin & Mineral Supplements ────────────────────────
  {
    name: 'Vitamin C 500mg Chewable',
    genericName: 'Ascorbic Acid + Sodium Ascorbate',
    manufacturer: 'Abbott India (Limcee)',
    category: 'Vitamin',
    description: 'Antioxidant immune booster that promotes collagen synthesis and wound healing.',
  },
  {
    name: 'Vitamin D3 60k IU Capsule',
    genericName: 'Cholecalciferol',
    manufacturer: 'Cadila Pharmaceuticals (Calcirol)',
    category: 'Vitamin',
    description: 'High-potency weekly Vitamin D3 supplement for bone density and calcium absorption.',
  },
  {
    name: 'Calcium + Vitamin D3 Tablets',
    genericName: 'Calcium Carbonate 500mg + Vitamin D3 250 IU',
    manufacturer: 'GlaxoSmithKline (Shelcal 500)',
    category: 'Vitamin',
    description: 'Essential daily mineral supplement for preventing osteoporosis and strengthening bones.',
  },
  {
    name: 'Multivitamin Tablets',
    genericName: 'Multivitamins with Zinc & Trace Minerals',
    manufacturer: 'Apex Laboratories (Zincovit)',
    category: 'Vitamin',
    description: 'Comprehensive daily multivitamin with zinc to fight fatigue and build immunity.',
  },
  {
    name: 'Neurobion Forte Tablets',
    genericName: 'Vitamin B-Complex with Vitamin B12',
    manufacturer: 'Procter & Gamble Health',
    category: 'Vitamin',
    description: 'Specialized Vitamin B1, B6, and B12 formulation for nerve health and tingling relief.',
  },
  {
    name: 'Folic Acid 5mg',
    genericName: 'Folic Acid (Vitamin B9)',
    manufacturer: 'Macleods Pharma (Folvite)',
    category: 'Vitamin',
    description: 'Essential prenatal vitamin for red blood cell production and neural development.',
  },

  // ── Respiratory ──────────────────────────────────────────
  {
    name: 'Cough Relief Syrup 100ml',
    genericName: 'Dextromethorphan + Chlorpheniramine + Phenylephrine',
    manufacturer: 'Pfizer India (Corex-DX)',
    category: 'Respiratory',
    description: 'Effective triple-action formula for dry, irritating cough and nasal congestion.',
  },
  {
    name: 'Ambroxol 30mg Tablets',
    genericName: 'Ambroxol Hydrochloride',
    manufacturer: 'Sun Pharma (Mucolite)',
    category: 'Respiratory',
    description: 'Mucolytic agent that thins sticky mucus and eases expectoration in wet cough.',
  },
  {
    name: 'Salbutamol 4mg',
    genericName: 'Salbutamol Sulphate (Albuterol)',
    manufacturer: 'Cipla Ltd (Asthalin)',
    category: 'Respiratory',
    description: 'Short-acting beta-2 agonist bronchodilator for rapid asthma attack relief.',
  },
  {
    name: 'Budesonide Respules 0.5mg',
    genericName: 'Budesonide Inhalation Suspension',
    manufacturer: 'Cipla Ltd (Budecort)',
    category: 'Respiratory',
    description: 'Inhaled corticosteroid for nebulization to control airway inflammation in asthma.',
  },

  // ── General Healthcare ───────────────────────────────────
  {
    name: 'ORS Sachet 21.8g',
    genericName: 'Oral Rehydration Salts (WHO Formula)',
    manufacturer: 'FDC Ltd (Electral)',
    category: 'General',
    description: 'WHO-recommended oral rehydration formulation for rapid electrolyte recovery.',
  },
  {
    name: 'Betadine Ointment 5% 20g',
    genericName: 'Povidone Iodine',
    manufacturer: 'Win-Medicare',
    category: 'General',
    description: 'Broad-spectrum antiseptic ointment for treating cuts, burns, and abrasions.',
  },
  {
    name: 'Moov Pain Relief Spray 50g',
    genericName: 'Diclofenac + Menthol + Eucalyptus Oil',
    manufacturer: 'Reckitt Benckiser',
    category: 'General',
    description: 'Fast pain relief aerosol spray for muscle stiffness, sprains, and backache.',
  },
];

async function seedData() {
  console.log('====================================================');
  console.log('   MediFind — Phase 3 Demo Data Seeder (Chennai)    ');
  console.log('====================================================');

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully.');

    // 1. Seed or Update Demo Medicines (Idempotent)
    console.log('\n📦 Seeding Demo Medicines...');
    const savedMedicines = [];
    for (const medData of demoMedicines) {
      let med = await Medicine.findOne({ name: medData.name });
      if (!med) {
        med = await Medicine.create(medData);
      } else {
        med.genericName = medData.genericName;
        med.manufacturer = medData.manufacturer;
        med.category = medData.category;
        med.description = medData.description;
        await med.save();
      }
      savedMedicines.push(med);
    }
    console.log(`✅ Seeded/Updated ${savedMedicines.length} Medicines.`);

    // 2. Seed or Update Demo Pharmacies & Pharmacy User Accounts (Idempotent)
    console.log('\n🏥 Seeding Demo Pharmacies & Users...');
    const savedPharmacies = [];
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo@1234', salt);

    for (const pData of demoPharmacies) {
      // Find or create pharmacy user account
      let user = await User.findOne({ email: pData.ownerEmail });
      if (!user) {
        user = await User.create({
          name: pData.ownerName,
          email: pData.ownerEmail,
          password: demoPasswordHash,
          role: 'pharmacy',
          phone: pData.phone,
          address: pData.address,
        });
      }

      // Find or create pharmacy record
      let pharmacy = await Pharmacy.findOne({ pharmacyName: pData.pharmacyName });
      if (!pharmacy) {
        pharmacy = await Pharmacy.create({
          ownerId: user._id,
          pharmacyName: pData.pharmacyName,
          address: pData.address,
          city: pData.city,
          phone: pData.phone,
          openingHours: pData.openingHours,
          location: pData.location,
          isVerified: true,
        });
      } else {
        pharmacy.ownerId = user._id;
        pharmacy.address = pData.address;
        pharmacy.city = pData.city;
        pharmacy.phone = pData.phone;
        pharmacy.openingHours = pData.openingHours;
        pharmacy.location = pData.location;
        pharmacy.isVerified = true;
        await pharmacy.save();
      }
      savedPharmacies.push(pharmacy);
    }
    console.log(`✅ Seeded/Updated ${savedPharmacies.length} Pharmacies.`);

    // 3. Seed Inventory for each pharmacy with varied stocks and realistic INR prices
    console.log('\n📋 Seeding Inventory Records...');
    let totalInventoryCount = 0;

    // Realistic price mapping by medicine name / category
    const getBasePrice = (med) => {
      if (med.name.includes('Paracetamol 500mg')) return 18;
      if (med.name.includes('Paracetamol 650mg')) return 32;
      if (med.name.includes('Ibuprofen 200mg')) return 22;
      if (med.name.includes('Ibuprofen 400mg')) return 38;
      if (med.name.includes('Amoxicillin 250mg')) return 65;
      if (med.name.includes('Amoxicillin 500mg')) return 115;
      if (med.name.includes('Azithromycin 250mg')) return 85;
      if (med.name.includes('Azithromycin 500mg')) return 145;
      if (med.name.includes('Cetirizine 10mg')) return 28;
      if (med.name.includes('Levocetirizine 5mg')) return 45;
      if (med.name.includes('Metformin 500mg')) return 35;
      if (med.name.includes('Metformin 850mg')) return 55;
      if (med.name.includes('Amlodipine 5mg')) return 42;
      if (med.name.includes('Amlodipine 10mg')) return 72;
      if (med.name.includes('Pantoprazole 40mg')) return 95;
      if (med.name.includes('Omeprazole 20mg')) return 58;
      if (med.name.includes('ORS Sachet')) return 22;
      if (med.name.includes('Vitamin C')) return 38;
      if (med.name.includes('Vitamin D3')) return 160;
      if (med.name.includes('Calcium + Vitamin D3')) return 120;
      if (med.name.includes('Multivitamin')) return 135;
      if (med.name.includes('Antacid Gel')) return 140;
      if (med.name.includes('Antacid Chewable')) return 30;
      if (med.name.includes('Eno Fruit Salt')) return 10;
      if (med.name.includes('Cough Relief Syrup')) return 98;
      if (med.name.includes('Betadine')) return 65;
      if (med.name.includes('Moov')) return 155;
      return 50; // fallback
    };

    // Assign different subsets of medicines to different pharmacies
    // to make search and availability realistic and diverse
    for (let pIdx = 0; pIdx < savedPharmacies.length; pIdx++) {
      const pharmacy = savedPharmacies[pIdx];

      // Each pharmacy carries 20-30 medicines selected deterministically
      const pharmacyMedicines = savedMedicines.filter((_, mIdx) => {
        return (mIdx + pIdx) % 2 === 0 || (mIdx * 3 + pIdx) % 5 === 0;
      });

      for (let mIdx = 0; mIdx < pharmacyMedicines.length; mIdx++) {
        const med = pharmacyMedicines[mIdx];
        const basePrice = getBasePrice(med);
        // Small price variation (±10%) across pharmacies
        const priceVariation = ((pIdx % 5) - 2) * 2;
        const finalPrice = Math.max(5, basePrice + priceVariation);

        // Stock quantity variation pattern
        let totalQuantity = 50;
        let reservedQuantity = 0;

        const seedPattern = (pIdx * 7 + mIdx * 11) % 10;
        if (seedPattern === 0) {
          totalQuantity = 0; // Out of stock (zero stock record for testing)
          reservedQuantity = 0;
        } else if (seedPattern === 1 || seedPattern === 2) {
          totalQuantity = 5; // Low stock
          reservedQuantity = 1;
        } else if (seedPattern === 3 || seedPattern === 4) {
          totalQuantity = 15; // Moderate stock
          reservedQuantity = 2;
        } else if (seedPattern === 5 || seedPattern === 6) {
          totalQuantity = 35; // Good stock
          reservedQuantity = 3;
        } else if (seedPattern === 7 || seedPattern === 8) {
          totalQuantity = 75; // High stock
          reservedQuantity = 5;
        } else {
          totalQuantity = 100; // Very high stock
          reservedQuantity = 4;
        }

        let inv = await Inventory.findOne({
          pharmacyId: pharmacy._id,
          medicineId: med._id,
        });

        if (!inv) {
          inv = await Inventory.create({
            pharmacyId: pharmacy._id,
            medicineId: med._id,
            totalQuantity,
            reservedQuantity,
            price: finalPrice,
            lastUpdated: new Date(),
          });
        } else {
          inv.totalQuantity = totalQuantity;
          inv.reservedQuantity = reservedQuantity;
          inv.price = finalPrice;
          inv.lastUpdated = new Date();
          await inv.save();
        }
        totalInventoryCount++;
      }
    }
    console.log(`✅ Seeded/Updated ${totalInventoryCount} Inventory stock records.`);

    // 4. Print Summary
    console.log('\n====================================================');
    console.log('             PHASE 3 SEED COMPLETED                 ');
    console.log('====================================================');
    console.log(`📍 Pharmacies:        ${savedPharmacies.length} (Chennai areas: Anna Nagar, T.Nagar, Adyar, Guindy, Velachery, Tambaram, Porur, OMR, Mylapore, Perambur, Ambattur, Royapettah)`);
    console.log(`💊 Medicines:         ${savedMedicines.length} items`);
    console.log(`📂 Categories:        Analgesic, Antibiotic, Allergy, Antidiabetic, Antihypertensive, Gastrointestinal, Antacid, Vitamin, Respiratory, General`);
    console.log(`📊 Inventory Links:   ${totalInventoryCount} stock records`);
    console.log(`🔐 Demo Pharmacy Pwd: Demo@1234 (Email format: xxx.owner@demo.medifind)`);
    console.log('====================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing seed script:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedData();
