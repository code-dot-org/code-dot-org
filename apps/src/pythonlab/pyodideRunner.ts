import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import {AnyAction, Dispatch} from 'redux';

import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {getFileByName} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

import {asyncRun, stopAndRestartPyodideWorker} from './pyodideWorkerManager';
import {runStudentTests, runValidationTests} from './pythonHelpers/scripts';

export async function handleRunClick(
  runTests: boolean,
  dispatch: Dispatch<AnyAction>,
  source: MultiFileSource | undefined
) {
  if (!source) {
    dispatch(appendSystemMessage('You have no code to run.'));
    return;
  }
  if (runTests) {
    runAllTests(source, dispatch);
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

export async function runPythonCode(mainFile: string, source: MultiFileSource) {
  try {
    const {results, error} = await asyncRun(mainFile, source);
    if (results) {
      console.log('got results!');
      console.log({results: results});
      // console.log(results[0]);
      // console.log(results[0].test_title);
      //console.log('pyodideWorker return results: ', results);
    } else if (error) {
      console.log('pyodideWorker error: ', error);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
    );
  }
}

export function stopPythonCode() {
  // This will terminate the worker and create a new one.
  stopAndRestartPyodideWorker();
}

export async function runAllTests(
  source: MultiFileSource,
  dispatch: Dispatch<AnyAction>
) {
  // If the project has a validation file, we just run those tests.
  const validationFile = Object.values(source.files).find(
    f => f.type === ProjectFileType.VALIDATION
  );
  if (validationFile) {
    // We only support one validation file. If somehow there is more than one, just run the first one.
    dispatch(appendSystemMessage(`Running level tests...`));
    await runPythonCode(runValidationTests(validationFile.name), source);
  } else {
    dispatch(appendSystemMessage(`Running your project's tests...`));
    // Otherwise, we look for files that follow the regex 'test*.py' and run those.
    await runPythonCode(runStudentTests(), source);
  }
}
