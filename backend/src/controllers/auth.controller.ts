import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Authentication Controller
 * Handles HTTP requests for auth endpoints
 */
class AuthController {
  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      // Call service
      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;

      // Call service
      const result = await authService.register(userData);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await authService.getUserById(req.user.userId);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (admin only)
   * GET /api/v1/auth/users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await authService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();