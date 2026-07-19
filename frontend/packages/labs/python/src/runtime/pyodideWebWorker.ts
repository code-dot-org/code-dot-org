/// <reference lib="webworker" />
import {loadPyodide, type PyodideInterface, version} from 'pyodide';

import {MessageTag} from './input/constants';
import {patchInputCode, pythonlabInputModule} from './input/pythonInput';
import type {PyodideMessage, WorkerRequest} from './messages';

// A pyodide web worker: load pyodide and our Python packages from a hosted
// directory, write the project files to its virtual filesystem, run the program,
// and stream stdout/stderr back. Ported and reduced from
// apps/src/pythonlab/pyodideWebWorker.ts — validation, the neighborhood
// mini-app, and source write-back are still deferred.
//
// The hosted directory (pyodide core + package wheels + our custom wheels) is
// supplied by the main thread via the `init` message; loading starts then. See
// pyodideConfig / scripts/setup-pyodide-assets.
//
// Blocking `input()` is patched below, but only works where the input service
// worker controls the worker's origin — the sandbox iframe (see
// input/inputServiceWorkerClient.ts). On the direct path there is no such worker,
// so `input()` raises INPUT_FAILED.

const ctx = self as DedicatedWorkerGlobalScope;

const post = (message: PyodideMessage) => ctx.postMessage(message);

// The standard packages we make available (matplotlib for plotting, numpy for
// numerics) plus every dependency, listed explicitly so a retry can reload just
// the ones that failed — mirrors legacy loadPackages().
const STANDARD_PACKAGES = [
  'matplotlib',
  'numpy',
  'contourpy',
  'cycler',
  'fonttools',
  'kiwisolver',
  'packaging',
  'pillow',
  'pyparsing',
  'python-dateutil',
  'pytz',
  'six',
];

// Our custom wheels (built from python/pythonlab/), loaded by URL from the
// hosted directory. pythonlab_setup provides the matplotlib `show()` patch; it
// imports `neighborhood` (via its teardown module), so that wheel is required
// too even though the neighborhood mini-app itself is still deferred.
const CUSTOM_WHEELS = [
  'neighborhood-0.4.0-py3-none-any.whl',
  'pythonlab_setup-0.2.0-py3-none-any.whl',
];

// Patch matplotlib.pyplot.show() to emit figures as tagged base64 PNGs, which
// the main thread turns into inline console images (see routeWorkerMessage).
const SETUP_CODE = `from pythonlab_setup import setup_pythonlab
setup_pythonlab('${MessageTag.MATPLOTLIB_IMG}')
`;

let pyodide: PyodideInterface;
let readyPromise: Promise<void> | null = null;
// Default hosted directory; overridden by the `init` message. `version` names
// the directory so the wheels match this pyodide's ABI.
let pyodideBaseUrl = `/blockly/js/pyodide/${version}/`;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide({
    indexURL: pyodideBaseUrl,
    // Strip JS globals so Python can't reach browser APIs unless we opt in.
    jsglobals: {},
  });
  pyodide.setStdout({
    batched: (line: string) =>
      post({type: 'sysout', message: line, id: 'none'}),
  });
  pyodide.setStderr({
    batched: (line: string) =>
      post({type: 'syserr', message: line, id: 'none'}),
  });
  // Registered (not exposed via jsglobals) so patched `input()` can reach the
  // service worker while Python stays walled off from other browser APIs.
  pyodide.registerJsModule('pythonlab_input', pythonlabInputModule);

  // Load the standard packages plus our setup wheel (loaded by URL). matplotlib
  // must be present before pythonlab_setup imports it, which loadPackage ensures.
  // Route pyodide's "Loading/Loaded" progress to the dev console, not the user's
  // console (legacy's directLogsToDevConsole).
  await pyodide.loadPackage(
    [
      ...STANDARD_PACKAGES,
      ...CUSTOM_WHEELS.map(wheel => `${pyodideBaseUrl}${wheel}`),
    ],
    {
      messageCallback: (msg: string) => console.log(msg),
      errorCallback: (msg: string) => console.error(msg),
    },
  );
  // Apply the matplotlib show() patch for this environment.
  await pyodide.runPythonAsync(SETUP_CODE);
}

function initializePyodide() {
  if (!readyPromise) {
    post({type: 'loading_pyodide', id: 'startup'});
    readyPromise = (async () => {
      try {
        await loadPyodideAndPackages();
      } catch (error) {
        // Surface load/setup failures instead of silently leaving the
        // environment "loading" forever (Run would stay disabled).
        post({
          type: 'error',
          message: `Failed to load the Python environment: ${
            (error as Error).message
          }`,
          id: 'startup',
        });
        throw error;
      }
      post({type: 'loaded_pyodide', id: 'startup'});
    })();
  }
  return readyPromise;
}

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const data = event.data;

  // The main thread sends `init` (with the hosted directory) before any run;
  // start loading now that the base URL is known.
  if (data.type === 'init') {
    pyodideBaseUrl = data.pyodideBaseUrl;
    void initializePyodide();
    return;
  }

  // A run request. Ensure loading is done first (defensive if no init arrived).
  await initializePyodide();
  const {id, python, files} = data;

  try {
    // Write every project file to the working directory so imports and file
    // reads resolve. (Folder paths are flattened to file names for now.)
    for (const file of files) {
      // A string is written as UTF-8.
      pyodide.FS.writeFile(file.name, file.contents);
    }
    // Point `input()` at this run's id before running the user's code.
    await pyodide.runPythonAsync(patchInputCode(id));
    await pyodide.runPythonAsync(python);
  } catch (error) {
    post({type: 'error', message: (error as Error).message, id});
  }

  post({type: 'run_complete', id});
};
