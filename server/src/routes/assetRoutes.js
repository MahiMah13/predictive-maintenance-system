import express from 'express';
import { 
  listAssets, 
  createAsset, 
  getAssetById, 
  updateAsset, 
  archiveAsset,
  logSensorReading,
  getSensorReadings,
  logFailureEvent,
  getFailureHistory
} from '../controllers/assetController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, listAssets);
router.post('/', authenticateToken, requireRole('admin', 'reliability_engineer'), createAsset);
router.get('/:id', authenticateToken, getAssetById);
router.put('/:id', authenticateToken, requireRole('admin', 'reliability_engineer'), updateAsset);
router.delete('/:id', authenticateToken, requireRole('admin', 'reliability_engineer'), archiveAsset);

router.post('/:id/readings', authenticateToken, logSensorReading);
router.get('/:id/readings', authenticateToken, getSensorReadings);

router.post('/:id/failures', authenticateToken, logFailureEvent);
router.get('/:id/failures', authenticateToken, getFailureHistory);

export default router;
