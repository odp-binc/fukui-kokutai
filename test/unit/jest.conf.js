const path = require("path");

module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  rootDir: path.resolve(__dirname, "../../"),
  moduleFileExtensions: ["js", "json", "ts", "tsx", "vue"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
    ".*\\.(vue)$": "vue-jest"
  },
  testPathIgnorePatterns: ["<rootDir>/test/e2e"],
  testRegex: "/test/unit/specs/.*\\.(test|spec)\\.(jsx?|tsx?)$",
  snapshotSerializers: ["<rootDir>/node_modules/jest-serializer-vue"],
  setupFiles: ["<rootDir>/test/unit/setup"],
  coverageDirectory: "<rootDir>/test/unit/coverage",
  collectCoverageFrom: [
    "src/**/*.{ts,js,vue}",
    "!src/**/*.d.ts",
    "!src/main.ts",
    "!src/router/index.ts",
    "!src/store/index.ts",
    "!**/node_modules/**"
  ],
  preset: "ts-jest/presets/js-with-babel",
  testMatch: null
};
