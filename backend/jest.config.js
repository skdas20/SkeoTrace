module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': '<rootDir>/jest-transformer.js'
  }
};
