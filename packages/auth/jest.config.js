/**
 * Jest Configuration for @zcatalyst/auth package
 */

const base = require('../../jest.config.base.browser');

module.exports = {
  ...base,
  displayName: '@zcatalyst/auth',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
