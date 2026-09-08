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

/**
 * A `define actor` block, as much of one as this dropdown asks about.
 *
 * Faked rather than made with `newBlock`, because a real one needs the whole
 * domain palette registered and what is being tested is four field reads. The
 * surface is small and named here so a change to it fails loudly.
 */
interface FakeActor {
  id: string;
  type: string;
  name: string;
  /** The block id this one acts like, if any. */
  parent?: string;
}

const asBlock = (
  actor: FakeActor,
  workspace: Blockly.Workspace,
): Blockly.Block =>
  ({
    id: actor.id,
    type: actor.type,
    workspace,
    getParent: () => null,
    getFieldValue: (name: string) => (name === 'NAME' ? actor.name : ''),
    // The chain under it, which for these holds one `acts like` row at most.
    getNextBlock: () =>
      actor.parent
        ? ({
            type: 'world_acts_like',
            getFieldValue: (name: string) =>
              name === 'ACTOR' ? `local:${actor.parent}` : '',
            getNextBlock: () => null,
          } as unknown as Blockly.Block)
        : null,
  }) as unknown as Blockly.Block;

/** A dropdown field on a block in a workspace editing `path`. */
const asking = (path: string, locals: FakeActor[] = [], mine?: string) => {
  const workspace = new Blockly.Workspace();
  setEditingActor(workspace, path);
  const blocks = locals.map(actor => asBlock(actor, workspace));
  const byId = new Map(blocks.map(block => [block.id, block]));
  (workspace as unknown as {getTopBlocks: () => Blockly.Block[]}).getTopBlocks =
    () => blocks;
  (
    workspace as unknown as {getBlockById: (id: string) => Blockly.Block | null}
  ).getBlockById = (id: string) => byId.get(id) ?? null;

  const field = new Blockly.FieldDropdown([['x', 'x']]);
  // The block the field is ON: one of the locals when a world is asking, and
  // a bare block in a `.actor` file, which defines no local actors at all.
  const source = mine
    ? byId.get(mine)!
    : ({workspace, getParent: () => null} as unknown as Blockly.Block);
  (field as unknown as {getSourceBlock: () => unknown}).getSourceBlock = () =>
    source;
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

  it('offers the actors beside it, when a world is asking', () => {
    // A world's own actors are `const`s in one module rather than files, and
    // one may act like another — which is the only way two actors in a
    // single-world project can share anything (`assembleWorldModule` orders
    // them so a parent is bound first).
    setActorParents({});
    const locals = [
      {id: 'barDef', type: 'world_actor', name: 'Bar'},
      {id: 'gaugeDef', type: 'world_actor', name: 'Gauge', parent: 'barDef'},
      {id: 'signDef', type: 'world_actor', name: 'Sign'},
    ];
    const offered = (mine: string) =>
      actorParentOptions(asking('worlds/main', locals, mine)).map(
        ([, value]) => value,
      );

    // The Sign may be either of the others, and the files as well.
    expect(offered('signDef')).toEqual([
      'local:barDef',
      'local:gaugeDef',
      'actors/bar',
      'actors/fuelBar',
      'actors/healthBar',
      'actors/coin',
    ]);
    // …but the Bar may not be the Gauge, which already acts like it: itself is
    // left out, and so is anything that reaches it.
    expect(offered('barDef')).toEqual([
      'local:signDef',
      'actors/bar',
      'actors/fuelBar',
      'actors/healthBar',
      'actors/coin',
    ]);
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
