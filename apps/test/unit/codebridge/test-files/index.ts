import {CodebridgeLevelProperties, ProjectFile} from '@codebridge/types';

import {MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';
import {InitProgressPayload, LevelResults} from '@cdo/apps/types/progressTypes';

const initProgressPayload: InitProgressPayload = require('./initProgressPayload.json');
const levelResults: LevelResults = require('./levelResults.json');
const neighborhoodLevelProperties: CodebridgeLevelProperties = require('./neighborhoodLevelProperties.json');
const nonValidatedLevelProperties: CodebridgeLevelProperties = require('./nonValidatedLevelProperties.json');
const noStartSourcesLevelProperties: CodebridgeLevelProperties = require('./noStartSourcesLevelProperties.json');
const predictLevelProperties: CodebridgeLevelProperties = require('./predictLevelProperties.json');
const testProject: MultiFileSource = require('./project.json');
const smallProject: MultiFileSource = require('./smallProject.json');
const smallProjectSources: ProjectSources = require('./smallProjectSources.json');
const smallProjectWithOutdatedFormat: MultiFileSource = require('./smallProjectWithOutdatedFormat.json');
const starterFile: ProjectFile = require('./starterFile.json');
const submittableLevelProperties: CodebridgeLevelProperties = require('./submittableLevelProperties.json');
const supportFile: ProjectFile = require('./supportFile.json');
const templateBackedLevelProperties: CodebridgeLevelProperties = require('./templateBackedLevelProperties.json');
const validatedLevelProperties: CodebridgeLevelProperties = require('./validatedLevelProperties.json');
const validationFile: ProjectFile = require('./validationFile.json');
const withExemplarLevelProperties: CodebridgeLevelProperties = require('./withExemplarLevelProperties.json');

export {
  initProgressPayload,
  levelResults,
  neighborhoodLevelProperties,
  nonValidatedLevelProperties,
  noStartSourcesLevelProperties,
  predictLevelProperties,
  testProject,
  smallProject,
  smallProjectSources,
  smallProjectWithOutdatedFormat,
  starterFile,
  submittableLevelProperties,
  supportFile,
  templateBackedLevelProperties,
  validatedLevelProperties,
  validationFile,
  withExemplarLevelProperties,
};
