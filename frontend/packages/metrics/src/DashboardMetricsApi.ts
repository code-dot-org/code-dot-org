import type {ApiClient} from '@code-dot-org/core/api';

import {MetricsApi} from './MetricsApi';
import type {MetricDatum} from './types';

/**
 * A {@link MetricsApi} implementation that forwards metrics to Dashboard.
 *
 * It wraps the API calls to the metrics endpoints in dashboard.
 */
export default class DashboardMetricsApi implements MetricsApi {
  async sendLogs(api: ApiClient, logs: object[]) {
    await api.metrics.sendLogs({logs});
  }

  async sendMetricData(api: ApiClient, metricData: MetricDatum[]) {
    await api.metrics.sendMetricData({metricData});
  }
}
