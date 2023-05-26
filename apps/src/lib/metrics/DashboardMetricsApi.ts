import {post} from '@cdo/apps/util/HttpClient';
import {MetricsApi} from './MetricsApi';

const BASE_URL = '/browser_events/';

/**
 * A {@link MetricsApi} implementation that forwards metrics to Dashboard.
 */
export default class DashboardMetricsApi implements MetricsApi {
  async sendLogs(logs: object[]): Promise<Response> {
    return post(BASE_URL + 'put_logs', JSON.stringify({logs}), true);
  }
}
