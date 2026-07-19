/// <reference lib="webworker" />
import {loadPyodide, type PyodideInterface, version} from 'pyodide';

import type {PyodideMessage, RunRequest} from './messages';

// A trimmed pyodide web worker: load pyodide, write the project files to its
// virtual filesystem, run the program, and stream stdout/stderr back. Ported
// and reduced from apps/src/pythonlab/pyodideWebWorker.ts — package pre-loading
// (numpy/matplotlib + custom wheels), stdin input, validation, the neighborhood
// mini-app, and source write-back are all deferred.

const ctx = self as DedicatedWorkerGlobalScope;

const post = (message: PyodideMessage) => ctx.postMessage(message);

let pyodide: PyodideInterface;
let readyPromise: Promise<void> | null = null;

async function initializePyodide() {
  if (!readyPromise) {
    post({type: 'loading_pyodide', id: 'startup'});
    readyPromise = (async () => {
      // Load pyodide's wasm + stdlib from the jsDelivr CDN (the demo has no
      // local pyodide assets; the studio host can point `indexURL` at its own
      // hosted copy later).
      pyodide = await loadPyodide({
        indexURL: `https://cdn.jsdelivr.net/pyodide/v${version}/full/`,
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
    })();
    await readyPromise;
    post({type: 'loaded_pyodide', id: 'startup'});
  }
  await readyPromise;
}

// Start loading as soon as the worker spins up.
initializePyodide();

ctx.onmessage = async (event: MessageEvent<RunRequest>) => {
  await initializePyodide();
  const {id, python, files} = event.data;

  try {
    // Write every project file to the working directory so imports and file
    // reads resolve. (Folder paths are flattened to file names for now.)
    for (const file of files) {
      // A string is written as UTF-8.
      pyodide.FS.writeFile(file.name, file.contents);
    }
    await pyodide.runPythonAsync(python);
  } catch (error) {
    post({type: 'error', message: (error as Error).message, id});
  }

  post({type: 'run_complete', id});
};
