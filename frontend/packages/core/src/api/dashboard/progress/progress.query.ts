import {
  useMutation,
  useQuery,
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
 * Mutation: report a milestone (level result). Cache invalidation is
 * the caller's responsibility — supply `options.onSuccess` if the
 * surrounding component is also reading `useUserProgress` and needs
 * the new server state. A typical wiring:
 *
 * ```ts
 * const queryClient = useQueryClient();
 * const report = useReportMilestone(api, {
 *   onSuccess: () =>
 *     queryClient.invalidateQueries({
 *       queryKey: progressKeys.userProgress(scriptName),
 *     }),
 * });
 * ```
 */
export function useReportMilestone(
  api: ApiClient,
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
  return useMutation({
    mutationFn: params => api.progress.reportMilestone(params),
    ...options,
  });
}
