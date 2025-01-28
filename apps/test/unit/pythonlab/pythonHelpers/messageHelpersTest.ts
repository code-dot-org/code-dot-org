import {
  parseMessageToNeighborhoodSignal,
  extractNeighborhoodExceptionType,
  getNeighborhoodExceptionMessage,
} from '@cdo/apps/pythonlab/pythonHelpers/messageHelpers';

describe('messageHelpers', function () {
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
      const tracebackMessage =
        "Traceback (most recent call last): \nFile '/lib/python311.zip/_pyodide/_base.py', line 573, in eval_code_async await CodeRunner(\nFile '/Files/main.py', line 4, in <<module> p.can_move('invalid')\nraise NeighborhoodRuntimeException(ExceptionKey.INVALID_MOVE\n neighborhood.support.neighborhood_runtime_exception.NeighborhoodRuntimeException: NeighborhoodRuntimeException: INVALID_MOVE";
      expect(extractNeighborhoodExceptionType(tracebackMessage)).toEqual(
        'INVALID_MOVE'
      );
    });
    it('returns null if there is no Neighborhood excpetion within a traceback error message', async function () {
      const tracebackMessage =
        "Traceback (most recent call last):\n AttributeError: File '/Files/main.py', line 3, in <module> p.turnleft()\n 'Painter' object has no attribute 'turnleft'";
      expect(extractNeighborhoodExceptionType(tracebackMessage)).toEqual(null);
    });
  });
  describe('getNeighborhoodExceptionMessage', function () {
    it('can successfully return a Neighborhood exception given an exception type', async function () {
      expect(getNeighborhoodExceptionMessage('INVALID_MOVE')).toEqual(
        '[EXCEPTION] Painter tried to move off the grid or into an obstacle.'
      );
    });
  });
});
