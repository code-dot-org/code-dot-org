import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import {progressKeys} from './progress.keys';
import type {
  OptionalMilestoneData,
  UserProgressResponse,
} from './progress.types';

/**
 * Fetch a user's progress for a script. Pass `userId` only when a
 * teacher is viewing a specific student — the empty case fetches the
 * current session user's own progress.
 */
export function useUserProgress(
  api: ApiClient,
  params: {scriptName: string; userId?: string},
  options?: Omit<UseQueryOptions<UserProgressResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: progressKeys.userProgress(params.scriptName, params.userId),
    queryFn: () => api.progress.getUserProgress(params),
    enabled: !!params.scriptName,
    ...options,
  });
}

/**
 * Mutation: report a milestone (level result). Invalidates the matching
 * user-progress cache entry on success so the next read picks up the
 * server's view of the new state.
 */
export function useReportMilestone(
  api: ApiClient,
  /**
   * The scriptName whose progress query should be invalidated when this
   * milestone reports successfully. Optional — pass when you know the
   * caller is also reading from `useUserProgress` for that script.
   */
  invalidateForScriptName?: string,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {
        userId: number;
        scriptLevelId: number;
        levelId: number;
        app: string;
        testResult: number;
        extraData?: OptionalMilestoneData;
      }
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: params => api.progress.reportMilestone(params),
    onSuccess: () => {
      if (invalidateForScriptName) {
        queryClient.invalidateQueries({
          queryKey: progressKeys.userProgress(invalidateForScriptName),
        });
      }
    },
    ...options,
  });
}
