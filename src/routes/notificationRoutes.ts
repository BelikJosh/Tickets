import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/user/:userId', authenticateToken, getNotifications);
router.put('/:notificationId/read', authenticateToken, markAsRead);

export default router;