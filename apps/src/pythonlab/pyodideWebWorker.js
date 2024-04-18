import {
  deleteSourceFiles,
  getUpdatedSource,
  importPackagesFromFiles,
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
  let results = '';
  try {
    writeSource(source, DEFAULT_FOLDER_ID, '', self.pyodide);
    await importPackagesFromFiles(source, self.pyodide);
    results = await self.pyodide.runPythonAsync(python);
    console.log('getting updated source...');
    const updatedSource = getUpdatedSource(
      source,
      id,
      self.pyodide,
      self.postMessage
    );
    self.postMessage({type: 'updated_source', message: updatedSource, id});
  } catch (error) {
    self.postMessage({type: 'error', message: error.message, id});
  }
  deleteSourceFiles(source, self.pyodide);
  self.postMessage({type: 'run_complete', message: results, id});
};
