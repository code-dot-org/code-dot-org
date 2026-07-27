import type {MultiFileSource, ProjectSources} from '@code-dot-org/core/api';

/** The page the preview loads by default. */
export const DEFAULT_START_HTML_FILE = 'index.html';

/**
 * The default project for a new World Lab: a host page and the game script that
 * draws the world. Used as `CodebridgeLab`'s `defaultSources` when a level
 * supplies none.
 *
 * The scaffold's page is a plain placeholder; wiring the Phaser 4 runtime is the
 * next increment (see `preview/WorldPreview`). When it lands, this default will
 * grow into a minimal Phaser scene.
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
    <meta charset="utf-8" />
    <title>World</title>
  </head>
  <body>
    <div id="game"></div>
    <script src="main.js"></script>
  </body>
</html>
`,
        folderId: '0',
        active: true,
        open: true,
      },
      '1': {
        id: '1',
        name: 'main.js',
        language: 'javascript',
        contents: `// Your World Lab game code runs here.
//
// The Phaser 4 runtime is not wired into the preview yet — this file is the
// place the game world will be built once it is.
console.log('Hello from main.js');
`,
        folderId: '0',
      },
    },
    folders: {},
    openFiles: ['0'],
  },
};

/**
 * Which of the workspace's two panes are showing. Mirrors web-lab's `ViewMode`;
 * the segmented buttons in the workspace header switch between them.
 */
export const ViewMode = {
  SPLIT: 'split',
  CODE: 'code',
  PREVIEW: 'preview',
} as const;

export type ViewModeType = (typeof ViewMode)[keyof typeof ViewMode];
