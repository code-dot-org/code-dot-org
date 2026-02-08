import type {Transport} from '../transports/types';

import {createAuthApi} from '../domains/auth';
import {createChannelsApi} from '../domains/channels';
import {createCoursesApi} from '../domains/courses';
import {createLevelsApi} from '../domains/levels';
import {createMetricsApi} from '../domains/metrics';
import {createPreferencesApi} from '../domains/preferences';
import {createProjectsApi} from '../domains/projects';
import {createSectionsApi} from '../domains/sections';
import {createSourcesApi} from '../domains/sources';
import {createUsersApi} from '../domains/users';

export const createApiClient = (transport: Transport) => ({
  transport,
  auth: createAuthApi(transport),
  channels: createChannelsApi(transport),
  courses: createCoursesApi(transport),
  levels: createLevelsApi(transport),
  metrics: createMetricsApi(transport),
  preferences: createPreferencesApi(transport),
  projects: createProjectsApi(transport),
  sections: createSectionsApi(transport),
  sources: createSourcesApi(transport),
  users: createUsersApi(transport),
});

export type ApiClient = ReturnType<typeof createApiClient>;
