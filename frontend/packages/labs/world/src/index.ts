// Public entry for @code-dot-org/world-lab.
//
// World Lab is a lab built on the Codebridge shell (@code-dot-org/codebridge):
// its default export is the studio entrypoint. The shell provides the file
// browser, editor, and info panel; this package supplies the world config, the
// default project, and the Phaser 4 world preview (driven via the sandbox).

export {default} from './App';
export {worldConfig} from './config';
export {DEFAULT_PROJECT, ENTRY_FILE} from './constants';
