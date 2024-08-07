import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';

import {HOME_FOLDER} from './constants';
import {ALL_PATCHES} from './patches';

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
  const mainErrorLineRegex = /line (\d+)/;
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
  let parsedError = getCorrectedMainErrorMessage(
    errorLines[mainErrorLine],
    mainErrorLineRegex
  );
  let currentLine = mainErrorLine + 1;
  const lineRegex = new RegExp(
    `File "\/${HOME_FOLDER}\/([^"]+)", line (\\d+).*`
  );
  let hasMultiFileStackTrace = false;
  while (currentLine < errorLines.length) {
    let newLine = errorLines[currentLine];
    if (lineRegex.test(errorLines[currentLine])) {
      // If the error message refers to another file, we know this is a multi-file stack trace.
      // We need to track if this is a multi-file stack trace because if it's not, we need to adjust
      // the line number(s) in the error message.
      hasMultiFileStackTrace = true;
    } else if (
      !hasMultiFileStackTrace &&
      mainErrorLineRegex.test(errorLines[currentLine])
    ) {
      // If the error message refers to a line number in main.py, adjust it.
      newLine = getCorrectedMainErrorMessage(
        errorLines[currentLine],
        mainErrorLineRegex
      );
    }
    parsedError += `\n${newLine}`;
    currentLine++;
  }
  return parsedError;
}

/**
 * @param message Original error message for the main.py file.
 * @param mainErrorLineRegex Regex to pull out the line number from the main error line
 * @returns The error message with an ajusted line number for main.py that ignores any patches
 * prepended to the user's code
 */
function getCorrectedMainErrorMessage(
  message: string,
  mainErrorLineRegex: RegExp
) {
  const originalLine = message.match(mainErrorLineRegex)![1];
  let prependedLines = 0;
  for (const patch of ALL_PATCHES) {
    if (patch.shouldPrepend) {
      prependedLines += patch.contents.split('\n').length;
    }
  }
  const correctedLine = parseInt(originalLine) - prependedLines;
  return `${message.replace(`line ${originalLine}`, `line ${correctedLine}`)}`;
}
