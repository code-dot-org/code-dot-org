import {loadPyodide} from 'pyodide';
import {writeSources} from './patches/pythonScriptUtils';
import {DEFAULT_FOLDER_ID} from '../weblab2/CDOIDE/constants';

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full',
  });
  // pre-load numpy as it will frequently be used, and matplotlib as we patch it.
  await self.pyodide.loadPackage(['numpy', 'matplotlib']);
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
  // Now is the easy part, the one that is similar to working in the main thread:
  try {
    console.log('in on message...');
    console.log({event});
    await self.pyodide.loadPackagesFromImports(python);
    writeSources(sources, DEFAULT_FOLDER_ID, '', self.pyodide);
    let results = await self.pyodide.runPythonAsync(python);
    self.postMessage({type: 'run_complete', results, id});
  } catch (error) {
    self.postMessage({type: 'error', error: error.message, id});
  }
  console.log('getting file info...');
  const pathData = self.pyodide.FS.analyzePath('/', true);
  console.log({pathData});
};
