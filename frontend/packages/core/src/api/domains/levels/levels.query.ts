import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import type {
  AppOptions,
  ExtraLinksLevelData,
  LevelPropertiesMap,
  SectionSummary,
  UserAppOptions,
} from './levels.types';
import {levelsKeys} from './levels.keys';

export function useLevelProperties(
  api: ApiClient,
  params: {
    levelId?: number;
    standaloneProjectType?: string;
    scriptName?: string;
    lessonPosition?: number;
  },
  options?: Omit<UseQueryOptions<LevelPropertiesMap>, 'queryKey' | 'queryFn'>,
) {
  const {levelId, standaloneProjectType, scriptName, lessonPosition} = params;

  return useQuery({
    queryKey: levelsKeys.properties(
      standaloneProjectType ? undefined : levelId,
      standaloneProjectType,
      scriptName,
      lessonPosition,
    ),
    queryFn: () => api.levels.getLevelProperties(params),
    enabled:
      Number.isFinite(levelId) ||
      !!standaloneProjectType ||
      !!(scriptName || lessonPosition),
    ...options,
  });
}

export function usePredictResponse(
  api: ApiClient,
  params: {levelId: number; scriptId: number},
  options?: Omit<UseQueryOptions<string>, 'queryKey' | 'queryFn'>,
) {
  const {levelId, scriptId} = params;

  return useQuery({
    queryKey: levelsKeys.predictResponse(scriptId, levelId),
    queryFn: () => api.levels.getPredictResponse(params),
    enabled: Number.isFinite(levelId) && Number.isFinite(scriptId),
    ...options,
  });
}

export function useResetPredictLevelProgress(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      unknown,
      Error,
      {currentLevelId?: number; scriptId?: number}
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {currentLevelId?: number; scriptId?: number}) =>
      api.levels.resetPredictLevelProgress(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: levelsKeys.all,
      });
    },
    ...options,
  });
}

export function useSectionSummary(
  api: ApiClient,
  params: {sectionId: number; levelId: number},
  options?: Omit<UseQueryOptions<SectionSummary>, 'queryKey' | 'queryFn'>,
) {
  const {sectionId, levelId} = params;

  return useQuery({
    queryKey: levelsKeys.sectionSummary(sectionId, levelId),
    queryFn: () => api.levels.getSectionSummary(params),
    enabled: Number.isFinite(sectionId) && Number.isFinite(levelId),
    ...options,
  });
}

export function useExtraLinksLevelData(
  api: ApiClient,
  params: {levelId: number; scriptLevelId?: number},
  options?: Omit<UseQueryOptions<ExtraLinksLevelData>, 'queryKey' | 'queryFn'>,
) {
  const {levelId, scriptLevelId} = params;

  return useQuery({
    queryKey: levelsKeys.extraLinks(levelId, scriptLevelId),
    queryFn: () => api.levels.getExtraLinksData(params),
    enabled: Number.isFinite(levelId),
    ...options,
  });
}

export function useAppOptions(
  api: ApiClient,
  params: {levelId: number},
  options?: Omit<UseQueryOptions<AppOptions>, 'queryKey' | 'queryFn'>,
) {
  const {levelId} = params;

  return useQuery({
    queryKey: levelsKeys.appOptions(levelId),
    queryFn: () => api.levels.getAppOptions(params),
    enabled: Number.isFinite(levelId),
    ...options,
  });
}

export function useUserAppOptions(
  api: ApiClient,
  params: {
    scriptName: string;
    lessonPosition: number;
    levelPosition: number;
    levelId: number;
  },
  options?: Omit<UseQueryOptions<UserAppOptions>, 'queryKey' | 'queryFn'>,
) {
  const {scriptName, lessonPosition, levelPosition, levelId} = params;

  return useQuery({
    queryKey: levelsKeys.userAppOptions(
      scriptName,
      lessonPosition,
      levelPosition,
      levelId,
    ),
    queryFn: () => api.levels.getUserAppOptions(params),
    enabled:
      !!scriptName &&
      Number.isFinite(lessonPosition) &&
      Number.isFinite(levelPosition) &&
      Number.isFinite(levelId),
    ...options,
  });
}
