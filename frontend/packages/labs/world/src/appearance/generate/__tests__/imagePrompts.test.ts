// What is asked for, and in what order.
//
// TWO REPORTED BUGS LIVED HERE, neither in the model. A learner asked for "a
// tileable ground surface … ice that the player is expected to slip upon" and
// got a centred block of ice on transparency, because the Actor Creator
// wrapped every prompt in the clause for a centred subject. Then, with that
// fixed, a learner wanting a mossy platform with vines hanging under it had to
// write "Ignore any further instruction to fill the space" — arguing with our
// own clause, because "surface" implied solid and nothing spelled otherwise.
//
// So what is worth pinning is that each ANSWER reaches the model: that the
// framing arrives before the learner's nouns, that a surface is told which
// edges to join and which to leave alone, and that one asked to be
// see-through is not also told to fill the frame.

import {describe, expect, it} from 'vitest';

import {promptFor, styleFor} from '../imagePrompts';

describe('promptFor', () => {
  it('asks a thing for space round it', () => {
    const asked = promptFor('thing', 'a purple crab');

    expect(asked).toMatch(/^a purple crab\./);
    expect(asked).toContain('fully transparent background');
    expect(asked).toContain('centred');
  });

  it('asks a surface to reach every edge, and says so first', () => {
    // THE ORDER IS THE POINT: a model handed three drawable nouns before
    // anything says what sort of picture this is has already decided.
    const asked = promptFor('surface', 'ice');

    expect(asked).toMatch(/^A flat texture, seen straight on, of: ice\./);
    expect(asked).toContain('edge to edge');
    expect(asked).not.toContain('centred');
  });

  it('refuses the objects a learner is likely to have named', () => {
    // "A tileable ground tile" is how anybody would ask, and a model handed
    // the word draws one. Avoiding the word is not enough.
    const asked = promptFor('surface', 'a ground tile of ice', undefined, {
      ways: 'both',
      through: false,
    });

    expect(asked).toMatch(/^A seamless repeating texture/);
    expect(asked).toContain('draw no tile, no block, no slab');
  });

  it('asks a backdrop for a scene, as it always did', () => {
    const asked = promptFor('background', 'a cave');

    expect(asked).toMatch(/^a cave\./);
    expect(asked).toContain('wide scene');
  });

  it('names the frame a shape wants, where a shape means anything', () => {
    expect(promptFor('thing', 'a totem', {x: 1, y: 3})).toContain(
      'a frame 1 wide by 3 tall',
    );
    // …and one tile is what every actor already is, so it says nothing.
    expect(promptFor('thing', 'a coin', {x: 1, y: 1})).not.toContain('a frame');
  });

  it('asks a surface for its shape too', () => {
    // A three-wide platform IS the picture: `set scale` stretches a sprite
    // rather than repeating it.
    const asked = promptFor('surface', 'ice', {x: 3, y: 2});

    expect(asked).toContain('a frame 3 wide by 2 tall');
  });
});

describe('which edges it joins', () => {
  it('asks for none of them unless told', () => {
    expect(promptFor('surface', 'a wall face')).not.toContain('must match');
  });

  it('frees the edges it is not asked about, and says so', () => {
    // HALF THE VALUE OF ASKING. Told only that the sides must match, a model
    // makes the whole thing uniform to be safe; told the top need not, it puts
    // grass on — which is the picture a platformer wanted and the one "every
    // direction" forbids.
    const across = promptFor('surface', 'earth', undefined, {
      ways: 'across',
      through: false,
    });

    expect(across).toContain('left and right edges must match');
    expect(across).toContain('top and bottom edges need NOT match');
    expect(across).toContain('surface of its own along the top');
  });

  it('turns it the other way for a column', () => {
    const up = promptFor('surface', 'a stone wall', undefined, {
      ways: 'up',
      through: false,
    });

    expect(up).toContain('top and bottom edges must match');
    expect(up).toContain('left and right edges need');
  });

  it('says nothing about edges for a thing', () => {
    expect(
      promptFor('thing', 'a crab', undefined, {ways: 'across', through: false}),
    ).not.toContain('must match');
  });
});

