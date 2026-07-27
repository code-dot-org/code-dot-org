// Public entry for @code-dot-org/world-lab.
//
// World Lab is a lab built on the Codebridge shell (@code-dot-org/codebridge):
// its default export is the studio entrypoint. The shell provides the file
// browser, editor, and info panel; this package supplies the world config, the
// default project, and — once ported — the Phaser 4 world preview.

export {default} from './App';
export {worldConfig} from './config';
export {DEFAULT_PROJECT, DEFAULT_START_HTML_FILE} from './constants';
