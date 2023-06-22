// Utilities for retrieving various types of data for Music Lab.

import HttpClient, {ResponseValidator} from '@cdo/apps/util/HttpClient';
import MusicLibrary, {
  LibraryJson,
  LibraryValidator,
} from '../player/MusicLibrary';
import {ProgressionStep} from '../progress/ProgressManager';

const AppConfig = require('../appConfig').default;

export const baseUrl = 'https://curriculum.code.org/media/musiclab/';

type LevelDataResponse = {
  level_data: ProgressionStep;
};

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

const LevelDataValidator: ResponseValidator<LevelDataResponse> = response => {
  const levelDataResponse = response as LevelDataResponse;
  if (response.level_data === undefined) {
    throw new Error('Missing required parameter: level_data');
  }

  return levelDataResponse;
};

// Loads a progression step.
export const loadProgressionStepFromSource = async (
  levelDataPath: string
): Promise<ProgressionStep> => {
  // Asynchronously retrieve the current level data.
  const response = await HttpClient.fetchJson<LevelDataResponse>(
    levelDataPath,
    {},
    LevelDataValidator
  );

  return response.value.level_data;
};
