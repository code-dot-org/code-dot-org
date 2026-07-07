import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {loadPyodide, PyodideInterface, version} from 'pyodide';

import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';

import {HOME_FOLDER} from './pythonHelpers/constants';
import {
  patchInputCode,
  patchRequestsCode,
  pythonlabInputModule,
  SETUP_CODE,
} from './pythonHelpers/patches';
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
    env: {
      HOME: `/${HOME_FOLDER}/`,
    },
    // jsglobals intentionally left at its default (globalThis, this worker's own global
    // scope), giving Python direct access to browser APIs like fetch. This used to be
    // hidden entirely, but requests.get() (CT-537) needs it: urllib3's own Emscripten
    // transport calls fetch/AbortController/etc. directly to make any network request
    // at all, and hand-picking which specific globals to expose is fragile -- it needs
    // several, and exactly which ones is an internal urllib3 implementation detail that
    // can change. The real security boundary here is the sandbox's cross-origin,
    // cookie-less isolation plus its CSP connect-src allow-list (studio.code.org and
    // self only) -- those still hold regardless of whether Python reaches the network
    // via requests.get() or by calling a browser API directly.
    // TODO: narrow this to the specific globals urllib3's Emscripten transport
    // (site-packages/urllib3/contrib/emscripten/) actually needs, instead of all of
    // globalThis, once that set is pinned down.
  });
  pyodide.setStdout(getStreamHandlerOptions('sysout'));
  pyodide.setStderr(getStreamHandlerOptions('syserr'));
  // Freeze the module object and its properties
  Object.freeze(pythonlabInputModule);
  Object.defineProperty(pythonlabInputModule.getInput, 'constructor', {
    writable: false,
    configurable: false,
    enumerable: false,
  });
  Object.freeze(pythonlabInputModule.getInput);

  pyodide.registerJsModule('pythonlab_input', pythonlabInputModule);

  // Pre-load our custom packages (unittest_runner and pythonlab_setup), as well as
  // matplotlib, which pythonlab_setup depends on, and numpy,
  // which will frequently be used. We have seen occasional issues with loading
  // packages, so we retry loading if we see any errors.
  let loadErrors = await loadPackages();
  if (loadErrors.length > 0) {
    // Retry loading packages once. Any packages that were successfully loaded
    // will be skipped in the retry.
    loadErrors = await loadPackages();
    if (loadErrors.length > 0) {
      postMessage({
        type: 'load_failed',
        message: `Error(s) loading python packages: ${loadErrors.join('\n')}`,
        id: 'startup',
      });
    }
  }
  // Warm up the pyodide environment by running setup code.
  await runInternalCode(SETUP_CODE, -1);
}

let pyodideReadyPromise: Promise<void> | null = null;
// Pyodide defines the globals object as any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideGlobals: any | null = null;
let loadStartTime: number | undefined;
async function initializePyodide() {
  const promiseWasNull = pyodideReadyPromise === null;
  if (promiseWasNull) {
    loadStartTime = Date.now();
    pyodideReadyPromise = loadPyodideAndPackages();
    postMessage({type: 'loading_pyodide'});
  }
  await pyodideReadyPromise;
  if (promiseWasNull) {
    const loadTime = loadStartTime ? Date.now() - loadStartTime : undefined;
    postMessage({
      type: 'loaded_pyodide',
      message: loadTime,
    });
  }
  pyodideGlobals = pyodide.globals.toJs();
}

// Get pyodide ready as soon as possible.
initializePyodide();

onmessage = async event => {
  // make sure loading is done
  await initializePyodide();
  const {id, python, source, validationFile, host, channelId} = event.data;
  let results = undefined;
  let sourceToWrite = source;
  // Add the validation file to the source if it exists. Use the id "validation"
  // so the validation file does not overwrite a user file (user files have stringified numeric ids).
  if (validationFile) {
    sourceToWrite = {
      ...source,
      files: {
        ...source.files,
        validation: {...validationFile, id: 'validation'},
      },
    };
  }
  try {
    writeSource(sourceToWrite, DEFAULT_FOLDER_ID, '', pyodide);
    postMessage({type: 'loading_packages'});
    await importPackagesFromFiles(sourceToWrite, pyodide);
    postMessage({type: 'loaded_packages'});
    await patchInput(id);
    // Levels with no project (exemplars, start mode) have no channel id, so there's
    // nothing to authorize proxied requests with -- skip patching entirely.
    if (channelId) {
      await patchRequests(host, channelId, id);
    }
    results = await pyodide.runPythonAsync(python, {
      filename: `/${HOME_FOLDER}/${MAIN_PYTHON_FILE}`,
    });
  } catch (error) {
    postMessage({type: 'error', message: (error as Error).message, id});
  }
  // Clean up environment.
  await runInternalCode(getCleanupCode(sourceToWrite), id);
  // We run setup code at the end to prepare the environment for the next run.
  await runInternalCode(SETUP_CODE, id);
  // We don't want to send back the validation file as part of the sources,
  // so we skip adding it to updatedSource.
  const filenamesToSkipSaving = validationFile ? [validationFile.name] : [];

  const updatedSource = getUpdatedSourceAndDeleteFiles(
    source,
    id,
    pyodide,
    postMessage,
    filenamesToSkipSaving
  );
  postMessage({type: 'updated_source', message: updatedSource, id});
  resetGlobals(pyodide, pyodideGlobals);

  // If there is a results response, convert it to a JS object.
  // Documentation on this method:
  // https://pyodide.org/en/stable/usage/api/js-api.html#pyodide.ffi.PyProxy.toJs
  const resultsObject = results?.toJs();
  try {
    postMessage({
      type: 'run_complete',
      message: JSON.stringify(resultsObject),
      id,
    });
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

async function patchInput(id: number) {
  await runInternalCode(patchInputCode(id), id);
}

async function patchRequests(host: string, channelId: string, id: number) {
  await runInternalCode(patchRequestsCode(host, channelId), id);
}

async function loadPackages() {
  const loadErrors: string[] = [];
  // We explicitly load all dependencies of the packages we want to be available to users,
  // matplotlib and numpy, as well as our custom packages. We do this so that on retry
  // if the top-level package was loaded successfully, but a dependency
  // failed, we will still try to reload the dependency.
  await pyodide.loadPackage(
    [
      // Main packages
      'matplotlib',
      'numpy',
      'requests',
      // Dependencies of main packages
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
      // Custom packages that we have built. They are defined in the
      // python/pythonlab/ folder in the codebase.
      `/blockly/js/pyodide/${version}/unittest_runner-0.3.0-py3-none-any.whl`,
      `/blockly/js/pyodide/${version}/pythonlab_setup-0.2.0-py3-none-any.whl`,
      `/blockly/js/pyodide/${version}/neighborhood-0.4.0-py3-none-any.whl`,
    ],
    {
      errorCallback: (message: string) => {
        loadErrors.push(message);
      },
    }
  );
  return loadErrors;
}
