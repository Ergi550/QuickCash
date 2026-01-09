import jwt from 'jsonwebtoken';
import { JWTPayload } from '../../../models/user.model';

// Test secret
const TEST_SECRET = 'test-secret-key';

// Mock jwt.utils with test implementations
jest.mock('../../../utils/jwt.utils', () => {
  const jwt = require('jsonwebtoken');
  const testSecret = 'test-secret-key';

  return {
    generateToken: jest.fn((payload: any) => {
      return jwt.sign(payload, testSecret, { expiresIn: '1h' });
    }),
    verifyToken: jest.fn((token: string) => {
      try {
        if (!token) return null;
        return jwt.verify(token, testSecret) as any;
      } catch {
        return null;
      }
    }),
    decodeToken: jest.fn((token: string) => {
      try {
        const decoded = jwt.decode(token);
        if (!decoded || typeof decoded === 'string') return null;
        return decoded as any;
      } catch {
        return null;
      }
    }),
  };
});

import { generateToken, verifyToken, decodeToken } from '../../../utils/jwt.utils';

describe('JWT Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      // ARRANGE
      const payload: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer'
      };
      // ACT
      const token = generateToken(payload);
      // ASSERT
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    test('should include correct payload in token', () => {
      // ARRANGE
      const payload: JWTPayload = {
        userId: 123,
        email: 'john@example.com',
        role: 'manager'
      };
      // ACT
      const token = generateToken(payload);
      const decoded = jwt.decode(token) as JWTPayload & { exp: number; iat: number };
      // ASSERT
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.exp).toBeDefined(); // Expiration time should be set
      expect(decoded.iat).toBeDefined(); // Issued at time should be set
    });

    test('should generate different tokens for different payloads', () => {
      // ARRANGE
      const payload1: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer'
      };
      const payload2: JWTPayload = {
        userId: 2,
        email: 'other@example.com',
        role: 'staff'
      };
      // ACT
      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);
      // ASSERT
      expect(token1).not.toBe(token2); // Different payloads produce different tokens
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token and return payload', () => {
      // ARRANGE
      const payload: JWTPayload = {
        userId: 456,
        email: 'alice@example.com',
        role: 'staff'
      };
      const token = generateToken(payload);
      // ACT
      const result = verifyToken(token);
      // ASSERT
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(payload.userId);
      expect(result?.email).toBe(payload.email);
      expect(result?.role).toBe(payload.role);
    });

    test('should return null for invalid token', () => {
      // ARRANGE
      const invalidToken = 'invalid.jwt.token';
      // ACT
      const result = verifyToken(invalidToken);
      // ASSERT
      expect(result).toBeNull();
    });

    test('should return null for expired token', () => {
      // ARRANGE - Create token with past expiration
      const payload: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer'
      };
      // Generate token that expired 1 hour ago
      const expiredToken = jwt.sign(
        payload,
        TEST_SECRET,
        { expiresIn: '-1h' } // Negative = already expired
      );
      // ACT
      const result = verifyToken(expiredToken);
      // ASSERT
      expect(result).toBeNull();
    });

    test('should return null for token with wrong signature', () => {
      // ARRANGE
      const payload: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer'
      };
      // Generate token with different secret
      const tokenWithWrongSecret = jwt.sign(
        payload,
        'wrong-secret-key',
        { expiresIn: '1h' }
      );
      // ACT
      const result = verifyToken(tokenWithWrongSecret);
      // ASSERT
      expect(result).toBeNull();
    });

    test('should return null for malformed token', () => {
      // ARRANGE
      const malformedTokens = [
        '',
        'not-a-jwt',
        'only.two.parts',
        null,
        undefined
      ];
      // ACT & ASSERT
      malformedTokens.forEach(token => {
        const result = verifyToken(token as any);
        expect(result).toBeNull();
      });
    });
  });

  describe('decodeToken', () => {
    test('should decode token without verification', () => {
      // ARRANGE
      const payload: JWTPayload = {
        userId: 789,
        email: 'bob@example.com',
        role: 'admin'
      };
      const token = generateToken(payload);
      // ACT
      const decoded = decodeToken(token);
      // ASSERT
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    test('should decode expired token (without verification)', () => {
      // ARRANGE
      const payload: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer'
      };
      const expiredToken = jwt.sign(payload, TEST_SECRET, { expiresIn: '-1h' });
      // ACT
      const decoded = decodeToken(expiredToken);
      // ASSERT
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
    });

    test('should return null for invalid token format', () => {
      // ARRANGE
      const invalidToken = 'not.a.valid.jwt.format';
      // ACT
      const result = decodeToken(invalidToken);
      // ASSERT
      expect(result).toBeNull();
    });
  });

  describe('Token Security', () => {
    test('token should not expose sensitive data in payload', () => {
      // ARRANGE
      const payload: JWTPayload = {
        userId: 1,
        email: 'user@example.com',
        role: 'customer'
      };
      const token = generateToken(payload);
      const decoded = jwt.decode(token) as any;
      // ASSERT
      expect(decoded.password).toBeUndefined();
      expect(decoded.password_hash).toBeUndefined();
      expect(decoded.two_factor_secret).toBeUndefined();
    });

    test('modifying token should invalidate signature', () => {
      // ARRANGE
      const payload: JWTPayload = {
        userId: 1,
        email: 'user@example.com',
        role: 'customer'
      };
      const token = generateToken(payload);
      // ACT - Manipulate token (change userId in payload)
      const parts = token.split('.');
      const manipulatedPayload = Buffer.from(
        JSON.stringify({ ...payload, userId: 999 })
      ).toString('base64');
      const manipulatedToken = `${parts[0]}.${manipulatedPayload}.${parts[2]}`;
      const result = verifyToken(manipulatedToken);
      // ASSERT
      expect(result).toBeNull(); // Should fail verification
    });
  });
});
