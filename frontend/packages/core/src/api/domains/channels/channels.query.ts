import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import type {Channel} from './channels.types';
import {channelsKeys} from './channels.keys';

export function useChannel(
  api: ApiClient,
  channelId: string,
  options?: Omit<UseQueryOptions<Channel>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: channelsKeys.detail(channelId),
    queryFn: () => api.channels.get({channelId}),
    enabled: !!channelId,
    ...options,
  });
}

export function useUpdateChannel(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, Channel>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channel: Channel) => api.channels.update({channel}),
    onSuccess: (_data, channel) => {
      queryClient.invalidateQueries({
        queryKey: channelsKeys.detail(channel.id),
      });
    },
    ...options,
  });
}

export function usePublishChannel(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, Channel>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channel: Channel) => api.channels.publish({channel}),
    onSuccess: (_data, channel) => {
      queryClient.invalidateQueries({
        queryKey: channelsKeys.detail(channel.id),
      });
    },
    ...options,
  });
}

export function useUnpublishChannel(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, Channel>, 'mutationFn'>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channel: Channel) => api.channels.unpublish({channel}),
    onSuccess: (_data, channel) => {
      queryClient.invalidateQueries({
        queryKey: channelsKeys.detail(channel.id),
      });
    },
    ...options,
  });
}

export function useAbuseScore(
  api: ApiClient,
  channelId: string,
  options?: Omit<UseQueryOptions<number>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: channelsKeys.abuseScore(channelId),
    queryFn: () => api.channels.fetchAbuseScore({channelId}),
    enabled: !!channelId,
    ...options,
  });
}

export function useSharingDisabled(
  api: ApiClient,
  channelId: string,
  options?: Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: channelsKeys.sharingDisabled(channelId),
    queryFn: () => api.channels.fetchSharingDisabled({channelId}),
    enabled: !!channelId,
    ...options,
  });
}

export function useIsTeacherOfProjectOwner(
  api: ApiClient,
  channelId: string,
  options?: Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: channelsKeys.isTeacherOfProjectOwner(channelId),
    queryFn: () => api.channels.fetchIsTeacherOfProjectOwner({channelId}),
    enabled: !!channelId,
    ...options,
  });
}
