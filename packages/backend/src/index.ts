import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { authRoutes } from './routes/auth.routes';
import { buildingRoutes } from './routes/building.routes';
import { issueRoutes } from './routes/issue.routes';
import { workOrderRoutes } from './routes/workOrder.routes';
import { userRoutes } from './routes/user.routes';
import { healthRoutes } from './routes/health.routes';
import { tenantRoutes } from './routes/tenant.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/tenants', tenantRoutes);  // Tenant management (signup, admin)
app.use('/api/auth', authRoutes);       // Authentication (login, etc.)
app.use('/api/users', userRoutes);      // User management (within tenant)
app.use('/api/buildings', buildingRoutes); // Building management (within tenant)
app.use('/api/issues', issueRoutes);    // Issue management (within tenant)
app.use('/api/work-orders', workOrderRoutes); // Work order management (within tenant)

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`🏢 Multi-tenant architecture enabled`);
});

export default app;