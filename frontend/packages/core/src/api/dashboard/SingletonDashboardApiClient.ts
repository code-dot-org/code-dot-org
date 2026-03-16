import {CodeStudioConfig} from '@/config';
import {createDashboardApiClient} from './createDashboardApiClient';
import {getDashboardApiUrl} from '@/dashboard';
import ky from 'ky';

// Re-export Types
export * from './labs/types';
export * from './users/types';

const httpTransport = ky.extend({
  prefixUrl: getDashboardApiUrl(CodeStudioConfig.environment),
  // In development, we need to include credentials to ensure cookies are sent with requests to the dashboard API
  // In production, the dashboard API is served from the same origin as the frontend, so credentials are included by default and we don't need to specify this.
  ...(CodeStudioConfig.environment === 'development' && {
    credentials: 'include',
  }),
});

export default createDashboardApiClient(httpTransport);
