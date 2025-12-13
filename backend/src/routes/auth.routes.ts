import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new customer
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * @route   GET /api/v1/auth/users
 * @desc    Get all users (admin/manager only)
 * @access  Private (Manager only)
 */
router.get(
  '/users',
  authenticate,
  authorize(UserRole.MANAGER),
  authController.getAllUsers
);

export default router;