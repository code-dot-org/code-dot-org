import {asyncRun} from './pyodideWorkerManager';

export async function runPythonCode(code: string) {
  try {
    const {results, error} = await asyncRun(code, {});
    if (results) {
      console.log('pyodideWorker return results: ', results);
      return results;
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

export async function evaluatePythonCode(code: string) {
  await runPythonCode(errorScript(code));
}

const errorScript = (source: string) => {
  return `
import jedi
script = jedi.Script("""${source}""")
print(script.get_syntax_errors())
`;
};
