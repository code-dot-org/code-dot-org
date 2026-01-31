import {useQuery, type UseQueryOptions} from '@tanstack/react-query';

import type {LevelProperties} from './levels.types';
import {levelsKeys} from './levels.keys';
import type {ApiClient} from '../../client/createApiClient';

export function useLevelProperties(
  api: ApiClient,
  levelId: number,
  options?: Omit<UseQueryOptions<LevelProperties>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: levelsKeys.properties(levelId),
    queryFn: () => api.levels.getLevelProperties({id: levelId}),
    enabled: Number.isFinite(levelId),
    ...options,
  });
}
