import type {ApiClient} from '@code-dot-org/core/api';

import {createMusicApi} from './music';

export const createMusicApiClient = (api: ApiClient) => ({
  ...api,
  music: createMusicApi(api.transport),
});

export type MusicApiClient = ReturnType<typeof createMusicApiClient>;
