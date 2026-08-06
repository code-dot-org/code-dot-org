// Which layer a placement lands in, and where the default sits in the stack.
//
// Slice two of specs/VIEWPORT.md: the authoring half. A layer OWNS ITS CONTENTS
// — a placement inside `define layer` is placed in it — so the answer is the
// block's ancestor rather than ambient state a preceding block set. `within
// layer` is the reopener for the one case containment cannot reach.

import {describe, expect, it} from 'vitest';

import type {Blockly} from '@code-dot-org/blockly';

import {DEFAULT_LAYER_ID} from '../../engine/core/Layer';
import {
  layerId,
  layerIdFromValue,
  layerOf,
  layerPlan,
  layerValue,
} from '../layers';

/**
 * A block chain, innermost first.
 *
 * Two ways a block can sit under another, and telling them apart is the whole
 * point of this helper: INSIDE a `do` mouth, or chained BELOW in the same
 * stack. Blockly makes the second a parent relationship too — `getParent()` on
 * a statement returns the statement above it — so a block written after a
 * `define layer` has that layer as its parent while plainly sitting outside it.
 * `getSurroundParent()` skips those siblings, and that is what `layerOf` walks.
 *
 * Mark an entry `after: true` to say it is chained below its superior rather
 * than nested inside it.
 */
function chain(
  ...blocks: Array<
    string | {type: string; id?: string; layer?: string; after?: boolean}
  >
): Blockly.Block {
  let parent: Blockly.Block | null = null;
  let parentSurround: Blockly.Block | null = null;
  for (const entry of [...blocks].reverse()) {
    const spec = typeof entry === 'string' ? {type: entry} : entry;
    const superior = parent;
    // Chained below its superior ⇒ whatever surrounds the superior surrounds
    // this too. Nested inside it ⇒ the superior is what surrounds it.
    const surround: Blockly.Block | null = spec.after
      ? parentSurround
      : superior;
    parent = {
      type: spec.type,
      id: spec.id ?? spec.type,
      getParent: () => superior,
      getSurroundParent: () => surround,
      getFieldValue: (name: string) =>
        name === 'LAYER' ? (spec.layer ?? null) : null,
      // `within layer` looks its target up to see whether it still exists.
      workspace: {getBlockById: (id: string) => (id ? {id} : null)},
    } as unknown as Blockly.Block;
    parentSurround = surround;
  }
  return parent as Blockly.Block;
}

describe('the layer a placement lands in', () => {
  it('is the default when nothing encloses it', () => {
    expect(layerOf(chain('world_add_actor', 'world_world'))).toBe(
      DEFAULT_LAYER_ID,
    );
  });

  it('is the layer whose body it sits in', () => {
    const block = chain(
      'world_add_actor',
      {type: 'world_define_layer', id: 'sky'},
      'world_world',
    );

    expect(layerOf(block)).toBe(layerId('sky'));
  });

  it('is that layer however deeply nested', () => {
    const block = chain(
      'world_add_actor',
      'controls_if',
      {type: 'world_define_layer', id: 'sky'},
      'world_world',
    );

    expect(layerOf(block)).toBe(layerId('sky'));
  });

  it('is the one a `within layer` names', () => {
    const block = chain('world_load_map', {
      type: 'world_within_layer',
      layer: layerValue('hud'),
    });

    expect(layerOf(block)).toBe(layerId('hud'));
  });

  it('is the innermost of two that enclose it', () => {
    // Stated rather than left to be discovered.
    const block = chain(
      'world_add_actor',
      {type: 'world_within_layer', layer: layerValue('hud')},
      {type: 'world_define_layer', id: 'sky'},
      'world_world',
    );

    expect(layerOf(block)).toBe(layerId('hud'));
  });

  it('is NOT the layer a block merely sits BELOW', () => {
    // The bug this helper exists to catch. `add actor` chained under a
    // `define layer` — outside its `do` mouth, plainly after it — was landing
    // in that layer, because Blockly makes the block above a block its parent.
    const block = chain(
      {type: 'world_add_actor', after: true},
      {type: 'world_define_layer', id: 'sky'},
      'world_world',
    );

    expect(layerOf(block)).toBe(DEFAULT_LAYER_ID);
  });

  it('is the enclosing layer when one sits below another inside it', () => {
    // Chained after an inner layer but still inside an outer one: the sibling
    // above is skipped, the enclosing layer is not.
    const block = chain(
      {type: 'world_add_actor', after: true},
      {type: 'world_define_layer', id: 'inner'},
      {type: 'world_define_layer', id: 'outer'},
      'world_world',
    );

    expect(layerOf(block)).toBe(layerId('outer'));
  });

  it('is the default when a `within layer` names a deleted definition', () => {
    // The value outlives the block it names. Placing into nothing is not an
    // option, so it places somewhere visible.
    const block = chain('world_add_actor', {
      type: 'world_within_layer',
      layer: layerValue(''),
    });

    expect(layerOf(block)).toBe(DEFAULT_LAYER_ID);
  });
});

