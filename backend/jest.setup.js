process.env.NODE_ENV = 'test';

// Mock modules that cause issues in Jest
jest.mock('express-rate-limit', () => {
  return function() {
    return (req, res, next) => next();
  };
});
