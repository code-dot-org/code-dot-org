import HttpClient from '@cdo/apps/util/HttpClient';

import {MetricsApi} from './MetricsApi';
import {MetricDatum} from './types';

const BASE_URL = '/browser_events/';

/**
 * A {@link MetricsApi} implementation that forwards metrics to Dashboard.
 */
export default class DashboardMetricsApi implements MetricsApi {
  async sendLogs(logs: object[]): Promise<Response> {
    return HttpClient.post(BASE_URL + 'put_logs', JSON.stringify({logs}), true);
  }

  async sendMetricData(metricData: MetricDatum[]) {
    return HttpClient.post(
      BASE_URL + 'put_metric_data',
      JSON.stringify({metricData}),
      true
    );
  }
}
