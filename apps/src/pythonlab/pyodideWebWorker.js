import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {loadPyodide, version} from 'pyodide';

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

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
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
  self.pyodide.setStdout(getStreamHandlerOptions('sysout'));
  self.pyodide.setStderr(getStreamHandlerOptions('syserr'));
  // Warm up the pyodide environment by running setup code.
  await runInternalCode(SETUP_CODE, 'setup_run');
}

let pyodideReadyPromise = null;
let pyodideGlobals = null;
async function initializePyodide() {
  const promiseWasNull = pyodideReadyPromise === null;
  if (promiseWasNull) {
    pyodideReadyPromise = loadPyodideAndPackages();
    self.postMessage({type: 'loading_pyodide'});
  }
  await pyodideReadyPromise;
  if (promiseWasNull) {
    self.postMessage({type: 'loaded_pyodide'});
  }
  pyodideGlobals = self.pyodide.globals.toJs();
}

// Get pyodide ready as soon as possible.
initializePyodide();

self.onmessage = async event => {
  // make sure loading is done
  await initializePyodide();
  const {id, python, source} = event.data;
  let results = '';
  try {
    writeSource(source, DEFAULT_FOLDER_ID, '', self.pyodide);
    await importPackagesFromFiles(source, self.pyodide);
    results = await self.pyodide.runPythonAsync(python, {
      filename: `/${HOME_FOLDER}/${MAIN_PYTHON_FILE}`,
    });
  } catch (error) {
    self.postMessage({type: 'error', message: error.message, id});
  }
  // Clean up environment.
  await runInternalCode(getCleanupCode(source), id);
  // We run setup code at the end to prepare the environment for the next run.
  await runInternalCode(SETUP_CODE, id);

  const updatedSource = getUpdatedSourceAndDeleteFiles(
    source,
    id,
    self.pyodide,
    self.postMessage
  );
  self.postMessage({type: 'updated_source', message: updatedSource, id});
  resetGlobals(self.pyodide, pyodideGlobals);

  // If there is a results response, convert it to a JS object.
  // Documentation on this method:
  // https://pyodide.org/en/stable/usage/api/js-api.html#pyodide.ffi.PyProxy.toJs
  const resultsObject = results?.toJs();
  self.postMessage({type: 'run_complete', message: resultsObject, id});
};

// Run code owned by us (not the user). If there is an error, post a
// system_error message.
async function runInternalCode(code, id) {
  try {
    await self.pyodide.runPythonAsync(code);
  } catch (error) {
    self.postMessage({type: 'system_error', message: error.message, id});
  }
}

// Return the options for sysout or syserr stream handler.
function getStreamHandlerOptions(type) {
  return {
    batched: msg => {
      self.postMessage({type: type, message: msg, id: 'none'});
    },
  };
}
