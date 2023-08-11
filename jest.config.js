module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts', '**/*.tests.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  reporters: [ 'default', 'jest-junit' ]
};
