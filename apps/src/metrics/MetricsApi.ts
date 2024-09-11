import {MetricDatum} from './types';

/**
 * Interface for interacting with a metrics service API.
 */
export interface MetricsApi {
  /**
   * Send a list of log objects.
   */
  sendLogs: (logs: object[]) => Promise<Response>;
  /**
   * Send a list of metric data.
   */
  sendMetricData: (metricData: MetricDatum[]) => Promise<Response>;
}
