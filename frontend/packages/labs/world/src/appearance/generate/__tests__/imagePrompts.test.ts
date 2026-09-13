// What is asked for, and in what order.
//
// THE REPORTED BUG WAS HERE and not in the model. A learner asked for "a
// tileable ground surface … ice that the player is expected to slip upon" and
// got a centred block of ice on transparency, because the Actor Creator wrapped
// every prompt in the clause for a centred subject — "draw only the subject,
// centred … no ground". So what is worth pinning is that each kind asks for the
// composition it names, and that the framing arrives before the learner's
// nouns do.

import {describe, expect, it} from 'vitest';

import {promptFor, styleFor, takesAShape} from '../imagePrompts';

describe('promptFor', () => {
  it('asks a centred subject for space round it', () => {
    const asked = promptFor('centered', 'a purple crab');

    expect(asked).toMatch(/^a purple crab\./);
    expect(asked).toContain('fully transparent background');
    expect(asked).toContain('centred');
  });

  it('asks a surface to reach every edge, and says so first', () => {
    // THE ORDER IS THE POINT: a model handed three drawable nouns before
    // anything says what sort of picture this is has already decided.
    const asked = promptFor('filled', 'ice');

    expect(asked).toMatch(/^A flat texture, seen straight on, of: ice\./);
    expect(asked).toContain('edge to edge');
    expect(asked).not.toContain('centred');
    expect(asked).not.toContain('transparent background');
  });

  it('refuses the objects a learner is likely to have named', () => {
    // "A tileable ground tile" is how anybody would ask, and a model handed
    // the word draws one. Avoiding the word is not enough; the clause says no
    // to it by name.
    const asked = promptFor('tileable', 'a tileable ground tile of ice');

    expect(asked).toMatch(/^A seamless repeating texture/);
    expect(asked).toContain('no visible seam');
    expect(asked).toContain('Draw no tile, no block, no slab');
  });

  it('asks a backdrop for a scene, as it always did', () => {
    const asked = promptFor('background', 'a cave');

    expect(asked).toMatch(/^a cave\./);
    expect(asked).toContain('wide scene');
  });

  it('names the frame a shape wants, where a shape means anything', () => {
    expect(promptFor('centered', 'a totem', {x: 1, y: 3})).toContain(
      'a frame 1 wide by 3 tall',
    );
    // …and one tile is what every actor already is, so it says nothing.
    expect(promptFor('centered', 'a coin', {x: 1, y: 1})).not.toContain(
      'a frame',
    );
  });

  it('says nothing about shape for a surface that repeats', () => {
    // The repeat unit is one square: more of the surface is made by placing
    // more of it, not by drawing a wider picture.
    expect(promptFor('tileable', 'ice', {x: 3, y: 1})).not.toContain('a frame');
  });
});

describe('styleFor', () => {
  it('asks for transparency only where something is meant to show through', () => {
    expect(styleFor('centered').transparent).toBe(true);
    expect(styleFor('filled').transparent).toBe(false);
    expect(styleFor('tileable').transparent).toBe(false);
    expect(styleFor('background').transparent).toBe(false);
  });

  it('draws a shaped subject in that shape', () => {
    expect(styleFor('centered', {x: 3, y: 1}).size).toBe('1536x1024');
    expect(styleFor('centered', {x: 1, y: 3}).size).toBe('1024x1536');
  });

  it('keeps a repeating surface square whatever it is asked', () => {
    // A seam only means anything if the picture IS the tile.
    expect(styleFor('tileable', {x: 3, y: 1}).size).toBe('1024x1024');
    expect(takesAShape('tileable')).toBe(false);
    expect(takesAShape('background')).toBe(false);
    expect(takesAShape('filled')).toBe(true);
  });
});
