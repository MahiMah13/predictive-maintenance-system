import express from 'express';
import { getFleetHealth, getDowntimeTrends } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/fleet-health', authenticateToken, getFleetHealth);
router.get('/downtime-trends', authenticateToken, getDowntimeTrends);

export default router;
