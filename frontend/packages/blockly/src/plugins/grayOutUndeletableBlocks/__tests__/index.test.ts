import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {grayOutUndeletableBlocks} from '../index';

/*
 * The handler only recolors blocks and reads their deletable/movable flags — no
 * SVG — so it runs against a headless workspace in jsdom. Standard blocks need
 * the locale set or their init throws on unresolved %{BKY_...} messages.
 */

Blockly.setLocale(En as unknown as {[key: string]: string});

let workspace: Blockly.Workspace;

beforeEach(() => {
  workspace = new Blockly.Workspace();
});

afterEach(() => {
  workspace.dispose();
});

const createEvent = (block: Blockly.Block) =>
  ({
    type: Blockly.Events.BLOCK_CREATE,
    blockId: block.id,
    workspaceId: workspace.id,
    json: {id: block.id, type: block.type},
  }) as unknown as Blockly.Events.Abstract;

describe('grayOutUndeletableBlocks', () => {
  it('grays out an undeletable, movable block', () => {
    const block = workspace.newBlock('text_print');
    block.setDeletable(false); // movable stays true by default

    grayOutUndeletableBlocks(createEvent(block));

    expect(block.getColour()).toBe('#888888');
  });

  it('leaves a normal (deletable) block untouched', () => {
    const block = workspace.newBlock('text_print');
    const original = block.getColour();

    grayOutUndeletableBlocks(createEvent(block));

    expect(block.getColour()).toBe(original);
  });

  it('does not gray out blocks in a read-only workspace', () => {
    const readOnly = new Blockly.Workspace(
      new Blockly.Options({readOnly: true} as Blockly.BlocklyOptions),
    );
    const block = readOnly.newBlock('text_print');
    block.setDeletable(false);
    const original = block.getColour();

    grayOutUndeletableBlocks({
      type: Blockly.Events.BLOCK_CREATE,
      blockId: block.id,
      workspaceId: readOnly.id,
      json: {id: block.id, type: block.type},
    } as unknown as Blockly.Events.Abstract);

    expect(block.getColour()).toBe(original);
    readOnly.dispose();
  });

  it('ignores events other than create/change', () => {
    const block = workspace.newBlock('text_print');
    block.setDeletable(false);
    const original = block.getColour();

    grayOutUndeletableBlocks({
      type: Blockly.Events.BLOCK_MOVE,
      blockId: block.id,
      workspaceId: workspace.id,
    } as unknown as Blockly.Events.Abstract);

    expect(block.getColour()).toBe(original);
  });
});
