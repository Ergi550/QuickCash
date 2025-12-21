import jwt from 'jsonwebtoken';
import { JWTPayload } from '../models/user.model';
import config from '../config/config';

/**
 * Generate JWT token
 * @param payload - User data to encode
 * @returns JWT token string
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Decode token without verification (for debugging)
 * @param token - JWT token
 * @returns Decoded payload
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};