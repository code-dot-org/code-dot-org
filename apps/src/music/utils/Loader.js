// Utilities for retrieving various types of data for Music Lab.

import {getStore} from '@cdo/apps/redux';
import AppConfig from '../appConfig';
import {levelsForLessonId} from '@cdo/apps/code-studio/progressRedux';

export const baseUrl = 'https://curriculum.code.org/media/musiclab/';

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
const loadLevelData = async levelSource => {
  const state = getStore().getState();

  let levelDataPath;
  if (levelSource === 'levels') {
    const scriptName = state.progress.scriptName;
    const lessonPosition = state.progress.lessons?.find(
      lesson => lesson.id === state.progress.currentLessonId
    ).relative_position;
    const levelNumber =
      levelsForLessonId(
        state.progress,
        state.progress.currentLessonId
      ).findIndex(level => level.isCurrentLevel) + 1;
    levelDataPath = `/s/${scriptName}/lessons/${lessonPosition}/levels/${levelNumber}/level_data`;
  } else if (levelSource === 'level') {
    const levelId = state.progress.currentLevelId;
    levelDataPath = `/levels/${levelId}/level_data`;
  }

  const response = await fetch(levelDataPath);

  if (!response.ok) {
    throw new Error('Response not ok');
  }

  const levelData = await response.json();
  return levelData;
};

// Loads a progression step.
export const loadProgressionStepFromSource = async (
  levelSource,
  currentLevelIndex
) => {
  let progressionStep = undefined;
  let levelCount = undefined;

  if (levelSource === 'levels') {
    // Since we have levels, we'll asynchronously retrieve the current level data.
    const response = await loadLevelData(levelSource);
    progressionStep = response.level_data;
  } else if (levelSource === 'level') {
    // Since we have a level, we'll asynchronously retrieve the current level data.
    const response = await loadLevelData(levelSource);
    progressionStep = response.level_data;
    levelCount = 1;
  } else if (levelSource === 'file') {
    // Let's load from the progression file.  We'll grab the entire progression
    // but just extract the current step's data.
    const response = await loadProgressionFile();
    progressionStep = response.steps[currentLevelIndex];
    levelCount = response.steps.length;
  }

  return {progressionStep, levelCount};
};
