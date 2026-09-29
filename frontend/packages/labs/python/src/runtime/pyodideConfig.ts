import {version} from 'pyodide';

// Where the pyodide runtime, its package wheels, and our custom wheels are
// served from. Defaults to studio's layout (legacy apps/src/pythonlab serves
// them at /blockly/js/pyodide/<version>/). The standalone demo overrides it with
// setPyodideBaseUrl (its assets live under /pyodide/<version>/; see main.tsx and
// scripts/setup-pyodide-assets). A host that serves them elsewhere sets its own.
let pyodideBaseUrl = `/blockly/js/pyodide/${version}/`;

/** The pyodide version this package builds against; names the hosted directory. */
export const PYODIDE_VERSION = version;

/** The directory (trailing slash) pyodide core + wheels are fetched from. */
export const getPyodideBaseUrl = () => pyodideBaseUrl;

/** Point the runtime at a different hosted pyodide directory (host-supplied). */
export const setPyodideBaseUrl = (url: string) => {
  pyodideBaseUrl = url.endsWith('/') ? url : `${url}/`;
};
