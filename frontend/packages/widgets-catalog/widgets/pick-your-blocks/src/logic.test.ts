import { describe, expect, it } from 'vitest';
import { ITEMS } from './data';
import { isToolCorrect } from './logic';

describe('isToolCorrect', () => {
  it('accepts each item\'s correct tool', () => {
    expect(isToolCorrect(ITEMS[0], 'sequence')).toBe(true);
    expect(isToolCorrect(ITEMS[1], 'loop')).toBe(true);
    expect(isToolCorrect(ITEMS[2], 'conditional')).toBe(true);
    expect(isToolCorrect(ITEMS[3], 'function')).toBe(true);
  });

  it('rejects any other tool', () => {
    expect(isToolCorrect(ITEMS[0], 'loop')).toBe(false);
    expect(isToolCorrect(ITEMS[1], 'function')).toBe(false);
    expect(isToolCorrect(ITEMS[2], 'sequence')).toBe(false);
    expect(isToolCorrect(ITEMS[3], 'conditional')).toBe(false);
  });
});
