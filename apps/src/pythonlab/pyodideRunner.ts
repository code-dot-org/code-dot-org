import {MultiFileSource} from '../lab2/types';
import {asyncRun} from './pyodideWorkerManager';

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
