import express from 'express';
import authRoutes from './authRoutes';
import ticketRoutes from './ticketRoutes';
import notificationRoutes from './notificationRoutes';
import userRoutes from './userRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);

export default router;