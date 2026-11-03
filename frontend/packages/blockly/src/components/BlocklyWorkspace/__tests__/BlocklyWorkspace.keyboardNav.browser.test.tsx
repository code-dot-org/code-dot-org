import {cleanup, render} from '@testing-library/react';
import * as Blockly from 'blockly/core';
import type {MutableRefObject} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import type {BlocklySerialization} from '../../../types';

import BlocklyWorkspace from '../index';

/*
 * Blockly v13 ships keyboard navigation in core, enabled by default, so a
 * workspace this package injects is keyboard-navigable without any extra setup.
 * These tests pin that: a rendered BlocklyWorkspace exposes focusable blocks,
 * the core navigation shortcuts are registered, and firing one moves focus.
 * Runs in headless Chromium since it needs a real injected workspace.
 */

afterEach(cleanup);

// Two print blocks connected in a stack (A above B), so navigating "down" from
// A has a concrete destination.
const STACK: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: 'text_print',
        next: {block: {type: 'text_print'}},
      },
    ],
  },
};

const renderStack = async () => {
  const ref: MutableRefObject<Blockly.WorkspaceSvg | null> = {current: null};
  render(<BlocklyWorkspace startBlocks={STACK} workspaceRef={ref} />);
  await vi.waitFor(
    () => {
      expect(ref.current).not.toBeNull();
      expect(ref.current!.getAllBlocks(false).length).toBeGreaterThanOrEqual(2);
    },
    {timeout: 5000, interval: 50},
  );
  return ref.current!;
};

// Fire a registered shortcut's callback against the workspace, scoped to a
// focused block — the path Blockly runs when the corresponding key is pressed.
const fireShortcut = (
  name: string,
  workspace: Blockly.WorkspaceSvg,
  block: Blockly.BlockSvg,
) => {
  const shortcut = Blockly.ShortcutRegistry.registry.getRegistry()[name];
  return shortcut.callback?.(
    workspace,
    new KeyboardEvent('keydown'),
    shortcut,
    {focusedNode: block},
  );
};

// Whether a block is in keyboard "move mode": finish_move is only applicable
// while a move is in progress, so its precondition reports the move state.
const isMoving = (workspace: Blockly.WorkspaceSvg, block: Blockly.BlockSvg) => {
  const finishMove =
    Blockly.ShortcutRegistry.registry.getRegistry()['finish_move'];
  return finishMove.preconditionFn?.(workspace, {focusedNode: block}) ?? false;
};

describe('BlocklyWorkspace keyboard navigation', () => {
  it('makes blocks keyboard-focusable', async () => {
    const workspace = await renderStack();
    const block = workspace.getTopBlocks(false)[0] as Blockly.BlockSvg;

    expect(block.canBeFocused()).toBe(true);
    // It is focusable in practice: the focus manager can take focus to it.
    const focusManager = Blockly.getFocusManager();
    focusManager.focusNode(block);
    expect(focusManager.getFocusedNode()).toBe(block);
  });

  it("registers Blockly v13's core navigation shortcuts", async () => {
    await renderStack();
    const registry = Blockly.ShortcutRegistry.registry.getRegistry();

    for (const name of ['up', 'down', 'left', 'right', 'focus_toolbox']) {
      expect(registry[name]).toBeDefined();
    }
  });

  it('moves focus to the next block when the down navigation shortcut fires', async () => {
    const workspace = await renderStack();
    const a = workspace.getTopBlocks(false)[0] as Blockly.BlockSvg;
    const b = a.getNextBlock() as Blockly.BlockSvg;
    expect(b).toBeTruthy();

    const focusManager = Blockly.getFocusManager();
    focusManager.focusNode(a);
    expect(focusManager.getFocusedNode()).toBe(a);

    // Fire the registered "down" navigation shortcut against the workspace,
    // scoped to the currently focused block.
    const down = Blockly.ShortcutRegistry.registry.getRegistry()['down'];
    const scope: Blockly.ContextMenuRegistry.Scope = {focusedNode: a};
    const handled = down.callback?.(
      workspace,
      new KeyboardEvent('keydown', {key: 'ArrowDown'}),
      down,
      scope,
    );

    expect(handled).toBe(true);
    expect(focusManager.getFocusedNode()).toBe(b);
  });

  describe('move mode', () => {
    it('picks up a focused block when start_move (M) fires', async () => {
      const workspace = await renderStack();
      const block = workspace.getTopBlocks(false)[0] as Blockly.BlockSvg;
      Blockly.getFocusManager().focusNode(block);

      expect(isMoving(workspace, block)).toBe(false);
      const handled = fireShortcut('start_move', workspace, block);
      expect(handled).toBe(true);
      // The block is now being moved by the keyboard.
      expect(isMoving(workspace, block)).toBe(true);

      // Leave move mode so it does not leak into other tests.
      fireShortcut('abort_move', workspace, block);
    });

    it('drops the block when finish_move (Enter / Space) fires', async () => {
      const workspace = await renderStack();
      const block = workspace.getTopBlocks(false)[0] as Blockly.BlockSvg;
      Blockly.getFocusManager().focusNode(block);

      fireShortcut('start_move', workspace, block);
      expect(isMoving(workspace, block)).toBe(true);

      fireShortcut('finish_move', workspace, block);
      // The move is committed: no longer in move mode, block kept on workspace.
      expect(isMoving(workspace, block)).toBe(false);
      expect(workspace.getAllBlocks(false)).toContain(block);
    });

    it('cancels the move when abort_move (Esc) fires', async () => {
      const workspace = await renderStack();
      const block = workspace.getTopBlocks(false)[0] as Blockly.BlockSvg;
      Blockly.getFocusManager().focusNode(block);

      fireShortcut('start_move', workspace, block);
      expect(isMoving(workspace, block)).toBe(true);

      fireShortcut('abort_move', workspace, block);
      // The move is cancelled: no longer in move mode, block preserved.
      expect(isMoving(workspace, block)).toBe(false);
      expect(workspace.getAllBlocks(false)).toContain(block);
    });
  });
});
