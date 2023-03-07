module.exports = {
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
      },
    },
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/test/**/*.unit.spec.ts', '!**/test/**/*.integration.spec.ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
      '**/src/**/*.ts',
    ],
    coverageThreshold: {
      global: {
        functions: 100,
        branches: 90.06,
        statements: 100,
        lines: 100,
      },
    },
  };