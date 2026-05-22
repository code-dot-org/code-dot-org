/**
 * @vitest-environment jsdom
 *
 * T200: HomeView renders both journey tiles synchronously without network calls.
 */

import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi, beforeEach} from 'vitest';

// Must mock before importing HomeView so the mock is in place at module load.
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/modules/seats/useActiveSeat', () => ({
  useActiveSeat: () => ({
    activeSeat: {
      id: 'seat:test',
      color: 'blue' as const,
      avatar: null,
      language: 'en' as const,
      createdAt: 0,
    },
    isLoading: false,
  }),
}));

vi.mock('@/config/siteConfig', () => ({
  getHomeGradeBands: () => undefined,
}));

import {HomeView} from '../HomeView';
import {AI_DECISIONS_JOURNEY} from '../journeys/ai-decisions.journey';
import {NOTEBOOK_JOURNEY} from '../journeys/notebook.journey';

describe('HomeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a tile for every registered journey', () => {
    render(<HomeView />);
    expect(
      screen.getByTestId(
        `journey-tile-${AI_DECISIONS_JOURNEY.title.toLowerCase().replace(/\s+/g, '-')}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `journey-tile-${NOTEBOOK_JOURNEY.title.toLowerCase().replace(/\s+/g, '-')}`,
      ),
    ).toBeInTheDocument();
  });

  it('does not fetch any network resources during render', () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    render(<HomeView />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('shows the heading', () => {
    render(<HomeView />);
    expect(screen.getByRole('heading', {level: 1})).toBeInTheDocument();
  });
});
