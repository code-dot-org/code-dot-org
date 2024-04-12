import {clearSources, writeSources} from './patches/pythonScriptUtils';
import {DEFAULT_FOLDER_ID} from '../weblab2/CDOIDE/constants';
import {loadPyodide, version} from 'pyodide';

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    indexURL: `/assets/js/pyodide/${version}/`,
  });
  // pre-load numpy as it will frequently be used, and matplotlib as we patch it.
  // TODO: Re-enable matplotlib after adding wheel to our repo.
  // https://codedotorg.atlassian.net/browse/CT-488
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
    await self.pyodide.loadPackagesFromImports(python);
    writeSources(sources, DEFAULT_FOLDER_ID, '', self.pyodide);
    let results = await self.pyodide.runPythonAsync(python);
    self.postMessage({type: 'run_complete', results, id});
  } catch (error) {
    console.log({error});
    self.postMessage({type: 'error', error: error.message, id});
  }
  clearSources(self.pyodide, sources);
};
