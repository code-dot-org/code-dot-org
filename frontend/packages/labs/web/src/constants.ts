import type {MultiFileSource, ProjectSources} from '@code-dot-org/core/api';

/** The page the preview loads by default (legacy DEFAULT_START_HTML_FILE). */
export const DEFAULT_START_HTML_FILE = 'index.html';

/**
 * The default project for a new Web Lab: a page, a stylesheet, and a script.
 * Used as `CodebridgeLab`'s `defaultSources` when a level supplies none.
 */
export const DEFAULT_PROJECT: ProjectSources<MultiFileSource> = {
  source: {
    files: {
      '0': {
        id: '0',
        name: DEFAULT_START_HTML_FILE,
        language: 'html',
        contents: `<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Hello world!</h1>
    <script src="script.js"></script>
  </body>
</html>
`,
        folderId: '0',
        active: true,
        open: true,
      },
      '1': {
        id: '1',
        name: 'styles.css',
        language: 'css',
        contents: `body {
  font-family: sans-serif;
}
`,
        folderId: '0',
      },
      '2': {
        id: '2',
        name: 'script.js',
        language: 'javascript',
        contents: `console.log('Hello from script.js');
`,
        folderId: '0',
      },
    },
    folders: {},
    openFiles: ['0'],
  },
};
