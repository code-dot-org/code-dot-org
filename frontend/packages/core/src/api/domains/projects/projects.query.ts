import {useQuery, type UseQueryOptions} from '@tanstack/react-query';
import {z} from 'zod';

import type {ApiClient} from '../../client/createApiClient';
import {ProjectChannelForLevelSchema} from './projects.schemata';
import type {ExtraLinksProjectData} from './projects.types';
import {projectsKeys} from './projects.keys';

type ProjectChannelForLevel = z.infer<typeof ProjectChannelForLevelSchema>;

export function useChannelForLevel(
  api: ApiClient,
  params: {levelId: number; scriptId?: number; userId?: number},
  options?: Omit<
    UseQueryOptions<ProjectChannelForLevel>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: projectsKeys.channelForLevel(params),
    queryFn: () => api.projects.getChannelForLevel(params),
    enabled: Number.isFinite(params.levelId),
    ...options,
  });
}

export function useExtraLinksProjectData(
  api: ApiClient,
  params: {channelId: string},
  options?: Omit<
    UseQueryOptions<ExtraLinksProjectData>,
    'queryKey' | 'queryFn'
  >,
) {
  const {channelId} = params;

  return useQuery({
    queryKey: projectsKeys.extraLinks(channelId),
    queryFn: () => api.projects.getExtraLinksData(params),
    enabled: !!channelId,
    ...options,
  });
}
