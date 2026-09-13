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

import {promptFor, styleFor} from '../imagePrompts';

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

  it('asks a repeating surface for its shape too', () => {
    // A three-wide platform IS the picture: `set scale` stretches a sprite
    // rather than repeating it, so drawing it square and scaling it is a
    // squashed platform.
    expect(promptFor('tileable', 'ice', {x: 3, y: 2})).toContain(
      'a frame 3 wide by 2 tall',
    );
  });
});

describe('which way it repeats', () => {
  it('asks for all four edges by default', () => {
    expect(promptFor('tileable', 'grass')).toContain('All four edges');
  });

  it('frees the edges it is not asked about, and says so', () => {
    // HALF THE VALUE OF ASKING. Told only that the sides must match, a model
    // makes the whole thing uniform to be safe; told the top need not, it puts
    // grass on it — which is the picture a platformer wanted and the one "every
    // direction" forbids.
    const across = promptFor('tileable', 'earth', undefined, 'across');

    expect(across).toContain('left and right edges must match');
    expect(across).toContain('top and bottom edges need NOT match');
    expect(across).toContain('surface of its own along the top');
  });

  it('turns it the other way for a column', () => {
    const up = promptFor('tileable', 'a stone wall', undefined, 'up');

    expect(up).toContain('top and bottom edges must match');
    expect(up).toContain('left and right edges need');
  });

  it('says nothing about edges for anything that is not repeating', () => {
    expect(promptFor('filled', 'ice', undefined, 'across')).not.toContain(
      'must match',
    );
    expect(promptFor('centered', 'a crab', undefined, 'across')).not.toContain(
      'must match',
    );
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

  it('draws a repeating surface in the shape it will be placed at', () => {
    expect(styleFor('tileable', {x: 3, y: 2}).size).toBe('1536x1024');
  });

  it('leaves a backdrop alone, having no tiles to fill', () => {
    expect(styleFor('background', {x: 1, y: 3}).size).toBe('1536x1024');
  });
});
