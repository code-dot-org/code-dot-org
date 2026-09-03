// Which `define actor` blocks get a wand, and what it is pointed at.
//
// The button itself needs a workspace with the whole palette registered to say
// anything at all, so what is tested here is the decision — the same split
// `rulesButton` makes for its wording. Getting it wrong is not cosmetic: a
// wand pointed at the wrong address writes into the wrong file, and one on a
// read-only workspace offers an edit at all.

import {describe, expect, it} from 'vitest';

import {enhanceTarget, type EnhanceContext} from '../enhanceButton';

/** A `define actor` in an actor's own file. */
const inFile: EnhanceContext = {
  actorModule: 'actors/player',
  fileModule: 'actors/player',
  world: false,
  blockId: 'defBlock',
  name: 'Platformer Player',
  flyout: false,
  readOnly: false,
};

/** …and one among a world's own roots, which has no file of its own. */
const inWorld: EnhanceContext = {
  actorModule: undefined,
  fileModule: 'worlds/main',
  world: true,
  blockId: 'platformerBallDef',
  name: 'Ball',
  flyout: false,
  readOnly: false,
};

describe('the wand on define actor', () => {
  it('points at the file, for an actor that has one', () => {
    expect(enhanceTarget(inFile)).toEqual({
      path: 'actors/player',
      name: 'Platformer Player',
    });
  });

  it('points at the world AND the block, for an actor it defines', () => {
    // No file to name it by, so it is named the way everything else names one:
    // the world it is written in, and the block that defines it
    // (`blockly/localActors`).
    expect(enhanceTarget(inWorld)).toEqual({
      path: 'worlds/main',
      block: 'platformerBallDef',
      name: 'Ball',
    });
  });

  it('is not offered where the file is neither', () => {
    // A `.rule` has no actor for this to be about, and a workspace the editor
    // has not told anything is one it cannot write into.
    expect(
      enhanceTarget({...inWorld, world: false, fileModule: 'rules/gravity'}),
    ).toBeUndefined();
    expect(enhanceTarget({...inWorld, fileModule: undefined})).toBeUndefined();
  });

  it('is not offered on a preview in the toolbox', () => {
    // A flyout block is a picture of one you might drag out. Clicking a wand
    // there would enhance an actor that is not in the file yet.
    expect(enhanceTarget({...inFile, flyout: true})).toBeUndefined();
    expect(enhanceTarget({...inWorld, flyout: true})).toBeUndefined();
  });

  it('is not offered where nothing can be edited', () => {
    // Where it parts company with the eye and the mortarboard beside it: those
    // two READ, and a version being previewed can still be looked into. This
    // one writes.
    expect(enhanceTarget({...inFile, readOnly: true})).toBeUndefined();
    expect(enhanceTarget({...inWorld, readOnly: true})).toBeUndefined();
  });
});
