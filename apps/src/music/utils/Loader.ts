// Utilities for retrieving various types of data for Music Lab.

import HttpClient from '@cdo/apps/util/HttpClient';
import MusicLibrary, {
  LibraryJson,
  LibraryValidator,
} from '../player/MusicLibrary';
import {baseAssetUrl, DEFAULT_LIBRARY} from '../constants';
const AppConfig = require('../appConfig').default;

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
  if (AppConfig.getValue('local-library') === 'true') {
    const localLibraryFilename = 'music-library';
    const localLibrary = require(`@cdo/static/music/${localLibraryFilename}.json`);
    return new MusicLibrary(
      'local-' + localLibraryFilename,
      localLibrary as LibraryJson
    );
  } else {
    // URL param takes precendence over provided library name.
    const libraryParameter = AppConfig.getValue('library') || libraryName;
    const libraryFilename =
      libraryParameter !== DEFAULT_LIBRARY
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
