import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  triggerFailurePrediction, 
  triggerRULEstimate, 
  generateAIRecommendations, 
  confirmRecommendation,
  createChatSession,
  postChatMessage,
  runPlanner
} from '../controllers/aiController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

const aiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // max 20 AI triggers per 10 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI rate limit exceeded. Please wait 10 minutes before generating additional AI analyses." }
});

router.post('/assets/:id/failure-prediction', authenticateToken, aiRateLimiter, triggerFailurePrediction);
router.post('/assets/:id/rul-estimate', authenticateToken, aiRateLimiter, triggerRULEstimate);
router.post('/assets/:id/recommendations', authenticateToken, aiRateLimiter, generateAIRecommendations);

router.put('/recommendations/:id/confirm', authenticateToken, requireRole('admin', 'reliability_engineer'), confirmRecommendation);

router.post('/chat/sessions', authenticateToken, createChatSession);
router.post('/chat/sessions/:id/messages', authenticateToken, aiRateLimiter, postChatMessage);

router.post('/planner/run', authenticateToken, requireRole('admin', 'reliability_engineer'), aiRateLimiter, runPlanner);

export default router;
