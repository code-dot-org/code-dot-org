import type {ApiClient} from '@code-dot-org/core/api';

import type {MetricDatum} from './types';

/**
 * Interface for interacting with a metrics service API.
 */
export interface MetricsApi {
  /**
   * Send a list of log objects.
   */
  sendLogs: (api: ApiClient, logs: object[]) => Promise<void>;
  /**
   * Send a list of metric data.
   */
  sendMetricData: (api: ApiClient, metricData: MetricDatum[]) => Promise<void>;
}
