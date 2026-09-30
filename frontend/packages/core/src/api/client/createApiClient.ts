import type {Transport} from '../transports/types';

import {createAiGatewayApi} from '../aiGateway';
import {createActivitiesApi} from '../dashboard/activities';
import {createAichatApi} from '../dashboard/aichat';
import {createAnimationsApi} from '../dashboard/animations';
import {createAssetsApi} from '../dashboard/assets';
import {createAuthApi} from '../dashboard/auth';
import {createChannelsApi} from '../dashboard/channels';
import {createCoursesApi} from '../dashboard/courses';
import {createImagesApi} from '../dashboard/images';
import {createLevelsApi} from '../dashboard/levels';
import {createLibrariesApi} from '../dashboard/libraries';
import {createMediaApi} from '../dashboard/media';
import {createMetricsApi} from '../dashboard/metrics';
import {createPreferencesApi} from '../dashboard/preferences';
import {createProgressApi} from '../dashboard/progress';
import {createProjectsApi} from '../dashboard/projects';
import {createSchoolsApi} from '../dashboard/schools';
import {createSectionsApi} from '../dashboard/sections';
import {createSourcesApi} from '../dashboard/sources';
import {createSpriteLabApi} from '../dashboard/spriteLab';
import {createUsersApi} from '../dashboard/users';

export const createApiClient = (transport: Transport) => ({
  transport,
  activities: createActivitiesApi(transport),
  aiGateway: createAiGatewayApi(transport),
  aichat: createAichatApi(transport),
  animations: createAnimationsApi(transport),
  assets: createAssetsApi(transport),
  auth: createAuthApi(transport),
  channels: createChannelsApi(transport),
  courses: createCoursesApi(transport),
  images: createImagesApi(transport),
  levels: createLevelsApi(transport),
  libraries: createLibrariesApi(transport),
  media: createMediaApi(transport),
  metrics: createMetricsApi(transport),
  preferences: createPreferencesApi(transport),
  progress: createProgressApi(transport),
  projects: createProjectsApi(transport),
  schools: createSchoolsApi(transport),
  sections: createSectionsApi(transport),
  sources: createSourcesApi(transport),
  spriteLab: createSpriteLabApi(transport),
  users: createUsersApi(transport),
});

export type ApiClient = ReturnType<typeof createApiClient>;
