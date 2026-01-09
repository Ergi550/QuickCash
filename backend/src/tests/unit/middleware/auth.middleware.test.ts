import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../../middleware/auth.middleware';
import { JWTPayload } from '../../../models/user.model';

// Mock jwt utils
jest.mock('../../../utils/jwt.utils');

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('authenticate middleware', () => {
    test('should call next() for valid token', () => {
      // ARRANGE
      const mockPayload: JWTPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'customer'
      };
      mockRequest.headers = {
        authorization: 'Bearer valid-token-123'
      };
      // Mock verifyToken to return valid payload
      const { verifyToken } = require('../../../utils/jwt.utils');
      verifyToken.mockReturnValue(mockPayload);
      // ACT
      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(); // Called without argument
      expect(mockRequest.user).toEqual(mockPayload);
    });

    test('should return 401 when Authorization header is missing', async () => {
      // ARRANGE
      mockRequest.headers = {}; // No authorization header
      // ACT
      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token nuk u gjet'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 when token does not start with "Bearer "', async () => {
      // ARRANGE
      mockRequest.headers = {
        authorization: 'InvalidFormat token-123'
      };
      // ACT
      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token nuk u gjet'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token', () => {
      // ARRANGE
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      // Mock verifyToken to return null (invalid)
      const { verifyToken } = require('../../../utils/jwt.utils');
      verifyToken.mockReturnValue(null);
      // ACT
      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token i pavlefshëm ose i skaduar'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for expired token', () => {
      // ARRANGE
      mockRequest.headers = {
        authorization: 'Bearer expired-token'
      };
      const { verifyToken } = require('../../../utils/jwt.utils');
      verifyToken.mockReturnValue(null); // Expired token returns null
      // ACT
      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token i pavlefshëm ose i skaduar'
      });
    });

    test('should attach user to request object', () => {
      // ARRANGE
      const mockPayload: JWTPayload = {
        userId: 42,
        email: 'john@example.com',
        role: 'manager'
      };
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      const { verifyToken } = require('../../../utils/jwt.utils');
      verifyToken.mockReturnValue(mockPayload);
      // ACT
      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe(42);
      expect(mockRequest.user?.email).toBe('john@example.com');
      expect(mockRequest.user?.role).toBe('manager');
    });

    test('should handle token with extra whitespace', () => {
      // ARRANGE
      mockRequest.headers = {
        authorization: '  Bearer   token-with-spaces  '
      };
      const { verifyToken } = require('../../../utils/jwt.utils');
      verifyToken.mockReturnValue(null); // Will fail because of spaces
      // ACT
      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('authorize middleware', () => {
    test('should call next() when user has required role', () => {
      // ARRANGE
      mockRequest.user = {
        userId: 1,
        email: 'manager@example.com',
        role: 'manager'
      };
      const authorizeMiddleware = authorize('manager', 'admin');
      // ACT
      authorizeMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should return 401 when user is not authenticated', () => {
      // ARRANGE
      mockRequest.user = undefined; // Not authenticated
      const authorizeMiddleware = authorize('manager');
      // ACT
      authorizeMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Nuk jeni autentifikuar'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 403 when user lacks required role', () => {
      // ARRANGE
      mockRequest.user = {
        userId: 1,
        email: 'customer@example.com',
        role: 'customer'
      };
      const authorizeMiddleware = authorize('manager', 'admin');
      // ACT
      authorizeMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Akses i refuzuar. Nuk keni të drejta të mjaftueshme'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should allow access with any of multiple allowed roles', async () => {
      // ARRANGE
      const testCases = [
        { role: 'staff' },
        { role: 'manager' },
        { role: 'admin' }
      ];
      const authorizeMiddleware = authorize('staff', 'manager', 'admin');
      testCases.forEach(testCase => {
        // Reset mocks
        mockNext = jest.fn();
        mockRequest.user = {
          userId: 1,
          email: 'user@example.com',
          role: testCase.role
        };
        // ACT
        authorizeMiddleware(
          mockRequest as AuthRequest,
          mockResponse as Response,
          mockNext
        );
        // ASSERT
        expect(mockNext).toHaveBeenCalled();
      });
    });

    test('should be case sensitive for roles', () => {
      // ARRANGE
      mockRequest.user = {
        userId: 1,
        email: 'user@example.com',
        role: 'Manager' // Capital M
      };
      const authorizeMiddleware = authorize('manager'); // lowercase
      // ACT
      authorizeMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );
      // ASSERT
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should create different middleware instances for different roles', async () => {
      // ARRANGE
      const adminMiddleware = authorize('admin');
      const staffMiddleware = authorize('staff');
      // ASSERT
      expect(adminMiddleware).not.toBe(staffMiddleware);
      expect(typeof adminMiddleware).toBe('function');
      expect(typeof staffMiddleware).toBe('function');
    });
  });

  describe('Integration: authenticate + authorize', () => {
    test('should work together in middleware chain', () => {
      // ARRANGE
      const mockPayload: JWTPayload = {
        userId: 1,
        email: 'manager@example.com',
        role: 'manager'
      };
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      const { verifyToken } = require('../../../utils/jwt.utils');
      verifyToken.mockReturnValue(mockPayload);
      const authorizeMiddleware = authorize('manager', 'admin');
      let nextCallCount = 0;
      const chainedNext = () => {
        nextCallCount++;
      };
      // ACT
      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        chainedNext
      );
      authorizeMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        chainedNext
      );
      // ASSERT
      expect(nextCallCount).toBe(2); // Both middleware called next()
      expect(mockRequest.user?.role).toBe('manager');
    });
  });
});
