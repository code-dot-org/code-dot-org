import {loadPyodide} from 'pyodide';

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full',
  });
  await self.pyodide.loadPackage(['numpy']);
  self.pyodide.setStdout({
    batched: msg => {
      self.postMessage({type: 'sysout', message: msg, id: 'none'});
    },
  });
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async event => {
  console.log('checking if pyodide is loaded...');
  // make sure loading is done
  await pyodideReadyPromise;
  console.log('pyodide is ready');
  const {id, python, ...context} = event.data;
  // The worker copies the context in its own "memory" (an object mapping name to values)
  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }
  // Now is the easy part, the one that is similar to working in the main thread:
  try {
    console.log('running python');
    await self.pyodide.loadPackagesFromImports(python);
    let results = await self.pyodide.runPythonAsync(python);
    console.log('ran python');
    self.postMessage({type: 'run_complete', results, id});
  } catch (error) {
    self.postMessage({type: 'error', error: error.message, id});
  }
};
