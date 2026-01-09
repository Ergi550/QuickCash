module.exports = { 
// Use ts-jest preset for TypeScript 
preset: 'ts-jest',
// Test environment 
testEnvironment: 'node', 
// Roots for test files 
roots: ['<rootDir>/src'], 
// Test file patterns 
testMatch: [ 
'**/__tests__/**/*.ts', 
'**/?(*.)+(spec|test).ts' 
], 
// Coverage configuration 
collectCoverageFrom: [ 
'src/**/*.ts', 
'!src/**/*.d.ts', 
'!src/**/*.interface.ts', 
'!src/models/**/*.ts',     
// Skip type definitions 
'!src/database/migrate.ts', // Skip migration scripts 
'!src/database/seed.ts'     
// Skip seed scripts 
], 
// Coverage thresholds 
coverageThreshold: { 
global: { 
branches: 75, 
functions: 80,
lines: 80, 
statements: 80 
}
}, 
// Coverage directory 
coverageDirectory: 'coverage', 
// Coverage reporters 
coverageReporters: ['text', 'lcov', 'html', 'json'], 
// Module paths 
moduleNameMapper: { 
'^@/(.*)$': '<rootDir>/src/$1' 
}, 
// Setup files 
setupFilesAfterEnv: ['<rootDir>/src/tests/setup/jest.setup.ts'], 
// Transform files 
transform: { 
'^.+\\.ts$': 'ts-jest' 
}, 
// Verbose output 
verbose: true, 
// Clear mocks between tests 
clearMocks: true, 
// Restore mocks between tests 
restoreMocks: true 
};