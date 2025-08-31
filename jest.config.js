module.exports = {
  verbose: true,
  testEnvironment: "jsdom",
  moduleFileExtensions: [
    "js",
    "jsx",
    "json",
    "vue",
  ],
  transform: {
    "^.+\\.vue$": "vue-jest",
    ".+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  
  testMatch: [
    "<rootDir>/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)",
  ],
  testURL: "http://localhost/",
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    "**/*.{vue}", "!**/node_modules/**", "!<rootDir>/dist/**",
    "!<rootDir>/src/plugins/**", "!<rootDir>/tests/unit/**",
  ],
  coverageReporters: ["lcov", "text-summary"],
};
