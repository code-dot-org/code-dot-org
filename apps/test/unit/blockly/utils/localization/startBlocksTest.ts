import * as BlocklyCore from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';

import {
  normalizeWorkspaceState,
  restoreTopBlockPositions,
} from '@cdo/apps/blockly/utils/localization/startBlocks';

BlocklyCore.setLocale(En as unknown as {[key: string]: string});

function keyOf(xml: string): string {
  const workspace = new BlocklyCore.Workspace();
  BlocklyCore.Xml.domToWorkspace(
    BlocklyCore.utils.xml.textToDom(xml),
    workspace
  );
  const key = normalizeWorkspaceState(
    BlocklyCore.serialization.workspaces.save(workspace)
  );
  workspace.dispose();
  return key;
}

function program({
  x = 10,
  text = 'Hello',
  variable = 'score',
  disabled = false,
} = {}): string {
  return (
    '<xml>' +
    '<variables><variable>score</variable><variable>lives</variable></variables>' +
    `<block type="variables_set" x="${x}" y="20"${
      disabled ? ' disabled="true"' : ''
    }>` +
    `<field name="VAR">${variable}</field>` +
    `<value name="VALUE"><block type="text"><field name="TEXT">${text}</field></block></value>` +
    '</block></xml>'
  );
}

describe('normalizeWorkspaceState', () => {
  it('gives two loads of the same blocks the same key', () => {
    expect(keyOf(program())).toEqual(keyOf(program()));
  });

  it('ignores position and disabled state', () => {
    expect(keyOf(program({x: 300, disabled: true}))).toEqual(keyOf(program()));
  });

  it('sees a changed field', () => {
    expect(keyOf(program({text: 'Goodbye'}))).not.toEqual(keyOf(program()));
  });

  it('sees a field switched to another variable', () => {
    expect(keyOf(program({variable: 'lives'}))).not.toEqual(keyOf(program()));
  });

  it('does not depend on key order', () => {
    expect(normalizeWorkspaceState({a: 1, b: {c: 2, d: 3}})).toEqual(
      normalizeWorkspaceState({b: {d: 3, c: 2}, a: 1})
    );
  });
});

describe('restoreTopBlockPositions', () => {
  function fakeBlock(type: string, x: number, y: number) {
    const block = {
      type,
      x,
      y,
      getRelativeToSurfaceXY: () => ({x: block.x, y: block.y}),
      moveBy: (dx: number, dy: number) => {
        block.x += dx;
        block.y += dy;
      },
    };
    return block;
  }

  function fakeWorkspace(blocks: ReturnType<typeof fakeBlock>[]) {
    return {getTopBlocks: () => blocks} as unknown as BlocklyCore.WorkspaceSvg;
  }

  it('moves blocks back to their saved positions', () => {
    const blocks = [fakeBlock('a', 0, 0), fakeBlock('b', 0, 0)];
    restoreTopBlockPositions(fakeWorkspace(blocks), [
      {type: 'a', x: 5, y: 6},
      {type: 'b', x: 7, y: 8},
    ]);
    expect(blocks.map(b => [b.x, b.y])).toEqual([
      [5, 6],
      [7, 8],
    ]);
  });

  it('moves nothing when the blocks do not line up', () => {
    const blocks = [fakeBlock('a', 0, 0), fakeBlock('c', 0, 0)];
    restoreTopBlockPositions(fakeWorkspace(blocks), [
      {type: 'a', x: 5, y: 6},
      {type: 'b', x: 7, y: 8},
    ]);
    expect(blocks.map(b => [b.x, b.y])).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });
});
