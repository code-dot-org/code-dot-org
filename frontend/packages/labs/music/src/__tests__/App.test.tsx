import {act, render} from '@testing-library/react';
import {vi} from 'vitest';

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

// Replace the DashboardApiClient singleton with stub methods that resolve to
// the minimum shape App.tsx consumes. Other exports pass through untouched.
vi.mock('@code-dot-org/core/api', async () => {
  const actual = await vi.importActual<typeof import('@code-dot-org/core/api')>(
    '@code-dot-org/core/api',
  );

  return {
    ...actual,
    DashboardApiClient: {
      ...actual.DashboardApiClient,
      levels: {
        ...actual.DashboardApiClient.levels,
        getLevelProperties: async () => ({}),
      },
      preferences: {
        ...actual.DashboardApiClient.preferences,
        getThemeSettings: async () => ({}),
      },
    },
  };
});

it('renders without crashing', async () => {
  const {container} = render(<App />);
  // Flush microtasks so the API promises (and their setState calls) settle
  // inside an act scope. Without this, React warns about updates outside act.
  await act(async () => {});
  expect(container).toBeTruthy();
});
