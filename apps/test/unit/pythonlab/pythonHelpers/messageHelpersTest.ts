import {
  parseMessageToNeighborhoodSignal,
  extractNeighborhoodExceptionType,
  getNeighborhoodExceptionMessage,
  parseErrorMessage,
} from '@cdo/apps/pythonlab/pythonHelpers/messageHelpers';

describe('messageHelpers', function () {
  let tracebackLine: string;
  let baseErrorLine: string;
  let mainErrorLine: string;
  let detailsErrorLine: string;
  let neighborhoodExceptionLine: string;
  let neighborhoodExceptionMessageLine: string;
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
  });
  describe('parseMessageToNeighborhoodSignal', function () {
    it('can successfully parse a message string with no detail', async function () {
      expect(parseMessageToNeighborhoodSignal('[PAINTER] MOVE')).toEqual({
        value: 'MOVE',
      });
    });
    it('can successfully parse a message string with detail', async function () {
      expect(
        parseMessageToNeighborhoodSignal('[PAINTER] PAINT {"color": "Blue"}')
      ).toEqual({
        value: 'PAINT',
        detail: {
          color: 'Blue',
        },
      });
    });
    it('returns null if message string has invalid format', async function () {
      expect(parseMessageToNeighborhoodSignal('Invalid')).toEqual(null);
    });
  });
  describe('extractNeighborhoodExceptionType', function () {
    it('can successfully extract a Neighborhood exception type given a traceback error message', async function () {
      const tracebackMessage = `${tracebackLine}\n${baseErrorLine}\n${mainErrorLine}\n${detailsErrorLine}\n${neighborhoodExceptionLine}`;
      expect(extractNeighborhoodExceptionType(tracebackMessage)).toEqual(
        'INVALID_MOVE'
      );
    });
    it('returns null if there is no Neighborhood exception within a traceback error message', async function () {
      const tracebackMessage = `${tracebackLine}\n AttributeError: File '/Files/main.py', line 3, in <module>\n p.turnleft()\n 'Painter' object has no attribute 'turnleft'`;
      expect(extractNeighborhoodExceptionType(tracebackMessage)).toEqual(null);
    });
  });
  describe('getNeighborhoodExceptionMessage', function () {
    it('can successfully return a Neighborhood exception given an exception type', async function () {
      expect(getNeighborhoodExceptionMessage('INVALID_MOVE')).toEqual(
        neighborhoodExceptionMessageLine
      );
    });
  });
  describe('parseErrorMessage', function () {
    it('returns the entire error message if main.py error is not found', async function () {
      const tracebackMessage = `${tracebackLine}\n${baseErrorLine}`;
      expect(parseErrorMessage(tracebackMessage)).toEqual(tracebackMessage);
    });
    it('returns the Neighborhood exception message and entire error message if main.py error is not found', async function () {
      const tracebackMessage = `${tracebackLine}\n${baseErrorLine}\n${neighborhoodExceptionLine}`;
      expect(parseErrorMessage(tracebackMessage)).toEqual(
        `${neighborhoodExceptionMessageLine}\n${tracebackMessage}`
      );
    });
    it('successfully returns the parsed exception message', async function () {
      const tracebackMessage = `${tracebackLine}\n${baseErrorLine}\n${mainErrorLine}\n${detailsErrorLine}`;
      const expectedErrorMessage = `${mainErrorLine}\n${detailsErrorLine}`;
      expect(parseErrorMessage(tracebackMessage)).toEqual(expectedErrorMessage);
    });
    it('successfully returns the Neighborhood exception with parsed exception message', async function () {
      const tracebackMessage = `${tracebackLine}: \n${baseErrorLine}\n${mainErrorLine}\n${detailsErrorLine}\n${neighborhoodExceptionLine}`;
      const expectedErrorMessage = `${mainErrorLine}\n${detailsErrorLine}\n${neighborhoodExceptionLine}`;
      expect(parseErrorMessage(tracebackMessage)).toEqual(
        `${neighborhoodExceptionMessageLine}\n${expectedErrorMessage}`
      );
    });
  });
});
