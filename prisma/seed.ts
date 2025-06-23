import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.inventory.deleteMany()
  await prisma.item.deleteMany()
  await prisma.stockArea.deleteMany()
  await prisma.site.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'General Hospital System',
      email: 'admin@generalhospital.com',
    },
  })

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@generalhospital.com',
      password: hashedPassword,
      name: 'Hospital Administrator',
      role: 'ADMIN',
      companyId: company.id,
    },
  })

  await prisma.user.create({
    data: {
      email: 'pharmacy@generalhospital.com',
      password: hashedPassword,
      name: 'Pharmacy Manager',
      role: 'USER',
      companyId: company.id,
    },
  })

  console.log('✅ Created company and users')

  // Create test sites
  const sites = await Promise.all([
    prisma.site.create({
      data: {
        name: 'Main Hospital Campus',
        address: '123 Medical Center Drive, Healthcare City, HC 12345',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Emergency Department',
        address: '123 Medical Center Drive, Emergency Wing, HC 12345',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Outpatient Clinic',
        address: '456 Health Plaza, Healthcare City, HC 12346',
        companyId: company.id,
      },
    }),
    prisma.site.create({
      data: {
        name: 'Pediatric Wing',
        address: '789 Children\'s Way, Healthcare City, HC 12347',
        companyId: company.id,
      },
    }),
  ])

  console.log('✅ Created sites')

  // Create stock areas for each site
  const stockAreas = []
  
  for (const site of sites) {
    const areas = await Promise.all([
      prisma.stockArea.create({
        data: {
          name: 'Main Pharmacy',
          siteId: site.id,
        },
      }),
      prisma.stockArea.create({
        data: {
          name: 'Emergency Supply Room',
          siteId: site.id,
        },
      }),
      prisma.stockArea.create({
        data: {
          name: 'ICU Med Room',
          siteId: site.id,
        },
      }),
      prisma.stockArea.create({
        data: {
          name: 'General Storage',
          siteId: site.id,
        },
      }),
    ])
    stockAreas.push(...areas)
  }

  console.log('✅ Created stock areas')

  // Create comprehensive test items
  const medications = [
    // High Alert Medications
    { name: 'Insulin (Regular)', drugId: 'INS001', isHighAlert: true, isHazardous: false, isLASA: false },
    { name: 'Heparin 5000 units/mL', drugId: 'HEP001', isHighAlert: true, isHazardous: false, isLASA: false },
    { name: 'Morphine 10mg/mL', drugId: 'MOR001', isHighAlert: true, isHazardous: false, isLASA: false },
    { name: 'Potassium Chloride 20mEq', drugId: 'KCL001', isHighAlert: true, isHazardous: false, isLASA: false },
    { name: 'Warfarin 5mg', drugId: 'WAR001', isHighAlert: true, isHazardous: false, isLASA: true },

    // Hazardous Medications
    { name: 'Chemotherapy: Cisplatin', drugId: 'CIS001', isHighAlert: true, isHazardous: true, isLASA: false },
    { name: 'Chemotherapy: Doxorubicin', drugId: 'DOX001', isHighAlert: true, isHazardous: true, isLASA: false },
    { name: 'Methotrexate 25mg', drugId: 'MTX001', isHighAlert: false, isHazardous: true, isLASA: false },

    // LASA Medications
    { name: 'Hydroxyzine 25mg', drugId: 'HYD001', isHighAlert: false, isHazardous: false, isLASA: true },
    { name: 'Hydralazine 25mg', drugId: 'HYD002', isHighAlert: false, isHazardous: false, isLASA: true },
    { name: 'Clonazepam 1mg', drugId: 'CLO001', isHighAlert: false, isHazardous: false, isLASA: true },
    { name: 'Clonidine 0.1mg', drugId: 'CLO002', isHighAlert: false, isHazardous: false, isLASA: true },

    // Regular Medications
    { name: 'Acetaminophen 500mg', drugId: 'ACE001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Ibuprofen 600mg', drugId: 'IBU001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Lisinopril 10mg', drugId: 'LIS001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Metformin 500mg', drugId: 'MET001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Amlodipine 5mg', drugId: 'AML001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Atorvastatin 20mg', drugId: 'ATO001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Omeprazole 20mg', drugId: 'OME001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Levothyroxine 50mcg', drugId: 'LEV001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Cephalexin 500mg', drugId: 'CEP001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Amoxicillin 500mg', drugId: 'AMO001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Prednisone 20mg', drugId: 'PRE001', isHighAlert: false, isHazardous: false, isLASA: false },
    { name: 'Albuterol Inhaler', drugId: 'ALB001', isHighAlert: false, isHazardous: false, isLASA: false },
  ]

  const supplies = [
    { name: 'Surgical Gloves (Box of 100)', description: 'Latex-free surgical gloves, size M' },
    { name: 'N95 Masks (Box of 20)', description: 'NIOSH-approved N95 respirator masks' },
    { name: 'IV Tubing Set', description: 'Standard IV administration set with roller clamp' },
    { name: 'Syringes 10mL (Pack of 100)', description: 'Sterile disposable syringes' },
    { name: 'Gauze Pads 4x4 (Pack of 200)', description: 'Sterile gauze pads for wound care' },
    { name: 'Medical Tape Roll', description: 'Hypoallergenic medical adhesive tape' },
    { name: 'Alcohol Prep Pads (Box of 100)', description: 'Sterile alcohol preparation pads' },
    { name: 'Bandages Assorted (Box of 50)', description: 'Various sizes of adhesive bandages' },
    { name: 'Thermometer Covers (Box of 100)', description: 'Disposable thermometer probe covers' },
    { name: 'Pulse Oximeter', description: 'Digital pulse oximeter with display' },
    { name: 'Blood Pressure Cuff', description: 'Adult size blood pressure cuff' },
    { name: 'Stethoscope', description: 'Professional stethoscope' },
    { name: 'Surgical Scissors', description: 'Stainless steel surgical scissors' },
    { name: 'Disposable Scalpels (Pack of 10)', description: 'Sterile disposable scalpels' },
    { name: 'Urinalysis Test Strips (Pack of 100)', description: '10-parameter urine test strips' },
  ]

  // Create medication items
  const medicationItems = []
  for (const med of medications) {
    const item = await prisma.item.create({
      data: {
        name: med.name,
        description: `Prescription medication: ${med.name}`,
        type: 'MEDICATION' as const,
        drugId: med.drugId,
        isHazardous: med.isHazardous,
        isHighAlert: med.isHighAlert,
        isLASA: med.isLASA,
        companyId: company.id,
      },
    })
    medicationItems.push(item)
  }

  // Create supply items
  const supplyItems = []
  for (const supply of supplies) {
    const item = await prisma.item.create({
      data: {
        name: supply.name,
        description: supply.description,
        type: 'SUPPLY' as const,
        isHazardous: false,
        isHighAlert: false,
        isLASA: false,
        companyId: company.id,
      },
    })
    supplyItems.push(item)
  }

  const allItems = [...medicationItems, ...supplyItems]
  console.log('✅ Created items')

  // Create realistic inventory data
  const inventoryData = []
  
  for (const stockArea of stockAreas) {
    // Each stock area gets a random selection of items
    const itemsForArea = allItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 15) + 10) // 10-25 items per area

    for (const item of itemsForArea) {
      // Generate realistic quantities based on item type and safety level
      let baseQuantity = 50
      let maxCapacity = 200
      let reorderThreshold = 20

      // High-usage common medications
      if (['Acetaminophen', 'Ibuprofen', 'Insulin'].some(name => item.name.includes(name))) {
        baseQuantity = Math.floor(Math.random() * 100) + 100 // 100-200
        maxCapacity = 500
        reorderThreshold = 50
      }
      
      // High Alert/Hazardous medications (lower quantities, more controlled)
      if (item.isHighAlert || item.isHazardous) {
        baseQuantity = Math.floor(Math.random() * 20) + 5 // 5-25
        maxCapacity = 50
        reorderThreshold = 10
      }

      // Supplies (higher quantities)
      if (item.type === 'SUPPLY') {
        baseQuantity = Math.floor(Math.random() * 200) + 50 // 50-250
        maxCapacity = 1000
        reorderThreshold = 100
      }

      // Add some variance - some items will be low stock or out of stock
      const variance = Math.random()
      let currentQuantity = baseQuantity

      if (variance < 0.1) { // 10% chance of being out of stock
        currentQuantity = 0
      } else if (variance < 0.2) { // 10% chance of being low stock
        currentQuantity = Math.floor(reorderThreshold * 0.5)
      } else if (variance < 0.3) { // 10% chance of being at reorder threshold
        currentQuantity = reorderThreshold
      } else {
        // Normal stock levels with some variation
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

  // Create inventory records in batches
  const batchSize = 100
  for (let i = 0; i < inventoryData.length; i += batchSize) {
    const batch = inventoryData.slice(i, i + batchSize)
    await prisma.inventory.createMany({
      data: batch,
    })
  }

  console.log('✅ Created inventory records')

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

  console.log('\n🎉 Database seeding completed!')
  console.log('=================================')
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
  console.log('   Email: admin@generalhospital.com')
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