import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {loadPyodide, PyodideInterface, version} from 'pyodide';

import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';

import {HOME_FOLDER} from './pythonHelpers/constants';
import {SETUP_CODE} from './pythonHelpers/patches';
import {
  getCleanupCode,
  getUpdatedSourceAndDeleteFiles,
  importPackagesFromFiles,
  resetGlobals,
  writeSource,
} from './pythonHelpers/pythonScriptUtils';
import {MessageType} from './types';

let pyodide: PyodideInterface;
async function loadPyodideAndPackages() {
  pyodide = await loadPyodide({
    // /assets does not serve unhashed files, so we load from /blockly instead,
    // which does serve the unhashed files. We need to serve the unhashed files because
    // pyodide controls adding the filenames to the url we provide here.
    indexURL: `/blockly/js/pyodide/${version}/`,
    // pre-load numpy as it will frequently be used, our custom setup package, and matplotlib
    // which our custom setup package patches.
    packages: [
      'numpy',
      'matplotlib',
      // These are custom packages that we have built. They are defined in this repo:
      // https://github.com/code-dot-org/pythonlab-packages
      `/blockly/js/pyodide/${version}/unittest_runner-0.1.0-py3-none-any.whl`,
      `/blockly/js/pyodide/${version}/pythonlab_setup-0.1.0-py3-none-any.whl`,
    ],
    env: {
      HOME: `/${HOME_FOLDER}/`,
    },
  });
  pyodide.setStdout(getStreamHandlerOptions('sysout'));
  pyodide.setStderr(getStreamHandlerOptions('syserr'));
  // Warm up the pyodide environment by running setup code.
  await runInternalCode(SETUP_CODE, -1);
}

let pyodideReadyPromise: Promise<void> | null = null;
// Pyodide defines the globals object as any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideGlobals: any | null = null;
async function initializePyodide() {
  const promiseWasNull = pyodideReadyPromise === null;
  if (promiseWasNull) {
    pyodideReadyPromise = loadPyodideAndPackages();
    postMessage({type: 'loading_pyodide'});
  }
  await pyodideReadyPromise;
  if (promiseWasNull) {
    postMessage({type: 'loaded_pyodide'});
  }
  pyodideGlobals = pyodide.globals.toJs();
}

// Get pyodide ready as soon as possible.
initializePyodide();

onmessage = async event => {
  // make sure loading is done
  await initializePyodide();
  const {id, python, source} = event.data;
  let results = undefined;
  try {
    writeSource(source, DEFAULT_FOLDER_ID, '', pyodide);
    await importPackagesFromFiles(source, pyodide);
    results = await pyodide.runPythonAsync(python, {
      filename: `/${HOME_FOLDER}/${MAIN_PYTHON_FILE}`,
    });
  } catch (error) {
    postMessage({type: 'error', message: (error as Error).message, id});
  }
  // Clean up environment.
  await runInternalCode(getCleanupCode(source), id);
  // We run setup code at the end to prepare the environment for the next run.
  await runInternalCode(SETUP_CODE, id);

  const updatedSource = getUpdatedSourceAndDeleteFiles(
    source,
    id,
    pyodide,
    postMessage
  );
  postMessage({type: 'updated_source', message: updatedSource, id});
  resetGlobals(pyodide, pyodideGlobals);

  // If there is a results response, convert it to a JS object.
  // Documentation on this method:
  // https://pyodide.org/en/stable/usage/api/js-api.html#pyodide.ffi.PyProxy.toJs
  const resultsObject = results?.toJs();
  try {
    postMessage({type: 'run_complete', message: resultsObject, id});
  } catch (e) {
    // Likely we hit a DataCloneError trying to send the resultsObject.
    // In this case, don't try to send the results object, as if it can't be
    // sent, it wasn't going to be parsed by us anyway.
    postMessage({type: 'run_complete', id});
  }
};

// Run code owned by us (not the user). If there is an error, post a
// system_error message.
async function runInternalCode(code: string, id: number) {
  try {
    await pyodide.runPythonAsync(code);
  } catch (error) {
    postMessage({type: 'system_error', message: (error as Error).message, id});
  }
}

// Return the options for sysout or syserr stream handler.
function getStreamHandlerOptions(type: MessageType) {
  return {
    batched: (msg: string) => {
      postMessage({type: type, message: msg, id: 'none'});
    },
  };
}
