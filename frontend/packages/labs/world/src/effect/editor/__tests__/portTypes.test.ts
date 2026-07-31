import {describe, expect, it} from 'vitest';

import {portOffset} from '../portTypes';

describe('portOffset', () => {
  it('centres a lone port on the edge', () => {
    expect(portOffset(0, 1)).toBe('50%');
  });

  it('spreads ports evenly without crowding the corners', () => {
    expect([0, 1].map(index => portOffset(index, 2))).toEqual(['25%', '75%']);
  });

  it('gives every port on a Split node its own place', () => {
    // Four distinct offsets is the whole fix: React Flow's own handle rules
    // outrank a CSS module class, so without an inline `left` per port all
    // four dots stack at the edge midpoint and the X/Y/Z/W labels point at
    // nothing.
    const offsets = [0, 1, 2, 3].map(index => portOffset(index, 4));

    expect(offsets).toEqual(['12.5%', '37.5%', '62.5%', '87.5%']);
    expect(new Set(offsets).size).toBe(4);
  });
});
