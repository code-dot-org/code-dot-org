import {loadPyodide} from 'pyodide';

// TODO: make this a class that loads pyodide once in a load method,
// then can run code faster.
// or...try to run code in a web worker?
// also try with pyodide saved in local storage

interface PyodideRunnerInterface {
  initialize: () => void;
  runPython: (code: string) => void;
  isLoaded: () => boolean;
}

export default class PyodideRunner implements PyodideRunnerInterface {
  loaded: boolean;
  // Pyodide does not export a type for their api
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pyodideInstance: any | undefined = undefined;
  loadedCallback: (isLoaded: boolean) => void;

  constructor(loadedCallback: (isLoaded: boolean) => void) {
    this.loaded = false;
    this.loadedCallback = loadedCallback;
  }

  async initialize() {
    if (!this.loaded) {
      const pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full',
      });
      console.log('loaded!');
      this.pyodideInstance = pyodide;
      this.loaded = true;
      this.loadedCallback(true);
    }
  }

  isLoaded() {
    return this.loaded;
  }

  runPython(code: string) {
    if (!this.loaded) {
      throw new Error('Pyodide not loaded');
    }
    this.pyodideInstance.runPython(code);
  }
}
