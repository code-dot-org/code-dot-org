import type {MultiFileSource} from '@code-dot-org/core/api';

// Messages exchanged between the main thread (pyodideWorkerManager) and the
// pyodide web worker. A trimmed subset of the legacy apps/src/pythonlab protocol
// — input, packages, validation, and neighborhood messages are deferred.

export type PyodideMessageType =
  | 'sysout'
  | 'syserr'
  | 'run_complete'
  | 'error'
  | 'internal_error'
  | 'updated_source'
  | 'loading_pyodide'
  | 'loaded_pyodide';

export interface PyodideMessage {
  type: PyodideMessageType;
  message?: string;
  id: string;
  /**
   * The project after the run, sent with `updated_source`: files and folders the
   * program created or modified are folded back into it. See
   * pythonScriptUtils.getUpdatedSourceAndDeleteFiles.
   */
  source?: MultiFileSource;
}

/** A run request posted to the worker. */
export interface RunRequest {
  id: string;
  /** The program to execute (main.py's contents). */
  python: string;
  /**
   * The whole project, written to the worker's virtual FS so imports resolve and
   * so the post-run walk can fold new files back into it.
   */
  source: MultiFileSource;
}

/**
 * Messages the main thread posts *to* the worker. `init` carries the hosted
 * pyodide directory and must be sent before any run (the worker begins loading
 * on receiving it); `run` executes a program.
 */
export type WorkerRequest =
  | {type: 'init'; pyodideBaseUrl: string}
  | ({type: 'run'} & RunRequest);
