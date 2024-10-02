import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import {AnyAction, Dispatch} from 'redux';

import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import ProgressManager from '@cdo/apps/lab2/progress/ProgressManager';
import {getFileByName} from '@cdo/apps/lab2/projects/utils';
import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';

import PythonValidationTracker from './progress/PythonValidationTracker';
import {
  asyncRun,
  restartPyodideIfProgramIsRunning,
} from './pyodideWorkerManager';
import {runStudentTests, runValidationTests} from './pythonHelpers/scripts';

export async function handleRunClick(
  runTests: boolean,
  dispatch: Dispatch<AnyAction>,
  source: MultiFileSource | undefined,
  progressManager: ProgressManager | null,
  validationFile?: ProjectFile
) {
  if (!source) {
    dispatch(appendSystemMessage('You have no code to run.'));
    return;
  }
  if (runTests) {
    await runAllTests(source, dispatch, progressManager, validationFile);
  } else {
    // Run main.py
    const code = getFileByName(source.files, MAIN_PYTHON_FILE)?.contents;
    if (!code) {
      dispatch(appendSystemMessage(`You have no ${MAIN_PYTHON_FILE} to run.`));
      return;
    }
    dispatch(appendSystemMessage('Running program...'));
    await runPythonCode(code, source);
  }
}

export async function runPythonCode(
  mainFile: string,
  source: MultiFileSource,
  validationFile?: ProjectFile
) {
  try {
    return await asyncRun(mainFile, source, validationFile);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
    );
  }
}

export function stopPythonCode() {
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
  const validationToRun =
    validationFile ||
    Object.values(source.files).find(
      f => f.type === ProjectFileType.VALIDATION
    );
  if (validationToRun) {
    dispatch(appendSystemMessage(`Running level tests...`));
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
      PythonValidationTracker.getInstance().setValidationResults(testResults);
      if (progressManager) {
        progressManager.updateProgress();
      }
    }
  } else {
    dispatch(appendSystemMessage(`Running your project's tests...`));
    // Otherwise, we look for files that follow the regex 'test*.py' and run those.
    await runPythonCode(runStudentTests(), source);
  }
}
