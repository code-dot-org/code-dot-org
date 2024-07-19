// Utilities for retrieving various types of data for Music Lab.

import HttpClient from '@cdo/apps/util/HttpClient';

import {getBaseAssetUrl} from '../appConfig';
import MusicLibrary, {
  LibraryJson,
  LibraryValidator,
} from '../player/MusicLibrary';

const AppConfig = require('../appConfig').default;

// This value can be modifed each time we know that there is an important new version
// of the library on S3, to help bypass any caching of an older version.
const requestVersion = 'launch2024-0';

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
      getBaseAssetUrl() +
        libraryFilename +
        '.json' +
        (requestVersion ? `?version=${requestVersion}` : ''),
      {},
      LibraryValidator
    );
    const translations = await loadTranslations('fr_fr');
    const libraryJsonLocalized = localizeLibrary(
      libraryJsonResponse.value,
      translations
    );
    return new MusicLibrary(libraryFilename, libraryJsonLocalized);
  }
};

type Translations = {[key: string]: string};

// set up to take libraryName as arg as well
const loadTranslations = async (locale: string): Promise<Translations> => {
  const translations = await HttpClient.fetchJson<Translations>(
    `https://curriculum.code.org/media/musiclab-test/loc-intro2024/${locale}.json`
  );
  return translations.value;
};

const localizeLibrary = (
  library: LibraryJson,
  translations: Translations
): LibraryJson => {
  const libraryJsonLocalized = JSON.parse(
    JSON.stringify(library)
  ) as LibraryJson;
  libraryJsonLocalized.instruments.forEach(
    instrument =>
      (instrument.name = translations[instrument.name] || instrument.name)
  );
  libraryJsonLocalized.kits.forEach(kit => {
    kit.name = translations[kit.name] || kit.name;
    kit.sounds.forEach(
      sound => (sound.name = translations[sound.name] || sound.name)
    );
  });
  libraryJsonLocalized.packs.forEach(pack => {
    pack.name = translations[pack.name] || pack.name;
    pack.sounds.forEach(
      sound => (sound.name = translations[sound.name] || sound.name)
    );
  });

  return libraryJsonLocalized;
};
