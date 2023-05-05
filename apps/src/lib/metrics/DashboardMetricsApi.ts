import {
  getAuthenticityToken,
  AUTHENTICITY_TOKEN_HEADER,
} from '../../util/AuthenticityTokenStore';
import {MetricsApi} from './MetricsApi';

const BASE_URL = '/browser_events/';

/**
 * A {@link MetricsApi} implementation that forwards metrics to Dashboard.
 */
export default class DashboardMetricsApi implements MetricsApi {
  async sendLogs(logs: object[]): Promise<Response> {
    let token;
    try {
      token = await getAuthenticityToken();
    } catch (error) {
      return Response.error();
    }

    return fetch(BASE_URL + 'put_logs', {
      method: 'POST',
      body: JSON.stringify({logs}),
      headers: {
        [AUTHENTICITY_TOKEN_HEADER]: token,
      },
    });
  }
}
