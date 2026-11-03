// What a workspace's top blocks say about the file it is.
//
// An `.actor` has a `define actor` among its roots; a rule's code and the
// game's own are marked (`markCode`). The questions here read that off the
// workspace rather than off the file's name, so a flyout's preview and a file
// that has not been saved yet answer the same as one that has. The last
// finds the `define actor` a block sits under, which is what `acts like` asks.

import type {Blockly} from '@code-dot-org/blockly';

/** The `world_actor` block type — a definition root in either kind of file. */
const DEFINE_ACTOR = 'world_actor';

/**
 * What file a workspace is the code of, when its roots do not say: a rule's
 * page or bodies hold no `define rule`, and the Main Screen's code no root
 * at all (`markCode`).
 */
type MarkedWorkspace = {holdsCodeOf?: 'rule' | 'game'};

const markOf = (workspace: Blockly.Workspace | undefined) =>
  (workspace as MarkedWorkspace | undefined)?.holdsCodeOf;

/**
 * Whether this workspace is a RULE's code: marked so (`markCode`). A rule's
 * pages and bodies hold no root that would say. `fileKind` is the answer
 * where a path is what you have.
 */
export const definesRule = (
  workspace: Blockly.Workspace | undefined,
): boolean => markOf(workspace) === 'rule';

/** Marks a workspace as the code of a rule or of the game, or of neither. */
export const markCode = (
  workspace: Blockly.Workspace,
  of: 'rule' | 'game' | undefined,
): void => {
  (workspace as MarkedWorkspace).holdsCodeOf = of;
};

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

/**
 * Whether this workspace is the game's own code — the Main Screen's, which
 * is marked so (`markCode`).
 */
export const holdsGameCode = (
  workspace: Blockly.Workspace | undefined,
): boolean => markOf(workspace) === 'game';

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
