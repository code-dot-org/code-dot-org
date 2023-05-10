// Utilities for retrieving various types of data for Music Lab.

const AppConfig = require('../appConfig').default;

export const baseUrl = 'https://curriculum.code.org/media/musiclab/';

enum LevelSource {
  LEVELS = 'LEVELS',
  LEVEL = 'LEVEL',
  FILE = 'FILE',
}

// Exporting enum as object for use in JS files
export const LevelSources = {
  LEVELS: LevelSource.LEVELS,
  LEVEL: LevelSource.LEVEL,
  FILE: LevelSource.FILE,
};

// Loads a sound library JSON file.
export const loadLibrary = async () => {
  if (AppConfig.getValue('local-library') === 'true') {
    const localLibraryFilename = 'music-library';
    const localLibrary = require(`@cdo/static/music/${localLibraryFilename}.json`);
    return localLibrary;
  } else {
    const libraryParameter = AppConfig.getValue('library');
    const libraryFilename = libraryParameter
      ? `music-library-${libraryParameter}.json`
      : 'music-library.json';
    const response = await fetch(baseUrl + libraryFilename);
    const library = await response.json();
    return library;
  }
};

// Loads a progression file.  This file can be used for prototyping a progression
// before it's split into proper levels.
const loadProgressionFile = async () => {
  if (AppConfig.getValue('local-progression') === 'true') {
    const defaultProgressionFilename = 'music-progression';
    const progression = require(`@cdo/static/music/${defaultProgressionFilename}.json`);
    return progression;
  } else {
    const progressionParameter = AppConfig.getValue('progression');
    const progressionFilename = progressionParameter
      ? `music-progression-${progressionParameter}.json`
      : 'music-progression.json';
    const response = await fetch(baseUrl + progressionFilename);
    const progression = await response.json();
    return progression;
  }
};

// Loads level data from the dashboard, for a script level or a level.
const loadLevelData = async (levelDataPath: string) => {
  const response = await fetch(levelDataPath);

  if (!response.ok) {
    throw new Error('Response not ok');
  }

  const levelData = await response.json();
  return levelData;
};

// Loads a progression step.
export const loadProgressionStepFromSource = async (
  levelSource: LevelSource,
  levelDataPath: string,
  currentLevelIndex: number
) => {
  let progressionStep = undefined;
  let levelCount = undefined;

  if (levelSource === LevelSource.LEVEL) {
    // Since we have levels, we'll asynchronously retrieve the current level data.
    const response = await loadLevelData(levelDataPath);
    progressionStep = response.level_data;
  } else if (levelSource === LevelSource.LEVELS) {
    // Since we have a level, we'll asynchronously retrieve the current level data.
    const response = await loadLevelData(levelDataPath);
    progressionStep = response.level_data;
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
