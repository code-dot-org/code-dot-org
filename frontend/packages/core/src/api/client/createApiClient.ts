import type {Transport} from '../transports/types';

import {createAuthApi} from '../dashboard/auth';
import {createChannelsApi} from '../dashboard/channels';
import {createCoursesApi} from '../dashboard/courses';
import {createLevelsApi} from '../dashboard/levels';
import {createMetricsApi} from '../dashboard/metrics';
import {createPreferencesApi} from '../dashboard/preferences';
import {createProjectsApi} from '../dashboard/projects';
import {createSectionsApi} from '../dashboard/sections';
import {createSourcesApi} from '../dashboard/sources';
import {createUsersApi} from '../dashboard/users';

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
