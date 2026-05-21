import {describe, expect, it} from 'vitest';

import {NeighborhoodSignalTypes} from '../constants';
import {parseNeighborhoodSignal} from '../parseNeighborhoodSignal';

describe('parseNeighborhoodSignal', () => {
  it('parses a MOVE signal with direction + id', () => {
    const out = parseNeighborhoodSignal(
      '[NEIGHBORHOOD] MOVE {"direction":"east","id":1}',
    );
    expect(out).toEqual({
      value: NeighborhoodSignalTypes.MOVE,
      detail: {direction: 'east', id: 1},
    });
  });

  it('parses an INITIALIZE_PAINTER signal with coordinates + paint', () => {
    const out = parseNeighborhoodSignal(
      '[NEIGHBORHOOD] INITIALIZE_PAINTER {"direction":"north","x":"3","y":"4","id":2,"paint":5}',
    );
    expect(out?.value).toBe(NeighborhoodSignalTypes.INITIALIZE_PAINTER);
    expect(out?.detail).toEqual({
      direction: 'north',
      x: '3',
      y: '4',
      id: 2,
      paint: 5,
    });
  });

  it('parses a SHOW_BUCKETS signal with no detail', () => {
    const out = parseNeighborhoodSignal('[NEIGHBORHOOD] SHOW_BUCKETS');
    expect(out).toEqual({
      value: NeighborhoodSignalTypes.SHOW_BUCKETS,
      detail: undefined,
    });
  });

  it('returns null for a non-NEIGHBORHOOD envelope', () => {
    expect(parseNeighborhoodSignal('[TURTLE] MOVE')).toBeNull();
  });

  it('returns null for a plain stdout line', () => {
    expect(parseNeighborhoodSignal('Hello world')).toBeNull();
    expect(parseNeighborhoodSignal('')).toBeNull();
  });

  it('throws on malformed JSON detail (protocol drift, not silent skip)', () => {
    expect(() =>
      parseNeighborhoodSignal('[NEIGHBORHOOD] MOVE {nope}'),
    ).toThrow();
  });
});
