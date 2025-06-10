export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/cypress/',
    '/dist/',
    '/build/',
    '/out/',
    '/.next/',
    '/playwright/',
    '.*\\.e2e\\.spec\\.ts$'
  ],
};
