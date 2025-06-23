import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Comprehensive medication data
const medicationCategories = {
  'Analgesics': {
    base: ['Acetaminophen', 'Ibuprofen', 'Naproxen', 'Aspirin', 'Celecoxib', 'Diclofenac', 'Meloxicam', 'Indomethacin'],
    strengths: ['200mg', '400mg', '500mg', '600mg', '800mg', '1000mg'],
    isHighAlert: false
  },
  'Opioid Analgesics': {
    base: ['Morphine', 'Oxycodone', 'Hydrocodone', 'Codeine', 'Tramadol', 'Fentanyl', 'Hydromorphone', 'Methadone'],
    strengths: ['5mg', '10mg', '15mg', '20mg', '30mg', '50mg/ml', '100mcg/hr'],
    isHighAlert: true
  },
  'Antibiotics': {
    base: ['Amoxicillin', 'Azithromycin', 'Cephalexin', 'Ciprofloxacin', 'Clindamycin', 'Doxycycline', 'Erythromycin', 'Levofloxacin', 'Metronidazole', 'Penicillin', 'Sulfamethoxazole', 'Vancomycin', 'Ampicillin', 'Cefazolin', 'Gentamicin'],
    strengths: ['250mg', '500mg', '750mg', '1g', '125mg/5ml', '250mg/5ml'],
    isHighAlert: false
  },
  'Cardiovascular': {
    base: ['Lisinopril', 'Amlodipine', 'Metoprolol', 'Atorvastatin', 'Simvastatin', 'Losartan', 'Carvedilol', 'Diltiazem', 'Verapamil', 'Enalapril', 'Propranolol', 'Nifedipine', 'Isosorbide', 'Digoxin', 'Furosemide'],
    strengths: ['2.5mg', '5mg', '10mg', '20mg', '25mg', '40mg', '80mg'],
    isHighAlert: false
  },
  'Anticoagulants': {
    base: ['Warfarin', 'Heparin', 'Enoxaparin', 'Rivaroxaban', 'Apixaban', 'Dabigatran', 'Clopidogrel'],
    strengths: ['1mg', '2mg', '5mg', '10mg', '5000units/ml', '40mg/0.4ml'],
    isHighAlert: true,
    isLASA: true
  },
  'Diabetes Medications': {
    base: ['Insulin', 'Metformin', 'Glipizide', 'Glyburide', 'Pioglitazone', 'Sitagliptin', 'Empagliflozin', 'Liraglutide'],
    strengths: ['500mg', '850mg', '1000mg', '5mg', '10mg', '100units/ml'],
    isHighAlert: true
  },
  'Psychiatric Medications': {
    base: ['Sertraline', 'Fluoxetine', 'Escitalopram', 'Venlafaxine', 'Bupropion', 'Mirtazapine', 'Trazodone', 'Alprazolam', 'Lorazepam', 'Clonazepam', 'Diazepam', 'Risperidone', 'Quetiapine', 'Aripiprazole'],
    strengths: ['25mg', '50mg', '100mg', '150mg', '200mg', '0.5mg', '1mg', '2mg'],
    isHighAlert: false,
    isLASA: true
  },
  'Respiratory': {
    base: ['Albuterol', 'Ipratropium', 'Budesonide', 'Fluticasone', 'Montelukast', 'Theophylline', 'Prednisone', 'Methylprednisolone'],
    strengths: ['90mcg/inh', '18mcg/inh', '160mcg/inh', '10mg', '20mg', '4mg'],
    isHighAlert: false
  },
  'Gastrointestinal': {
    base: ['Omeprazole', 'Lansoprazole', 'Pantoprazole', 'Ranitidine', 'Famotidine', 'Sucralfate', 'Simethicone', 'Loperamide', 'Bisacodyl', 'Docusate'],
    strengths: ['20mg', '40mg', '150mg', '300mg', '1g', '40mg', '80mg'],
    isHighAlert: false
  },
  'Thyroid Medications': {
    base: ['Levothyroxine', 'Liothyronine', 'Methimazole', 'Propylthiouracil'],
    strengths: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg', '150mcg', '175mcg', '200mcg'],
    isHighAlert: false
  },
  'Chemotherapy': {
    base: ['Cisplatin', 'Carboplatin', 'Doxorubicin', 'Cyclophosphamide', 'Methotrexate', 'Fluorouracil', 'Paclitaxel', 'Docetaxel', 'Gemcitabine', 'Vincristine'],
    strengths: ['10mg/ml', '25mg/ml', '50mg/ml', '100mg/ml', '2mg/ml'],
    isHighAlert: true,
    isHazardous: true
  },
  'Electrolytes': {
    base: ['Potassium Chloride', 'Sodium Chloride', 'Magnesium Sulfate', 'Calcium Gluconate', 'Sodium Bicarbonate', 'Potassium Phosphate'],
    strengths: ['20mEq', '40mEq', '99mg', '2mEq/ml', '4mEq/ml', '8.4%'],
    isHighAlert: true
  },
  'Emergency Medications': {
    base: ['Epinephrine', 'Atropine', 'Lidocaine', 'Amiodarone', 'Adenosine', 'Dopamine', 'Norepinephrine', 'Vasopressin', 'Naloxone'],
    strengths: ['1mg/ml', '0.1mg/ml', '2mg/ml', '50mg/ml', '6mg/2ml'],
    isHighAlert: true
  }
}

