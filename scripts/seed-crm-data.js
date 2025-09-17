const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function seedCRMData() {
  console.log('🌱 Starting CRM data seeding...');

  try {
    // First, let's get existing users to understand current state
    const existingUsers = await prisma.user.findMany();
    console.log(`Found ${existingUsers.length} existing users`);

    // Create additional users with various roles
    const additionalUsers = [
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@crm.com',
        password: await hashPassword('password123'),
        role: 'MANAGER',
        isActive: true,
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@crm.com',
        password: await hashPassword('password123'),
        role: 'REP',
        isActive: true,
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@crm.com',
        password: await hashPassword('password123'),
        role: 'REP',
        isActive: true,
      },
      {
        name: 'David Kim',
        email: 'david.kim@crm.com',
        password: await hashPassword('password123'),
        role: 'REP',
        isActive: true,
      },
      {
        name: 'Jessica Brown',
        email: 'jessica.brown@crm.com',
        password: await hashPassword('password123'),
        role: 'REP',
        isActive: true,
      },
      {
        name: 'Alex Thompson',
        email: 'alex.thompson@crm.com',
        password: await hashPassword('password123'),
        role: 'READ_ONLY',
        isActive: true,
      },
    ];

    const newUsers = [];
    for (const userData of additionalUsers) {
      const existing = await prisma.user.findUnique({ where: { email: userData.email } });
      if (!existing) {
        const user = await prisma.user.create({ data: userData });
        newUsers.push(user);
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } else {
        newUsers.push(existing);
        console.log(`⚠️ User already exists: ${existing.name} (${existing.email})`);
      }
    }

    // Get all users for assignment
    const allUsers = await prisma.user.findMany();
    const reps = allUsers.filter(u => ['REP', 'MANAGER', 'ADMIN'].includes(u.role));

    console.log(`📊 Total users: ${allUsers.length}, Available reps: ${reps.length}`);

    // Create comprehensive contacts database
    const contactsData = [
      {
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.johnson@techcorp.com',
        phone: '+1-555-0101',
        company: 'TechCorp Industries',
        position: 'CEO',
        address: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        tags: ['enterprise', 'decision-maker', 'tech', 'technology'],
        notes: 'CEO of major tech company, interested in enterprise solutions. Very responsive to email communication. Website: https://techcorp.com',
      },
      {
        firstName: 'Maria',
        lastName: 'Gonzalez',
        email: 'maria.gonzalez@innovate.com',
        phone: '+1-555-0102',
        company: 'Innovate Solutions',
        position: 'CTO',
        address: '456 Innovation Blvd',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA',
        tags: ['technical', 'early-adopter', 'saas', 'software'],
        notes: 'Very technical contact, prefers detailed technical discussions. Key decision maker for software purchases. Website: https://innovatesolutions.com',
      },
      {
        firstName: 'James',
        lastName: 'Miller',
        email: 'james.miller@retailplus.com',
        phone: '+1-555-0103',
        company: 'RetailPlus Chain',
        position: 'VP of Operations',
        address: '789 Retail Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        tags: ['retail', 'operations', 'scale'],
        notes: 'Manages operations for 200+ retail locations. Looking for scalable solutions. Website: https://retailplus.com',
      },
      {
        firstName: 'Lisa',
        lastName: 'Wang',
        email: 'lisa.wang@healthtech.com',
        phone: '+1-555-0104',
        company: 'HealthTech Innovations',
        position: 'Product Manager',
        address: '321 Health Plaza',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA',
        tags: ['healthcare', 'compliance', 'product'],
        notes: 'Product manager focused on healthcare compliance. Interested in secure, HIPAA-compliant solutions. Website: https://healthtech.com',
      },
      {
        firstName: 'Thomas',
        lastName: 'Anderson',
        email: 'thomas.anderson@finance.com',
        phone: '+1-555-0105',
        company: 'Anderson Financial',
        position: 'Managing Director',
        address: '654 Wall Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10005',
        country: 'USA',
        tags: ['finance', 'compliance', 'enterprise'],
        notes: 'Managing director at investment firm. Requires high security and compliance standards. Website: https://andersonfinancial.com',
      },
      {
        firstName: 'Rachel',
        lastName: 'Green',
        email: 'rachel.green@startup.io',
        phone: '+1-555-0106',
        company: 'GreenStart Inc',
        position: 'Founder',
        address: '987 Startup Way',
        city: 'Palo Alto',
        state: 'CA',
        zipCode: '94301',
        country: 'USA',
        tags: ['startup', 'founder', 'sustainability'],
        notes: 'Startup founder in clean energy space. Budget conscious but growing rapidly. Website: https://greenstart.io',
      },
      {
        firstName: 'Christopher',
        lastName: 'Lee',
        email: 'chris.lee@manufacturing.com',
        phone: '+1-555-0107',
        company: 'Lee Manufacturing',
        position: 'Plant Manager',
        address: '147 Industrial Rd',
        city: 'Detroit',
        state: 'MI',
        zipCode: '48201',
        country: 'USA',
        tags: ['manufacturing', 'automation', 'efficiency'],
        notes: 'Plant manager looking to modernize operations with automation and digital tools. Website: https://leemanufacturing.com',
      },
      {
        firstName: 'Amanda',
        lastName: 'Davis',
        email: 'amanda.davis@consulting.com',
        phone: '+1-555-0108',
        company: 'Davis Consulting Group',
        position: 'Senior Partner',
        address: '258 Consultant Ave',
        city: 'Washington',
        state: 'DC',
        zipCode: '20001',
        country: 'USA',
        tags: ['consulting', 'strategy', 'enterprise'],
        notes: 'Senior partner at consulting firm. Often recommends solutions to clients. High influence potential. Website: https://davisconsulting.com',
      },
      {
        firstName: 'Kevin',
        lastName: 'Wright',
        email: 'kevin.wright@education.edu',
        phone: '+1-555-0109',
        company: 'Wright University',
        position: 'IT Director',
        address: '369 University Dr',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA',
        tags: ['education', 'it', 'budget-conscious'],
        notes: 'IT Director at university. Limited budget but potential for long-term relationship. Website: https://wright.edu',
      },
      {
        firstName: 'Nicole',
        lastName: 'Taylor',
        email: 'nicole.taylor@logistics.com',
        phone: '+1-555-0110',
        company: 'Taylor Logistics',
        position: 'Operations Director',
        address: '741 Warehouse Blvd',
        city: 'Memphis',
        state: 'TN',
        zipCode: '38101',
        country: 'USA',
        tags: ['logistics', 'operations', 'efficiency'],
        notes: 'Operations director for logistics company. Interested in tracking and efficiency solutions. Website: https://taylorlogistics.com',
      }
    ];

    const contacts = [];
    for (const contactData of contactsData) {
      const existing = await prisma.contact.findUnique({ where: { email: contactData.email } });
      if (!existing) {
        const owner = reps[Math.floor(Math.random() * reps.length)];
        const contact = await prisma.contact.create({
          data: {
            ...contactData,
            ownerId: owner.id,
          }
        });
        contacts.push(contact);
        console.log(`✅ Created contact: ${contact.firstName} ${contact.lastName} (${contact.company})`);
      } else {
        contacts.push(existing);
        console.log(`⚠️ Contact already exists: ${existing.firstName} ${existing.lastName}`);
      }
    }

    // Create comprehensive leads database
    const leadsData = [
      {
        title: 'Enterprise Software Implementation - TechCorp',
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.johnson@techcorp.com',
        phone: '+1-555-0101',
        company: 'TechCorp Industries',
        position: 'CEO',
        source: 'REFERRAL',
        status: 'QUALIFIED',
        value: 250000,
        notes: 'CEO interested in comprehensive enterprise software solution. Needs implementation by Q2 2025.',
        tags: ['enterprise', 'high-value', 'urgent'],
      },
      {
        title: 'SaaS Platform Migration - Innovate Solutions',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        email: 'maria.gonzalez@innovate.com',
        phone: '+1-555-0102',
        company: 'Innovate Solutions',
        position: 'CTO',
        source: 'WEBSITE',
        status: 'CONTACTED',
        value: 180000,
        notes: 'CTO looking to migrate from legacy system to modern SaaS platform. Technical decision maker.',
        tags: ['saas', 'migration', 'technical'],
      },
      {
        title: 'Retail Operations Automation - RetailPlus',
        firstName: 'James',
        lastName: 'Miller',
        email: 'james.miller@retailplus.com',
        phone: '+1-555-0103',
        company: 'RetailPlus Chain',
        position: 'VP of Operations',
        source: 'COLD_CALL',
        status: 'NEW',
        value: 320000,
        notes: 'VP of Operations for 200+ retail locations. Interested in automation and efficiency tools.',
        tags: ['retail', 'automation', 'large-scale'],
      },
      {
        title: 'Healthcare Compliance Solution - HealthTech',
        firstName: 'Lisa',
        lastName: 'Wang',
        email: 'lisa.wang@healthtech.com',
        phone: '+1-555-0104',
        company: 'HealthTech Innovations',
        position: 'Product Manager',
        source: 'LINKEDIN',
        status: 'QUALIFIED',
        value: 150000,
        notes: 'Product manager seeking HIPAA-compliant solutions for healthcare data management.',
        tags: ['healthcare', 'compliance', 'hipaa'],
      },
      {
        title: 'Financial Services Integration - Anderson Financial',
        firstName: 'Thomas',
        lastName: 'Anderson',
        email: 'thomas.anderson@finance.com',
        phone: '+1-555-0105',
        company: 'Anderson Financial',
        position: 'Managing Director',
        source: 'REFERRAL',
        status: 'PROPOSAL',
        value: 400000,
        notes: 'Managing director needs secure financial data integration. High security requirements.',
        tags: ['finance', 'security', 'integration'],
      },
      {
        title: 'Startup Growth Platform - GreenStart',
        firstName: 'Rachel',
        lastName: 'Green',
        email: 'rachel.green@startup.io',
        phone: '+1-555-0106',
        company: 'GreenStart Inc',
        position: 'Founder',
        source: 'CONFERENCE',
        status: 'CONTACTED',
        value: 75000,
        notes: 'Startup founder looking for scalable growth platform. Budget conscious but high growth potential.',
        tags: ['startup', 'growth', 'scalable'],
      },
      {
        title: 'Manufacturing Automation - Lee Manufacturing',
        firstName: 'Christopher',
        lastName: 'Lee',
        email: 'chris.lee@manufacturing.com',
        phone: '+1-555-0107',
        company: 'Lee Manufacturing',
        position: 'Plant Manager',
        source: 'TRADE_SHOW',
        status: 'NEW',
        value: 220000,
        notes: 'Plant manager interested in automation solutions to improve efficiency and reduce costs.',
        tags: ['manufacturing', 'automation', 'efficiency'],
      },
      {
        title: 'Consulting Firm Tool Suite - Davis Consulting',
        firstName: 'Amanda',
        lastName: 'Davis',
        email: 'amanda.davis@consulting.com',
        phone: '+1-555-0108',
        company: 'Davis Consulting Group',
        position: 'Senior Partner',
        source: 'REFERRAL',
        status: 'QUALIFIED',
        value: 190000,
        notes: 'Senior partner looking for comprehensive consulting tool suite. Potential for referrals to clients.',
        tags: ['consulting', 'tools', 'referral-potential'],
      },
    ];

    const leads = [];
    for (const leadData of leadsData) {
      const existing = await prisma.lead.findFirst({ where: { email: leadData.email } });
      if (!existing) {
        const owner = reps[Math.floor(Math.random() * reps.length)];
        const contact = contacts.find(c => c.email === leadData.email);
        const lead = await prisma.lead.create({
          data: {
            ...leadData,
            ownerId: owner.id,
            contactId: contact?.id,
          }
        });
        leads.push(lead);
        console.log(`✅ Created lead: ${lead.title} (${lead.company})`);
      } else {
        leads.push(existing);
        console.log(`⚠️ Lead already exists: ${existing.title}`);
      }
    }

    // Create comprehensive deals database
    const dealsData = [
      {
        title: 'Enterprise Software Implementation - TechCorp',
        value: 250000,
        stage: 'NEGOTIATION',
        probability: 75,
        expectedCloseDate: new Date('2025-03-15'),
        source: 'REFERRAL',
        notes: 'Final negotiations on enterprise software implementation. Legal review in progress.',
        tags: ['enterprise', 'high-value', 'near-close'],
      },
      {
        title: 'SaaS Platform License - Innovate Solutions',
        value: 180000,
        stage: 'PROPOSAL',
        probability: 60,
        expectedCloseDate: new Date('2025-04-01'),
        source: 'WEBSITE',
        notes: 'Proposal submitted for annual SaaS platform license. Awaiting technical review.',
        tags: ['saas', 'annual-license', 'technical-review'],
      },
      {
        title: 'Retail Automation Suite - RetailPlus Chain',
        value: 320000,
        stage: 'VALUE_PROPOSITION',
        probability: 40,
        expectedCloseDate: new Date('2025-05-30'),
        source: 'COLD_CALL',
        notes: 'Demonstrating value proposition for retail automation across 200+ locations.',
        tags: ['retail', 'automation', 'large-deployment'],
      },
      {
        title: 'Healthcare Compliance Platform - HealthTech',
        value: 150000,
        stage: 'NEEDS_ANALYSIS',
        probability: 70,
        expectedCloseDate: new Date('2025-02-28'),
        source: 'LINKEDIN',
        notes: 'Completing needs analysis for HIPAA-compliant healthcare data platform.',
        tags: ['healthcare', 'compliance', 'hipaa'],
      },
      {
        title: 'Financial Integration Services - Anderson Financial',
        value: 400000,
        stage: 'PROPOSAL',
        probability: 80,
        expectedCloseDate: new Date('2025-01-31'),
        source: 'REFERRAL',
        notes: 'High-value financial services integration. Security audit completed successfully.',
        tags: ['finance', 'security', 'high-value'],
      },
      {
        title: 'Startup Growth Package - GreenStart Inc',
        value: 75000,
        stage: 'VALUE_PROPOSITION',
        probability: 50,
        expectedCloseDate: new Date('2025-06-15'),
        source: 'CONFERENCE',
        notes: 'Startup package with growth-based pricing model. Founder very interested.',
        tags: ['startup', 'growth-pricing', 'flexible'],
      },
      {
        title: 'Manufacturing Optimization - Lee Manufacturing',
        value: 220000,
        stage: 'QUALIFICATION',
        probability: 30,
        expectedCloseDate: new Date('2025-07-01'),
        source: 'TRADE_SHOW',
        notes: 'Early stage discovery for manufacturing optimization and automation solutions.',
        tags: ['manufacturing', 'optimization', 'early-stage'],
      },
      {
        title: 'Consulting Tools Premium - Davis Consulting',
        value: 190000,
        stage: 'NEGOTIATION',
        probability: 85,
        expectedCloseDate: new Date('2025-02-15'),
        source: 'REFERRAL',
        notes: 'Premium consulting tools package. Strong potential for client referrals.',
        tags: ['consulting', 'premium', 'referral-potential'],
      },
      {
        title: 'Education Platform License - Wright University',
        value: 95000,
        stage: 'PROPOSAL',
        probability: 55,
        expectedCloseDate: new Date('2025-08-01'),
        source: 'EMAIL',
        notes: 'Educational discount applied. Waiting for budget approval from university administration.',
        tags: ['education', 'discount', 'budget-approval'],
      },
      {
        title: 'Logistics Tracking System - Taylor Logistics',
        value: 130000,
        stage: 'VALUE_PROPOSITION',
        probability: 45,
        expectedCloseDate: new Date('2025-04-30'),
        source: 'COLD_EMAIL',
        notes: 'Demonstrating ROI for comprehensive logistics tracking and optimization system.',
        tags: ['logistics', 'tracking', 'roi-demo'],
      }
    ];

    const deals = [];
    for (const dealData of dealsData) {
      const existing = await prisma.deal.findFirst({ where: { title: dealData.title } });
      if (!existing) {
        const owner = reps[Math.floor(Math.random() * reps.length)];
        const contact = contacts[Math.floor(Math.random() * contacts.length)];
        const lead = leads.find(l => l.title.includes(dealData.title.split(' - ')[1]));
        
        const deal = await prisma.deal.create({
          data: {
            ...dealData,
            ownerId: owner.id,
            contactId: contact.id,
            leadId: lead?.id,
          }
        });
        deals.push(deal);
        console.log(`✅ Created deal: ${deal.title} ($${deal.value.toLocaleString()})`);
      } else {
        deals.push(existing);
        console.log(`⚠️ Deal already exists: ${existing.title}`);
      }
    }

    // Create comprehensive activities
    const activitiesData = [
      // Immediate follow-ups
      {
        title: 'Follow-up call with TechCorp CEO',
        description: 'Discuss final contract terms and implementation timeline',
        type: 'CALL',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        isCompleted: false,
        notes: 'Prepare contract amendments and implementation schedule',
      },
      {
        title: 'Technical demo for Innovate Solutions',
        description: 'Comprehensive platform demonstration for CTO and technical team',
        type: 'MEETING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        isCompleted: false,
        notes: 'Prepare technical deep-dive presentation and sandbox environment',
      },
      {
        title: 'Send proposal to RetailPlus',
        description: 'Submit detailed automation proposal with pricing',
        type: 'EMAIL',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        isCompleted: false,
        notes: 'Include case studies from similar retail implementations',
      },
      {
        title: 'Security audit review with Anderson Financial',
        description: 'Present security audit results and compliance documentation',
        type: 'MEETING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        isCompleted: false,
        notes: 'Bring security certification documents and compliance checklist',
      },
      {
        title: 'Budget discussion with Wright University',
        description: 'Discuss educational pricing and budget constraints',
        type: 'CALL',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        isCompleted: false,
        notes: 'Prepare educational discount structure and payment plans',
      },
      // Completed activities
      {
        title: 'Discovery call with HealthTech completed',
        description: 'Completed needs analysis for healthcare compliance requirements',
        type: 'CALL',
        priority: 'HIGH',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isCompleted: true,
        notes: 'Identified key compliance requirements and integration points',
      },
      {
        title: 'Sent welcome package to GreenStart',
        description: 'Delivered startup onboarding materials and growth plan',
        type: 'EMAIL',
        priority: 'LOW',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isCompleted: true,
        notes: 'Included startup success stories and growth metrics',
      },
      {
        title: 'Trade show follow-up with Lee Manufacturing',
        description: 'Post-trade show follow-up and scheduling next meeting',
        type: 'EMAIL',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isCompleted: true,
        notes: 'Positive response, interested in on-site demonstration',
      },
      // Upcoming activities
      {
        title: 'Quarterly business review with Davis Consulting',
        description: 'Review performance metrics and discuss expansion opportunities',
        type: 'MEETING',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        isCompleted: false,
        notes: 'Prepare performance dashboard and expansion proposal',
      },
      {
        title: 'ROI presentation for Taylor Logistics',
        description: 'Present cost-benefit analysis and ROI projections',
        type: 'MEETING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        isCompleted: false,
        notes: 'Include logistics efficiency metrics and cost savings projections',
      }
    ];

    let activityIndex = 0;
    for (const activityData of activitiesData) {
      const owner = reps[Math.floor(Math.random() * reps.length)];
      const assignee = reps[Math.floor(Math.random() * reps.length)];
      const contact = contacts[activityIndex % contacts.length];
      const deal = deals[activityIndex % deals.length];
      
      const activity = await prisma.activity.create({
        data: {
          title: activityData.title,
          description: activityData.description,
          type: activityData.type,
          priority: activityData.priority,
          dueDate: activityData.dueDate,
          isCompleted: activityData.isCompleted,
          createdById: owner.id,
          assigneeId: assignee.id,
          contactId: contact.id,
          dealId: deal.id,
        }
      });
      
      console.log(`✅ Created activity: ${activity.title} (${activity.type})`);
      activityIndex++;
    }

    // Create some additional standalone activities
    const standaloneActivities = [
      {
        title: 'Cold outreach to new prospects',
        description: 'Identify and contact 20 new prospects in healthcare vertical',
        type: 'TASK',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        isCompleted: false,
        notes: 'Focus on mid-market healthcare companies with 100-500 employees',
      },
      {
        title: 'Update CRM with Q4 results',
        description: 'Input Q4 performance data and update forecasts',
        type: 'TASK',
        priority: 'LOW',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        isCompleted: false,
        notes: 'Include win/loss analysis and pipeline review',
      },
      {
        title: 'Attend industry conference',
        description: 'Attend SaaS Industry Summit 2025',
        type: 'TASK',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        isCompleted: false,
        notes: 'Network with prospects and learn about industry trends',
      }
    ];

    for (const activityData of standaloneActivities) {
      const owner = reps[Math.floor(Math.random() * reps.length)];
      const assignee = reps[Math.floor(Math.random() * reps.length)];
      const contact = contacts[Math.floor(Math.random() * contacts.length)];
      
      const activity = await prisma.activity.create({
        data: {
          title: activityData.title,
          description: activityData.description,
          type: activityData.type,
          priority: activityData.priority,
          dueDate: activityData.dueDate,
          isCompleted: activityData.isCompleted,
          createdById: owner.id,
          assigneeId: assignee.id,
          contactId: contact.id,
        }
      });
      
      console.log(`✅ Created standalone activity: ${activity.title}`);
    }

    // Generate summary statistics
    const finalStats = {
      users: await prisma.user.count(),
      contacts: await prisma.contact.count(),
      leads: await prisma.lead.count(),
      deals: await prisma.deal.count(),
      activities: await prisma.activity.count(),
      totalDealValue: await prisma.deal.aggregate({
        _sum: { value: true }
      })
    };

    console.log('\n🎉 CRM Data Seeding Complete!');
    console.log('📊 Final Statistics:');
    console.log(`   Users: ${finalStats.users}`);
    console.log(`   Contacts: ${finalStats.contacts}`);
    console.log(`   Leads: ${finalStats.leads}`);
    console.log(`   Deals: ${finalStats.deals}`);
    console.log(`   Activities: ${finalStats.activities}`);
    console.log(`   Total Deal Value: $${finalStats.totalDealValue._sum.value?.toLocaleString() || 0}`);
    console.log('\n✨ Your CRM is now populated with comprehensive, interconnected data!');
    
  } catch (error) {
    console.error('❌ Error seeding CRM data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedCRMData()
  .then(() => {
    console.log('🌟 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });