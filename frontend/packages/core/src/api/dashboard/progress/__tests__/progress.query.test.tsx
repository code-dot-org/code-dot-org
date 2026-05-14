/**
 * @vitest-environment jsdom
 */

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {ApiClient} from '../../../client/createApiClient';
import {progressKeys} from '../progress.keys';
import {useReportMilestone, useUserProgress} from '../progress.query';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * A QueryClient configured for tests: no retries on failure (so the
 * "error" state appears on the first failed call) and no React-DevTools
 * gc. A fresh instance per test keeps cache state isolated.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  });
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function makeApi(
  overrides: {
    getUserProgress?: ReturnType<typeof vi.fn>;
    reportMilestone?: ReturnType<typeof vi.fn>;
  } = {},
): ApiClient {
  return {
    progress: {
      getUserProgress:
        overrides.getUserProgress ?? vi.fn().mockResolvedValue({}),
      reportMilestone:
        overrides.reportMilestone ?? vi.fn().mockResolvedValue(undefined),
    },
  } as unknown as ApiClient;
}

// ─── useUserProgress ────────────────────────────────────────────────────────

describe('useUserProgress', () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    queryClient = makeQueryClient();
  });

  it('starts in a loading state and resolves to the api response', async () => {
    const getUserProgress = vi.fn().mockResolvedValue({isInstructor: true});
    const api = makeApi({getUserProgress});

    const {result} = renderHook(
      () => useUserProgress(api, {scriptName: 'csd-1'}),
      {wrapper: wrapperFor(queryClient)},
    );

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({isInstructor: true});
    expect(getUserProgress).toHaveBeenCalledWith({scriptName: 'csd-1'});
  });

  it('uses the progressKeys.userProgress cache key (script + userId)', async () => {
    const api = makeApi();
    renderHook(
      () => useUserProgress(api, {scriptName: 'csd-1', userId: '42'}),
      {wrapper: wrapperFor(queryClient)},
    );

    await waitFor(() =>
      expect(
        queryClient.getQueryData(progressKeys.userProgress('csd-1', '42')),
      ).toBeDefined(),
    );
  });

  it('keeps current-user and view-as-student entries in separate cache slots', async () => {
    // Same scriptName, different userId — the resolved promises need to
    // land at distinct cache keys so neither overwrites the other.
    const getUserProgress = vi
      .fn()
      .mockResolvedValueOnce({progress: {1: {status: 'perfect'}}})
      .mockResolvedValueOnce({progress: {2: {status: 'submitted'}}});
    const api = makeApi({getUserProgress});

    const {rerender} = renderHook(
      ({userId}: {userId?: string}) =>
        useUserProgress(api, {scriptName: 'csd-1', userId}),
      {
        wrapper: wrapperFor(queryClient),
        initialProps: {userId: undefined as string | undefined},
      },
    );

    await waitFor(() =>
      expect(
        queryClient.getQueryData(progressKeys.userProgress('csd-1')),
      ).toBeDefined(),
    );

    rerender({userId: '42'});

    await waitFor(() =>
      expect(
        queryClient.getQueryData(progressKeys.userProgress('csd-1', '42')),
      ).toBeDefined(),
    );

    // Both entries coexist — viewing as a student doesn't clobber the
    // current-user fetch.
    expect(
      queryClient.getQueryData(progressKeys.userProgress('csd-1')),
    ).toEqual({progress: {1: {status: 'perfect'}}});
    expect(
      queryClient.getQueryData(progressKeys.userProgress('csd-1', '42')),
    ).toEqual({progress: {2: {status: 'submitted'}}});
  });

  it('disables the query when scriptName is empty', async () => {
    const getUserProgress = vi.fn().mockResolvedValue({});
    const api = makeApi({getUserProgress});

    const {result} = renderHook(() => useUserProgress(api, {scriptName: ''}), {
      wrapper: wrapperFor(queryClient),
    });

    // `enabled: !!params.scriptName` should keep the query gated.
    expect(result.current.fetchStatus).toBe('idle');
    expect(getUserProgress).not.toHaveBeenCalled();
  });

  it('surfaces api errors as the error state', async () => {
    const getUserProgress = vi
      .fn()
      .mockRejectedValue(new Error('network died'));
    const api = makeApi({getUserProgress});

    const {result} = renderHook(
      () => useUserProgress(api, {scriptName: 'csd-1'}),
      {wrapper: wrapperFor(queryClient)},
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('network died');
  });
});

// ─── useReportMilestone ─────────────────────────────────────────────────────

describe('useReportMilestone', () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    queryClient = makeQueryClient();
  });

  const milestonePayload = {
    userId: 0,
    scriptLevelId: 7,
    levelId: 42,
    app: 'pythonlab',
    testResult: 100,
  };

  it('mutationFn forwards verbatim to api.progress.reportMilestone', async () => {
    const reportMilestone = vi.fn().mockResolvedValue(undefined);
    const api = makeApi({reportMilestone});

    const {result} = renderHook(() => useReportMilestone(api), {
      wrapper: wrapperFor(queryClient),
    });

    await result.current.mutateAsync(milestonePayload);

    expect(reportMilestone).toHaveBeenCalledWith(milestonePayload);
  });

  it('invokes a caller-supplied onSuccess after a successful report', async () => {
    // Cache invalidation is the caller's responsibility — the canonical
    // wiring is `options.onSuccess: () => queryClient.invalidateQueries(...)`.
    // This test pins that the hook actually runs the supplied callback.
    const reportMilestone = vi.fn().mockResolvedValue(undefined);
    const api = makeApi({reportMilestone});
    const onSuccess = vi.fn();

    const {result} = renderHook(() => useReportMilestone(api, {onSuccess}), {
      wrapper: wrapperFor(queryClient),
    });

    await result.current.mutateAsync(milestonePayload);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('does nothing extra on success when no options are supplied', async () => {
    // The default hook is just `mutationFn` — no cache touches, no side
    // effects. Confirms that consumers who don't care about invalidation
    // get a clean fire-and-forget mutation.
    const reportMilestone = vi.fn().mockResolvedValue(undefined);
    const api = makeApi({reportMilestone});
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const {result} = renderHook(() => useReportMilestone(api), {
      wrapper: wrapperFor(queryClient),
    });

    await result.current.mutateAsync(milestonePayload);

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('does not invoke options.onSuccess when the api call fails', async () => {
    const reportMilestone = vi.fn().mockRejectedValue(new Error('500 boom'));
    const api = makeApi({reportMilestone});
    const onSuccess = vi.fn();

    const {result} = renderHook(() => useReportMilestone(api, {onSuccess}), {
      wrapper: wrapperFor(queryClient),
    });

    await expect(result.current.mutateAsync(milestonePayload)).rejects.toThrow(
      '500 boom',
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('surfaces api errors as the mutation error state', async () => {
    const reportMilestone = vi.fn().mockRejectedValue(new Error('500 boom'));
    const api = makeApi({reportMilestone});

    const {result} = renderHook(() => useReportMilestone(api), {
      wrapper: wrapperFor(queryClient),
    });

    await expect(result.current.mutateAsync(milestonePayload)).rejects.toThrow(
      '500 boom',
    );
    // The hook's `isError` flag flips on a follow-up React render — wait
    // for it rather than asserting synchronously after `mutateAsync`.
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('500 boom');
  });
});
