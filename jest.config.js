module.exports = {
  moduleFileExtensions: [
    'js',
    'ts'
  ],
  moduleDirectories: [
    'node_modules'
  ],
  setupFilesAfterEnv: [
    '@babel/polyfill',
    'jest-canvas-mock'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(d3|d3-selection|d3-array|d3-scale|d3-zoom|d3-shape|d3-color|d3-time-format|d3-format|ol)/)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts'
  ],
  transform: {
    '\\.(js)$': '<rootDir>/node_modules/babel-jest',
    '\\.(ts)$': '<rootDir>/node_modules/babel-jest'
  },
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'jsdom'
};
