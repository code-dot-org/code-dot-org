// The count on the world block.
//
// A world runs every rule the project holds (blockly/projectModules), so the
// block that used to carry a row per mechanic carries a number instead. What
// can be wrong about a number on its own is how it is worded, and "1 rules" is
// the kind of thing that ships.

import {describe, expect, it} from 'vitest';

import {countText} from '../rulesButton';

describe('the world block’s rule count', () => {
  it('says what it means for each of the three cases', () => {
    expect(countText(0)).toBe('no rules');
    expect(countText(1)).toBe('1 rule');
    expect(countText(7)).toBe('7 rules');
  });

  it('says none rather than zero', () => {
    // "0 rules" is arithmetic; "no rules" is an answer. The empty project is
    // also the one most likely to be looking at this block wondering why
    // nothing falls.
    expect(countText(0)).not.toContain('0');
  });
});
