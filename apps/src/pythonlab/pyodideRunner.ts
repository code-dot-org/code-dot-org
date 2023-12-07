import {asyncRun} from './pyodideWorkerManager';

export async function runPythonCode(code: string) {
  console.log('in pyodide consumer');
  try {
    const {results, error} = await asyncRun(code, {});
    console.log('in pyodide consumer, got results?');
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
