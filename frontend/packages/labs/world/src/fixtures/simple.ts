import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

import {DEFAULT_PROJECT} from '../constants';

// The project this scenario loads. The version panel's "Initial version"
// restores the sources as first loaded, so this doubles as that baseline.
const SOURCE = DEFAULT_PROJECT.source;

// Minimal World Lab scenario for the standalone demo harness. The host (LabHost)
// fetches these level properties, app options, and theme from the mock API.
const simple: LabFixture = {
  sources: {source: SOURCE},
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'World Lab',
      type: 'World',
      appName: 'world',
      usesProjects: true,
      isProjectLevel: true,
      offerBrowserTts: false,
      showExemplarLink: false,
      exemplarSources: null,
      longInstructions:
        '## World Lab\n\nEdit `index.html` and `main.js`.\n\n' +
        '- The world preview is a placeholder for now\n' +
        '- Multi-file projects are supported',
    }),
  },
  theme: {},
};

export default simple;
