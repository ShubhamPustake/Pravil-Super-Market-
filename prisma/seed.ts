import 'dotenv/config'
import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Starting seed for ERP...')

  // Delete all data
  await prisma.stockMovement.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.purchaseItem.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Store Admin',
      email: 'admin@pravilmart.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log(`Created admin user: ${admin.email}`)

  // Create Categories
  const categories = [
    'Dairy', 'Rice', 'Atta', 'Wheat', 'Pulses', 'Oil', 'Sugar', 'Tea', 
    'Coffee', 'Spices', 'Biscuits', 'Snacks', 'Beverages', 'Frozen Food', 
    'Household', 'Cleaning', 'Personal Care', 'Packaged Food', 'Others'
  ]

  for (const catName of categories) {
    const slug = catName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
    await prisma.category.create({
      data: {
        name: catName,
        slug: slug,
      }
    })
  }
  console.log('Created categories')

  // Create dummy supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Default Wholesale Supplier',
      contact: '9876543210',
      address: 'Mumbai Market',
      gst: '27AAAAA0000A1Z5'
    }
  })
  console.log(`Created default supplier: ${supplier.name}`)

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
