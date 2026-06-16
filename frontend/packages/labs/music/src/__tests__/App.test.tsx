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

// The MSW node server (configured in `setup.ts`) intercepts the App's calls
// to `/levels/.../level_properties` and `/user_preference/theme`, so the
// real `DashboardApiClient` singleton runs end to end here.

it('renders without crashing', async () => {
  const {container} = render(<App />);
  // Flush microtasks so the API promises (and their setState calls) settle
  // inside an act scope. Without this, React warns about updates outside act.
  await act(async () => {});
  expect(container).toBeTruthy();
});
