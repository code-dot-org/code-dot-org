import {ProjectFile} from '@codebridge/types';

import {
  LevelProperties,
  MultiFileSource,
  ProjectSources,
} from '@cdo/apps/lab2/types';
import {InitProgressPayload, LevelResults} from '@cdo/apps/types/progressTypes';

const initProgressPayload: InitProgressPayload = require('./initProgressPayload.json');
const levelResults: LevelResults = require('./levelResults.json');
const neighborhoodLevelProperties: LevelProperties = require('./neighborhoodLevelProperties.json');
const nonValidatedLevelProperties: LevelProperties = require('./nonValidatedLevelProperties.json');
const predictLevelProperties: LevelProperties = require('./predictLevelProperties.json');
const testProject: MultiFileSource = require('./project.json');
const smallProject: MultiFileSource = require('./smallProject.json');
const smallProjectSources: ProjectSources = require('./smallProjectSources.json');
const starterFile: ProjectFile = require('./starterFile.json');
const submittableLevelProperties: LevelProperties = require('./submittableLevelProperties.json');
const supportFile: ProjectFile = require('./supportFile.json');
const templateBackedLevelProperties: LevelProperties = require('./templateBackedLevelProperties.json');
const validatedLevelProperties: LevelProperties = require('./validatedLevelProperties.json');
const validationFile: ProjectFile = require('./validationFile.json');
const withExemplarLevelProperties: LevelProperties = require('./withExemplarLevelProperties.json');

export {
  initProgressPayload,
  levelResults,
  neighborhoodLevelProperties,
  nonValidatedLevelProperties,
  predictLevelProperties,
  testProject,
  smallProject,
  smallProjectSources,
  starterFile,
  submittableLevelProperties,
  supportFile,
  templateBackedLevelProperties,
  validatedLevelProperties,
  validationFile,
  withExemplarLevelProperties,
};
