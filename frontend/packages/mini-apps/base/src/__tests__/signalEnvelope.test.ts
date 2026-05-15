import {describe, expect, it} from 'vitest';

import {parseSignalEnvelope} from '../signalEnvelope';

const TAG = '[NEIGHBORHOOD]';

describe('parseSignalEnvelope', () => {
  it('parses a key-only envelope (no JSON detail)', () => {
    const out = parseSignalEnvelope(`${TAG} TURN_LEFT`, TAG);
    expect(out).toEqual({key: 'TURN_LEFT', detail: undefined});
  });

  it('parses an envelope with a JSON detail object', () => {
    const line = `${TAG} MOVE {"direction":"east","id":"painter-1"}`;
    const out = parseSignalEnvelope<{direction: string; id: string}>(line, TAG);
    expect(out).toEqual({
      key: 'MOVE',
      detail: {direction: 'east', id: 'painter-1'},
    });
  });

  it('parses an envelope whose detail contains nested objects', () => {
    const line = `${TAG} PAINT {"id":"painter-1","meta":{"color":"Blue"}}`;
    const out = parseSignalEnvelope(line, TAG);
    expect(out?.key).toBe('PAINT');
    expect(out?.detail).toEqual({id: 'painter-1', meta: {color: 'Blue'}});
  });

  it('returns null when the tag does not match', () => {
    const out = parseSignalEnvelope(`[TURTLE] MOVE`, TAG);
    expect(out).toBeNull();
  });

  it('returns null on lines that do not match the envelope shape', () => {
    expect(parseSignalEnvelope('plain stdout line', TAG)).toBeNull();
    expect(parseSignalEnvelope('[NEIGHBORHOOD]no-space', TAG)).toBeNull();
    expect(parseSignalEnvelope('[NEIGHBORHOOD] ', TAG)).toBeNull();
  });

  it('throws when the JSON detail is malformed', () => {
    // The mini-app guarantees well-formed JSON; surfacing the parse error
    // is the documented behavior, not silent skipping.
    expect(() =>
      parseSignalEnvelope(`${TAG} MOVE {not-json}`, TAG),
    ).toThrow();
  });
});