describe('how much of the square it is', () => {
  it('still makes a see-through surface bleed off the edges it joins', () => {
    // THE SECOND REPORT. "It need NOT fill the frame" is true of the axis that
    // is free and FALSE of the axis that joins, and said flatly it licensed
    // exactly what came back: a platform drawn as an object, capped at both
    // ends, sitting in a transparent margin. The learner had written "do not
    // leave any gaps to the left or right" into the box themselves and been
    // overruled by our own clause.
    const asked = promptFor('surface', 'a mossy platform', undefined, {
      ways: 'across',
      through: true,
    });

    expect(asked).toContain('BLEED OFF the left and right edges');
    expect(asked).toContain('no transparent margin at either side');
    expect(asked).not.toContain('need NOT fill the frame');
    // …and the free axis is still free, which is the whole point of asking.
    expect(asked).toContain('Above it and below it');
    expect(asked).toContain('fully transparent');
  });

  it('says a joining surface has no ends, because it came back with two', () => {
    // "The material is the whole picture" is FALSE of a see-through one — half
    // of it is deliberately nothing — and a sentence a model can see is false
    // is one it discounts, taking the useful half with it. What was missing
    // was the reason a platform should not be capped.
    const asked = promptFor('surface', 'a mossy platform', undefined, {
      ways: 'across',
      through: true,
    });

    expect(asked).toContain('no ends of its own');
    expect(asked).toContain('continues past the edges of the picture');
    expect(asked).not.toContain('The material is the whole picture');
  });

  it('names a strip rather than a sprite where it joins', () => {
    // "A flat game sprite" names the very thing that must not be drawn: one
    // object with a silhouette.
    const asked = promptFor('surface', 'a mossy platform', undefined, {
      ways: 'across',
      through: true,
    });

    expect(asked).toMatch(/^A seamless horizontally-repeating strip/);
    expect(asked).not.toContain('game sprite');
  });

  it('tells a see-through surface that joins nothing NOT to fill the frame', () => {
    // THE SENTENCE A LEARNER HAD TO WRITE BY HAND, after arguing with ours:
    // "Ignore any further instruction to fill the space". Right where nothing
    // joins, and only there.
    const asked = promptFor('surface', 'a rock face', undefined, {
      ways: 'none',
      through: true,
    });

    expect(asked).toContain('need NOT fill the frame');
    expect(asked).not.toContain('Fill the entire frame edge to edge');
  });

  it('refuses a background colour, which is what a model reaches for', () => {
    // Asked merely not to fill the frame, a model puts sky behind the vines.
    const asked = promptFor('surface', 'vines', undefined, {
      ways: 'none',
      through: true,
    });

    expect(asked).toContain('fully transparent');
    expect(asked).toContain('no background colour of any kind');
  });

  it('still makes the joining edges reach, transparency or not', () => {
    for (const through of [false, true]) {
      const asked = promptFor('surface', 'a platform', undefined, {
        ways: 'across',
        through,
      });
      expect(asked).toContain('the material must run right off that edge');
    }
  });
});

describe('styleFor', () => {
  it('asks for transparency wherever something must show through', () => {
    expect(styleFor('thing').transparent).toBe(true);
    expect(styleFor('surface').transparent).toBe(false);
    expect(styleFor('background').transparent).toBe(false);
    // …and the combination the old kinds could not spell: material, with a
    // hole in it. The words alone cannot get this; the provider has to be told.
    expect(
      styleFor('surface', undefined, {ways: 'across', through: true})
        .transparent,
    ).toBe(true);
  });

  it('draws a shaped subject in that shape', () => {
    expect(styleFor('thing', {x: 3, y: 1}).size).toBe('1536x1024');
    expect(styleFor('thing', {x: 1, y: 3}).size).toBe('1024x1536');
  });

  it('draws a surface in the shape it will be placed at', () => {
    expect(styleFor('surface', {x: 3, y: 2}).size).toBe('1536x1024');
  });

  it('leaves a backdrop alone, having no tiles to fill', () => {
    expect(styleFor('background', {x: 1, y: 3}).size).toBe('1536x1024');
  });
});
