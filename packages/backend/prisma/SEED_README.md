# Database Seed Script

## Overview
This seed script populates the database with realistic test data for the Building Maintenance App. It creates a complete ecosystem including:

1. A management company (tenant)
2. Multiple buildings with units
3. Users of all roles (TENANT, MAINTENANCE, MANAGER, ADMIN)
4. Sample issues across different categories and priorities
5. Work orders linked to issues
6. Supporting data (assets, attachments, comments, maintenance records)

## Features
- **Idempotent**: Can be run multiple times safely
- **Realistic Data**: Based on real-world property management scenarios
- **Complete Relationships**: All database relationships are properly established
- **Comprehensive Coverage**: Includes all major entity types in the system

## How to Run

### Using npm script:
```bash
npm run prisma:seed
```

### Directly with tsx:
```bash
npx tsx prisma/seed.ts
```

### During development (with database reset):
```bash
npx prisma db push --force-reset
npm run prisma:seed
```

## Data Created

### Management Company
- **Name**: Skyline Property Management
- **Subdomain**: skyline-properties
- **Plan**: PROFESSIONAL
- **Status**: ACTIVE

### Buildings (3)
1. **The Grand Tower** - New York, NY (25 floors, 150 units)
2. **Commerce Plaza** - Chicago, IL (15 floors, 80 units)  
3. **Riverfront Lofts** - Austin, TX (12 floors, 60 units)

### Users
- **1 ADMIN**: Michael Chen (admin@skylinemanagement.com)
- **2 MANAGERS**: Sarah Johnson, Robert Garcia
- **3 MAINTENANCE**: James Wilson, Maria Rodriguez, David Smith
- **8 TENANTS**: Alex Martin, Jennifer Lee, Thomas Brown, etc.

### Sample Issues
- **URGENT**: Water leak in kitchen
- **HIGH**: AC not cooling
- **MEDIUM**: Outlet not working
- **LOW**: Dishwasher making noise
- **COMPLETED**: Ceiling crack repair

### Work Orders
- 5 work orders (3 linked to issues, 2 standalone)
- Various statuses: PENDING, SCHEDULED, IN_PROGRESS, COMPLETED
- Different priorities: URGENT, HIGH, MEDIUM, LOW

### Additional Data
- 4 building assets (elevator, HVAC, fire alarm, pool pump)
- 3 management contracts
- 3 attachments (images)
- 5 comments (discussion threads)
- 2 maintenance records
- Tenant history records

## Database Relationships
The seed script properly establishes all relationships:
- Buildings ↔ Management Company (via ManagementContract)
- Units ↔ Buildings
- Users ↔ Units (tenants)
- Users ↔ Management Company (employees)
- Issues ↔ Buildings/Units
- Issues ↔ Users (submittedBy, assignedTo)
- Work Orders ↔ Issues
- Work Orders ↔ Buildings/Units
- Attachments ↔ Issues/Work Orders
- Comments ↔ Issues/Work Orders
- Assets ↔ Buildings/Units
- Maintenance Records ↔ Assets

## Notes
- The script clears all existing data before seeding (for idempotency)
- All dates are set to realistic values (past, present, future)
- Costs and estimates are realistic for maintenance work
- Location data spans multiple cities for testing geographic features
- Status distribution includes various states (PENDING, IN_PROGRESS, COMPLETED, etc.)

## Customization
To modify the seed data:
1. Edit `prisma/seed.ts`
2. Adjust the data objects as needed
3. Run the seed script again

The script is modular - each section can be modified independently without affecting others.