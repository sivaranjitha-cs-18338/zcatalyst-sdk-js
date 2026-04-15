/**
 * Jest Configuration for @zcatalyst/auth package
 */

const base = require('../../config/jest.config.base.browser');

module.exports = {
  ...base,
  displayName: '@zcatalyst/auth',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