const medicalSupplyCategories = {
  'Disposable Supplies': [
    'Surgical Gloves', 'Exam Gloves', 'N95 Masks', 'Surgical Masks', 'Face Shields', 'Gowns', 'Shoe Covers',
    'Hair Covers', 'Beard Covers', 'Eye Protection', 'Disposable Cups', 'Specimen Containers'
  ],
  'Injection Supplies': [
    'Syringes', 'Needles', 'IV Catheters', 'Butterfly Needles', 'Safety Needles', 'Insulin Syringes',
    'Tuberculin Syringes', 'Luer Lock Syringes', 'Catheter Tips', 'Needle Disposal Containers'
  ],
  'IV Supplies': [
    'IV Tubing Sets', 'IV Bags', 'Extension Sets', 'Y-Site Connectors', 'Stopcocks', 'IV Pumps',
    'Infusion Sets', 'Blood Administration Sets', 'Filter Sets', 'Pressure Bags'
  ],
  'Wound Care': [
    'Gauze Pads', 'Gauze Rolls', 'Medical Tape', 'Adhesive Bandages', 'Transparent Dressings',
    'Hydrocolloid Dressings', 'Foam Dressings', 'Wound Cleanser', 'Antiseptic Wipes', 'Skin Prep'
  ],
  'Diagnostic Supplies': [
    'Thermometer Covers', 'Blood Pressure Cuffs', 'Stethoscopes', 'Otoscope Specula', 'Tongue Depressors',
    'Reflex Hammers', 'Pulse Oximeters', 'Glucometers', 'Test Strips', 'Lancets'
  ],
  'Laboratory Supplies': [
    'Blood Collection Tubes', 'Urine Containers', 'Petri Dishes', 'Microscope Slides', 'Cover Slips',
    'Pipette Tips', 'Culture Swabs', 'Transport Media', 'pH Strips', 'Centrifuge Tubes'
  ],
  'Surgical Instruments': [
    'Surgical Scissors', 'Forceps', 'Scalpels', 'Hemostats', 'Retractors', 'Sutures', 'Staples',
    'Electrocautery Pads', 'Surgical Markers', 'Bone Wax'
  ],
  'Respiratory Supplies': [
    'Oxygen Masks', 'Nasal Cannulas', 'Nebulizer Masks', 'Spacer Devices', 'Peak Flow Meters',
    'Spirometry Filters', 'Tracheostomy Supplies', 'Ventilator Circuits', 'CPAP Masks', 'Oxygen Tubing'
  ],
  'Patient Care': [
    'Bedpans', 'Urinals', 'Washbasins', 'Water Pitchers', 'Disposable Washcloths', 'Incontinence Pads',
    'Adult Diapers', 'Catheter Bags', 'Feeding Tubes', 'Compression Stockings'
  ],
  'Emergency Supplies': [
    'Crash Cart Supplies', 'Defibrillator Pads', 'Airway Management', 'Emergency Medications',
    'Intubation Supplies', 'Emergency Oxygen', 'Splints', 'Cervical Collars', 'Backboards', 'Restraints'
  ]
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const volumes = ['5ml', '10ml', '20ml', '50ml', '100ml', '250ml', '500ml', '1000ml']
const quantities = ['Box of 50', 'Box of 100', 'Pack of 10', 'Pack of 25', 'Each', 'Dozen']

function generateMedications() {
  const medications = []
  
  for (const [category, data] of Object.entries(medicationCategories)) {
    for (const baseName of data.base) {
      for (const strength of data.strengths) {
        // Generate variations
        const variations = [
          `${baseName} ${strength}`,
          `${baseName} ${strength} Tablet`,
          `${baseName} ${strength} Capsule`,
          `${baseName} ${strength} Solution`,
          `${baseName} ${strength} Injection`
        ]
        
        for (const name of variations) {
          // Generate drug ID
          const drugId = `${baseName.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
          
          medications.push({
            name,
            description: `${category} medication: ${name}`,
            type: 'MEDICATION',
            drugId,
            isHazardous: data.isHazardous || false,
            isHighAlert: data.isHighAlert || false,
            isLASA: data.isLASA || false,
            category
          })
        }
      }
    }
  }
  
  return medications
}

function generateSupplies() {
  const supplies = []
  
  for (const [category, items] of Object.entries(medicalSupplyCategories)) {
    for (const baseName of items) {
      // Generate variations with sizes, quantities, etc.
      const variations = []
      
      if (['Gloves', 'Gowns', 'Masks'].some(type => baseName.includes(type))) {
        // Size-based items
        for (const size of sizes) {
          for (const qty of quantities) {
            variations.push(`${baseName} ${size} (${qty})`)
          }
        }
      } else if (['Syringes', 'Bags', 'Containers'].some(type => baseName.includes(type))) {
        // Volume-based items
        for (const volume of volumes) {
          for (const qty of quantities) {
            variations.push(`${baseName} ${volume} (${qty})`)
          }
        }
      } else {
        // Standard variations
        for (const qty of quantities) {
          variations.push(`${baseName} (${qty})`)
          variations.push(`Sterile ${baseName} (${qty})`)
          variations.push(`Disposable ${baseName} (${qty})`)
        }
      }
      
      for (const name of variations) {
        supplies.push({
          name,
          description: `${category} supply: ${name}`,
          type: 'SUPPLY',
          isHazardous: false,
          isHighAlert: false,
          isLASA: false,
          category
        })
      }
    }
  }
  
  return supplies
}

async function main() {
  console.log('🌱 Starting large dataset seeding (5000+ items)...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.inventory.deleteMany()
  await prisma.item.deleteMany()
  await prisma.stockArea.deleteMany()
  await prisma.site.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'Metropolitan Hospital Network',
      email: 'admin@metrohealth.com',
    },
  })

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@metrohealth.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      companyId: company.id,
    },
  })

  await prisma.user.create({
    data: {
      email: 'pharmacy@metrohealth.com',
      password: hashedPassword,
      name: 'Chief Pharmacist',
      role: 'USER',
      companyId: company.id,
    },
  })

  console.log('✅ Created company and users')

  // Create more sites for a larger hospital network
  const sites = await Promise.all([
    // Main campus sites
    prisma.site.create({
      data: {
        name: 'Metropolitan General Hospital',
        address: '1000 Medical Center Drive, Metro City, MC 10001',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Metro Emergency Department',
        address: '1000 Medical Center Drive, Emergency Wing, MC 10001',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Metro Surgical Center',
        address: '1000 Medical Center Drive, Surgical Tower, MC 10001',
        companyId: company.id,
      },
    }),
    // Specialty centers
    prisma.site.create({
      data: {
        name: 'Metro Cancer Center',
        address: '1100 Oncology Boulevard, Metro City, MC 10002',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Metro Heart Institute',
        address: '1200 Cardiology Lane, Metro City, MC 10003',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Metro Children\'s Hospital',
        address: '1300 Pediatric Way, Metro City, MC 10004',
        companyId: company.id,
      },
    }),
    // Outpatient facilities
    prisma.site.create({
      data: {
        name: 'Metro North Clinic',
        address: '2000 North Healthcare Plaza, Metro City, MC 10005',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Metro South Clinic',
        address: '3000 South Medical Center, Metro City, MC 10006',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Metro West Specialty Clinic',
        address: '4000 West Health Campus, Metro City, MC 10007',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Metro East Urgent Care',
        address: '5000 East Medical Plaza, Metro City, MC 10008',
        companyId: company.id,
      },
    }),
  ])

  console.log('✅ Created 10 sites')

  // Create comprehensive stock areas
  const stockAreaTypes = [
    'Main Pharmacy', 'Emergency Pharmacy', 'OR Pharmacy', 'ICU Med Room',
    'CCU Med Room', 'NICU Med Room', 'PICU Med Room', 'General Med Room',
    'Oncology Pharmacy', 'Chemotherapy Prep', 'IV Therapy Room', 'Central Supply',
    'OR Supply Room', 'Emergency Supply', 'Crash Cart Supplies', 'Isolation Supply',
    'Respiratory Therapy', 'Radiology Supply', 'Laboratory Supply', 'Blood Bank',
    'Dialysis Supply', 'Physical Therapy', 'Nutrition Supply', 'Wound Care Center'
  ]

  const stockAreas = []
  for (const site of sites) {
    // Each site gets 8-12 different stock areas
    const areasForSite = stockAreaTypes
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 8)
    
    for (const areaType of areasForSite) {
      const area = await prisma.stockArea.create({
        data: {
          name: areaType,
          siteId: site.id,
        },
      })
      stockAreas.push(area)
    }
  }

  console.log(`✅ Created ${stockAreas.length} stock areas`)

  // Generate medications and supplies
  console.log('🏭 Generating medications...')
  const medications = generateMedications()
  console.log(`Generated ${medications.length} medication variations`)

  console.log('📦 Generating medical supplies...')
  const supplies = generateSupplies()
  console.log(`Generated ${supplies.length} supply variations`)

  // Combine and shuffle to get 5000 items
  const allGeneratedItems = [...medications, ...supplies]
  const selectedItems = allGeneratedItems
    .sort(() => 0.5 - Math.random())
    .slice(0, 5000)

  console.log(`📊 Selected ${selectedItems.length} items for database`)

  // Create items in batches
  console.log('💾 Creating items in database...')
  const batchSize = 100
  const createdItems = []

  for (let i = 0; i < selectedItems.length; i += batchSize) {
    const batch = selectedItems.slice(i, i + batchSize)
    
    for (const item of batch) {
      try {
        const createdItem = await prisma.item.create({
          data: {
            ...item,
            companyId: company.id,
          },
        })
        createdItems.push(createdItem)
      } catch (error) {
        console.warn(`Skipped duplicate item: ${item.name}`)
      }
    }
    
    if (i % 1000 === 0) {
      console.log(`   Created ${i + batch.length} items...`)
    }
  }

  console.log(`✅ Created ${createdItems.length} items in database`)

  // Create inventory records - but not for every item in every location (too much data)
  console.log('📋 Creating inventory records...')
  const inventoryData = []
  
  for (const stockArea of stockAreas) {
    // Each stock area gets 100-300 random items
    const itemsForArea = createdItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 200) + 100)

    for (const item of itemsForArea) {
      // Generate realistic quantities
      let baseQuantity = 50
      let maxCapacity = 200
      let reorderThreshold = 20

      // Adjust based on item type and safety
      if (item.type === 'MEDICATION') {
        if (item.isHighAlert || item.isHazardous) {
          baseQuantity = Math.floor(Math.random() * 20) + 5
          maxCapacity = 50
          reorderThreshold = 10
        } else {
          baseQuantity = Math.floor(Math.random() * 100) + 25
          maxCapacity = 300
          reorderThreshold = 30
        }
      } else { // SUPPLY
        baseQuantity = Math.floor(Math.random() * 200) + 50
        maxCapacity = 1000
        reorderThreshold = 100
      }

      // Add variance for realistic stock levels
      const variance = Math.random()
      let currentQuantity = baseQuantity

      if (variance < 0.05) {
        currentQuantity = 0 // 5% out of stock
      } else if (variance < 0.15) {
        currentQuantity = Math.floor(reorderThreshold * 0.5) // 10% low stock
      } else {
        currentQuantity = Math.floor(Math.random() * (maxCapacity - reorderThreshold)) + reorderThreshold
      }

      inventoryData.push({
        itemId: item.id,
        stockAreaId: stockArea.id,
        currentQuantity,
        maxCapacity,
        reorderThreshold,
      })
    }
  }

  // Create inventory in batches
  console.log(`📦 Creating ${inventoryData.length} inventory records...`)
  for (let i = 0; i < inventoryData.length; i += batchSize) {
    const batch = inventoryData.slice(i, i + batchSize)
    await prisma.inventory.createMany({
      data: batch,
      skipDuplicates: true,
    })
    
    if (i % 5000 === 0) {
      console.log(`   Created ${i + batch.length} inventory records...`)
    }
  }

  // Summary statistics
  const totalSites = await prisma.site.count()
  const totalStockAreas = await prisma.stockArea.count()
  const totalItems = await prisma.item.count()
  const totalInventory = await prisma.inventory.count()
  const medicationsCount = await prisma.item.count({ where: { type: 'MEDICATION' } })
  const suppliesCount = await prisma.item.count({ where: { type: 'SUPPLY' } })
  const hazardousCount = await prisma.item.count({ where: { isHazardous: true } })
  const highAlertCount = await prisma.item.count({ where: { isHighAlert: true } })
  const lasaCount = await prisma.item.count({ where: { isLASA: true } })

  console.log('\n🎉 Large dataset seeding completed!')
  console.log('========================================')
  console.log(`📊 Summary:`)
  console.log(`   • Company: 1 (${company.name})`)
  console.log(`   • Users: 2`)
  console.log(`   • Sites: ${totalSites}`)
  console.log(`   • Stock Areas: ${totalStockAreas}`)
  console.log(`   • Items: ${totalItems}`)
  console.log(`     - Medications: ${medicationsCount}`)
  console.log(`     - Supplies: ${suppliesCount}`)
  console.log(`     - Hazardous: ${hazardousCount}`)
  console.log(`     - High Alert: ${highAlertCount}`)
  console.log(`     - LASA: ${lasaCount}`)
  console.log(`   • Inventory Records: ${totalInventory}`)
  console.log('')
  console.log('🔑 Test Login Credentials:')
  console.log('   Email: admin@metrohealth.com')
  console.log('   Password: password123')
  console.log('')
  console.log('🌐 Visit: http://localhost:3001/login')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })