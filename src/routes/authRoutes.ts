import express from 'express';
import { login, register } from '../controllers/authController';
import { validateLogin } from '../middleware/validation';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', register);

export default router;