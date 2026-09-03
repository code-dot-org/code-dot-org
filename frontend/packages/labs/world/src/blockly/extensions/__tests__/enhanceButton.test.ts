// Which `define actor` blocks get a wand.
//
// The button itself needs a workspace with the whole palette registered to say
// anything at all, so what is tested here is the decision — the same split
// `rulesButton` makes for its wording. Getting this wrong is not a cosmetic
// bug: a wand on a block whose actor has no file offers an edit that cannot
// land anywhere, and one on a read-only workspace offers an edit at all.

import {describe, expect, it} from 'vitest';

import {offersEnhancing} from '../enhanceButton';

const inFile = {module: 'actors/player', flyout: false, readOnly: false};

describe('the wand on define actor', () => {
  it('is offered in an actor’s own file', () => {
    expect(offersEnhancing(inFile)).toBe(true);
  });

  it('is not offered in a world', () => {
    // A world's `define actor` defines an actor the world keeps to itself,
    // with no file of its own — and every edit an enhancement makes lands in
    // a file. The workspace says which case it is by naming the actor it
    // edits, or naming none (`blockly/editingRule`).
    expect(offersEnhancing({...inFile, module: undefined})).toBe(false);
  });

  it('is not offered on a preview in the toolbox', () => {
    // A flyout block is a picture of one you might drag out. Clicking a wand
    // there would enhance the file behind a block that is not in it yet.
    expect(offersEnhancing({...inFile, flyout: true})).toBe(false);
  });

  it('is not offered where nothing can be edited', () => {
    // Where it parts company with the eye and the mortarboard beside it: those
    // two READ, and a version being previewed can still be looked into. This
    // one writes.
    expect(offersEnhancing({...inFile, readOnly: true})).toBe(false);
  });
});
