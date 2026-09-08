// The `acts like` dropdown, and the choices it leaves out.
//
// A cycle here is not a loop, it is a project that will not load: each row
// compiles to an import of the other actor's module, so two actors acting like
// each other are two modules importing each other — resolved to `undefined` at
// whichever end runs first, and the game dies reading a builder that is not
// there before anything is on screen. `use rule` leaves the rule being edited
// out of its own dropdown for the same reason; this has to look further,
// because the chain can be longer than one.

import {beforeEach, describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {setEditingActor} from '../editingRule';
import {
  actorParentOptions,
  setActorParents,
  setProjectActors,
} from '../moduleOptions';

/** A dropdown field on a block in a workspace editing `path`. */
const asking = (path: string) => {
  const workspace = new Blockly.Workspace();
  setEditingActor(workspace, path);
  const field = new Blockly.FieldDropdown([['x', 'x']]);
  const block = {workspace} as unknown as Blockly.Block;
  (field as unknown as {getSourceBlock: () => unknown}).getSourceBlock = () =>
    block;
  return field;
};

const offered = (path: string) =>
  actorParentOptions(asking(path)).map(([, value]) => value);

describe('what `acts like` offers', () => {
  beforeEach(() => {
    setProjectActors([
      ['Bar', 'actors/bar'],
      ['Fuel Bar', 'actors/fuelBar'],
      ['Health Bar', 'actors/healthBar'],
      ['Coin', 'actors/coin'],
    ]);
  });

  it('leaves out the actor being edited', () => {
    setActorParents({});
    expect(offered('actors/bar')).not.toContain('actors/bar');
    expect(offered('actors/bar')).toContain('actors/fuelBar');
  });

  it('leaves out anything that already acts like it, however far away', () => {
    // `healthBar → fuelBar → bar`. Editing the Bar, neither of the two below
    // it may be named: both would close the ring.
    setActorParents({
      'actors/healthBar': 'actors/fuelBar',
      'actors/fuelBar': 'actors/bar',
    });

    expect(offered('actors/bar')).toEqual(['actors/coin']);
    // …and from the other end nothing is in the way: the Fuel Bar may act like
    // the Bar, which is what it already does.
    expect(offered('actors/healthBar')).toContain('actors/bar');
  });

  it('does not hang on a cycle already saved in the project', () => {
    // Two actors acting like each other is a file the dropdown would not have
    // written and a project may hold anyway — pasted, or renamed into it. The
    // walk has to END, and it is not this dropdown's job to fix a ring it is
    // not part of: the Coin may still act like either, because doing so closes
    // nothing that is not already closed.
    setActorParents({
      'actors/bar': 'actors/fuelBar',
      'actors/fuelBar': 'actors/bar',
    });

    expect(offered('actors/coin')).toEqual([
      'actors/bar',
      'actors/fuelBar',
      'actors/healthBar',
    ]);
  });
});
