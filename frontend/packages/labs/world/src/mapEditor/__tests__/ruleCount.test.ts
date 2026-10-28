// The count of the rules a game runs, as the Main Screen's properties say it.

import {describe, expect, it} from 'vitest';

import {countText} from '../ruleCount';

describe('the game’s rule count', () => {
  it('says what it means for each of the three cases', () => {
    expect(countText(0)).toBe('no rules');
    expect(countText(1)).toBe('1 rule');
    expect(countText(7)).toBe('7 rules');
  });

  it('says none rather than zero', () => {
    // "0 rules" is arithmetic; "no rules" is an answer.
    expect(countText(0)).not.toContain('0');
  });
});
