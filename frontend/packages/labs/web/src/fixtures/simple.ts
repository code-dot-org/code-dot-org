import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

import {DEFAULT_PROJECT} from '../constants';

// The project this scenario loads. The version panel's "Initial version"
// restores the sources as first loaded, so this doubles as that baseline.
const SOURCE = DEFAULT_PROJECT.source;

// Minimal Web Lab scenario for the standalone demo harness. The host (LabHost)
// fetches these level properties, app options, and theme from the mock API.
const simple: LabFixture = {
  sources: {source: SOURCE},
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'Web Lab',
      type: 'Weblab2',
      appName: 'weblab2',
      usesProjects: true,
      isProjectLevel: true,
      offerBrowserTts: false,
      showExemplarLink: false,
      exemplarSources: null,
      longInstructions:
        '## Web Lab\n\nEdit `index.html`, `styles.css`, and `script.js`.\n\n' +
        '- The preview updates as you type\n' +
        '- Multi-file projects are supported\n' +
        '- Console and network output appear in the debug panel',
    }),
  },
  theme: {},
};

export default simple;
