import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

// A Python Lab scenario whose program blocks on input(), for exercising the
// input service worker on the sandbox path. Load it with the `input` channel:
//   /frontend-studio/projects/python/input/edit?pyodide-sandbox=<sandbox url>
const input: LabFixture = {
  sources: {
    source: {
      files: {
        '0': {
          id: '0',
          name: 'main.py',
          language: 'python',
          // One line, so it survives being typed into the editor; here it is the
          // fixture so no typing is needed.
          contents: 'print("Hi " + input("Name? "))',
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
        '## Python Lab — input\n\nPress **Run**, then type a name in the ' +
        'console and press Enter.',
    }),
  },
  theme: {},
};

export default input;
