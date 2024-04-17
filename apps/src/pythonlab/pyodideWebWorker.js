import {
  deleteSourceFiles,
  importPackagesFromFiles,
  writeCsvAndTextFiles,
  writeSource,
} from './patches/pythonScriptUtils';
import {DEFAULT_FOLDER_ID} from '../weblab2/CDOIDE/constants';
import {loadPyodide, version} from 'pyodide';

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    indexURL: `/assets/js/pyodide/${version}/`,
    // pre-load numpy as it will frequently be used, and matplotlib as we patch it.
    packages: ['numpy', 'matplotlib'],
  });
  self.pyodide.setStdout({
    batched: msg => {
      self.postMessage({type: 'sysout', message: msg, id: 'none'});
    },
  });
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
  try {
    writeSource(source, DEFAULT_FOLDER_ID, '', self.pyodide);
    // Loading can throw erroneous console errors if a user has a package with the same name as one
    // in the pyodide list of packages that we have not put in our repo. We can ignore these,
    // any actual import errors will be caught by the runPythonAsync call.
    await importPackagesFromFiles(source, self.pyodide);
    let results = await self.pyodide.runPythonAsync(python);
    self.postMessage({type: 'run_complete', results, id});
  } catch (error) {
    self.postMessage({type: 'error', error: error.message, id});
  }
  writeCsvAndTextFiles(self.pyodide, source);
  deleteSourceFiles(self.pyodide, source);
};
