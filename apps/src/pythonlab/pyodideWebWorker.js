import {
  getUpdatedSourceAndDeleteFiles,
  importPackagesFromFiles,
  writeSource,
} from './pythonHelpers/pythonScriptUtils';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {loadPyodide, version} from 'pyodide';

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    // /assets does not serve unhashed files, so we load from /blockly instead,
    // which does serve the unhashed files. We need to serve the unhashed files because
    // pyodide controls adding the filenames to the url we provide here.
    indexURL: `/blockly/js/pyodide/${version}/`,
    // pre-load numpy as it will frequently be used, and matplotlib as we patch it.
    packages: ['numpy', 'matplotlib'],
  });
  await self.pyodide.loadPackage('micropip');
  const micropip = self.pyodide.pyimport('micropip');
  await micropip.install(
    '/blockly/js/pyodide/0.25.1/pythonlab_setup-0.0.1-py3-none-any.whl'
  );
  self.pyodide.setStdout(getStreamHandlerOptions('sysout'));
  self.pyodide.setStderr(getStreamHandlerOptions('syserr'));
}

let pyodideReadyPromise = null;
async function initializePyodide() {
  if (pyodideReadyPromise === null) {
    pyodideReadyPromise = loadPyodideAndPackages();
  }
  await pyodideReadyPromise;
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
    results = await self.pyodide.runPythonAsync(python);
  } catch (error) {
    self.postMessage({type: 'error', message: error.message, id});
  }
  const updatedSource = getUpdatedSourceAndDeleteFiles(
    source,
    id,
    self.pyodide,
    self.postMessage
  );
  self.postMessage({type: 'updated_source', message: updatedSource, id});
  self.postMessage({type: 'run_complete', message: results, id});
};

// Return the options for sysout or syserr stream handler.
function getStreamHandlerOptions(type) {
  return {
    batched: msg => {
      self.postMessage({type: type, message: msg, id: 'none'});
    },
  };
}
