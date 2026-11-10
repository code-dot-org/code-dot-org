// A block that changed size without an edit: a mini toolbox opened or shut.
//
// The section layout re-runs after every edit (`useSectionWorkspace`), and
// nothing else tells it a stack grew. Opening a hat's `+` adds a row and fires
// no event, since nothing in the file changed, so the hat below stayed where
// it was and the flyout was drawn over it.

import type {Workspace} from 'blockly';

const listeners = new WeakMap<Workspace, () => void>();

/** Lay `workspace` out again whenever one of its blocks says it resized. */
export function onBlockResized(workspace: Workspace, then: () => void): void {
  listeners.set(workspace, then);
}

/** Say that `block` changed size; a no-op where nothing lays it out. */
export function blockResized(block: {workspace: Workspace}): void {
  listeners.get(block.workspace)?.();
}
