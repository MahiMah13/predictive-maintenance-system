import express from 'express';
import { 
  listFleetFailures, 
  listSchedules, 
  createSchedule, 
  listWorkOrders, 
  createWorkOrder, 
  getWorkOrderById, 
  updateWorkOrder 
} from '../controllers/maintenanceController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/failures', authenticateToken, listFleetFailures);

router.get('/schedules', authenticateToken, listSchedules);
router.post('/schedules', authenticateToken, requireRole('admin', 'reliability_engineer'), createSchedule);

router.get('/work-orders', authenticateToken, listWorkOrders);
router.post('/work-orders', authenticateToken, requireRole('admin', 'reliability_engineer'), createWorkOrder);
router.get('/work-orders/:id', authenticateToken, getWorkOrderById);
router.put('/work-orders/:id', authenticateToken, updateWorkOrder);

export default router;
