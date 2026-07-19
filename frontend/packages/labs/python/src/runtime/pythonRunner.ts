import {CodebridgeRegistry} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import store, {labSystemActions} from '@code-dot-org/lab/redux';

import type {WorkerFile} from './messages';
import {
  asyncRun,
  preloadPyodide,
  restartWorkerIfRunning,
  sendInput,
} from './pyodideManager';

const MAIN_PYTHON_FILE = 'main.py';

/**
 * Start loading pyodide ahead of the first Run (e.g. when the lab mounts) so the
 * environment is ready by the time a program runs.
 */
export function preloadPython() {
  // Fire-and-forget: the façade resolves its backend and warms pyodide.
  void preloadPyodide();
}

/**
 * Run the project's `main.py` in pyodide, streaming output to the console and
 * tracking run state on the base `labSystem` slice. The runtime owns its own
 * lifecycle, as the ControlButtons reflect `labSystem.isRunning`.
 */
export async function runPython(source: MultiFileSource) {
  const files: WorkerFile[] = Object.values(source.files).map(file => ({
    name: file.name,
    contents: file.contents,
  }));
  const main = files.find(file => file.name === MAIN_PYTHON_FILE);

  const consoleManager = CodebridgeRegistry.getConsoleManager();
  if (!main) {
    consoleManager?.writeConsoleMessage(`No ${MAIN_PYTHON_FILE} to run.`);
    return;
  }

  store.dispatch(labSystemActions.setIsRunning(true));
  try {
    await asyncRun(main.contents, files);
  } finally {
    store.dispatch(labSystemActions.setIsRunning(false));
    store.dispatch(labSystemActions.setHasRun(true));
  }
}

/** Send a line of stdin to a program blocked on `input()`. */
export function sendPythonInput(value: string) {
  void sendInput(value);
}

/** Stop the running program. */
export function stopPython() {
  // Fire-and-forget the restart; reflect the stopped state immediately.
  void restartWorkerIfRunning();
  store.dispatch(labSystemActions.setIsRunning(false));
}
