import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
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
 * @route   PUT /api/v1/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, authController.updateProfile);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @route   GET /api/v1/auth/users
 * @desc    Get all users
 * @access  Private (Admin, Manager)
 */
router.get(
  '/users',
  authenticate,
  authorize('admin', 'manager'),
  authController.getAllUsers
);

/**
 * @route   DELETE /api/v1/auth/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete(
  '/users/:id',
  authenticate,
  authorize('admin'),
  authController.deleteUser
);

export default router;