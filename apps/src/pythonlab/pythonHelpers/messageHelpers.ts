import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {NeighborhoodSignalType} from '@cdo/apps/miniApps/neighborhood/constants';
import {NeighborhoodSignal} from '@cdo/apps/miniApps/neighborhood/types';

import {HOME_FOLDER} from './constants';

/**
 * This method parses an error message from pyodide and makes it more readable and useful
 * for end users.
 * Pyodide error messages start with an internal stack trace we can ignore.
 * The first useful line is the one that starts with "File "/Files/main.py", line (line number)", which refers to a line number
 * in main.py. If we find this line, we return the error message starting from this line.
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

// This function parses the message string (example: '[PAINTER] PAINT {"color": "Blue"}') to a NeighborhoodSignal.
export function parseMessageToNeighborhoodSignal(
  message: string
): NeighborhoodSignal | null {
  /*
    \[(\w+)]\ captures the signal type inside square brackets, e.g., PAINTER
    \s+ matches one or more spaces
    ([^\s]+) captures the value, e.g., PAINT.
    (\{.*\})? optionally captures the detail json if it exists, e.g., {"color": "Blue"}
  */
  const regex = /^\[(\w+)]\s+([^\s]+)(?:\s+(\{.*\}))?$/;

  const match = message.match(regex);
  if (!match) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError(
        `Error in parseMessageToNeighborhoodSignal. message: ${message}`
      );
    return null;
  }

  const [, , value, detail] = match;

  const signal: NeighborhoodSignal = {
    value: value as NeighborhoodSignalType,
  };

  if (detail) {
    signal.detail = JSON.parse(detail);
  }
  return signal;
}
