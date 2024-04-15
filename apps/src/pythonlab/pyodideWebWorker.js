import {clearSources, writeSources} from './patches/pythonScriptUtils';
import {DEFAULT_FOLDER_ID} from '../weblab2/CDOIDE/constants';
import {loadPyodide} from 'pyodide';

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    //indexURL: `/assets/js/pyodide/${version}/`,
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full',
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
  const {id, python, sources} = event.data;
  try {
    writeSources(sources, DEFAULT_FOLDER_ID, '', self.pyodide);
    // Loading can throw erroneous console errors if a user has a package with the same name as one
    // in the pyodide list of packages that we have not put in our repo. We can ignore these,
    // any actual import errors will be caught by the runPythonAsync call.
    await self.pyodide.loadPackagesFromImports(python);
    let results = await self.pyodide.runPythonAsync(python);
    self.postMessage({type: 'run_complete', results, id});
  } catch (error) {
    console.log({error});
    self.postMessage({type: 'error', error: error.message, id});
  }
  clearSources(self.pyodide, sources);
};
