// Utilities for retrieving various types of data for Music Lab.

import HttpClient, {ResponseValidator} from '@cdo/apps/util/HttpClient';
import MusicLibrary, {
  LibraryJson,
  LibraryValidator,
} from '../player/MusicLibrary';
import {Progression, ProgressionStep} from '../progress/ProgressManager';

const AppConfig = require('../appConfig').default;

export const baseUrl = 'https://curriculum.code.org/media/musiclab/';

enum LevelSource {
  LEVELS = 'LEVELS',
  LEVEL = 'LEVEL',
  FILE = 'FILE',
}

type LevelDataResponse = {
  level_data: ProgressionStep;
};

interface ProgressionStepData {
  progressionStep: ProgressionStep | undefined;
  levelCount: number | undefined;
}

// Exporting enum as object for use in JS files
export const LevelSources = {
  LEVELS: LevelSource.LEVELS,
  LEVEL: LevelSource.LEVEL,
  FILE: LevelSource.FILE,
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

// Loads a progression file.  This file can be used for prototyping a progression
// before it's split into proper levels.
const loadProgressionFile = async (): Promise<Progression> => {
  if (AppConfig.getValue('local-progression') === 'true') {
    const defaultProgressionFilename = 'music-progression';
    const progression = require(`@cdo/static/music/${defaultProgressionFilename}.json`);
    return progression as Progression;
  } else {
    const progressionParameter = AppConfig.getValue('progression');
    const progressionFilename = progressionParameter
      ? `music-progression-${progressionParameter}.json`
      : 'music-progression.json';
    const progressionResponse = await HttpClient.fetchJson<Progression>(
      baseUrl + progressionFilename
    );
    return progressionResponse.value;
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
  levelSource: LevelSource,
  levelDataPath: string,
  currentLevelIndex: number
): Promise<ProgressionStepData> => {
  let progressionStep = undefined;
  let levelCount = undefined;

  if (levelSource === LevelSource.LEVELS) {
    // Since we have levels, we'll asynchronously retrieve the current level data.
    const response = await HttpClient.fetchJson<LevelDataResponse>(
      levelDataPath,
      {},
      LevelDataValidator
    );
    progressionStep = response.value.level_data;
  } else if (levelSource === LevelSource.LEVEL) {
    // Since we have a level, we'll asynchronously retrieve the current level data.
    const response = await HttpClient.fetchJson<LevelDataResponse>(
      levelDataPath,
      {},
      LevelDataValidator
    );
    progressionStep = response.value.level_data;
    levelCount = 1;
  } else if (levelSource === LevelSource.FILE) {
    // Let's load from the progression file.  We'll grab the entire progression
    // but just extract the current step's data.
    const response = await loadProgressionFile();
    progressionStep = response.steps[currentLevelIndex];
    levelCount = response.steps.length;
  }

  return {progressionStep, levelCount};
};
