import {MultiFileSource} from '../lab2/types';
import {asyncRun} from './pyodideWorkerManager';
import {getTestRunnerScript} from './pythonHelpers/scripts';

export async function runPythonCode(
  mainFile: string,
  source: MultiFileSource,
  channelId: string
) {
  try {
    const {results, error} = await asyncRun(mainFile, source, channelId);
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

export async function runAllTests(source: MultiFileSource, channelId: string) {
  // To run all tests in the project, we look for files that follow the regex 'test*.py'
  await runPythonCode(getTestRunnerScript('test*.py'), source, channelId);
}
