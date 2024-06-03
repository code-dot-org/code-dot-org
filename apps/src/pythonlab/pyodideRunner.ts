import {AnyAction, Dispatch} from 'redux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {asyncRun} from './pyodideWorkerManager';
import {getTestRunnerScript} from './pythonHelpers/scripts';
import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import {getFileByName} from '@cdo/apps/lab2/projects/utils';

export function handleRunClick(
  runTests: boolean,
  dispatch: Dispatch<AnyAction>,
  permissions: string[],
  source: MultiFileSource | undefined
) {
  // For now, restrict running python code to levelbuilders.
  if (!permissions.includes('levelbuilder')) {
    dispatch(
      appendSystemMessage('You do not have permission to run python code.')
    );
    return;
  }
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
    runPythonCode(code, source);
  }
}

export async function runPythonCode(mainFile: string, source: MultiFileSource) {
  try {
    const {results, error} = await asyncRun(mainFile, source);
    if (results) {
      console.log('pyodideWorker return results: ', results);
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

export async function runAllTests(
  source: MultiFileSource,
  dispatch: Dispatch<AnyAction>
) {
  // If the project has a validation file, we just run those tests.
  const validationFile = Object.values(source.files).filter(f => f.validation);
  if (validationFile.length > 0) {
    // We only support one validation file. If somehow there are more than one, just run the first one.
    dispatch(appendSystemMessage(`Running level tests...`));
    await runPythonCode(getTestRunnerScript(validationFile[0].name), source);
  } else {
    dispatch(appendSystemMessage(`Running your project's tests...`));
    // Otherwise, we look for files that follow the regex 'test*.py' and run those.
    await runPythonCode(getTestRunnerScript('test*.py'), source);
  }
}
