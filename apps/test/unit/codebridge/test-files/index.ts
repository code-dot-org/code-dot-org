import {ProjectFile, ProjectType} from '@codebridge/types';

import {LevelProperties} from '@cdo/apps/lab2/types';
import {InitProgressPayload, LevelResults} from '@cdo/apps/types/progressTypes';

const initProgressPayload: InitProgressPayload = require('./initProgressPayload.json');
const levelProperties: LevelProperties = require('./levelProperties.json');
const levelResults: LevelResults = require('./levelResults.json');
const testProject: ProjectType = require('./project.json');
const smallProject: ProjectType = require('./smallProject.json');
const starterFile: ProjectFile = require('./starterFile.json');
const supportFile: ProjectFile = require('./supportFile.json');
const validationFile: ProjectFile = require('./validationFile.json');

export {
  initProgressPayload,
  levelProperties,
  levelResults,
  testProject,
  smallProject,
  starterFile,
  supportFile,
  validationFile,
};
