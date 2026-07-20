// Public entry for @code-dot-org/web-lab.
//
// Web Lab is a lab built on the Codebridge shell (@code-dot-org/codebridge):
// its default export is the studio entrypoint. The shell provides the file
// browser, editor, and info panel; this package supplies the web config
// (HTML/CSS/JS language support), the default project, and — once ported — the
// HTML preview and debug panel.

export {default} from './App';
export type {WebLabProps} from './App';
export {webConfig} from './config';
export {DEFAULT_PROJECT, DEFAULT_START_HTML_FILE} from './constants';
