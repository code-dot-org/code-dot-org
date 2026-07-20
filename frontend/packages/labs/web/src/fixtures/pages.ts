import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

import {DEFAULT_START_HTML_FILE} from '../constants';

// A two-page project, for exercising preview navigation: following a link is
// recorded in the history, and the back/forward buttons walk it.
const pages: LabFixture = {
  sources: {
    source: {
      files: {
        '0': {
          id: '0',
          name: DEFAULT_START_HTML_FILE,
          language: 'html',
          contents: `<!doctype html>
<html>
  <body>
    <h1>Home</h1>
    <a href="about.html">About this page</a>
  </body>
</html>
`,
          folderId: '0',
          active: true,
          open: true,
        },
        '1': {
          id: '1',
          name: 'about.html',
          language: 'html',
          contents: `<!doctype html>
<html>
  <body>
    <h1>About</h1>
    <a href="index.html">Back home</a>
  </body>
</html>
`,
          folderId: '0',
        },
      },
      folders: {},
      openFiles: ['0'],
    },
  },
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'Web Lab pages',
      type: 'Weblab2',
      appName: 'weblab2',
      usesProjects: true,
      isProjectLevel: true,
      offerBrowserTts: false,
      showExemplarLink: false,
      exemplarSources: null,
      longInstructions:
        '## Pages\n\nFollow the link in the preview, then use the back and ' +
        'forward buttons above it.',
    }),
  },
  theme: {},
};

export default pages;
