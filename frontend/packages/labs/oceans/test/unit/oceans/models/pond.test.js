import {describe, it, expect} from 'vitest';

import {arrangeFish} from '../../../../src/oceans/models/pond';

/** Creates a minimal mock fish object for arrangeFish tests. */
function mockFish() {
  let position = null;
  return {
    setXY(pos) {
      position = pos;
    },
    getXY() {
      return position;
    },
  };
}

describe('arrangeFish', () => {
  it('assigns distinct x/y positions to each fish', () => {
    const fishes = Array.from({length: 5}, () => mockFish());
    arrangeFish(fishes);
    const positions = fishes.map(f => f.getXY());
    // Every fish should have been given a position object.
    positions.forEach(pos => {
      expect(pos).not.toBeNull();
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
    });
    // All positions should be distinct.
    const posStrings = positions.map(p => `${p.x},${p.y}`);
    expect(new Set(posStrings).size).toBe(5);
  });

  it('handles empty fish array without throwing', () => {
    expect(() => arrangeFish([])).not.toThrow();
  });

  it('can arrange the maximum pond size', () => {
    const fishes = Array.from({length: 20}, () => mockFish());
    arrangeFish(fishes);
    fishes.forEach(f => expect(f.getXY()).not.toBeNull());
  });
});
