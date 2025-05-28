import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Enable API mocking before all tests
beforeAll(() => server.listen());

// Reset any runtime request handlers after each test
afterEach(() => server.resetHandlers());

// Disable API mocking after all tests
afterAll(() => server.close());