import type {Transport} from '../transports/types';

import {createChannelsApi} from '../domains/channels';
import {createLevelsApi} from '../domains/levels';
import {createProjectsApi} from '../domains/projects';
import {createSourcesApi} from '../domains/sources';

export type ApiClient = {
  transport: Transport;
  channels: ReturnType<typeof createChannelsApi>;
  levels: ReturnType<typeof createLevelsApi>;
  projects: ReturnType<typeof createProjectsApi>;
  sources: ReturnType<typeof createSourcesApi>;
};

export function createApiClient(transport: Transport): ApiClient {
  return {
    transport,
    channels: createChannelsApi(transport),
    levels: createLevelsApi(transport),
    projects: createProjectsApi(transport),
    sources: createSourcesApi(transport),
  };
}
