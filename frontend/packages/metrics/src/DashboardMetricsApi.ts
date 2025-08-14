import {retrieveToken} from '@code-dot-org/api';

import {MetricsApi} from './MetricsApi';
import type {MetricDatum} from './types';

const BASE_URL = '/browser_events/';

/**
 * A {@link MetricsApi} implementation that forwards metrics to Dashboard.
 */
export default class DashboardMetricsApi implements MetricsApi {
  async sendLogs(logs: object[]): Promise<Response> {
    return fetch(BASE_URL + 'put_logs', {
      method: 'POST',
      body: JSON.stringify({logs}),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': await retrieveToken(),
      },
    });
  }

  async sendMetricData(metricData: MetricDatum[]) {
    return fetch(BASE_URL + 'put_metric_data', {
      method: 'POST',
      body: JSON.stringify({metricData}),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': await retrieveToken(),
      },
    });
  }
}
