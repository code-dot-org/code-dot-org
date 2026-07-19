import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

// A Python Lab scenario that plots with matplotlib, to demonstrate inline
// figures in the console. Press Run; `plt.show()` renders the chart in the
// console (the pythonlab_setup wheel patches show() to emit a base64 PNG, which
// xterm's ImageAddon draws). Load it with the `matplotlib` channel:
//   /frontend-studio/projects/python/matplotlib/edit
const PROGRAM = `import matplotlib.pyplot as plt

x = [0, 1, 2, 3, 4, 5]
y = [n * n for n in x]

plt.plot(x, y, marker="o")
plt.title("Squares")
plt.xlabel("n")
plt.ylabel("n squared")
plt.show()

print("Plotted", len(x), "points")
`;

const matplotlib: LabFixture = {
  sources: {
    source: {
      files: {
        '0': {
          id: '0',
          name: 'main.py',
          language: 'python',
          contents: PROGRAM,
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
        '## Python Lab — matplotlib\n\nPress **Run**. The `plt.show()` call ' +
        'renders the chart inline in the console below.',
    }),
  },
  theme: {},
};

export default matplotlib;
