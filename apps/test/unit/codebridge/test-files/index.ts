import {ProjectFile} from '@codebridge/types';

import {LevelProperties, MultiFileSource} from '@cdo/apps/lab2/types';
import {InitProgressPayload, LevelResults} from '@cdo/apps/types/progressTypes';

const initProgressPayload: InitProgressPayload = require('./initProgressPayload.json');
const levelResults: LevelResults = require('./levelResults.json');
const nonValidatedLevelProperties: LevelProperties = require('./nonValidatedLevelProperties.json');
const predictLevelProperties: LevelProperties = require('./predictLevelProperties.json');
const testProject: MultiFileSource = require('./project.json');
const smallProject: MultiFileSource = require('./smallProject.json');
const starterFile: ProjectFile = require('./starterFile.json');
const submittableLevelProperties: LevelProperties = require('./submittableLevelProperties.json');
const supportFile: ProjectFile = require('./supportFile.json');
const validatedLevelProperties: LevelProperties = require('./validatedLevelProperties.json');
const validationFile: ProjectFile = require('./validationFile.json');

export {
  initProgressPayload,
  levelResults,
  nonValidatedLevelProperties,
  predictLevelProperties,
  testProject,
  smallProject,
  starterFile,
  submittableLevelProperties,
  supportFile,
  validatedLevelProperties,
  validationFile,
};
