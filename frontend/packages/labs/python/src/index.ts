// Public entry for @code-dot-org/python-lab.
//
// Python Lab is a lab built on the Codebridge shell (@code-dot-org/codebridge):
// its default export is the studio entrypoint. See docs — the shell provides the
// file browser, editor, and console; this package supplies Python config
// (language support) and, once ported, the pyodide runtime.

export {default} from './App';
export type {PythonLabProps} from './App';
export {pythonConfig} from './config';
// Host-supplied configuration for where the pyodide runtime + wheels are served
// from (defaults to studio's /blockly/js/pyodide/<version>/).
export {PYODIDE_VERSION, setPyodideBaseUrl} from './runtime/pyodideConfig';
