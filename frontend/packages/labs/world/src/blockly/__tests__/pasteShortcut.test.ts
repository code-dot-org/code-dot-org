// The paste that lands in the tab on screen.
//
// Blockly's paste is real and wants a rendered workspace; what is this
// module's is which workspace it is handed and where on it. So the workspace
// is a stand-in with the five things the shortcut reads, and `paste` itself
// is watched rather than run.

import * as Blockly from 'blockly/core';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {
  canPasteInto,
  PASTE_SHORTCUT,
  pasteLocation,
  pasteTarget,
  registerPasteShortcut,
} from '../pasteShortcut';

/** A rendered main workspace, as far as the shortcut looks. */
const rendered = (over: Partial<Blockly.WorkspaceSvg> = {}) =>
  ({
    rendered: true,
    isFlyout: false,
    isReadOnly: () => false,
    isDragging: () => false,
    getMetricsManager: () => ({
      getViewMetrics: () => ({left: 100, top: 200, width: 400, height: 300}),
    }),
    ...over,
  }) as unknown as Blockly.WorkspaceSvg;

const copied = () =>
  Blockly.clipboard.setLastCopiedData({
    paster: 'block',
    blockState: {type: 'world_this_actor'},
    typeCounts: {world_this_actor: 1},
  } as Blockly.clipboard.BlockCopyData);

afterEach(() => {
  vi.restoreAllMocks();
  Blockly.clipboard.setLastCopiedData(undefined as never);
  Blockly.clipboard.setLastCopiedLocation(undefined as never);
});

describe('where a paste lands', () => {
  it('is the workspace the keys were pressed on', () => {
    const here = rendered();
    expect(pasteTarget(here)).toBe(here);
  });

  it('is the flyout’s target, for keys pressed over a flyout', () => {
    const main = rendered();
    const flyout = rendered({isFlyout: true, targetWorkspace: main} as never);
    expect(pasteTarget(flyout)).toBe(main);
  });

  it('is nowhere on a workspace that is gone', () => {
    // The case Blockly's own shortcut fails on: the copied-from workspace,
    // disposed when the tab changed. Ours never asks for it, but a target that
    // is not rendered is still no target.
    expect(pasteTarget(rendered({rendered: false}))).toBeUndefined();
  });
});

describe('whether a paste may happen', () => {
  it('needs something copied', () => {
    expect(canPasteInto(rendered())).toBe(false);
    copied();
    expect(canPasteInto(rendered())).toBe(true);
  });

  it('refuses a read-only workspace and a drag in progress', () => {
    copied();
    expect(canPasteInto(rendered({isReadOnly: () => true}))).toBe(false);
    expect(canPasteInto(rendered({isDragging: () => true}))).toBe(false);
  });
});

describe('where on the workspace', () => {
  it('is where it was copied from, when that is in view', () => {
    Blockly.clipboard.setLastCopiedLocation(
      new Blockly.utils.Coordinate(150, 250),
    );
    expect(pasteLocation(rendered(), new Event('keydown'))).toBeUndefined();
  });

  it('is the middle of the view, when the copied place is not in it', () => {
    // A location from another file's workspace is as likely off the screen as
    // on it; the middle of this one is somewhere the learner is looking.
    Blockly.clipboard.setLastCopiedLocation(
      new Blockly.utils.Coordinate(-500, -500),
    );
    const at = pasteLocation(rendered(), new Event('keydown'));
    expect(at).toEqual(new Blockly.utils.Coordinate(300, 350));
  });
});

describe('the shortcut', () => {
  it('hands Blockly the workspace on screen', () => {
    copied();
    const here = rendered();
    const paste = vi
      .spyOn(Blockly.clipboard, 'paste')
      .mockReturnValue({} as never);

    const done = PASTE_SHORTCUT.callback!(
      here,
      new Event('keydown'),
      PASTE_SHORTCUT,
      {} as never,
    );

    expect(done).toBe(true);
    expect(paste).toHaveBeenCalledWith(
      Blockly.clipboard.getLastCopiedData(),
      here,
      expect.anything(),
    );
  });

  it('does nothing with nothing copied', () => {
    const paste = vi.spyOn(Blockly.clipboard, 'paste');
    expect(
      PASTE_SHORTCUT.callback!(
        rendered(),
        new Event('keydown'),
        PASTE_SHORTCUT,
        {} as never,
      ),
    ).toBe(false);
    expect(paste).not.toHaveBeenCalled();
  });

  it('replaces Blockly’s, under Blockly’s own name', () => {
    registerPasteShortcut();
    const registered =
      Blockly.ShortcutRegistry.registry.getRegistry()[PASTE_SHORTCUT.name];
    expect(registered.callback).toBe(PASTE_SHORTCUT.callback);
    // …and again, since a plugin calls it on every inject.
    expect(() => registerPasteShortcut()).not.toThrow();
  });
});
