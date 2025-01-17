import {parseMessageToNeighborhoodSignal} from '@cdo/apps/pythonlab/pythonHelpers/messageHelpers';

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
