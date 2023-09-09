// Utilities for retrieving various types of data for Music Lab.

import HttpClient from '@cdo/apps/util/HttpClient';
import MusicLibrary, {
  LibraryJson,
  LibraryValidator,
} from '../player/MusicLibrary';
import {baseAssetUrl} from '../constants';
import AppConfig from '../appConfig';

/**
 * Loads a sound library JSON file.
 *
 * @param libraryName specific library to load (optional). If a library is specified by
 * URL param, that will take precedence.
 * @returns the Music Library
 */
export const loadLibrary = async (
  libraryName?: string
): Promise<MusicLibrary> => {
  if (AppConfig.getValue('local-library') === 'true') {
    const localLibraryFilename = 'music-library';
    const localLibrary = await import(
      `@cdo/static/music/${localLibraryFilename}.json`
    );
    return new MusicLibrary(
      'local-' + localLibraryFilename,
      localLibrary as LibraryJson
    );
  } else {
    // URL param takes precendence over provided library name.
    const libraryParameter = AppConfig.getValue('library') || libraryName;
    const libraryFilename = libraryParameter
      ? `music-library-${libraryParameter}`
      : 'music-library';

    const libraryJsonResponse = await HttpClient.fetchJson<LibraryJson>(
      baseAssetUrl + libraryFilename + '.json',
      {},
      LibraryValidator
    );
    return new MusicLibrary(libraryFilename, libraryJsonResponse.value);
  }
};
