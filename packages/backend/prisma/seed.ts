import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (for idempotency)
  console.log('🧹 Clearing existing data...');
  
  // Delete in correct order to respect foreign key constraints
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.repairRecord.deleteMany();
  await prisma.tenantHistory.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.user.deleteMany();
  await prisma.buildingOperatorPeriod.deleteMany();
  await prisma.managementContract.deleteMany();
  await prisma.building.deleteMany();
  await prisma.managementCompany.deleteMany();

  console.log('✅ Database cleared');

  // ======================
  // 1. CREATE MANAGEMENT COMPANY (TENANT)
  // ======================
  console.log('🏢 Creating management company...');
  
  const managementCompany = await prisma.managementCompany.create({
    data: {
      name: 'Skyline Property Management',
      subdomain: 'skyline-properties',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      settings: {
        notificationPreferences: {
          email: true,
          sms: true,
          push: true
        },
        maintenanceSettings: {
          autoAssign: true,
          defaultPriority: 'MEDIUM',
          responseTimeHours: 24
        }
      }
    }
  });

  console.log(`✅ Created management company: ${managementCompany.name}`);

  // ======================
  // 2. CREATE BUILDINGS WITH UNITS
  // ======================
  console.log('🏗️ Creating buildings and units...');

  // Building 1: Luxury Apartment Complex
  const building1 = await prisma.building.create({
    data: {
      name: 'The Grand Tower',
      address: '123 Luxury Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      yearBuilt: 2018,
      floors: 25,
      totalUnits: 150,
      ownerId: 'OWNER-001',
      currentManagementId: managementCompany.id,
    }
  });

  // Building 2: Office Building
  const building2 = await prisma.building.create({
    data: {
      name: 'Commerce Plaza',
      address: '456 Business Boulevard',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      yearBuilt: 2010,
      floors: 15,
      totalUnits: 80,
      ownerId: 'OWNER-002',
      currentManagementId: managementCompany.id,
    }
  });

  // Building 3: Mixed-Use Development
  const building3 = await prisma.building.create({
    data: {
      name: 'Riverfront Lofts',
      address: '789 Riverside Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      yearBuilt: 2020,
      floors: 12,
      totalUnits: 60,
      ownerId: 'OWNER-003',
      currentManagementId: managementCompany.id,
    }
  });

  console.log(`✅ Created 3 buildings: ${building1.name}, ${building2.name}, ${building3.name}`);

  // Create units for each building
  const unitsData = [];

  // Units for Building 1 (The Grand Tower) - 10 sample units
  for (let i = 1; i <= 10; i++) {
    unitsData.push({
      buildingId: building1.id,
      unitNumber: `GT${i.toString().padStart(3, '0')}`,
      type: i <= 7 ? 'APARTMENT' : 'CONDOMINIUM',
      squareFeet: 800 + (i * 50),
      bedrooms: i <= 3 ? 1 : i <= 7 ? 2 : 3,
      bathrooms: i <= 3 ? 1 : 2,
    });
  }

  // Units for Building 2 (Commerce Plaza) - 8 sample units
  for (let i = 1; i <= 8; i++) {
    unitsData.push({
      buildingId: building2.id,
      unitNumber: `CP${i.toString().padStart(3, '0')}`,
      type: i <= 5 ? 'OFFICE' : 'RETAIL',
      squareFeet: 1000 + (i * 75),
      bedrooms: 0,
      bathrooms: i <= 2 ? 1 : 2,
    });
  }

  // Units for Building 3 (Riverfront Lofts) - 6 sample units
  for (let i = 1; i <= 6; i++) {
    unitsData.push({
      buildingId: building3.id,
      unitNumber: `RL${i.toString().padStart(2, '0')}`,
      type: 'CONDOMINIUM',
      squareFeet: 1200 + (i * 100),
      bedrooms: i <= 2 ? 2 : 3,
      bathrooms: i <= 2 ? 2 : 3,
    });
  }

  // Create all units
  const units = await Promise.all(
    unitsData.map(unitData => prisma.unit.create({ data: unitData }))
  );

  console.log(`✅ Created ${units.length} units across all buildings`);

  // ======================
  // 3. CREATE USERS OF ALL ROLES
  // ======================
  console.log('👥 Creating users with different roles...');

  // ADMIN User (Management Company Admin)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@skylinemanagement.com',
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '+1-555-0101',
      role: 'ADMIN',
      managementCompanyId: managementCompany.id,
      employeeId: 'EMP-001',
      position: 'Chief Operations Officer',
    }
  });

  // MANAGER Users (Property Managers)
  const manager1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@skylinemanagement.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0102',
      role: 'MANAGER',
      managementCompanyId: managementCompany.id,
      employeeId: 'EMP-002',
      position: 'Property Manager - East Region',
    }
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'robert.garcia@skylinemanagement.com',
      firstName: 'Robert',
      lastName: 'Garcia',
      phone: '+1-555-0103',
      role: 'MANAGER',
      managementCompanyId: managementCompany.id,
      employeeId: 'EMP-003',
      position: 'Property Manager - West Region',
    }
  });

  // MAINTENANCE Users (Technicians)
  const maintenance1 = await prisma.user.create({
    data: {
      email: 'james.wilson@skylinemanagement.com',
      firstName: 'James',
      lastName: 'Wilson',
      phone: '+1-555-0104',
      role: 'MAINTENANCE',
      managementCompanyId: managementCompany.id,
      employeeId: 'EMP-004',
      position: 'Lead Maintenance Technician',
    }
  });

  const maintenance2 = await prisma.user.create({
    data: {
      email: 'maria.rodriguez@skylinemanagement.com',
      firstName: 'Maria',
      lastName: 'Rodriguez',
      phone: '+1-555-0105',
      role: 'MAINTENANCE',
      managementCompanyId: managementCompany.id,
      employeeId: 'EMP-005',
      position: 'HVAC Specialist',
    }
  });

  const maintenance3 = await prisma.user.create({
    data: {
      email: 'david.smith@skylinemanagement.com',
      firstName: 'David',
      lastName: 'Smith',
      phone: '+1-555-0106',
      role: 'MAINTENANCE',
      managementCompanyId: managementCompany.id,
      employeeId: 'EMP-006',
      position: 'Plumbing Technician',
    }
  });

  // TENANT Users (Building Occupants)
  const tenantUsers = [];
  const tenantData = [
    { email: 'alex.martin@example.com', firstName: 'Alex', lastName: 'Martin', unitId: units[0].id },
    { email: 'jennifer.lee@example.com', firstName: 'Jennifer', lastName: 'Lee', unitId: units[1].id },
    { email: 'thomas.brown@example.com', firstName: 'Thomas', lastName: 'Brown', unitId: units[2].id },
    { email: 'emily.williams@example.com', firstName: 'Emily', lastName: 'Williams', unitId: units[3].id },
    { email: 'daniel.miller@example.com', firstName: 'Daniel', lastName: 'Miller', unitId: units[10].id },
    { email: 'olivia.davis@example.com', firstName: 'Olivia', lastName: 'Davis', unitId: units[11].id },
    { email: 'william.moore@example.com', firstName: 'William', lastName: 'Moore', unitId: units[18].id },
    { email: 'sophia.taylor@example.com', firstName: 'Sophia', lastName: 'Taylor', unitId: units[19].id },
  ];

  for (let i = 0; i < tenantData.length; i++) {
    const tenant = await prisma.user.create({
      data: {
        email: tenantData[i].email,
        firstName: tenantData[i].firstName,
        lastName: tenantData[i].lastName,
        phone: `+1-555-01${10 + i}`,
        role: 'TENANT',
        unitId: tenantData[i].unitId,
        leaseStart: new Date('2024-01-01'),
        leaseEnd: new Date('2024-12-31'),
      }
    });
    tenantUsers.push(tenant);

    // Update unit with current tenant
    await prisma.unit.update({
      where: { id: tenantData[i].unitId },
      data: { currentTenantId: tenant.id }
    });

    // Create tenant history record
    await prisma.tenantHistory.create({
      data: {
        unitId: tenantData[i].unitId,
        userId: tenant.id,
        moveInDate: new Date('2024-01-01'),
        leaseTerms: {
          monthlyRent: 1800 + (i * 200),
          securityDeposit: 2000,
          leaseDurationMonths: 12,
          utilitiesIncluded: ['Water', 'Trash'],
          parkingSpaces: 1,
          petPolicy: i % 2 === 0 ? 'No pets' : 'Small pets allowed',
        }
      }
    });
  }

  console.log(`✅ Created users: 1 ADMIN, 2 MANAGERS, 3 MAINTENANCE, ${tenantUsers.length} TENANTS`);

  // ======================
  // 4. CREATE MANAGEMENT CONTRACTS
  // ======================
  console.log('📝 Creating management contracts...');

  const contracts = await Promise.all([
    prisma.managementContract.create({
      data: {
        buildingId: building1.id,
        managementCompanyId: managementCompany.id,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2025-12-31'),
        status: 'ACTIVE',
        terms: {
          managementFee: '5% of gross revenue',
          servicesIncluded: ['Maintenance', 'Accounting', 'Marketing'],
          responseTimeSLA: '24 hours for emergencies',
          reportingFrequency: 'Monthly',
        }
      }
    }),
    prisma.managementContract.create({
      data: {
        buildingId: building2.id,
        managementCompanyId: managementCompany.id,
        startDate: new Date('2022-06-01'),
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
        terms: {
          managementFee: '4% of gross revenue',
          servicesIncluded: ['Maintenance', 'Security', 'Cleaning'],
          responseTimeSLA: '48 hours for non-emergencies',
          reportingFrequency: 'Quarterly',
        }
      }
    }),
    prisma.managementContract.create({
      data: {
        buildingId: building3.id,
        managementCompanyId: managementCompany.id,
        startDate: new Date('2023-03-01'),
        endDate: new Date('2026-02-28'),
        status: 'ACTIVE',
        terms: {
          managementFee: '6% of gross revenue',
          servicesIncluded: ['Full Service', 'Concierge', 'Amenity Management'],
          responseTimeSLA: '2 hours for emergencies',
          reportingFrequency: 'Weekly',
        }
      }
    }),
  ]);

  console.log(`✅ Created ${contracts.length} management contracts`);

  // ======================
  // 5. CREATE ASSETS
  // ======================
  console.log('🔧 Creating building assets...');

  const assets = await Promise.all([
    // Building 1 assets
    prisma.asset.create({
      data: {
        buildingId: building1.id,
        name: 'Main Elevator System',
        type: 'ELEVATOR',
        manufacturer: 'Otis',
        model: 'Gen2',
        serialNumber: 'OTIS-2023-001',
        installationDate: new Date('2023-01-15'),
        status: 'OPERATIONAL',
        expectedLifespanMonths: 240,
        nextMaintenanceDate: new Date('2024-06-01'),
      }
    }),
    prisma.asset.create({
      data: {
        buildingId: building1.id,
        name: 'Central HVAC System',
        type: 'HVAC',
        manufacturer: 'Trane',
        model: 'XR17',
        serialNumber: 'TRANE-2023-002',
        installationDate: new Date('2023-02-20'),
        status: 'OPERATIONAL',
        expectedLifespanMonths: 180,
        nextMaintenanceDate: new Date('2024-04-15'),
      }
    }),
    // Building 2 assets
    prisma.asset.create({
      data: {
        buildingId: building2.id,
        name: 'Fire Alarm System',
        type: 'FIRE_SAFETY',
        manufacturer: 'Simplex',
        model: '4100ES',
        serialNumber: 'SIMPLEX-2022-001',
        installationDate: new Date('2022-05-10'),
        status: 'OPERATIONAL',
        expectedLifespanMonths: 120,
        nextMaintenanceDate: new Date('2024-05-01'),
      }
    }),
    // Building 3 assets
    prisma.asset.create({
      data: {
        buildingId: building3.id,
        name: 'Swimming Pool Pump',
        type: 'PLUMBING',
        manufacturer: 'Pentair',
        model: 'SuperFlo VS',
        serialNumber: 'PENTAIR-2023-001',
        installationDate: new Date('2023-04-05'),
        status: 'OPERATIONAL',
        expectedLifespanMonths: 96,
        nextMaintenanceDate: new Date('2024-05-15'),
      }
    }),
  ]);

  console.log(`✅ Created ${assets.length} building assets`);

  // ======================
  // 6. CREATE SAMPLE ISSUES
  // ======================
  console.log('🚨 Creating sample issues...');

  const issues = await Promise.all([
    // URGENT: Water leak
    prisma.issue.create({
      data: {
        title: 'Water Leak in Kitchen',
        description: 'Water leaking from under the kitchen sink. Getting worse.',
        category: 'PLUMBING',
        priority: 'URGENT',
        status: 'PENDING',
        location: 'Unit GT001 - Kitchen',
        buildingId: building1.id,
        unitId: units[0].id,
        submittedById: tenantUsers[0].id, // Alex Martin
        estimatedCost: 250.00,
        scheduledDate: new Date('2024-02-20'),
      }
    }),
    // HIGH: AC not working
    prisma.issue.create({
      data: {
        title: 'AC Not Cooling',
        description: 'Air conditioner running but not cooling below 80°F.',
        category: 'HVAC',
        priority: 'HIGH',
        status: 'SCHEDULED',
        location: 'Unit GT002 - Living Room',
        buildingId: building1.id,
        unitId: units[1].id,
        submittedById: tenantUsers[1].id, // Jennifer Lee
        assignedToId: maintenance2.id, // Maria Rodriguez (HVAC specialist)
        estimatedCost: 350.00,
        scheduledDate: new Date('2024-02-22'),
      }
    }),
    // MEDIUM: Electrical issue
    prisma.issue.create({
      data: {
        title: 'Outlet Not Working',
        description: 'Outlet in bedroom has no power. Tried resetting breaker.',
        category: 'ELECTRICAL',
        priority: 'MEDIUM',
        status: 'PENDING',
        location: 'Unit GT003 - Bedroom',
        buildingId: building1.id,
        unitId: units[2].id,
        submittedById: tenantUsers[2].id, // Thomas Brown
        estimatedCost: 85.00,
      }
    }),
    // LOW: Appliance noise
    prisma.issue.create({
      data: {
        title: 'Dishwasher Making Noise',
        description: 'Grinding noise during wash cycle. Still cleans.',
        category: 'APPLIANCE',
        priority: 'LOW',
        status: 'PENDING',
        location: 'Unit CP001 - Kitchen',
        buildingId: building2.id,
        unitId: units[10].id,
        submittedById: tenantUsers[4].id, // Daniel Miller
        estimatedCost: 200.00,
      }
    }),
    // COMPLETED: Structural repair
    prisma.issue.create({
      data: {
        title: 'Crack in Bathroom Ceiling Repaired',
        description: 'Small crack in bathroom ceiling after last storm. Has been repaired.',
        category: 'STRUCTURAL',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        location: 'Unit RL001 - Bathroom',
        buildingId: building3.id,
        unitId: units[18].id,
        submittedById: tenantUsers[6].id, // William Moore
        assignedToId: maintenance1.id,
        estimatedCost: 150.00,
        actualCost: 145.00,
        scheduledDate: new Date('2024-02-10'),
        completedDate: new Date('2024-02-12'),
      }
    }),
  ]);

  console.log(`✅ Created ${issues.length} sample issues with various statuses`);

  // ======================
  // 7. CREATE WORK ORDERS LINKED TO ISSUES
  // ======================
  console.log('🔧 Creating work orders...');

  const workOrders = await Promise.all([
    // Work order for water leak (linked to issue 0)
    prisma.workOrder.create({
      data: {
        title: 'Emergency Plumbing Repair - Kitchen Sink',
        description: 'Repair water leak under kitchen sink. Replace damaged pipes.',
        issueId: issues[0].id,
        buildingId: building1.id,
        unitId: units[0].id,
        assignedToId: maintenance3.id, // David Smith (plumbing)
        priority: 'URGENT',
        status: 'PENDING',
        scheduledDate: new Date('2024-02-20'),
        estimatedHours: 2.5,
        estimatedCost: 250.00,
      }
    }),
    // Work order for AC repair (linked to issue 1)
    prisma.workOrder.create({
      data: {
        title: 'HVAC System Diagnosis and Repair',
        description: 'Diagnose AC cooling issue, recharge refrigerant if needed.',
        issueId: issues[1].id,
        buildingId: building1.id,
        unitId: units[1].id,
        assignedToId: maintenance2.id, // Maria Rodriguez (HVAC)
        priority: 'HIGH',
        status: 'SCHEDULED',
        scheduledDate: new Date('2024-02-22'),
        estimatedHours: 3.0,
        estimatedCost: 350.00,
      }
    }),
    // Work order for completed repair (linked to issue 4)
    prisma.workOrder.create({
      data: {
        title: 'Bathroom Ceiling Crack Repair',
        description: 'Repair crack in bathroom ceiling, repaint area.',
        issueId: issues[4].id,
        buildingId: building3.id,
        unitId: units[18].id,
        assignedToId: maintenance1.id,
        priority: 'MEDIUM',
        status: 'COMPLETED',
        scheduledDate: new Date('2024-02-10'),
        startDate: new Date('2024-02-10'),
        completedDate: new Date('2024-02-12'),
        estimatedHours: 2.0,
        estimatedCost: 150.00,
        actualHours: 1.75,
        actualCost: 145.00,
        notes: 'Crack repaired and area repainted to match existing ceiling.',
      }
    }),
    // Standalone work order (not linked to issue)
    prisma.workOrder.create({
      data: {
        title: 'Quarterly Fire Extinguisher Inspection',
        description: 'Inspect and tag all fire extinguishers in building.',
        buildingId: building2.id,
        assignedToId: maintenance1.id,
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        scheduledDate: new Date('2024-03-01'),
        estimatedHours: 2.0,
        estimatedCost: 0.00,
        notes: 'Routine safety inspection required by fire code.',
      }
    }),
    // Another standalone work order
    prisma.workOrder.create({
      data: {
        title: 'Monthly Landscape Maintenance',
        description: 'Mow lawns, trim hedges, and weed flower beds.',
        buildingId: building1.id,
        priority: 'LOW',
        status: 'PENDING',
        scheduledDate: new Date('2024-02-28'),
        estimatedHours: 4.0,
        estimatedCost: 300.00,
      }
    }),
  ]);

  console.log(`✅ Created ${workOrders.length} work orders (${issues.filter(i => i.id).length} linked to issues)`);

  // ======================
  // 8. CREATE ATTACHMENTS
  // ======================
  console.log('📎 Creating sample attachments...');

  const attachments = await Promise.all([
    // Attachment for water leak issue
    prisma.attachment.create({
      data: {
        filename: 'water-leak.jpg',
        fileType: 'image/jpeg',
        fileSize: 2048000,
        url: 'https://example-assets.s3.amazonaws.com/water-leak-101.jpg',
        issueId: issues[0].id,
        uploadedById: tenantUsers[0].id,
        buildingId: building1.id,
      }
    }),
    // Attachment for work order
    prisma.attachment.create({
      data: {
        filename: 'ceiling-repair-before.jpg',
        fileType: 'image/jpeg',
        fileSize: 1536000,
        url: 'https://example-assets.s3.amazonaws.com/ceiling-before.jpg',
        workOrderId: workOrders[2].id,
        uploadedById: maintenance1.id,
        buildingId: building3.id,
      }
    }),
    prisma.attachment.create({
      data: {
        filename: 'ceiling-repair-after.jpg',
        fileType: 'image/jpeg',
        fileSize: 1572000,
        url: 'https://example-assets.s3.amazonaws.com/ceiling-after.jpg',
        workOrderId: workOrders[2].id,
        uploadedById: maintenance1.id,
        buildingId: building3.id,
      }
    }),
  ]);

  console.log(`✅ Created ${attachments.length} sample attachments`);

  // ======================
  // 9. CREATE COMMENTS
  // ======================
  console.log('💬 Creating sample comments...');

  const comments = await Promise.all([
    // Comment on water leak issue
    prisma.comment.create({
      data: {
        content: 'I\'ve turned off the water supply under the sink for now. Please fix as soon as possible!',
        issueId: issues[0].id,
        authorId: tenantUsers[0].id,
        buildingId: building1.id,
      }
    }),
    prisma.comment.create({
      data: {
        content: 'We have a plumber scheduled for tomorrow morning. They should arrive between 8-10 AM.',
        issueId: issues[0].id,
        authorId: manager1.id,
        buildingId: building1.id,
      }
    }),
    // Comment on AC issue
    prisma.comment.create({
      data: {
        content: 'The temperature is getting uncomfortable. Any update on when this will be fixed?',
        issueId: issues[1].id,
        authorId: tenantUsers[1].id,
        buildingId: building1.id,
      }
    }),
    prisma.comment.create({
      data: {
        content: 'HVAC technician is scheduled for Friday. They will diagnose and repair the issue.',
        issueId: issues[1].id,
        authorId: manager1.id,
        buildingId: building1.id,
      }
    }),
    // Comment on completed work
    prisma.comment.create({
      data: {
        content: 'Great job on the repair! The ceiling looks perfect now.',
        workOrderId: workOrders[2].id,
        authorId: tenantUsers[6].id,
        buildingId: building3.id,
      }
    }),
  ]);

  console.log(`✅ Created ${comments.length} sample comments`);

  // ======================
  // 10. CREATE MAINTENANCE RECORDS FOR ASSETS
  // ======================
  console.log('📊 Creating maintenance records...');

  const maintenanceRecords = await Promise.all([
    // Maintenance record for elevator
    prisma.maintenanceRecord.create({
      data: {
        assetId: assets[0].id,
        date: new Date('2023-12-15'),
        type: 'Preventive Maintenance',
        performedBy: 'Otis Elevator Company',
        notes: 'Routine inspection and lubrication. All systems operational.',
        cost: 450.00,
      }
    }),
    // Maintenance record for HVAC
    prisma.maintenanceRecord.create({
      data: {
        assetId: assets[1].id,
        date: new Date('2023-11-20'),
        type: 'Seasonal Service',
        performedBy: 'Trane Certified Technician',
        notes: 'Replaced filters, cleaned coils, checked refrigerant levels.',
        cost: 320.00,
      }
    }),
  ]);

  console.log(`✅ Created ${maintenanceRecords.length} maintenance records`);

  // ======================
  // SUMMARY
  // ======================
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('==========================================');
  console.log('📊 SEEDING SUMMARY:');
  console.log(`   • Management Companies: 1`);
  console.log(`   • Buildings: 3`);
  console.log(`   • Units: ${units.length}`);
  console.log(`   • Users: ${1 + 2 + 3 + tenantUsers.length} (1 ADMIN, 2 MANAGERS, 3 MAINTENANCE, ${tenantUsers.length} TENANTS)`);
  console.log(`   • Management Contracts: ${contracts.length}`);
  console.log(`   • Assets: ${assets.length}`);
  console.log(`   • Issues: ${issues.length}`);
  console.log(`   • Work Orders: ${workOrders.length}`);
  console.log(`   • Attachments: ${attachments.length}`);
  console.log(`   • Comments: ${comments.length}`);
  console.log(`   • Maintenance Records: ${maintenanceRecords.length}`);
  console.log('\n🔑 TEST USERS:');
  console.log('   • Admin: admin@skylinemanagement.com');
  console.log('   • Manager: sarah.johnson@skylinemanagement.com');
  console.log('   • Maintenance: james.wilson@skylinemanagement.com');
  console.log('   • Tenant: alex.martin@example.com');
  console.log('\n🏢 BUILDINGS:');
  console.log(`   • ${building1.name} (${building1.city}) - ${building1.totalUnits} units`);
  console.log(`   • ${building2.name} (${building2.city}) - ${building2.totalUnits} units`);
  console.log(`   • ${building3.name} (${building3.city}) - ${building3.totalUnits} units`);
  console.log('\n🚨 SAMPLE ISSUES CREATED:');
  console.log('   • Urgent: Water leak in kitchen');
  console.log('   • High: AC not cooling');
  console.log('   • Medium: Outlet not working');
  console.log('   • Low: Dishwasher noise');
  console.log('   • Completed: Ceiling crack repair');
  console.log('\n✅ Seed script is idempotent - can be run multiple times!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });