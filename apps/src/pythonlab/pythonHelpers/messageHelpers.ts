import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';

import {HOME_FOLDER} from './constants';

/**
 * This method parses an error message from pyodide and makes it more readable and useful
 * for end users.
 * Pyodide error messages start with an internal stack trace we can ignore.
 * The first useful line is the one that starts with "File "/Files/main.py", line (line number)", which refers to a line number
 * in main.py. We prepend setup code to the user's main.py, so we adjust the line number accordingly.
 * If there is a further stack trace (from other files) we can just send those lines as is.
 * If there is not, we continue to adjust the line numbers in the error message to account for the setup code we prepended,
 * as the error message line numbers will all refer to main.py.
 * If we never find the main error, we return the entire message unaltered.
 *
 * There is one exception to this rule: if the error message is a ModuleNotFoundError relating to a module
 * that is supported by pyodide but is not installed, we change it to say that the module is not supported in Python Lab.
 * This is because any uninstalled module is purposefully not supported.
 * @param errorMessage - the error message from pyodide
 **/
export function parseErrorMessage(errorMessage: string) {
  // Special case for an unsupported module.
  const importErrorRegex =
    /ModuleNotFoundError: The module '([^']+)' is included in the Pyodide distribution, but it is not installed./;
  if (importErrorRegex.test(errorMessage)) {
    const [, module] = errorMessage.match(importErrorRegex)!;
    return `ModuleNotFoundError: The module '${module}' is not supported in Python Lab.`;
  }

  // Parse to find the main.py error line.
  const errorLines = errorMessage.trim().split('\n');
  const mainErrorRegex = new RegExp(
    `File "\/${HOME_FOLDER}\/${MAIN_PYTHON_FILE}", line \\d+.*`
  );
  let mainErrorLine = 0;
  while (
    mainErrorLine < errorLines.length &&
    !mainErrorRegex.test(errorLines[mainErrorLine])
  ) {
    mainErrorLine++;
  }
  if (mainErrorLine >= errorLines.length) {
    // If we never find the main.py error, return the entire message.
    return errorMessage;
  }
  const adjustedErrorLines = errorLines.slice(mainErrorLine, errorLines.length);
  return adjustedErrorLines.join('\n');
}
