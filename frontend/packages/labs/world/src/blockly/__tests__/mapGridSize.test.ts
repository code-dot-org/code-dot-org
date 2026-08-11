// How wide the arrangement grid draws itself.
//
// A static read of a runtime value, so what is worth pinning is the FALLBACK:
// every case this cannot answer has to come back as one screen rather than as
// zero, NaN, or a grid with four thousand buttons in it. A grid that is too
// small only limits where you can click; a grid that is wrong in the other
// directions is a frozen tab.

import {describe, expect, it} from 'vitest';

import {VIEWPORT_TILES} from '../../runtime/viewport';
import {mapGridSize} from '../fields/mapGridSize';

/** A stand-in for the Blockly blocks this reads, which is all it touches. */
const workspaceWith = (declarations: Array<Record<string, unknown>>) => {
  const blocks = declarations.map(inputs => ({
    type: 'world_set_map_size',
    isInsertionMarker: () => false,
    getInputTargetBlock: (name: string) => inputs[name] ?? null,
  }));
  return {
    workspace: {getBlocksByType: () => blocks},
  } as unknown as Parameters<typeof mapGridSize>[0];
};

const literal = (value: unknown) => ({
  type: 'math_number',
  getFieldValue: () => value,
});

describe('mapGridSize', () => {
  it('is one screen when nothing says otherwise', () => {
    // Every world that predates the block, which is most of them.
    expect(mapGridSize(workspaceWith([]))).toEqual({
      columns: VIEWPORT_TILES,
      rows: VIEWPORT_TILES,
    });
    expect(mapGridSize(null)).toEqual({
      columns: VIEWPORT_TILES,
      rows: VIEWPORT_TILES,
    });
  });

  it('reads the tiles a declaration was given', () => {
    expect(
      mapGridSize(workspaceWith([{X: literal(48), Y: literal(10)}])),
    ).toEqual({columns: 48, rows: 10});
  });

  it('falls back per axis, not per block', () => {
    // Half a declaration is the state a block is in while it is being written,
    // and the axis that WAS given should still be honoured.
    expect(mapGridSize(workspaceWith([{X: literal(30)}]))).toEqual({
      columns: 30,
      rows: VIEWPORT_TILES,
    });
  });

  it('ignores a size it cannot read', () => {
    // A computed size — `x of ⟨map size⟩` — is a real thing to write and not a
    // mistake; the grid simply cannot know it, so it says one screen rather
    // than guessing.
    const computed = {type: 'world_map_size', getFieldValue: () => null};
    expect(mapGridSize(workspaceWith([{X: computed, Y: literal(10)}]))).toEqual(
      {columns: VIEWPORT_TILES, rows: 10},
    );
  });

  it('refuses a size that would make an unusable grid', () => {
    // Zero and negatives are what a half-typed number looks like; the cap is
    // what stops a legitimate 500-tile level rendering half a million buttons.
    expect(
      mapGridSize(workspaceWith([{X: literal(0), Y: literal(-4)}])),
    ).toEqual({columns: VIEWPORT_TILES, rows: VIEWPORT_TILES});
    expect(mapGridSize(workspaceWith([{X: literal(5000)}])).columns).toBe(64);
  });

  it('takes the first declaration when a world makes several', () => {
    expect(
      mapGridSize(
        workspaceWith([{X: literal(20), Y: literal(20)}, {X: literal(40)}]),
      ),
    ).toEqual({columns: 20, rows: 20});
  });
});
