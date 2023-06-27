// Utilities for retrieving various types of data for Music Lab.

import HttpClient from '@cdo/apps/util/HttpClient';
import MusicLibrary, {
  LibraryJson,
  LibraryValidator,
} from '../player/MusicLibrary';

const AppConfig = require('../appConfig').default;

export const baseUrl = 'https://curriculum.code.org/media/musiclab/';

// Loads a sound library JSON file.
export const loadLibrary = async (): Promise<MusicLibrary> => {
  if (AppConfig.getValue('local-library') === 'true') {
    const localLibraryFilename = 'music-library';
    const localLibrary = require(`@cdo/static/music/${localLibraryFilename}.json`);
    return new MusicLibrary(localLibrary as LibraryJson);
  } else {
    const libraryParameter = AppConfig.getValue('library');
    const libraryFilename = libraryParameter
      ? `music-library-${libraryParameter}.json`
      : 'music-library.json';

    const libraryJsonResponse = await HttpClient.fetchJson<LibraryJson>(
      baseUrl + libraryFilename,
      {},
      LibraryValidator
    );
    return new MusicLibrary(libraryJsonResponse.value);
  }
};
