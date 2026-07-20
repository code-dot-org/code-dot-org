import {
  CodebridgeRegistry,
  DEFAULT_FOLDER_ID,
  getRunTimestampMessage,
} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {LabRegistry} from '@code-dot-org/lab';
import store, {labSystemActions} from '@code-dot-org/lab/redux';

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
  // main.py at the project root is the entry script.
  const main = Object.values(source.files).find(
    file =>
      file.name === MAIN_PYTHON_FILE && file.folderId === DEFAULT_FOLDER_ID,
  );

  // Flush any pending (throttled) save before running, matching legacy's
  // PythonlabView.onRun. Students typically run right before navigating away, so
  // this both makes leaving the page fast and means a run always persists the
  // code it ran instead of waiting out the autosave interval. Fire-and-forget,
  // as legacy does — the run should not wait on the network.
  void LabRegistry.projectManager?.flushSave();

  const consoleManager = CodebridgeRegistry.getConsoleManager();
  if (!main) {
    consoleManager?.writeConsoleMessage(`No ${MAIN_PYTHON_FILE} to run.`);
    return;
  }

  store.dispatch(labSystemActions.setIsRunning(true));
  // Gray "RUN AT hh:mm" banner marks the start of this run in the console.
  consoleManager?.writeConsoleMessage(getRunTimestampMessage());
  try {
    await asyncRun(main.contents, source);
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
