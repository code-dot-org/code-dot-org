import {CodeStudioConfig, getDashboardApiUrl} from '@code-dot-org/core';
import {datadogLogs} from '@datadog/browser-logs';
import {datadogRum} from '@datadog/browser-rum';
import {reactPlugin} from '@datadog/browser-rum-react';

const environment = CodeStudioConfig.environment;

function getAllowedTracingUrls() {
  switch (environment) {
    case 'adhoc':
      return [
        {
          match: /^https:\/\/.*\.cdn-code\.org/,
          propagatorTypes: ['tracecontext'],
        },
      ];
    default:
      return [
        {
          match: getDashboardApiUrl(environment),
          propagatorTypes: ['tracecontext'],
        },
      ];
  }
}

datadogRum.init({
  applicationId: 'fcd6e241-7fbc-4cb7-831a-eb8191087624',
  clientToken: 'pub9349f05da4db9534abd34f8a2a586ee7',
  site: 'datadoghq.com',
  service: 'apps',
  env: CodeStudioConfig.environment,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 0, // Explicitly disabled, please see https://codedotorg.slack.com/archives/C0717ETG9S6/p1772745099687559
  trackResources: true,
  trackUserInteractions: true,
  trackLongTasks: true,
  plugins: [reactPlugin({router: false})],
  allowedTracingUrls: getAllowedTracingUrls(),
});

datadogLogs.init({
  clientToken: 'pub9349f05da4db9534abd34f8a2a586ee7',
  site: 'datadoghq.com',
  service: 'apps',
  env: CodeStudioConfig.environment,
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
  forwardConsoleLogs: ['log', 'info', 'warn', 'error'],
});
