const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  moduleNameMapper: {
    "^@zcatalyst/auth-admin$": "../../auth-admin/src/__mocks__",
  }
};