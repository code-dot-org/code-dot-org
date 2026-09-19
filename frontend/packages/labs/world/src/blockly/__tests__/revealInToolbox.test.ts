// "Show me" for a block: which drawer is opened and which block is focused
// (specs/SHOW_ME_PLAN.md). Against stand-ins; what Blockly then draws and
// reads aloud is the browser's to say.

import {describe, expect, it, vi} from 'vitest';

import {revealInToolbox, type ToolboxHost} from '../revealInToolbox';

const drawer = (name: string, contents: unknown) => ({
  isSelectable: () => true,
  getName: () => name,
  getContents: () => contents,
});

const TEXT = drawer('Text', [
  {kind: 'block', type: 'text'},
  {kind: 'BLOCK', type: 'world_print'},
]);
const GRAVITY = drawer('Gravity', [
  {kind: 'label', text: 'Events'},
  {kind: 'block', type: 'world_on_Gravity_StopsFallingEvent'},
]);
/** Filled at run time: its contents are a name, not a list. */
const VARIABLES = drawer('Variables', 'VARIABLE');
const SEPARATOR = {isSelectable: () => false};

const host = (flyoutBlocks: Array<{type: string}> = []) => {
  const setSelectedItem = vi.fn();
  const workspace: ToolboxHost = {
    getToolbox: () => ({
      getToolboxItems: () => [TEXT, SEPARATOR, VARIABLES, GRAVITY],
      setSelectedItem,
    }),
    getFlyout: () => ({
      getWorkspace: () => ({getTopBlocks: () => flyoutBlocks}),
    }),
  };
  return {workspace, setSelectedItem};
};

describe('revealInToolbox', () => {
  it('opens the drawer that lists the block, and focuses the block in it', () => {
    const print = {type: 'world_print'};
    const {workspace, setSelectedItem} = host([{type: 'text'}, print]);
    const focus = vi.fn();

    expect(revealInToolbox(workspace, {block: 'world_print'}, focus)).toBe(
      'It is in the Text drawer.',
    );
    expect(setSelectedItem).toHaveBeenCalledWith(TEXT);
    expect(focus).toHaveBeenCalledWith(print);
  });

  it('opens a drawer by its name, whatever the case, and focuses the drawer', () => {
    const {workspace, setSelectedItem} = host();
    const focus = vi.fn();
    expect(revealInToolbox(workspace, {drawer: 'gravity'}, focus)).toBe(
      'It is the Gravity drawer.',
    );
    expect(setSelectedItem).toHaveBeenCalledWith(GRAVITY);
    expect(focus).toHaveBeenCalledWith(GRAVITY);
  });

  it('says no for a block no drawer lists, which a gated toolbox does not', () => {
    const {workspace, setSelectedItem} = host();
    const focus = vi.fn();
    expect(revealInToolbox(workspace, {block: 'world_teleport'}, focus)).toBe(
      false,
    );
    expect(setSelectedItem).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });

  it('still names the drawer when the flyout has not drawn the block yet', () => {
    const {workspace} = host([]);
    const focus = vi.fn();
    expect(revealInToolbox(workspace, {block: 'world_print'}, focus)).toBe(
      'It is in the Text drawer.',
    );
    expect(focus).not.toHaveBeenCalled();
  });

  it('says no with no toolbox at all', () => {
    expect(
      revealInToolbox({getToolbox: () => null}, {drawer: 'Text'}, vi.fn()),
    ).toBe(false);
  });
});
