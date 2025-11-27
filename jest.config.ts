import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "^styled-components$": "styled-components/dist/styled-components.cjs.js",
  },
  testMatch: ["<rootDir>/tests/unit/**/?(*.)+(spec|test).(ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  collectCoverageFrom: ["app/**/*.{ts,tsx}", "!app/**/page.styles.ts"],
  collectCoverage: true,
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      statements: 5,
      branches: 0,
      functions: 5,
      lines: 5,
    },
  },
};

export default config;
