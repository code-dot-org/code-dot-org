import {
  CodebridgeRegistry,
  DEFAULT_FOLDER_ID,
  getRunTimestampMessage,
  getValidationFromSource,
} from '@code-dot-org/codebridge';
import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';
import {LabRegistry} from '@code-dot-org/lab/contexts';
import store, {labSystemActions} from '@code-dot-org/lab/redux';
import type {ProgressManager} from '@code-dot-org/progress';

import {
  type PythonValidationResult,
  pythonValidationTracker,
} from '../progress/PythonValidationTracker';

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

// unittest_runner ships as a custom wheel. run_validation_tests returns the
// per-test results as the run's final value; run_student_tests only prints.
const runValidationTestsCode = (fileName: string) => `
from unittest_runner import run_validation_tests
run_validation_tests(${JSON.stringify(fileName)})
`;

const RUN_STUDENT_TESTS_CODE = `
from unittest_runner import run_student_tests
run_student_tests('test*.py')
`;

/**
 * Run the level's validation tests and report their results to the progress
 * manager. A level with no validation file runs the student's own `test*.py`
 * files instead, which report nothing. Ported from runAllTests in
 * apps/src/pythonlab/pyodideRunner.ts.
 */
export async function runPythonTests(
  source: MultiFileSource,
  validationFile: ProjectFile | undefined,
  progressManager: ProgressManager | null,
) {
  // In start mode the validation file is part of the project; otherwise the
  // level supplies it and the worker adds it for this run only.
  const validationToRun = validationFile ?? getValidationFromSource(source);
  const consoleManager = CodebridgeRegistry.getConsoleManager();
  void LabRegistry.projectManager?.flushSave();

  if (!validationToRun) {
    consoleManager?.writeConsoleMessage(
      getRunTimestampMessage(new Date(), 'TEST'),
    );
    await asyncRun(RUN_STUDENT_TESTS_CODE, source);
    return;
  }

  consoleManager?.writeConsoleMessage(
    getRunTimestampMessage(new Date(), 'VALIDATE'),
  );
  // Show the previous run's test names as pending while this run goes.
  progressManager?.resetValidation();
  progressManager?.updateProgress();
  const message = await asyncRun(
    runValidationTestsCode(validationToRun.name),
    source,
    validationFile,
  );
  if (message && progressManager) {
    let results: PythonValidationResult[] | undefined;
    try {
      results = JSON.parse(message) as PythonValidationResult[];
    } catch {
      // Not a result list: the tests did not finish.
    }
    if (Array.isArray(results)) {
      pythonValidationTracker.setValidationResults(results);
      progressManager.updateProgress();
    }
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
