import { PrismaClient, Role, LeadStatus, DealStage, ActivityType, Priority } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users with different roles
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      email: 'admin@crm.com',
      name: 'Admin User',
      role: Role.ADMIN,
      isActive: true
    }
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@crm.com' },
    update: {},
    create: {
      email: 'manager@crm.com',
      name: 'Manager User',
      role: Role.MANAGER,
      isActive: true
    }
  })

  const repUser1 = await prisma.user.upsert({
    where: { email: 'rep1@crm.com' },
    update: {},
    create: {
      email: 'rep1@crm.com',
      name: 'Sales Rep 1',
      role: Role.REP,
      isActive: true
    }
  })

  const repUser2 = await prisma.user.upsert({
    where: { email: 'rep2@crm.com' },
    update: {},
    create: {
      email: 'rep2@crm.com',
      name: 'Sales Rep 2',
      role: Role.REP,
      isActive: true
    }
  })

  console.log('✅ Users created')

  // Create contacts
  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      company: 'Tech Corp',
      position: 'CTO',
      notes: 'Interested in enterprise solutions',
      ownerId: repUser1.id
    }
  })

  const contact2 = await prisma.contact.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@startup.io',
      phone: '+1-555-0124',
      company: 'Startup Inc',
      position: 'CEO',
      notes: 'Fast-growing startup',
      ownerId: repUser2.id
    }
  })

  console.log('✅ Contacts created')

  // Create leads
  const lead1 = await prisma.lead.create({
    data: {
      title: 'Enterprise CRM Implementation',
      company: 'Tech Corp',
      status: LeadStatus.QUALIFIED,
      value: 50000,
      notes: 'Looking for comprehensive CRM solution',
      contactId: contact1.id,
      ownerId: repUser1.id
    }
  })

  console.log('✅ Leads created')

  // Create deals
  const deal1 = await prisma.deal.create({
    data: {
      title: 'Tech Corp Enterprise Deal',
      value: 50000,
      stage: DealStage.PROPOSAL,
      probability: 75,
      expectedCloseDate: new Date('2024-12-31'),
      notes: 'Proposal submitted',
      contactId: contact1.id,
      leadId: lead1.id,
      ownerId: repUser1.id
    }
  })

  console.log('✅ Deals created')

  // Create activities
  await prisma.activity.create({
    data: {
      title: 'Initial Discovery Call',
      description: 'Conducted discovery call',
      type: ActivityType.CALL,
      priority: Priority.HIGH,
      isCompleted: true,
      completedAt: new Date('2024-01-15'),
      contactId: contact1.id,
      leadId: lead1.id,
      assigneeId: repUser1.id,
      createdById: repUser1.id
    }
  })

  console.log('✅ Activities created')

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
