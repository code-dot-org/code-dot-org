// Which `define actor` blocks get a wand, and what it is pointed at.
//
// The button itself needs a workspace with the whole palette registered to say
// anything at all, so what is tested here is the decision. Getting it wrong
// is not cosmetic: a
// wand pointed at the wrong address writes into the wrong file, and one on a
// read-only workspace offers an edit at all.

import {describe, expect, it} from 'vitest';

import {enhanceTarget, type EnhanceContext} from '../enhanceButton';

/** A `define actor` in an actor's own file. */
const inFile: EnhanceContext = {
  actorModule: 'actors/player',
  name: 'Platformer Player',
  flyout: false,
  readOnly: false,
};

/** …and a `define actor` anywhere else, which is about nobody. */
const elsewhere: EnhanceContext = {
  actorModule: undefined,
  name: 'Ball',
  flyout: false,
  readOnly: false,
};

describe('the wand on define actor', () => {
  it('points at the file, for an actor that has one', () => {
    expect(enhanceTarget(inFile)).toEqual({
      kind: 'actor',
      path: 'actors/player',
      name: 'Platformer Player',
    });
  });

  it('is not offered on a define actor outside an actor file', () => {
    // Every actor is a file; a `define actor` anywhere else defines nothing.
    expect(enhanceTarget(elsewhere)).toBeUndefined();
  });

  it('is not offered on a preview in the toolbox', () => {
    // A flyout block is a picture of one you might drag out. Clicking a wand
    // there would enhance an actor that is not in the file yet.
    expect(enhanceTarget({...inFile, flyout: true})).toBeUndefined();
    expect(enhanceTarget({...elsewhere, flyout: true})).toBeUndefined();
  });

  it('is not offered where nothing can be edited', () => {
    // Where it parts company with the open button and the mortarboard beside it:
    // two READ, and a version being previewed can still be looked into. This
    // one writes.
    expect(enhanceTarget({...inFile, readOnly: true})).toBeUndefined();
    expect(enhanceTarget({...elsewhere, readOnly: true})).toBeUndefined();
  });
});
