// Paste into the workspace on screen, not the one the block was copied from.
//
// Blockly's own paste shortcut reads back the workspace a block was copied
// from and refuses unless that workspace is still rendered. The lab shows one
// file at a time and disposes the workspace when the tab changes, so a block
// copied in one tab could never be pasted in another: Cmd+V beeped, in both
// tabs (specs/PASTE.md). The copied data survives the switch — it is module
// state — and `clipboard.paste` takes an explicit workspace. This shortcut
// hands it the one the keys were pressed on.
//
// EVERYTHING ELSE IS BLOCKLY'S. The precondition is theirs with the workspace
// swapped; where the block lands is their rule too — the pointer for a paste
// from a menu, the copied location if it is in view (which it is for a paste
// back into the same file), the middle of the view otherwise. Copy and cut are
// untouched: they record the right data, and a cut is a copy and a delete.

import * as Blockly from 'blockly/core';

import {createInjectPlugin} from '@code-dot-org/blockly';

/** The workspace a paste lands in: the one the keys were pressed on. */
export const pasteTarget = (
  workspace: Blockly.WorkspaceSvg | undefined,
): Blockly.WorkspaceSvg | undefined => {
  const main = workspace?.isFlyout ? workspace.targetWorkspace : workspace;
  const target = main ?? (Blockly.getMainWorkspace() as Blockly.WorkspaceSvg);
  return target?.rendered ? target : undefined;
};

/**
 * Where on `workspace` a paste goes.
 *
 * Undefined means "where it was copied from", which is Blockly's default and
 * is right for a paste back into the same file; a location in another file's
 * coordinates is as likely to be off the screen as on it, so out of view it
 * is the middle of the view instead.
 */
export const pasteLocation = (
  workspace: Blockly.WorkspaceSvg,
  event: Event,
): Blockly.utils.Coordinate | undefined => {
  if (typeof PointerEvent !== 'undefined' && event instanceof PointerEvent) {
    return Blockly.utils.svgMath.screenToWsCoordinates(
      workspace,
      new Blockly.utils.Coordinate(event.clientX, event.clientY),
    );
  }
  const copiedAt = Blockly.clipboard.getLastCopiedLocation();
  const {left, top, width, height} = workspace
    .getMetricsManager()
    .getViewMetrics(true);
  const view = new Blockly.utils.Rect(top, top + height, left, left + width);
  if (copiedAt && view.contains(copiedAt.x, copiedAt.y)) {
    return undefined;
  }
  return new Blockly.utils.Coordinate(left + width / 2, top + height / 2);
};

/** Whether a paste may happen on `workspace` right now. */
export const canPasteInto = (
  workspace: Blockly.WorkspaceSvg | undefined,
): boolean =>
  Boolean(
    Blockly.clipboard.getLastCopiedData() &&
      workspace &&
      !workspace.isReadOnly() &&
      !workspace.isDragging() &&
      !Blockly.getFocusManager().ephemeralFocusTaken(),
  );

/** The shortcut, as Blockly's registry takes it. */
export const PASTE_SHORTCUT: Blockly.ShortcutRegistry.KeyboardShortcut = {
  name: Blockly.ShortcutItems.names.PASTE,
  preconditionFn(workspace) {
    return canPasteInto(pasteTarget(workspace));
  },
  callback(workspace, event) {
    const data = Blockly.clipboard.getLastCopiedData();
    const target = pasteTarget(workspace);
    if (!data || !target) {
      return false;
    }
    return Boolean(
      Blockly.clipboard.paste(data, target, pasteLocation(target, event)),
    );
  },
  keyCodes: [
    Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V,
      [Blockly.utils.KeyCodes.CTRL],
    ),
    Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V,
      [Blockly.utils.KeyCodes.META],
    ),
  ],
};

/**
 * Put the shortcut in place of Blockly's.
 *
 * Idempotent, so a plugin may call it on every inject: Blockly registers its
 * defaults once at load, and ours replaces that one by name.
 */
export const registerPasteShortcut = (): void => {
  Blockly.ShortcutRegistry.registry.unregister(PASTE_SHORTCUT.name);
  Blockly.ShortcutRegistry.registry.register(PASTE_SHORTCUT);
};

/** The plugin that installs it, beside the editor's other plugins. */
export const PasteAcrossTabsPlugin = createInjectPlugin({
  onInit: () => registerPasteShortcut(),
});
