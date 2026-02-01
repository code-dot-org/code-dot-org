import {useQuery, type UseQueryOptions} from '@tanstack/react-query';

import type {LevelPropertiesMap} from './levels.types';
import {levelsKeys} from './levels.keys';
import type {ApiClient} from '../../client/createApiClient';

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
