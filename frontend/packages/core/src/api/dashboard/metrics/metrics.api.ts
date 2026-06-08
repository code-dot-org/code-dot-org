import type {Transport} from '../../transports/types';

import {MetricDataSchema} from './metrics.schemata';
import type {MetricData} from './metrics.types';

export function createMetricsApi(transport: Transport) {
  return {
    async sendLogs(params: {logs: object[]}) {
      const {logs} = params;

      return await transport.request<unknown>({
        method: 'POST',
        url: '/browser_events/put_logs',
        body: logs,
      });
    },

    async sendMetricData(params: {metricData: MetricData}) {
      const {metricData} = params;

      const validatedData = MetricDataSchema.parse(metricData);

      return await transport.request<unknown>({
        method: 'POST',
        url: '/browser_events/put_metric_data',
        body: validatedData,
      });
    },
  };
}
