// Jest Setup File
// Global test configuration and mocks

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock IndexDB
const indexedDBMock = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};
global.indexedDB = indexedDBMock;

// Suppress console errors in tests (optional)
// global.console.error = jest.fn();
// global.console.warn = jest.fn();