describe('the slot blocks', () => {
  it('paint the layer they are written in', () => {
    // `set background` / `set foreground` name their layer for the same reason
    // a placement does: the block's ancestor is the answer, so fogging inside
    // a `define layer` fogs that layer and nothing else.
    const block = chain('world_set_foreground', {
      type: 'world_define_layer',
      id: 'game',
    });

    expect(layerOf(block)).toBe(layerId('game'));
  });
});

describe('resolving a LAYER dropdown value', () => {
  it('is the layer the value names', () => {
    const block = chain({type: 'world_all_actors_in_layer', id: 'q'});

    expect(layerIdFromValue(block, layerValue('game'))).toBe(layerId('game'));
  });

  it('is the default for the bare value an empty world offers', () => {
    // With no `define layer` in the workspace the dropdown offers the default
    // outright, so the value is not prefixed at all.
    const block = chain({type: 'world_all_actors_in_layer', id: 'q'});

    expect(layerIdFromValue(block, DEFAULT_LAYER_ID)).toBe(DEFAULT_LAYER_ID);
  });

  it('is the default when the definition it names has gone', () => {
    // A dropdown value outlives the block it names; answering "no layer" is
    // not an option, so it answers with the one every world has.
    const block = chain({type: 'world_all_actors_in_layer', id: 'q'});

    expect(layerIdFromValue(block, layerValue(''))).toBe(DEFAULT_LAYER_ID);
  });
});

describe('the layer plan a world declares', () => {
  /** A `define world` whose next-chain is the given blocks, in order. */
  const world = (
    ...body: Array<string | {type: string; id?: string}>
  ): Blockly.Block => {
    const built = body.map(entry => {
      const spec = typeof entry === 'string' ? {type: entry} : entry;
      return {
        type: spec.type,
        id: spec.id ?? spec.type,
        getChildren: () => [],
        getNextBlock: () => null,
      } as unknown as Blockly.Block & {getNextBlock: () => unknown};
    });
    built.forEach((block, index) => {
      const next = built[index + 1] ?? null;
      (block as {getNextBlock: () => unknown}).getNextBlock = () => next;
    });
    return {
      type: 'world_world',
      getNextBlock: () => built[0] ?? null,
    } as unknown as Blockly.Block;
  };

  /** The plan's ids, which is what most of these are about. */
  const ids = (block: Blockly.Block) => layerPlan(block).map(entry => entry.id);

  it('is empty for a world that declares none', () => {
    expect(ids(world('world_use_rule', 'world_add_actor'))).toEqual([
      DEFAULT_LAYER_ID,
    ]);
  });

  it('is the layers in declaration order, which is depth', () => {
    expect(
      ids(
        world(
          {type: 'world_define_layer', id: 'sky'},
          {type: 'world_define_layer', id: 'game'},
        ),
      ),
    ).toEqual([layerId('sky'), layerId('game')]);
  });

  it('puts the default where the first unplaced placement is', () => {
    // The whole point of choosing this over pinning it to the bottom: a Sky
    // declared above draws behind, an Interface declared below draws in front.
    expect(
      ids(
        world({type: 'world_define_layer', id: 'sky'}, 'world_add_actor', {
          type: 'world_define_layer',
          id: 'hud',
        }),
      ),
    ).toEqual([layerId('sky'), DEFAULT_LAYER_ID, layerId('hud')]);
  });

  it('adds the default once, however many placements are loose', () => {
    expect(
      ids(world('world_add_actor', 'world_load_map', 'world_create_in_map')),
    ).toEqual([DEFAULT_LAYER_ID]);
  });

  it('does not count placements that belong to a layer', () => {
    // A `define layer` holding every placement needs no default at all — the
    // world has one anyway (the engine supplies it), it just is not declared.
    expect(ids(world({type: 'world_define_layer', id: 'game'}))).toEqual([
      layerId('game'),
    ]);
  });

  it('names no layer twice', () => {
    const plan = ids(
      world(
        {type: 'world_define_layer', id: 'sky'},
        'world_add_actor',
        'world_add_actor',
      ),
    );

    expect(new Set(plan).size).toBe(plan.length);
  });
});
