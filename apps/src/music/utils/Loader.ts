// Utilities for retrieving various types of data for Music Lab.

import HttpClient from '@cdo/apps/util/HttpClient';
import MusicLibrary, {
  LibraryJson,
  LibraryValidator,
} from '../player/MusicLibrary';
const AppConfig = require('../appConfig').default;
import {getBaseAssetUrl} from '../appConfig';

/**
 * Loads a sound library JSON file.
 *
 * @param libraryName specific library to load. If a library is specified by
 * URL param, that will take precedence.
 * @returns the Music Library
 */
export const loadLibrary = async (
  libraryName: string
): Promise<MusicLibrary> => {
  const libraryParameter = AppConfig.getValue('library') || libraryName;
  const libraryFilename = `music-library-${libraryParameter}`;

  if (AppConfig.getValue('local-library') === 'true') {
    const localLibrary = require(`@cdo/static/music/${libraryFilename}.json`);
    return new MusicLibrary(
      'local-' + libraryFilename,
      localLibrary as LibraryJson
    );
  } else {
    const libraryJsonResponse = await HttpClient.fetchJson<LibraryJson>(
      getBaseAssetUrl() + libraryFilename + '.json',
      {},
      LibraryValidator
    );
    return new MusicLibrary(libraryFilename, libraryJsonResponse.value);
  }
};
