// What a `play animation` block may name.
//
// The animations of the actor whose file the block is in, by the names it
// keeps them under (specs/ANIMATION_PLAN.md). An animation is its kind's, so
// there is nothing else to offer, and no row that fetches one: an animation
// is added to an actor in the Actor Editor.

import {afterEach, describe, expect, it} from 'vitest';

import {animationOptions, setKindAnimations} from '../animationOptions';

// Registry is module state; reset it between cases.
afterEach(() => setKindAnimations({}));

describe('animationOptions', () => {
  it('names what is missing, with an empty value', () => {
    // A fresh block takes its first option as its value; an empty one leaves
    // it unfinished, and generating nothing, until somebody chooses.
    expect(animationOptions()).toEqual([['(no animations yet)', '']]);
    expect(animationOptions('actors/coin')).toEqual([
      ['(no animations yet)', ''],
    ]);
  });

  it('offers the actor’s own, by the names it gave them', () => {
    setKindAnimations({'actors/coin': ['Main', 'Spin']});
    expect(animationOptions('actors/coin')).toEqual([
      ['Main', 'Main'],
      ['Spin', 'Spin'],
    ]);
  });

  it('offers nobody else’s', () => {
    // A Coin's Main is the Coin's, and a block in another file is not
    // offered it.
    setKindAnimations({'actors/coin': ['Main', 'Spin']});
    expect(animationOptions('actors/gem')).toEqual([
      ['(no animations yet)', ''],
    ]);
  });

  it('has no import row', () => {
    setKindAnimations({'actors/coin': ['Main']});
    expect(animationOptions('actors/coin').map(([text]) => text)).not.toContain(
      '(import…)',
    );
  });
});
