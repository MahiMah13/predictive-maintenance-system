import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Predictive Maintenance Platform API',
    timestamp: new Date().toISOString(),
    gemini_configured: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('YourActualGeminiKey'))
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // for /api/profile
app.use('/api/assets', assetRoutes);
app.use('/api', maintenanceRoutes); // for /api/failures, /api/schedules, /api/work-orders
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/knowledge-documents', knowledgeRoutes);

// Centralized Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Predictive Maintenance API Server running on port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
