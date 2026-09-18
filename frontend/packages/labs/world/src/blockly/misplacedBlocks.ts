// A block that cannot mean anything in the file it landed in is an orphan.
//
// `DisableOrphansPlugin` disables any top-level block with a previous
// connection — a row with nothing above it — with a reason, and a disabled
// block generates nothing. This is the same plugin for a second shape of
// mistake: a block that is a ROOT in the right sense and still cannot be held
// by this kind of file. A `define actor` in a world, a world's hat in an
// actor file, a hat about `this actor` in a world. Each is legal somewhere
// and nowhere here, and the way one arrives is a paste from another tab
// (specs/PASTE.md), or a file edited by hand.
//
// THREE QUESTIONS, asked of a root whenever it is created, moved or changed:
//
//   - Is it a definition with a home elsewhere? `ROOT_HOMES` says which kinds
//     of file may hold `define actor`, `define world` and the rest.
//   - Is it offered to this kind of file at all? The palette is built per
//     kind, and its toolbox is the set of what may be placed here. A hat the
//     world hears and an actor cannot is in no drawer of an actor file.
//   - Is it a hat about `this actor` in a world? A world binds no `actor`, so
//     the subject would compile to a name nothing declares and the module
//     would throw as it loaded. The fix is the socket, not the tab: a world's
//     hat is about `any ⟨kind⟩`.
//
// The answer is disabled-with-a-reason and a warning saying where it belongs,
// which is what a learner sees, and nothing generated, which is what the
// project sees. A disabled DEFINITION also has to be one the generator's
// file-kind check overlooks, or a grey `define actor` would still stop a
// world compiling; `BlocklyGenerator` skips disabled roots for that reason.
//
// WHAT A WORKSPACE KNOWS is told to it by the editor (`setFileContext`),
// after the workspace exists — which is after its file has loaded, so the
// sweep runs then as well as on each event.

import * as Blockly from 'blockly/core';

import {createInjectPlugin} from '@code-dot-org/blockly';

import {ROOT_HOMES, type FileKind} from './fileKind';

/** The reason a block is disabled by, which is how it is enabled again. */
export const MISPLACED = 'MISPLACED';

/** The key the warning is filed under on the block. */
const WARNING = 'misplaced';

/** What a workspace is told about the file it edits. */
export interface FileContext {
  kind: FileKind;
  /** Every block type the file's toolbox offers. */
  offered: ReadonlySet<string>;
}

interface Tagged {
  __fileContext?: FileContext;
}

const contextOf = (
  workspace: Blockly.Workspace | undefined,
): FileContext | undefined => {
  const svg = workspace as (Blockly.WorkspaceSvg & Tagged) | undefined;
  const main = svg?.isFlyout
    ? (svg.targetWorkspace as (Blockly.WorkspaceSvg & Tagged) | undefined)
    : svg;
  return main?.__fileContext;
};

/** Every block type a toolbox lists, categories flattened. */
export const typesOffered = (toolbox: unknown): Set<string> => {
  const found = new Set<string>();
  const walk = (items: unknown[]) => {
    for (const item of items) {
      if (typeof item === 'string') {
        found.add(item);
      } else if (item && typeof item === 'object') {
        const entry = item as {type?: unknown; blocks?: unknown[]};
        if (typeof entry.type === 'string') {
          found.add(entry.type);
        }
        if (Array.isArray(entry.blocks)) {
          walk(entry.blocks);
        }
      }
    }
  };
  walk(Array.isArray(toolbox) ? toolbox : []);
  return found;
};

/** How a kind of file reads in a reason. */
const A_FILE: Record<FileKind, string> = {
  actor: 'an actor file',
  world: 'a world',
  rule: 'a rule',
  map: 'a map',
  placement: 'a placed actor',
};

/**
 * Why `block` cannot be where it is, or nothing if it can.
 *
 * Asked of ROOTS. A row under something is that something's business, and an
 * unattached row is the orphan plugin's; what is neither is a definition or
 * a hat, and those are what this is for.
 */
export const misplacementOf = (block: Blockly.Block): string | undefined => {
  const context = contextOf(block.workspace);
  if (!context || block.getParent() || block.isShadow()) {
    return undefined;
  }
  if (block.previousConnection || block.outputConnection) {
    return undefined; // an orphan, which is somebody else's to say
  }
  const homes = ROOT_HOMES.get(block.type);
  if (homes && !homes.has(context.kind)) {
    const home = [...homes][0];
    return `This belongs in ${A_FILE[home]}, not ${A_FILE[context.kind]}.`;
  }
  if (!context.offered.has(block.type)) {
    return `${A_FILE[context.kind]} cannot hold this.`.replace(/^./, c =>
      c.toUpperCase(),
    );
  }
  if (context.kind === 'world' && block.type.startsWith('world_on_')) {
    const subject = block.getInputTargetBlock('ACTOR');
    if (subject?.type === 'world_this_actor') {
      return 'A world’s hat is about a kind: put “any ⟨kind⟩” in the socket.';
    }
  }
  return undefined;
};

/** Mark or unmark one root, and everything chained under it. */
export const review = (block: Blockly.Block): void => {
  const reason = misplacementOf(block);
  const recording = Blockly.Events.getRecordUndo();
  try {
    Blockly.Events.setRecordUndo(false);
    for (let at: Blockly.Block | null = block; at; at = at.getNextBlock()) {
      at.setDisabledReason(Boolean(reason), MISPLACED);
    }
    block.setWarningText?.(reason ?? null, WARNING);
    const svg = block as unknown as {getSvgRoot?: () => SVGElement};
    const root = svg.getSvgRoot?.();
    if (root) {
      root.style.opacity = reason ? '0.5' : '';
    }
  } finally {
    Blockly.Events.setRecordUndo(recording);
  }
};

/** Every root in the workspace, asked again. */
export const reviewMisplaced = (workspace: Blockly.Workspace): void => {
  for (const block of workspace.getTopBlocks(false)) {
    review(block);
  }
};

/**
 * Tell a workspace what file it edits, and look over what it already holds.
 *
 * After the load rather than before: the editor learns its file from a child
 * that has already deserialized the blocks (`BlocklyFileEditor`), so the
 * sweep here is what catches a misplaced block that arrived in the file.
 */
export const setFileContext = (
  workspace: Blockly.Workspace,
  context: FileContext | undefined,
): void => {
  (workspace as Blockly.Workspace & Tagged).__fileContext = context;
  if (context) {
    reviewMisplaced(workspace);
  }
};

/** A create, a move or a change: ask the root the block belongs to again. */
export const onMisplacedChange = (event: Blockly.Events.Abstract): void => {
  if (
    event.type !== Blockly.Events.BLOCK_CREATE &&
    event.type !== Blockly.Events.BLOCK_MOVE &&
    event.type !== Blockly.Events.BLOCK_CHANGE
  ) {
    return;
  }
  const {blockId, workspaceId} = event as Blockly.Events.BlockBase;
  if (!blockId || !workspaceId) {
    return;
  }
  const workspace = Blockly.Workspace.getById(workspaceId);
  const block = workspace?.getBlockById(blockId);
  if (block) {
    review(block.getRootBlock());
  }
};

/** The plugin, beside `DisableOrphansPlugin` in the editor's list. */
export const MisplacedBlocksPlugin = createInjectPlugin({
  onChange: onMisplacedChange,
});
