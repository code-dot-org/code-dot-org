import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import {MiniApps} from '@codebridge/constants';
import {AnyAction, Dispatch} from 'redux';

import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import ProgressManager from '@cdo/apps/lab2/progress/ProgressManager';
import {getFileByName} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {getStore} from '@cdo/apps/redux';

import {getValidationFromSource} from '../codebridge';

import PythonValidationTracker from './progress/PythonValidationTracker';
import {
  asyncRun,
  restartPyodideIfProgramIsRunning,
} from './pyodideWorkerManager';
import {runStudentTests, runValidationTests} from './pythonHelpers/scripts';

const appName = 'pythonlab';

export async function handleRunClick(
  runTests: boolean,
  dispatch: Dispatch<AnyAction>,
  source: MultiFileSource | undefined,
  progressManager: ProgressManager | null,
  validationFile?: ProjectFile
) {
  const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
  if (!source) {
    consoleManager?.writeSystemMessage('You have no code to run.', appName);
    return;
  }
  if (runTests) {
    await runAllTests(source, dispatch, progressManager, validationFile);
  } else {
    // Run main.py
    const code = getFileByName(source.files, MAIN_PYTHON_FILE)?.contents;
    if (!code) {
      consoleManager?.writeSystemMessage(
        `You have no ${MAIN_PYTHON_FILE} to run.`,
        appName
      );
      return;
    }
    consoleManager?.writeSystemMessage('Running program...', appName);
    await runPythonCode(code, source);
    if (isNeighborhoodLevel()) {
      CodebridgeRegistry.getInstance().getNeighborhood()?.onClose();
    }
  }
}

export async function runPythonCode(
  mainFile: string,
  source: MultiFileSource,
  validationFile?: ProjectFile
) {
  try {
    if (isNeighborhoodLevel()) {
      CodebridgeRegistry.getInstance().getNeighborhood()?.reset();
      CodebridgeRegistry.getInstance().getNeighborhood()?.onRun();
    }
    return await asyncRun(mainFile, source, validationFile);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
    );
  }
}

export function stopPythonCode() {
  if (isNeighborhoodLevel()) {
    CodebridgeRegistry.getInstance().getNeighborhood()?.onStop();
  }
  // This will terminate the worker and create a new one if there is a running program.
  restartPyodideIfProgramIsRunning();
}

export async function runAllTests(
  source: MultiFileSource,
  dispatch: Dispatch<AnyAction>,
  progressManager: ProgressManager | null,
  validationFile?: ProjectFile
) {
  // We default to using the validation file passed in. If it does not exist,
  // we check the source for the validation file (this is the case in start mode).
  const validationToRun = validationFile || getValidationFromSource(source);
  const consoleManager = CodebridgeRegistry.getInstance().getConsoleManager();
  if (validationToRun) {
    consoleManager?.writeSystemMessage(`Running level tests...`, appName);
    progressManager?.resetValidation();
    // We only send the separate validation file, because otherwise the
    // source already has the validation file.
    const result = await runPythonCode(
      runValidationTests(validationToRun.name),
      source,
      validationFile
    );
    if (result?.message) {
      // Get validation test results
      // Message is an array of Maps with the keys "name" and "result",
      // where "name" is the name of the test and "result" is one of
      // "PASS/FAIL/ERROR/SKIP/EXPECTED_FAILURE/UNEXPECTED_SUCCESS"
      // See this PR for details: https://github.com/code-dot-org/pythonlab-packages/pull/5
      const testResults = result.message as Map<string, string>[];
      if (progressManager) {
        PythonValidationTracker.getInstance().setValidationResults(testResults);
        progressManager.updateProgress();
      }
    }
  } else {
    consoleManager?.writeSystemMessage(
      `Running your project's tests...`,
      appName
    );
    // Otherwise, we look for files that follow the regex 'test*.py' and run those.
    await runPythonCode(runStudentTests(), source);
  }
}

function isNeighborhoodLevel() {
  return (
    getStore().getState().lab.levelProperties?.miniApp === MiniApps.Neighborhood
  );
}
