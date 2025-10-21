import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  NeighborhoodSignalType,
  NeighborhoodExceptionType,
  NeighborhoodExceptionMessage,
} from '@cdo/apps/miniApps/neighborhood/constants';
import {NeighborhoodSignal} from '@cdo/apps/miniApps/neighborhood/types';
import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import commonI18n from '@cdo/locale';

import {HOME_FOLDER} from './constants';

// List of packages we expect students to have access to in their code.
const supportedPackages = ['pandas', 'matplotlib', 'numpy'];

/**
 * This method parses an error message from pyodide and makes it more readable and useful
 * for end users.
 * Pyodide error messages start with an internal stack trace we can ignore.
 * The first useful line is the one that starts with "File "/Files/main.py", line (line number)", which refers to a line number
 * in main.py. If we find this line, we return the error message starting from this line.
 * If we never find the main error, we return the entire message unaltered.
 *
 * There are 2 exceptions to this rule:
 * 1. If the error message is a ModuleNotFoundError relating to a module
 * that is supported by pyodide but is not installed, we update it depending on the module and whether we are currently
 * running system code. If we are running system code, we return a generic "we failed to load a module" message.
 * If we are running user code and the module is supported by us, we return a message indicating the specific module that failed to load.
 * Otherwise, the module is not supported by us, and we return a message indicating the module is not supported.
 *
 * 2. If the error message includes a Neighborhood exception, we prepend a user-friendly message to the error message.
 * @param errorMessage - the error message from pyodide
 **/
export function parseErrorMessage(
  errorMessage: string,
  isSystemCode: boolean
): string {
  // Special case for an unsupported module.
  const importErrorRegex =
    /The module '([^']+)' is included in the Pyodide distribution, but it is not installed./;
  if (importErrorRegex.test(errorMessage)) {
    const [, module] = errorMessage.match(importErrorRegex)!;
    if (isSystemCode) {
      return pythonlabI18n.missingGenericModuleError();
    } else if (supportedPackages.includes(module)) {
      return pythonlabI18n.missingModuleError({module});
    } else {
      return pythonlabI18n.moduleNotSupported({module});
    }
  }
  // Look for Neighborhood exception.
  const neighborhoodExceptionType =
    extractNeighborhoodExceptionType(errorMessage);
  let neighborhoodExceptionMessage = null;
  if (neighborhoodExceptionType) {
    neighborhoodExceptionMessage = getNeighborhoodExceptionMessage(
      neighborhoodExceptionType
    );
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
    return neighborhoodExceptionMessage
      ? `${neighborhoodExceptionMessage}\n${errorMessage}`
      : errorMessage;
  }
  const adjustedErrorLines = errorLines
    .slice(mainErrorLine, errorLines.length)
    .join('\n');

  return neighborhoodExceptionMessage
    ? `${neighborhoodExceptionMessage}\n${adjustedErrorLines}`
    : adjustedErrorLines;
}

/**
 * This method returns the user-friendly message mapped to a Neighborhood exception type key.
 * @param exceptionType
 */
export function getNeighborhoodExceptionMessage(exceptionType: string) {
  if (exceptionType in NeighborhoodExceptionType) {
    // Return the user-friendly error message mapped to the NeighborhoodExceptionType.
    const message =
      NeighborhoodExceptionMessage[exceptionType as NeighborhoodExceptionType];
    return `${commonI18n.exceptionTag()} ${message}`;
  } else {
    return `${commonI18n.exceptionTag()} ${commonI18n.errorNeighborhoodUnknown()} ${exceptionType}`;
  }
}
/**
 * This method parses a traceback error message and searches for a Neighborhood exception.
 * We look for "NeighborhoodRuntimeException" and then return the neighborhood exception type.
 * @param tracebackMessage - the traceback message from pyodide
 **/
export function extractNeighborhoodExceptionType(
  tracebackMessage: string
): string | null {
  /*
    ^\s*.*: Matches the beginning of the line and any leading whitespace before the 'NeighborhoodRuntimeException:' keyword.
    \s+([A-Z_]+): Captures the exception type (e.g., INVALID_DIRECTION) consisting of uppercase letters and underscores.
    $: Ensures the regex matches until the end of the line.
    m flag: Enables multiline matching.
  */
  const regex = /^\s*.*NeighborhoodRuntimeException:\s+([A-Z_]+)$/m;
  // Execute the regex on the traceback error message to find a Neighborhood exception if it exists.
  const neighborhoodExceptionMatch = tracebackMessage.match(regex);
  if (neighborhoodExceptionMatch) {
    const exceptionType = neighborhoodExceptionMatch[1];
    return exceptionType;
  } else {
    return null;
  }
}

// This function parses the message string (example: '[NEIGHBORHOOD] PAINT {"color": "Blue"}') to a NeighborhoodSignal.
export function parseMessageToNeighborhoodSignal(
  message: string
): NeighborhoodSignal | null {
  /*
    \[(\w+)]\ captures the signal type inside square brackets, e.g., NEIGHBORHOOD
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
