// The definition a file is about stays first and in place (`pinnedRoots`,
// specs/LAZY_WORKSPACE_PLAN.md) — and the file never hears about it.

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import {isPinnedRoot, pinRoots, withoutPins} from '../pinnedRoots';
import {arrangeTopBlocks, orderKeys} from '../tidyLayout';

describe('the file’s own definition', () => {
  beforeAll(() => {
    Blockly.defineBlocksWithJsonArray([
      {type: 'world_actor', message0: 'define actor', nextStatement: null},
      {type: 'hat', message0: 'when', nextStatement: null},
    ]);
  });

  const DOCUMENT = {
    blocks: {
      languageVersion: 0,
      blocks: [
        {type: 'hat', id: 'hat', x: 20, y: 20},
        {type: 'world_actor', id: 'actor', x: 20, y: 200},
      ],
    },
  };

  it('is the four definitions, and nothing else', () => {
    expect(
      ['world_actor', 'world_world', 'world_rule', 'world_map'].every(
        isPinnedRoot,
      ),
    ).toBe(true);
    expect(isPinnedRoot('world_rule_trait')).toBe(false);
  });

  it('cannot be moved or deleted, and a handler still can', () => {
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(DOCUMENT as never, workspace);
    pinRoots(workspace.getTopBlocks(false));
    const actor = workspace.getBlockById('actor')!;
    expect(actor.isMovable()).toBe(false);
    expect(actor.isDeletable()).toBe(false);
    expect(workspace.getBlockById('hat')!.isMovable()).toBe(true);
  });

  it('saves as the file was, without the pins', () => {
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(DOCUMENT as never, workspace);
    const before = Blockly.serialization.workspaces.save(workspace);
    pinRoots(workspace.getTopBlocks(false));
    const pinned = Blockly.serialization.workspaces.save(workspace);
    // Blockly writes them; the file must not carry them.
    expect(JSON.stringify(pinned)).toContain('"movable":false');
    expect(withoutPins(pinned as never)).toEqual(before);
  });

  it('is laid out first, whatever is above it', () => {
    const boxes = [
      {x: 20, y: 20, width: 300, height: 100},
      {x: 20, y: 200, width: 300, height: 100},
    ];
    const places = arrangeTopBlocks(
      boxes,
      orderKeys(
        ['hat', 'actor'],
        boxes,
        new Map(),
        new Set(['hat']),
        new Set(['actor']),
      ),
    );
    expect(places[1]).toEqual({x: 20, y: 20});
    expect(places[0].y).toBeGreaterThan(places[1].y);
  });
});
