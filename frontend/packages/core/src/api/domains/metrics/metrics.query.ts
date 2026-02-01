import {useMutation, type UseMutationOptions} from '@tanstack/react-query';

import type {ApiClient} from '../../client/createApiClient';
import type {MetricData} from './metrics.types';

export function useSendLogs(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, object[]>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: (logs: object[]) => api.metrics.sendLogs({logs}),
    ...options,
  });
}

export function useSendMetricsData(
  api: ApiClient,
  options?: Omit<UseMutationOptions<unknown, Error, MetricData>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn: (metricData: MetricData) =>
      api.metrics.sendMetricsData({metricData}),
    ...options,
  });
}
