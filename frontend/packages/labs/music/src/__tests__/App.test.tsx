import {act, render} from '@testing-library/react';
import {vi} from 'vitest';

import {
  ApiClientProvider,
  DashboardApiClient as api,
  QueryClientProvider,
} from '@code-dot-org/core/api';

import App from '../App';

vi.mock('@code-dot-org/core', () => ({
  CodeStudioConfig: {
    environment: 'test',
    dashboardApiUrl: 'http://localhost',
  },
}));

vi.mock('@code-dot-org/core/plugins/observability', () => ({
  logger: {info: vi.fn()},
  metrics: {count: vi.fn()},
}));

// Replace the DashboardApiClient singleton with one backed by a mock
// transport. Other exports (createApiClient, createMockTransport, schemas,
// React hooks, etc.) pass through untouched via importActual.
vi.mock('@code-dot-org/core/api', async () => {
  const actual = await vi.importActual<typeof import('@code-dot-org/core/api')>(
    '@code-dot-org/core/api',
  );

  const transport = actual.createMockTransport({
    baseUrl: '',
    routes: [
      {
        method: 'GET',
        url: '/levels/46446/level_properties',
        handler: () => ({}),
      },
      {
        method: 'GET',
        url: '/user_preference/theme',
        handler: () => ({theme: {}}),
      },
    ],
  });

  return {
    ...actual,
    DashboardApiClient: actual.createApiClient(transport),
  };
});

it('renders without crashing', async () => {
  const {container} = render(
    <QueryClientProvider>
      <ApiClientProvider client={api}>
        <App />
      </ApiClientProvider>
    </QueryClientProvider>,
  );
  // Flush microtasks so the API promises (and their setState calls) settle
  // inside an act scope. Without this, React warns about updates outside act.
  await act(async () => {});
  expect(container).toBeTruthy();
});
