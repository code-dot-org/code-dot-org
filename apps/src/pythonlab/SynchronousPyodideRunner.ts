// Run pyodide in the main thread
import {loadPyodide} from 'pyodide';

interface PyodideRunnerInterface {
  initialize: () => void;
  runPython: (code: string) => void;
  isLoaded: () => boolean;
}

export default class SynchronousPyodideRunner
  implements PyodideRunnerInterface
{
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
