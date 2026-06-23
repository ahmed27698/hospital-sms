import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', nameAr: 'مدير النظام', type: 'ADMIN', permissions: ['*'] },
  })
  const managerRole = await prisma.role.upsert({
    where: { name: 'Quality Manager' },
    update: {},
    create: { name: 'Quality Manager', nameAr: 'مدير الجودة', type: 'MANAGER', permissions: ['standards:read', 'standards:write', 'requirements:read', 'requirements:write', 'reports:read'] },
  })
  const staffRole = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: { name: 'Staff', nameAr: 'موظف', type: 'STAFF', permissions: ['requirements:read', 'documents:read'] },
  })

  console.log('✔ Roles created')

  // Departments
  const departments = await Promise.all([
    prisma.department.upsert({ where: { id: 'dept-emergency' }, update: {}, create: { id: 'dept-emergency', name: 'Emergency', nameAr: 'الطوارئ' } }),
    prisma.department.upsert({ where: { id: 'dept-icu' }, update: {}, create: { id: 'dept-icu', name: 'ICU', nameAr: 'العناية المركزة' } }),
    prisma.department.upsert({ where: { id: 'dept-pharmacy' }, update: {}, create: { id: 'dept-pharmacy', name: 'Pharmacy', nameAr: 'الصيدلية' } }),
    prisma.department.upsert({ where: { id: 'dept-nursing' }, update: {}, create: { id: 'dept-nursing', name: 'Nursing', nameAr: 'التمريض' } }),
    prisma.department.upsert({ where: { id: 'dept-quality' }, update: {}, create: { id: 'dept-quality', name: 'Quality & Patient Safety', nameAr: 'الجودة وسلامة المرضى' } }),
    prisma.department.upsert({ where: { id: 'dept-infection' }, update: {}, create: { id: 'dept-infection', name: 'Infection Control', nameAr: 'مكافحة العدوى' } }),
  ])

  console.log('✔ Departments created')

  // Admin user
  const password = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.org' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@hospital.org',
      password,
      roleId: adminRole.id,
      departmentId: departments[4].id,
      jobTitle: 'System Administrator',
      status: 'ACTIVE',
    },
  })

  console.log('✔ Admin user created')

  // Quality Manager user
  const managerPassword = await bcrypt.hash('Manager@123', 12)
  await prisma.user.upsert({
    where: { email: 'quality@hospital.org' },
    update: {},
    create: {
      name: 'Quality Manager',
      email: 'quality@hospital.org',
      password: managerPassword,
      roleId: managerRole.id,
      departmentId: departments[4].id,
      jobTitle: 'Quality Manager',
      status: 'ACTIVE',
    },
  })

  console.log('✔ Quality Manager user created')

  // Sample JCI standards
  const standards = await Promise.all([
    prisma.standard.upsert({
      where: { code: 'ACC.1' },
      update: { chapterTitle: 'Access to Care and Continuity of Care', level: 1 },
      create: {
        code: 'ACC.1',
        title: 'Access to Care and Continuity of Care',
        titleAr: 'الوصول إلى الرعاية واستمراريتها',
        chapterCode: 'ACC',
        chapterTitle: 'Access to Care and Continuity of Care',
        chapterTitleAr: 'الوصول إلى الرعاية',
        level: 1,
        departmentId: departments[0].id,
        ownerId: admin.id,
        orderIndex: 1,
      },
    }),
    prisma.standard.upsert({
      where: { code: 'PCI.1' },
      update: { chapterTitle: 'Prevention and Control of Infections', level: 1 },
      create: {
        code: 'PCI.1',
        title: 'Prevention and Control of Infections',
        titleAr: 'الوقاية من العدوى ومكافحتها',
        chapterCode: 'PCI',
        chapterTitle: 'Prevention and Control of Infections',
        chapterTitleAr: 'مكافحة العدوى',
        level: 1,
        departmentId: departments[5].id,
        ownerId: admin.id,
        orderIndex: 1,
      },
    }),
    prisma.standard.upsert({
      where: { code: 'MMU.1' },
      update: { chapterTitle: 'Medication Management and Use', level: 1 },
      create: {
        code: 'MMU.1',
        title: 'Medication Management and Use',
        titleAr: 'إدارة الأدوية واستخدامها',
        chapterCode: 'MMU',
        chapterTitle: 'Medication Management and Use',
        chapterTitleAr: 'إدارة الأدوية',
        level: 1,
        departmentId: departments[2].id,
        ownerId: admin.id,
        orderIndex: 1,
      },
    }),
    prisma.standard.upsert({
      where: { code: 'QPS.1' },
      update: { chapterTitle: 'Quality Improvement and Patient Safety', level: 1 },
      create: {
        code: 'QPS.1',
        title: 'Quality Improvement and Patient Safety',
        titleAr: 'تحسين الجودة وسلامة المرضى',
        chapterCode: 'QPS',
        chapterTitle: 'Quality Improvement and Patient Safety',
        chapterTitleAr: 'الجودة وسلامة المرضى',
        level: 1,
        departmentId: departments[4].id,
        ownerId: admin.id,
        orderIndex: 1,
      },
    }),
  ])

  console.log('✔ Standards created')

  // Sample requirements
  const now = new Date()
  const inTenDays = new Date(now.getTime() + 10 * 86400000)
  const inThirtyDays = new Date(now.getTime() + 30 * 86400000)
  const pastDate = new Date(now.getTime() - 5 * 86400000)

  await Promise.all([
    prisma.requirement.upsert({
      where: { id: 'req-acc-1-1' },
      update: {},
      create: {
        id: 'req-acc-1-1',
        code: 'ACC.1.1',
        title: 'The hospital has a process for admitting inpatients',
        titleAr: 'يوجد إجراء لقبول المرضى الداخليين',
        standardId: standards[0].id,
        departmentId: departments[0].id,
        ownerId: admin.id,
        status: 'COMPLETED',
        priority: 3,
        dueDate: inThirtyDays,
        completedAt: now,
        orderIndex: 1,
      },
    }),
    prisma.requirement.upsert({
      where: { id: 'req-acc-1-2' },
      update: {},
      create: {
        id: 'req-acc-1-2',
        code: 'ACC.1.2',
        title: 'The hospital provides emergency services',
        titleAr: 'تقدم المستشفى خدمات الطوارئ',
        standardId: standards[0].id,
        departmentId: departments[0].id,
        ownerId: admin.id,
        status: 'IN_PROGRESS',
        priority: 3,
        dueDate: inTenDays,
        orderIndex: 2,
      },
    }),
    prisma.requirement.upsert({
      where: { id: 'req-pci-1-1' },
      update: {},
      create: {
        id: 'req-pci-1-1',
        code: 'PCI.1.1',
        title: 'The hospital designs and implements a program to reduce infection risk',
        titleAr: 'تصمم المستشفى وتنفذ برنامجاً للحد من مخاطر العدوى',
        standardId: standards[1].id,
        departmentId: departments[5].id,
        ownerId: admin.id,
        status: 'OVERDUE',
        priority: 3,
        dueDate: pastDate,
        orderIndex: 1,
      },
    }),
    prisma.requirement.upsert({
      where: { id: 'req-mmu-1-1' },
      update: {},
      create: {
        id: 'req-mmu-1-1',
        code: 'MMU.1.1',
        title: 'Medication orders are written clearly and legibly',
        titleAr: 'تُكتب أوامر الأدوية بوضوح وقابلية للقراءة',
        standardId: standards[2].id,
        departmentId: departments[2].id,
        ownerId: admin.id,
        status: 'NOT_STARTED',
        priority: 2,
        dueDate: inThirtyDays,
        orderIndex: 1,
      },
    }),
    prisma.requirement.upsert({
      where: { id: 'req-qps-1-1' },
      update: {},
      create: {
        id: 'req-qps-1-1',
        code: 'QPS.1.1',
        title: 'Leaders establish a quality improvement and patient safety program',
        titleAr: 'يضع القادة برنامجاً لتحسين الجودة وسلامة المرضى',
        standardId: standards[3].id,
        departmentId: departments[4].id,
        ownerId: admin.id,
        status: 'COMPLETED',
        priority: 3,
        dueDate: inThirtyDays,
        completedAt: now,
        orderIndex: 1,
      },
    }),
    prisma.requirement.upsert({
      where: { id: 'req-qps-1-2' },
      update: {},
      create: {
        id: 'req-qps-1-2',
        code: 'QPS.1.2',
        title: 'Quality data is collected and analyzed on a regular basis',
        titleAr: 'يتم جمع بيانات الجودة وتحليلها بشكل منتظم',
        standardId: standards[3].id,
        departmentId: departments[4].id,
        ownerId: admin.id,
        status: 'IN_PROGRESS',
        priority: 2,
        dueDate: inTenDays,
        orderIndex: 2,
      },
    }),
  ])

  console.log('✔ Requirements created')

  // Audit log entry
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE',
      resource: 'system',
      description: 'Database seeded with initial data',
    },
  })

  console.log('\n✅ Seed complete!')
  console.log('─────────────────────────────')
  console.log('Admin login:')
  console.log('  Email:    admin@hospital.org')
  console.log('  Password: Admin@123')
  console.log('')
  console.log('Quality Manager login:')
  console.log('  Email:    quality@hospital.org')
  console.log('  Password: Manager@123')
  console.log('─────────────────────────────')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
