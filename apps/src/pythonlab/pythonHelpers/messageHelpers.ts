import {ALL_PATCHES} from './patches';

/**
 * This method parses an error message from pyodide and makes it more readable and useful
 * for end users.
 * Pyodide error messages start with an internal stack trace we can ignore.
 * The first useful line is the one that starts with "File "<exec>", line (line number)", which refers to a line number
 * in main.py. We prepend setup code to the user's main.py, so we adjust the line number accordingly.
 * If there is a further stack trace we update it to remove reference to `/home/pyodide/`, which is the folder
 * all user code goes into in the pyodide system.
 * Otherwise we return the rest of the error message as is. If we never find the main error, we return the
 * entire message unaltered.
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
  const mainErrorRegex = /File "<exec>", line \d+.*/;
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
  const mainLineNumber = parseInt(
    errorLines[mainErrorLine].match(mainErrorLineRegex)![1]
  );
  const correctedMainErrorLine = getMainErrorLine(mainLineNumber);
  let parsedError = `main.py, line ${correctedMainErrorLine}`;
  let currentLine = mainErrorLine + 1;
  const lineRegex = /File "\/home\/pyodide\/([^"]+)", line (\d+).*/;
  let hasMultiFileStackTrace = false;
  while (currentLine < errorLines.length) {
    if (lineRegex.test(errorLines[currentLine])) {
      // If the error message refers to another file, remove the reference to the pyodide folder.
      const [, file, line] = errorLines[currentLine].match(lineRegex)!;
      parsedError += `\n${file}, line ${line}`;
      hasMultiFileStackTrace = true;
    } else {
      if (
        !hasMultiFileStackTrace &&
        mainErrorLineRegex.test(errorLines[currentLine])
      ) {
        // If the error message refers to a line number in main.py, adjust it.
        const line = errorLines[currentLine].match(mainErrorLineRegex)![1];
        const correctedLine = getMainErrorLine(parseInt(line));
        parsedError += `\n${errorLines[currentLine].replace(
          `line ${line}`,
          `line ${correctedLine}`
        )}`;
      } else {
        // Otherwise, add the line as is.
        parsedError += `\n${errorLines[currentLine]}`;
      }
    }
    currentLine++;
  }
  return parsedError;
}

/**
 * @param lineNumber original line number from the error message
 * @returns Adjusted line number for main.py that ignores any patches
 * prepended to the user's code
 */
function getMainErrorLine(lineNumber: number) {
  let prependedLines = 0;
  for (const patch of ALL_PATCHES) {
    if (patch.shouldPrepend) {
      prependedLines += patch.contents.split('\n').length;
    }
  }
  return lineNumber - prependedLines;
}
