import {loadPyodide} from 'pyodide';

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full',
  });
  console.log('loaded pyodide from worker');
}

console.log('about to call loadPyodideAndPackages');
const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async event => {
  console.log('in on message');
  // make sure loading is done
  await pyodideReadyPromise;
  console.log('pyodide is ready');
  // Don't bother yet with this line, suppose our API is built in such a way:
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
    self.postMessage({results, id});
  } catch (error) {
    self.postMessage({error: error.message, id});
  }
};
