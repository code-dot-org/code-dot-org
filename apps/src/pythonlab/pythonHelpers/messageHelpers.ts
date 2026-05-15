import {MAIN_PYTHON_FILE} from '@cdo/apps/lab2/constants';
import pythonlabI18n from '@cdo/apps/pythonlab/locale';

import {HOME_FOLDER} from './constants';

// List of packages we expect students to have access to in their code.
const supportedPackages = ['pandas', 'matplotlib', 'numpy'];

/**
 * Turn a raw pyodide traceback into something a student can read.
 *
 * Pyodide error messages begin with an internal stack trace we strip out.
 * The first useful line is `File "/Files/main.py", line N` — once we find
 * it, we keep that line and everything after; otherwise we return the
 * original message unaltered.
 *
 * Two exceptions to the strip rule:
 *
 *   1. ModuleNotFoundError for a Pyodide-distributed module that isn't
 *      installed. We rewrite it depending on whether it's a package we
 *      support, an unsupported package, or system code that hit it.
 *
 *   2. A `miniAppPrefix` (e.g. `[EXCEPTION] Painter tried to ...`) is
 *      prepended verbatim. The caller computes this — it's the mini-app
 *      runtime's job to recognize its own exceptions, not this helper's.
 *
 * @param errorMessage   raw traceback from pyodide
 * @param isSystemCode   true when the failing code is ours, not the student's
 * @param miniAppPrefix  friendly message from `miniApp.parseException`, or null
 */
export function parseErrorMessage(
  errorMessage: string,
  isSystemCode: boolean,
  miniAppPrefix: string | null = null
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
    return miniAppPrefix ? `${miniAppPrefix}\n${errorMessage}` : errorMessage;
  }
  const adjustedErrorLines = errorLines
    .slice(mainErrorLine, errorLines.length)
    .join('\n');

  return miniAppPrefix
    ? `${miniAppPrefix}\n${adjustedErrorLines}`
    : adjustedErrorLines;
}
