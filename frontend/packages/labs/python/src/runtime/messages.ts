import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

// Messages exchanged between the main thread (pyodideWorkerManager) and the
// pyodide web worker. A trimmed subset of the legacy apps/src/pythonlab protocol
// — package and neighborhood messages are deferred.

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
  /** With `run_complete`, the program's final value as JSON, if it had one. */
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
  /**
   * The level's validation file. It is written beside the project for this run
   * only and is never folded back into it.
   */
  validationFile?: ProjectFile;
}

/**
 * Messages the main thread posts *to* the worker. `init` carries the hosted
 * pyodide directory and must be sent before any run (the worker begins loading
 * on receiving it); `run` executes a program.
 */
export type WorkerRequest =
  | {type: 'init'; pyodideBaseUrl: string}
  | ({type: 'run'} & RunRequest);
