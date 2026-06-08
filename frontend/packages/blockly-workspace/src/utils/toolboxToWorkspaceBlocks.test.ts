import type * as Blockly from 'blockly/core';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {toolboxToWorkspaceBlocks} from './toolboxToWorkspaceBlocks';

/*
 * A pure transform from a Blockly ToolboxInfo into the workspace blocks used by
 * toolbox-editing mode: category markers plus the blocks they contain. No
 * workspace involved, so it runs in jsdom.
 */

// Build a ToolboxInfo from arbitrary contents; categories carry an `id` (which
// the transform reads) that Blockly's published type does not declare.
const toolbox = (contents: unknown[]) =>
  ({
    kind: 'categoryToolbox',
    contents,
  }) as unknown as Blockly.utils.toolbox.ToolboxInfo;

const blocksOf = (result: ReturnType<typeof toolboxToWorkspaceBlocks>) =>
  (result as {blocks?: {blocks: unknown[]}}).blocks?.blocks ?? [];

afterEach(() => vi.restoreAllMocks());

describe('toolboxToWorkspaceBlocks', () => {
  it('returns an empty object for an undefined toolbox', () => {
    expect(toolboxToWorkspaceBlocks(undefined)).toEqual({});
  });

  it('passes block items straight through', () => {
    const result = toolboxToWorkspaceBlocks(
      toolbox([{kind: 'block', type: 'text_print'}]),
    );
    expect(blocksOf(result)).toEqual([{kind: 'block', type: 'text_print'}]);
  });

  it('emits a category marker block and recurses into its contents', () => {
    const result = toolboxToWorkspaceBlocks(
      toolbox([
        {
          kind: 'category',
          id: 'Play',
          name: 'Sounds',
          contents: [{kind: 'block', type: 'play_sound'}],
        },
      ]),
    );
    expect(blocksOf(result)).toEqual([
      {type: 'category', fields: {CATEGORY: 'Play'}},
      {kind: 'block', type: 'play_sound'},
    ]);
  });

  it('emits a dynamic-category block for a custom category', () => {
    const result = toolboxToWorkspaceBlocks(
      toolbox([
        {kind: 'category', custom: 'VARIABLE', id: 'myVars', name: 'Variables'},
      ]),
    );
    expect(blocksOf(result)).toEqual([
      {type: 'custom_category', fields: {CUSTOM: 'myVars'}},
    ]);
  });

  it('skips the DEFAULT category marker but keeps its blocks', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = toolboxToWorkspaceBlocks(
      toolbox([
        {
          kind: 'category',
          id: 'DEFAULT',
          name: 'Default',
          contents: [{kind: 'block', type: 'foo'}],
        },
      ]),
    );
    expect(blocksOf(result)).toEqual([{kind: 'block', type: 'foo'}]);
  });

  it('warns and skips a block with no type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = toolboxToWorkspaceBlocks(toolbox([{kind: 'block'}]));
    expect(blocksOf(result)).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });
});
