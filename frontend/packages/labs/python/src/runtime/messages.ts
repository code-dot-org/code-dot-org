// Messages exchanged between the main thread (pyodideWorkerManager) and the
// pyodide web worker. A trimmed subset of the legacy apps/src/pythonlab protocol
// — input, packages, validation, neighborhood, and source write-back messages
// are deferred.

export type PyodideMessageType =
  | 'sysout'
  | 'syserr'
  | 'run_complete'
  | 'error'
  | 'loading_pyodide'
  | 'loaded_pyodide';

export interface PyodideMessage {
  type: PyodideMessageType;
  message?: string;
  id: string;
}

/** A single project file, flattened to a name + contents for the worker's FS. */
export interface WorkerFile {
  name: string;
  contents: string;
}

/** A run request posted to the worker. */
export interface RunRequest {
  id: string;
  /** The program to execute (main.py's contents). */
  python: string;
  /** All project files, written to the worker's virtual FS so imports resolve. */
  files: WorkerFile[];
}

/**
 * Messages the main thread posts *to* the worker. `init` carries the hosted
 * pyodide directory and must be sent before any run (the worker begins loading
 * on receiving it); `run` executes a program.
 */
export type WorkerRequest =
  | {type: 'init'; pyodideBaseUrl: string}
  | ({type: 'run'} & RunRequest);
