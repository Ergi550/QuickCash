import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { JWTPayload } from '../models/user.model';

/**
 * Extended Request interface with user data
 */
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token nuk u gjet',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Token i pavlefshëm ose i skaduar',
      });
      return;
    }

    // Attach user to request
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Autentifikimi dështoi',
    });
  }
};

/**
 * Authorization middleware factory
 * Checks if user has required role(s)
 * @param roles - Allowed roles
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Nuk jeni autentifikuar',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Akses i refuzuar. Nuk keni të drejta të mjaftueshme',
      });
      return;
    }

    next();
  };
};