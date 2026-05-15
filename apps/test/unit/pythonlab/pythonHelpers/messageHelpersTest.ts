import pythonlabI18n from '@cdo/apps/pythonlab/locale';
import {parseErrorMessage} from '@cdo/apps/pythonlab/pythonHelpers/messageHelpers';

// `parseErrorMessage` is now pure: it formats a traceback and, if given,
// prepends a friendly mini-app exception message. The mini-app-specific
// recognition (matching `NeighborhoodRuntimeException: KEY` etc.) lives
// inside `miniApp.parseException` in the mini-app's own package and is
// tested there; here we just hand the function a fixture prefix and
// verify the formatting.

describe('messageHelpers', function () {
  let tracebackLine: string;
  let baseErrorLine: string;
  let mainErrorLine: string;
  let detailsErrorLine: string;
  let neighborhoodExceptionLine: string;
  let neighborhoodExceptionMessageLine: string;
  let missingSupportedModuleErrorLine: string;
  let missingGenericModuleErrorLine: string;
  beforeEach(() => {
    tracebackLine = 'Traceback (most recent call last): ';
    baseErrorLine =
      'File "/lib/python311.zip/_pyodide/_base.py", line 573, in eval_code_async await CodeRunner';
    mainErrorLine = 'File "/Files/main.py", line 4, in <module>';
    detailsErrorLine =
      'p.can_move("invalid")\nFile "/lib/python3.11/site-packages/neighborhood/painter.py", line 164, in can_move';
    neighborhoodExceptionLine =
      'raise NeighborhoodRuntimeException(ExceptionKey.INVALID_MOVE\n neighborhood.support.neighborhood_runtime_exception.NeighborhoodRuntimeException: NeighborhoodRuntimeException: INVALID_MOVE';
    neighborhoodExceptionMessageLine =
      '[EXCEPTION] Painter tried to move off the grid or into an obstacle.';
    missingSupportedModuleErrorLine =
      "ModuleNotFoundError: The module 'pandas' is included in the Pyodide distribution, but it is not installed.";
    missingGenericModuleErrorLine =
      "ModuleNotFoundError: The module 'some_module' is included in the Pyodide distribution, but it is not installed.";
  });

  describe('parseErrorMessage', function () {
    it('returns the entire error message if main.py error is not found', function () {
      const tracebackMessage = `${tracebackLine}\n${baseErrorLine}`;
      expect(parseErrorMessage(tracebackMessage, false)).toEqual(
        tracebackMessage
      );
    });
    it('prepends the mini-app prefix when main.py error is not found', function () {
      const tracebackMessage = `${tracebackLine}\n${baseErrorLine}\n${neighborhoodExceptionLine}`;
      expect(
        parseErrorMessage(
          tracebackMessage,
          false,
          neighborhoodExceptionMessageLine
        )
      ).toEqual(`${neighborhoodExceptionMessageLine}\n${tracebackMessage}`);
    });
    it('successfully returns the parsed exception message', async function () {
      const tracebackMessage = `${tracebackLine}\n${baseErrorLine}\n${mainErrorLine}\n${detailsErrorLine}`;
      const expectedErrorMessage = `${mainErrorLine}\n${detailsErrorLine}`;
      expect(parseErrorMessage(tracebackMessage, false)).toEqual(
        expectedErrorMessage
      );
    });
    it('prepends the mini-app prefix to the parsed exception message', function () {
      const tracebackMessage = `${tracebackLine}: \n${baseErrorLine}\n${mainErrorLine}\n${detailsErrorLine}\n${neighborhoodExceptionLine}`;
      const expectedErrorMessage = `${mainErrorLine}\n${detailsErrorLine}\n${neighborhoodExceptionLine}`;
      expect(
        parseErrorMessage(
          tracebackMessage,
          false,
          neighborhoodExceptionMessageLine
        )
      ).toEqual(`${neighborhoodExceptionMessageLine}\n${expectedErrorMessage}`);
    });
    it('ignores the prefix when the error is a missing module (module path wins)', function () {
      // Module-not-found short-circuits before any prefix prepend — the
      // friendly module message stands alone.
      const expectedMessage = pythonlabI18n.missingModuleError({
        module: 'pandas',
      });
      expect(
        parseErrorMessage(
          missingSupportedModuleErrorLine,
          false,
          'this prefix should be discarded'
        )
      ).toEqual(expectedMessage);
    });
    it('provides correct message for missing module in system code', function () {
      const tracebackMessage = missingSupportedModuleErrorLine;
      const expectedMessage = pythonlabI18n.missingGenericModuleError();
      expect(parseErrorMessage(tracebackMessage, true)).toEqual(
        expectedMessage
      );
    });
    it('provides correct message for missing supported module', function () {
      const tracebackMessage = missingSupportedModuleErrorLine;
      const expectedMessage = pythonlabI18n.missingModuleError({
        module: 'pandas',
      });
      expect(parseErrorMessage(tracebackMessage, false)).toEqual(
        expectedMessage
      );
    });
    it('provides correct message for missing unsupported module', function () {
      const tracebackMessage = missingGenericModuleErrorLine;
      const expectedMessage = pythonlabI18n.moduleNotSupported({
        module: 'some_module',
      });
      expect(parseErrorMessage(tracebackMessage, false)).toEqual(
        expectedMessage
      );
    });
  });
});
