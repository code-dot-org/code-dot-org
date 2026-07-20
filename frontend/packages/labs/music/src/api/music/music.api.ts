import type {Transport} from '@code-dot-org/core/api';

import AppConfig, {getBaseAssetUrl} from '../../appConfig';
import {baseAssetUrlRestricted} from '../../constants';
import type {SoundData} from '../../player/types';

import {LibraryJsonSchema} from './music.schemata';
import type {SoundFolder} from './music.types';

// This value can be modifed each time we know that there is an important new version
// of the library on S3, to help bypass any caching of an older version.
const requestVersion = 'launch2024-3';

export function createMusicApi(transport: Transport) {
  return {
    /**
     * GET https://curriculum.code.org/media/musiclab/:library/:folder[/:soundData.path]/:soundData.src
     */
    async getSound(params: {
      library: string;
      folder: SoundFolder;
      soundData: SoundData;
    }): Promise<Blob> {
      const {library, folder, soundData} = params;
      console.log('getSound', soundData);

      const baseUrl = soundData.restricted
        ? baseAssetUrlRestricted
        : getBaseAssetUrl();

      const optionalSoundPath = soundData.path ? `${soundData.path}/` : '';

      return transport.requestBlob({
        method: 'GET',
        url: `${baseUrl}${library}/${folder.path}/${optionalSoundPath}${soundData.src}.mp3`,
      });
    },

    /**
     * GET https://curriculum.code.org/media/musiclab/:library.json[?version=:requestVersion]
     */
    async getLibrary(params: {library: string}) {
      const {library} = params;

      const url =
        AppConfig.getValue('local-library') === 'true'
          ? `/${library}.json`
          : `${getBaseAssetUrl()}${library}.json${requestVersion ? `?version=${requestVersion}` : ''}`;

      const raw = await transport.request<unknown>({
        method: 'GET',
        url,
      });

      return LibraryJsonSchema.parse(raw);
    },
  };
}
