import express from 'express';
import { listKnowledgeDocuments, ingestKnowledgeDocument } from '../controllers/knowledgeController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, listKnowledgeDocuments);
router.post('/', authenticateToken, requireRole('admin', 'reliability_engineer'), ingestKnowledgeDocument);

export default router;
