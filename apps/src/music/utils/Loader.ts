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

    // To do: load translations in parallel with library.
    // To do: load locale from browser.
    // To do: handle missing translation file.
    // To do: wrap this (getting translations, localizing library)
    //   in an experiment so we can ship it without any user-facing impact?
    //   Or can just wait to merge it until we have real translations.
    // Currently have fake translations for 'uk_ua' (Ukranian) and 'ar_sa' (Arabic)
    const translations = await loadTranslations(libraryFilename, 'uk_ua');

    const libraryJsonLocalized = localizeLibrary(
      libraryJsonResponse.value,
      translations
    );
    return new MusicLibrary(libraryFilename, libraryJsonLocalized);
  }
};

type Translations = {[key: string]: string};

// To do: specify values that libraryFilename can be?
const loadTranslations = async (
  libraryName: string,
  locale: string
): Promise<Translations> => {
  // To do: change musiclab-test/ to musiclab/ once we have real translations.
  const translations = await HttpClient.fetchJson<Translations>(
    `https://curriculum.code.org/media/musiclab-test/${libraryName}-loc/${locale}.json`
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
      (instrument.name = translations[instrument.id] || instrument.name)
  );

  libraryJsonLocalized.kits.forEach(kit => {
    const kitId = kit.id;
    kit.name = translations[kitId] || kit.name;
    kit.sounds.forEach(sound => {
      const soundId = `${kitId}/${sound.src}`;
      sound.name = translations[soundId] || sound.name;
    });
  });

  libraryJsonLocalized.packs.forEach(pack => {
    const packId = pack.id;
    if (!pack.skipLocalization) {
      pack.name = translations[packId] || pack.name;
    }
    pack.sounds.forEach(sound => {
      if (!sound.skipLocalization) {
        const soundId = `${packId}/${sound.src}`;
        sound.name = translations[soundId] || sound.name;
      }
    });
  });

  return libraryJsonLocalized;
};
