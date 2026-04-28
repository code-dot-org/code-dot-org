import {render} from '@testing-library/react';
import {vi} from 'vitest';

import App from '../App';

vi.mock('@code-dot-org/core', () => ({
  CodeStudioConfig: {
    environment: 'test',
    dashboardApiUrl: 'http://localhost',
  },
}));

vi.mock('@code-dot-org/core/api', () => ({
  DashboardApiClient: {
    labs: {levels: {getLevelProperties: vi.fn().mockResolvedValue(undefined)}},
    users: {userPreference: {getTheme: vi.fn().mockResolvedValue(undefined)}},
  },
}));

vi.mock('@code-dot-org/core/plugins/observability', () => ({
  logger: {info: vi.fn()},
  metrics: {count: vi.fn()},
}));

it('renders without crashing', () => {
  const {container} = render(<App />);
  expect(container).toBeTruthy();
});
