import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

import {DEFAULT_PROJECT} from '../constants';

// A project that makes a request, for exercising the debug panel's network pane:
// the activity list, the request/response details, and the block toggle.
//
// The demo has no allow-listed hosts, so the CSP (`connect-src 'self'`) refuses
// this request and the row shows the failure path. A successful row needs a host
// the policy permits, which only a real deployment supplies.
const source = {
  ...DEFAULT_PROJECT.source,
  files: {
    ...DEFAULT_PROJECT.source.files,
    '2': {
      ...DEFAULT_PROJECT.source.files['2'],
      contents: `console.log('Hello from script.js');

fetch('https://api.example.com/data.json')
  .then(response => response.json())
  .then(data => console.log('got', data))
  .catch(error => console.log('fetch failed:', error.message));
`,
    },
  },
};

const network: LabFixture = {
  sources: {source},
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'Web Lab network',
      type: 'Weblab2',
      appName: 'weblab2',
      usesProjects: true,
      isProjectLevel: true,
      offerBrowserTts: false,
      showExemplarLink: false,
      exemplarSources: null,
      longInstructions:
        '## Network\n\n`script.js` fetches an API. Open the debug panel’s ' +
        'Network tab to see the request, and use the ban button to block it.',
    }),
  },
  theme: {},
};

export default network;
