// Global test setup 
// This file runs before all tests 
// Extend Jest matchers 
import '@jest/globals'; 
// Set test timeout 
jest.setTimeout(10000); // 10 seconds 
// Mock environment variables 
process.env.NODE_ENV = 'test'; 
process.env.JWT_SECRET = 'test-secret-key'; 
process.env.JWT_EXPIRES_IN = '1h'; 
// Console logging control 
global.console = { 
  ...console, 
  // Suppress console.log in tests 
  log: jest.fn(), 
  // Keep errors and warnings 
  error: console.error, 
  warn: console.warn, 
  info: console.info, 
  debug: console.debug, 
}; 
// Global beforeAll 
beforeAll(() => { 
  console.info('🧪 Starting test suite...'); 
}); 
// Global afterAll 
afterAll(() => { console.info('✅ Test suite completed!'); 
});