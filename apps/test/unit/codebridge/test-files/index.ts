import {ProjectFile, ProjectType} from '@codebridge/types';

const testProject: ProjectType = require('./project.json');
const starterFile: ProjectFile = require('./starterFile.json');
const supportFile: ProjectFile = require('./supportFile.json');
const validationFile: ProjectFile = require('./validationFile.json');

export {testProject, starterFile, supportFile, validationFile};
