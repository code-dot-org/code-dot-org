import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

// Minimal Python Lab scenario for the standalone demo harness. The host
// (LabHost) fetches these level properties, app options, and theme from the
// mock API; the project sources fall back to the lab's DEFAULT_PROJECT.
const simple: LabFixture = {
  // The project the host loads for this scenario — a single main.py.
  sources: {
    source: {
      files: {
        '0': {
          id: '0',
          name: 'main.py',
          language: 'python',
          contents: 'print("Hello world!")',
          folderId: '0',
          active: true,
        },
      },
      folders: {},
      openFiles: ['0'],
    },
  },
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'Python Lab',
      type: 'Pythonlab',
      appName: 'pythonlab',
      usesProjects: true,
      isProjectLevel: true,
      offerBrowserTts: false,
      showExemplarLink: false,
      exemplarSources: null,
      longInstructions:
        '## Python Lab\n\nEdit `main.py`, then press **Run**.\n\n' +
        '- Create files and folders in the browser\n' +
        '- Multi-file projects are supported\n' +
        '- Output streams to the console below',
    }),
  },
  theme: {},
};

export default simple;
