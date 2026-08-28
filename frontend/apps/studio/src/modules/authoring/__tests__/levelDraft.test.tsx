import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {act, renderHook, waitFor} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {authoringApi} from '../api';
import {useLevelDraft, type UseLevelDraftArgs} from '../levelDraft';

vi.mock('../api', () => ({
  authoringApi: {
    applyChange: vi.fn(),
    checkLevel: vi.fn(),
  },
}));

const checkLevel = vi.mocked(authoringApi.checkLevel);

function wrapper() {
  const queryClient = new QueryClient();
  return function Wrapper({children}: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

function baseArgs(
  overrides: Partial<UseLevelDraftArgs> = {},
): UseLevelDraftArgs {
  return {
    experienceId: 'exp-1',
    levelNumericId: 7,
    levelPropertiesLoaded: true,
    skin: 'birds',
    solutionVerified: false,
    workspaceMode: undefined,
    onWorkspaceModeChange: vi.fn(),
    onWorkspaceOverrideChange: vi.fn(),
    onDismissSolutionOffer: vi.fn(),
    onToolboxDraftChange: vi.fn(),
    onDiscardStageState: vi.fn(),
    ...overrides,
  };
}

describe('useLevelDraft — stale validator banner (Author Mode gap #9)', () => {
  beforeEach(() => {
    checkLevel.mockReset();
  });

  it('clears a checkResult the moment a further edit makes it stale', async () => {
    checkLevel.mockResolvedValue({
      ok: false,
      mode: 'simulated',
      reasons: ['grid has no start tile.'],
    });
    const {result} = renderHook(() => useLevelDraft(baseArgs()), {
      wrapper: wrapper(),
    });

    await act(async () => {
      await result.current.runCheck();
    });
    expect(result.current.checkResult).not.toBeNull();

    act(() => {
      result.current.setStartDirection('2');
    });

    expect(result.current.checkResult).toBeNull();
  });

  it('leaves checkResult alone when nothing has changed since it was produced', async () => {
    checkLevel.mockResolvedValue({ok: true, mode: 'simulated', reasons: []});
    const {result} = renderHook(() => useLevelDraft(baseArgs()), {
      wrapper: wrapper(),
    });

    await act(async () => {
      await result.current.runCheck();
    });
    expect(result.current.checkResult).not.toBeNull();

    // Re-render for an unrelated reason (no draft mutation) — the banner
    // must not flicker away on its own.
    await waitFor(() => expect(result.current.checkResult).not.toBeNull());
  });
});
