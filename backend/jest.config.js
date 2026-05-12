module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverage: false,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
