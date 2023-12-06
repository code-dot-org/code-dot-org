import {loadPyodide} from 'pyodide';

// TODO: make this a class that loads pyodide once in a load method,
// then can run code faster.
// or...try to run code in a web worker?
// also try with pyodide saved in local storage

export function runPython(code: string, callback: (result: string) => void) {
  console.log('loading pyodide...');
  loadPyodide({indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full'}).then(
    pyodide => {
      console.log('pyodide loaded');
      pyodide.runPython(code);
    }
  );
}
