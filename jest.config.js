module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts', '**/*.tests.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  reporters: [ 'default' ]
};
