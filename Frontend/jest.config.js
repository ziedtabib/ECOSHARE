module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!(axios|react-hot-toast|framer-motion|@headlessui|@heroicons|@tailwindcss)/)"
  ],
  moduleNameMapper: {
    "^axios$": "axios/dist/node/axios.cjs"
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/setupTests.js',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  }
};
