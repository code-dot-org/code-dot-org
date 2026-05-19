import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import type {
  ProjectSourcesAny,
  ProjectVersion,
  SaveSourceOptions,
  SourcesUpdateResponse,
  SourcesRestoreResponse,
} from './sources.types';
import {sourcesKeys} from './sources.keys';

export function useSources(
  api: ApiClient,
  params: {channelId: string; versionId?: string; sourceFile?: string},
  options?: Omit<
    UseQueryOptions<{sources: ProjectSourcesAny; versionId: string}>,
    'queryKey' | 'queryFn'
  >,
) {
  const {channelId, versionId, sourceFile} = params;

  return useQuery({
    queryKey: sourcesKeys.source(channelId, sourceFile),
    queryFn: () => api.sources.get({channelId, versionId, sourceFile}),
    enabled: !!channelId,
    ...options,
  });
}

export function useSourceVersionList(
  api: ApiClient,
  params: {
    channelId: string;
    sourceFile?: string;
    includeComments?: boolean;
  },
  options?: Omit<UseQueryOptions<ProjectVersion[]>, 'queryKey' | 'queryFn'>,
) {
  const {channelId, sourceFile, includeComments} = params;

  return useQuery({
    queryKey: sourcesKeys.versionList(channelId, sourceFile),
    queryFn: () =>
      api.sources.getVersionList({channelId, sourceFile, includeComments}),
    enabled: !!channelId,
    ...options,
  });
}

export function useUpdateSources(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      SourcesUpdateResponse,
      Error,
      {
        channelId: string;
        sources: ProjectSourcesAny;
        options?: SaveSourceOptions;
      }
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      channelId: string;
      sources: ProjectSourcesAny;
      options?: SaveSourceOptions;
    }) => api.sources.update(params),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({
        queryKey: sourcesKeys.detail(params.channelId),
      });
    },
    ...options,
  });
}

export function useRestoreSources(
  api: ApiClient,
  options?: Omit<
    UseMutationOptions<
      SourcesRestoreResponse,
      Error,
      {channelId: string; versionId: string}
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {channelId: string; versionId: string}) =>
      api.sources.restore(params),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({
        queryKey: sourcesKeys.detail(params.channelId),
      });
    },
    ...options,
  });
}
