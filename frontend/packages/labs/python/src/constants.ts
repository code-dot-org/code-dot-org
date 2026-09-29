import type {ProjectSources, MultiFileSource} from '@code-dot-org/core/api';

export const MAIN_PYTHON_FILE = 'main.py';

/**
 * The default project for a new Python Lab: a single `main.py`. Used as
 * `CodebridgeLab`'s `defaultSources` when a level supplies none. Ported from
 * apps/src/pythonlab/constants.ts (with the frontend schema's `language` field).
 */
export const DEFAULT_PROJECT: ProjectSources<MultiFileSource> = {
  source: {
    files: {
      '0': {
        id: '0',
        name: MAIN_PYTHON_FILE,
        language: 'python',
        contents: 'print("Hello world!")',
        folderId: '0',
        active: true,
      },
    },
    folders: {},
    openFiles: ['0'],
  },
};
