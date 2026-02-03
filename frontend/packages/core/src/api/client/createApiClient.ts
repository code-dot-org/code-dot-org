import type {Transport} from '../transports/types';

import {createAuthApi} from '../domains/auth';
import {createChannelsApi} from '../domains/channels';
import {createLevelsApi} from '../domains/levels';
import {createMetricsApi} from '../domains/metrics';
import {createPreferencesApi} from '../domains/preferences';
import {createProjectsApi} from '../domains/projects';
import {createSourcesApi} from '../domains/sources';

export const createApiClient = (transport: Transport) => ({
  transport,
  auth: createAuthApi(transport),
  channels: createChannelsApi(transport),
  levels: createLevelsApi(transport),
  metrics: createMetricsApi(transport),
  preferences: createPreferencesApi(transport),
  projects: createProjectsApi(transport),
  sources: createSourcesApi(transport),
});

export type ApiClient = ReturnType<typeof createApiClient>;
