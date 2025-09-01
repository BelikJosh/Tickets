import express from 'express';
import { 
  getUsers, 
  getUserProfile,
  uploadUserPhoto,
  getUserPhoto,
  getUserWithPhoto
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getUsers);
router.get('/profile', authenticateToken, getUserProfile);
router.get('/:userId/photo', authenticateToken, getUserPhoto);
router.get('/:userId', authenticateToken, getUserWithPhoto);
router.put('/:userId/photo', authenticateToken, uploadUserPhoto);

export default router;