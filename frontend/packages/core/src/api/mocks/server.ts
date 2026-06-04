// MSW node server for vitest. Lives at its own subpath
// (`@code-dot-org/core/api/mocks/server`) so the browser-targeted
// `./api/mocks` bundle stays free of `msw/node`.
//
// Tests own the lifecycle:
//
//   import {beforeAll, afterEach, afterAll} from 'vitest';
//   import {mockServer} from '@code-dot-org/core/api/mocks/server';
//
//   beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
//   afterEach(() => mockServer.resetHandlers());
//   afterAll(() => mockServer.close());

import {setupServer} from 'msw/node';

import {getMockHandlers} from './handlers';

export const mockServer = setupServer(...getMockHandlers());
