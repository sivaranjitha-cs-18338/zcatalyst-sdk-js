const base = require("../../jest.config.base.js");

module.exports =  {
  ...base,
  moduleNameMapper: {
    "^@zcatalyst/transport$": "../../transport/src/__mocks__",
  },
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 30,
      lines: 47,
      statements: 46
    }
  }
};
