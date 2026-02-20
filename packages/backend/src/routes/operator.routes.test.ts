import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import type { Server } from 'http';

const mockPrisma = {
  user: { findUnique: vi.fn() },
  building: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  buildingOperatorPeriod: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  managementCompany: { findUnique: vi.fn() },
  hoaOrganization: { findUnique: vi.fn() },
  issue: { findMany: vi.fn() },
  workOrder: { findMany: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock('../prisma/client', () => ({
  prisma: mockPrisma,
}));

vi.mock('../middleware/auth.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      userId: 'u1',
      email: 'manager@test.com',
      role: 'MANAGER',
      tenantId: 't1',
    };
    next();
  },
}));

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const { operatorRoutes } = await import('./operator.routes');
  const { errorHandler } = await import('../middleware/errorHandler');

  const app = express();
  app.use(express.json());
  app.use('/api', operatorRoutes);
  app.use(errorHandler);

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('operator routes', () => {
  it('GET /api/portfolio/buildings returns operator-scoped portfolio', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      role: 'MANAGER',
      managementCompanyId: 'mc1',
      hoaOrganizationId: null,
    });

    mockPrisma.building.findMany.mockResolvedValue([
      {
        id: 'b1',
        name: 'Ocean View',
        _count: { issues: 2, workOrders: 1, units: 10 },
      },
    ]);

    const res = await fetch(`${baseUrl}/api/portfolio/buildings`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.meta.count).toBe(1);
    expect(body.data.buildings[0].id).toBe('b1');
  });

  it('POST /api/buildings/:id/operator-periods validates payload', async () => {
    const res = await fetch(`${baseUrl}/api/buildings/b1/operator-periods`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operatorType: 'PM',
        startDate: '2026-03-01T00:00:00.000Z',
      }),
    });

    expect(res.status).toBe(400);
  });

  it('GET /api/buildings/:id/history returns 404 when building does not exist', async () => {
    mockPrisma.building.findUnique.mockResolvedValue(null);

    const res = await fetch(`${baseUrl}/api/buildings/missing/history`);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe('Building not found');
  });

  it('POST /api/buildings/:id/transition performs continuity handoff', async () => {
    mockPrisma.building.findUnique.mockResolvedValue({
      id: 'b1',
      name: 'Ocean View',
      currentOperatorPeriodId: 'op-old',
    });

    mockPrisma.buildingOperatorPeriod.findFirst.mockResolvedValue({
      id: 'op-old',
      buildingId: 'b1',
      status: 'ACTIVE',
      startDate: new Date('2026-01-01T00:00:00.000Z'),
    });

    mockPrisma.managementCompany.findUnique.mockResolvedValue({
      id: 'mc1',
      name: 'Skyline PM',
    });

    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        buildingOperatorPeriod: {
          update: vi.fn().mockResolvedValue({
            id: 'op-old',
            operatorType: 'PM',
            status: 'ENDED',
            startDate: new Date('2026-01-01T00:00:00.000Z'),
            endDate: new Date('2026-03-01T00:00:00.000Z'),
          }),
          create: vi.fn().mockResolvedValue({
            id: 'op-new',
            operatorType: 'PM',
            status: 'ACTIVE',
            startDate: new Date('2026-03-01T00:00:00.000Z'),
            endDate: null,
            handoffNotes: 'handoff',
            managementCompany: { id: 'mc1', name: 'Skyline PM' },
            hoaOrganization: null,
          }),
        },
        building: { update: vi.fn().mockResolvedValue({ id: 'b1' }) },
        issue: { count: vi.fn().mockResolvedValue(8) },
        workOrder: { count: vi.fn().mockResolvedValue(5) },
      };
      return cb(tx);
    });

    const res = await fetch(`${baseUrl}/api/buildings/b1/transition`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fromOperatorPeriodId: 'op-old',
        toOperatorType: 'PM',
        toOperatorId: 'mc1',
        effectiveDate: '2026-03-01T00:00:00.000Z',
        handoffNotes: 'handoff',
      }),
    });

    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.status).toBe('success');
    expect(body.data.nextPeriod.id).toBe('op-new');
    expect(body.data.continuity.issuesInBuildingHistory).toBe(8);
    expect(body.data.continuity.workOrdersInBuildingHistory).toBe(5);
  });
});
