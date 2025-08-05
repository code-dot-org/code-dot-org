import {MAZE_FILE_NAME} from '@codebridge/constants';

import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {ProjectFileType, ProjectSources} from '@cdo/apps/lab2/types';

export const DEFAULT_PROJECT: ProjectSources = {
  source: {
    files: {
      '0': {
        id: '0',
        name: MAIN_PYTHON_FILE,
        language: 'py',
        contents: 'print("Hello world!")',
        folderId: '0',
        active: true,
      },
    },
    folders: {},
    openFiles: ['0'],
  },
};

export const STANDALONE_CONSOLE_PROJECT: ProjectSources = {
  source: {
    files: {
      '0': {
        id: '0',
        name: MAIN_PYTHON_FILE,
        language: 'py',
        contents: 'print("Hello world!")',
        folderId: '0',
        active: true,
      },
    },
    folders: {},
    openFiles: ['0'],
  },
  labConfig: {
    standaloneSettings: {projectType: 'console'},
  },
};

export const STANDALONE_NEIGHBORHOOD_PROJECT: ProjectSources = {
  source: {
    files: {
      '0': {
        id: '0',
        name: MAIN_PYTHON_FILE,
        language: 'py',
        contents: 'from neighborhood import Painter',
        folderId: '0',
        active: true,
      },
      '1': {
        id: '1',
        name: MAZE_FILE_NAME,
        // 16 x 16 empty grid
        contents:
          '[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]',
        type: ProjectFileType.SYSTEM_SUPPORT,
        language: 'txt',
        folderId: '0',
      },
    },
    folders: {},
    openFiles: ['0'],
  },
  labConfig: {
    miniApp: {name: 'neighborhood'},
    standaloneSettings: {projectType: 'neighborhood'},
  },
};

export const PYTHONLAB_VALID_FILE_TYPES = ['py', 'csv', 'txt'];
