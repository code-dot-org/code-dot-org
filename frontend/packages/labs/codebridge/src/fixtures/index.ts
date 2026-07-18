import type {MultiFileSource} from '@code-dot-org/core/api';

/**
 * A minimal single-file Python project, used to exercise the Codebridge write
 * path in tests and the dev harness before real level sources are wired up.
 */
export const samplePythonSource: MultiFileSource = {
  folders: {},
  files: {
    '1': {
      id: '1',
      name: 'main.py',
      language: 'python',
      contents: 'print("hello from codebridge")\n',
      folderId: '0',
      active: true,
    },
  },
  openFiles: ['1'],
};
