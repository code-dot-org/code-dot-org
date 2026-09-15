// What a workspace's top blocks say about the file it is.
//
// A `.rule` has a `define rule` among its roots, a `.world` a `define world`,
// and an `.actor` one `define actor`. Three questions here read that off the
// blocks rather than off the file's name, so a flyout's preview and a file
// that has not been saved yet answer the same as one that has. The fourth
// finds the `define actor` a block sits under, which is what `acts like` asks.
//
// This file held the world-defined actor, a `define actor` among a world's
// own roots, until every actor became a file; what is left is the part that
// was never about that.

import type {Blockly} from '@code-dot-org/blockly';

/** The `world_actor` block type — a definition root in either kind of file. */
const DEFINE_ACTOR = 'world_actor';

/** The `world_world` block type; its presence is what makes a file a world. */
const DEFINE_WORLD = 'world_world';

const DEFINE_RULE = 'world_rule';

/**
 * Whether this workspace is a RULE — i.e. whether a `define rule` is in it.
 *
 * Read off the blocks rather than off the file's name for the reason
 * `ownTraitOptions` reads its traits that way: a registry refreshes on a parse,
 * and a caller that has a workspace in front of it should not have to wait for
 * one. `fileKind` is the answer where a path is what you have.
 */
export const definesRule = (
  workspace: Blockly.Workspace | undefined,
): boolean =>
  Boolean(workspace?.getTopBlocks(false).some(b => b.type === DEFINE_RULE));

/**
 * The workspace a block belongs to — a flyout's block asks about its target.
 *
 * `workspaceOf` above answers the same question for a FIELD; this one is for
 * the callers that hold the block itself (a shadow chooser, which is handed the
 * block it is about to attach a shadow to).
 */
export const workspaceOfBlock = (
  block: Blockly.Block | undefined,
): Blockly.Workspace | undefined => {
  const workspace = block?.workspace as
    | (Blockly.WorkspaceSvg & {targetWorkspace?: Blockly.Workspace})
    | undefined;
  if (!workspace) {
    return undefined;
  }
  return (
    (workspace.isFlyout ? workspace.targetWorkspace : workspace) ?? undefined
  );
};

/** Whether this workspace is a world — i.e. whether a `define world` is in it. */
export const definesWorld = (
  workspace: Blockly.Workspace | undefined,
): boolean =>
  Boolean(workspace?.getTopBlocks(false).some(b => b.type === DEFINE_WORLD));

/**
 * The `define actor` root a block sits under, if it is in one.
 *
 * What asks is `acts like`, for the one question it has about itself: which
 * actor am I, so I can refuse to be my own parent.
 */
export const definingActorRoot = (
  block: Blockly.Block | undefined,
): Blockly.Block | undefined => {
  let at: Blockly.Block | null | undefined = block;
  for (; at; at = at.getParent()) {
    if (at.type === DEFINE_ACTOR) {
      return at;
    }
  }
  return undefined;
};
