import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

  // Create 10 sites
  const sites = await Promise.all([
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

  // Create stock areas for each site
  const stockAreaTypes = [
    'Main Pharmacy', 'Emergency Pharmacy', 'OR Pharmacy', 'ICU Med Room',
    'CCU Med Room', 'NICU Med Room', 'PICU Med Room', 'General Med Room',
    'Oncology Pharmacy', 'Chemotherapy Prep', 'IV Therapy Room', 'Central Supply',
    'OR Supply Room', 'Emergency Supply', 'Crash Cart Supplies', 'Isolation Supply',
    'Respiratory Therapy', 'Radiology Supply', 'Laboratory Supply', 'Blood Bank'
  ]

  const stockAreas = []
  for (const site of sites) {
    // Each site gets 8 different stock areas
    const areasForSite = stockAreaTypes.slice(0, 8)
    
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

  // Generate 5000 items with simple naming to avoid duplicates
  console.log('💾 Creating 5000 items...')
  const items = []

  // Base medication names
  const baseMeds = [
    'Acetaminophen', 'Ibuprofen', 'Aspirin', 'Morphine', 'Codeine', 'Tramadol', 'Oxycodone',
    'Amoxicillin', 'Azithromycin', 'Cephalexin', 'Ciprofloxacin', 'Doxycycline', 'Penicillin',
    'Lisinopril', 'Amlodipine', 'Metoprolol', 'Atorvastatin', 'Simvastatin', 'Losartan',
    'Warfarin', 'Heparin', 'Clopidogrel', 'Aspirin', 'Enoxaparin',
    'Insulin', 'Metformin', 'Glipizide', 'Glyburide', 'Sitagliptin',
    'Sertraline', 'Fluoxetine', 'Alprazolam', 'Lorazepam', 'Diazepam',
    'Albuterol', 'Prednisone', 'Budesonide', 'Fluticasone',
    'Omeprazole', 'Lansoprazole', 'Ranitidine', 'Famotidine',
    'Levothyroxine', 'Liothyronine', 'Methimazole'
  ]

  // Base supply names
  const baseSupplies = [
    'Surgical Gloves', 'Exam Gloves', 'N95 Masks', 'Surgical Masks', 'Face Shields',
    'Syringes', 'Needles', 'IV Catheters', 'IV Tubing', 'Gauze Pads',
    'Medical Tape', 'Bandages', 'Thermometer Covers', 'Blood Pressure Cuffs',
    'Stethoscopes', 'Pulse Oximeters', 'Glucometers', 'Test Strips',
    'Blood Collection Tubes', 'Urine Containers', 'Culture Swabs',
    'Surgical Scissors', 'Forceps', 'Scalpels', 'Sutures',
    'Oxygen Masks', 'Nasal Cannulas', 'Nebulizer Masks', 'CPAP Masks'
  ]

  const strengths = ['5mg', '10mg', '25mg', '50mg', '100mg', '250mg', '500mg', '1g']
  const forms = ['Tablet', 'Capsule', 'Solution', 'Injection', 'Cream', 'Ointment']
  const sizes = ['XS', 'S', 'M', 'L', 'XL']
  const quantities = ['Box of 50', 'Box of 100', 'Pack of 10', 'Pack of 25', 'Each']

  let itemCount = 0

  // Generate medications (3000 items)
  for (let i = 0; i < 3000; i++) {
    const baseName = baseMeds[Math.floor(Math.random() * baseMeds.length)]
    const strength = strengths[Math.floor(Math.random() * strengths.length)]
    const form = forms[Math.floor(Math.random() * forms.length)]
    const variant = Math.floor(Math.random() * 100)
    
    const name = `${baseName} ${strength} ${form} V${variant}`
    const drugId = `${baseName.substring(0, 3).toUpperCase()}${String(i).padStart(4, '0')}`
    
    // Set safety flags based on medication type
    let isHighAlert = false
    let isHazardous = false
    let isLASA = false
    
    if (['Morphine', 'Oxycodone', 'Warfarin', 'Heparin', 'Insulin'].includes(baseName)) {
      isHighAlert = true
    }
    
    if (['Warfarin', 'Morphine'].includes(baseName)) {
      isLASA = true
    }
    
    if (Math.random() < 0.02) { // 2% chance for hazardous
      isHazardous = true
      isHighAlert = true
    }

    items.push({
      name,
      description: `Medication: ${name}`,
      type: 'MEDICATION',
      drugId,
      isHazardous,
      isHighAlert,
      isLASA,
      companyId: company.id,
    })
    itemCount++
  }

  // Generate supplies (2000 items)
  for (let i = 0; i < 2000; i++) {
    const baseName = baseSupplies[Math.floor(Math.random() * baseSupplies.length)]
    const size = sizes[Math.floor(Math.random() * sizes.length)]
    const quantity = quantities[Math.floor(Math.random() * quantities.length)]
    const variant = Math.floor(Math.random() * 100)
    
    const name = `${baseName} ${size} ${quantity} V${variant}`

    items.push({
      name,
      description: `Medical Supply: ${name}`,
      type: 'SUPPLY',
      drugId: null,
      isHazardous: false,
      isHighAlert: false,
      isLASA: false,
      companyId: company.id,
    })
    itemCount++
  }

  console.log(`📊 Generated ${itemCount} items`)

  // Create items in batches to improve performance
  const batchSize = 250
  const createdItems = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    
    try {
      const result = await prisma.item.createMany({
        data: batch,
        skipDuplicates: true,
      })
      
      // Get the created items for inventory creation
      const batchItems = await prisma.item.findMany({
        where: {
          companyId: company.id,
        },
        skip: createdItems.length,
        take: result.count,
      })
      
      createdItems.push(...batchItems)
      
      if (i % 1000 === 0) {
        console.log(`   Created ${i + batch.length} items...`)
      }
    } catch (error) {
      console.error(`Error creating batch ${i}-${i + batch.length}:`, error)
    }
  }

  console.log(`✅ Created ${createdItems.length} items in database`)

  // Create inventory records
  console.log('📋 Creating inventory records...')
  const inventoryData = []
  
  // Each stock area gets 200-400 random items
  for (const stockArea of stockAreas) {
    const itemsForArea = createdItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 200) + 200) // 200-400 items

    for (const item of itemsForArea) {
      // Generate realistic quantities
      let currentQuantity = 50
      let maxCapacity = 200
      let reorderThreshold = 20

      if (item.type === 'MEDICATION') {
        if (item.isHighAlert || item.isHazardous) {
          currentQuantity = Math.floor(Math.random() * 20) + 5
          maxCapacity = 50
          reorderThreshold = 10
        } else {
          currentQuantity = Math.floor(Math.random() * 100) + 25
          maxCapacity = 300
          reorderThreshold = 30
        }
      } else { // SUPPLY
        currentQuantity = Math.floor(Math.random() * 200) + 50
        maxCapacity = 1000
        reorderThreshold = 100
      }

      // Add variance for stock levels
      const variance = Math.random()
      if (variance < 0.05) {
        currentQuantity = 0 // 5% out of stock
      } else if (variance < 0.15) {
        currentQuantity = Math.floor(reorderThreshold * 0.5) // 10% low stock
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

  console.log(`📦 Creating ${inventoryData.length} inventory records...`)
  
  // Create inventory in batches
  for (let i = 0; i < inventoryData.length; i += batchSize) {
    const batch = inventoryData.slice(i, i + batchSize)
    await prisma.inventory.createMany({
      data: batch,
      skipDuplicates: true,
    })
    
    if (i % 2000 === 0) {
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