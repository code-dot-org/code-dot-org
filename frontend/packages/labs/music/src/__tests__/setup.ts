// Vitest setup: install the MSW node server so tests exercise the real
// `kyTransport` end to end. Per-test overrides via `mockServer.use(...)`.

import {afterAll, afterEach, beforeAll} from 'vitest';

import {mockServer} from '@code-dot-org/core/api/mocks/server';

beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
