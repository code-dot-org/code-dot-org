// Tweens a file defines, and how a block names one.
//
// A tween is DEFINED where it is used and referenced by id, which is the
// pattern `define actor` → `add actor ⟨Coin⟩` already sets and `localActors`
// already explains. A tween for the Player is found in `player.actor`, beside
// the blocks that play it; a tween several files share would live in a file of
// its own, which is the same axis an actor sits on (a file, or local to one
// world) and is not built yet.
//
// THE VALUE IS THE DEFINING BLOCK'S ID, not the name, for the reason an actor's
// is: a dropdown value outlives the thing it names, so renaming a tween keeps
// every `play tween` pointing at it, and two both called "fade" — which is what
// happens, the default text being the same every time — stay told apart.

import type {Blockly} from '@code-dot-org/blockly';

import {liveDropdown} from './moduleOptions';

/**
 * The workspace a field's block sits in — the TARGET one for a field in the
 * flyout, since a block in there is a preview of one you might drag out and
 * the question is about where it would land. Same shape as `cameras`.
 */
const workspaceOf = (field?: Blockly.Field): Blockly.Workspace | undefined => {
  const workspace = field?.getSourceBlock()?.workspace as
    | (Blockly.WorkspaceSvg & {targetWorkspace?: Blockly.Workspace})
    | undefined;
  return workspace?.isFlyout ? workspace.targetWorkspace : workspace;
};

/** The `world_define_tween` block type — a definition root. */
export const DEFINE_TWEEN = 'world_define_tween';

/** Every tween defined in this workspace, in the order the blocks are in. */
export const tweensIn = (
  workspace: Blockly.Workspace | undefined,
): Array<{blockId: string; name: string}> =>
  (workspace?.getTopBlocks(false) ?? [])
    .filter(block => block.type === DEFINE_TWEEN)
    .map(block => ({
      blockId: block.id,
      name: String(block.getFieldValue('NAME') ?? ''),
    }));

/**
 * The rows a TWEEN dropdown offers.
 *
 * A dropdown with no options cannot be built, so a file that defines none says
 * so in words rather than being empty — and `play tween` then generates
 * nothing, the same bargain `use trait` makes with "(none)".
 */
export const tweenOptions = (
  field?: Blockly.Field,
): Array<[string, string]> => {
  const rows = tweensIn(workspaceOf(field)).map(
    ({blockId, name}) => [name || 'Tween', blockId] as [string, string],
  );
  return rows.length ? rows : [['(no tweens yet)', '']];
};

/**
 * The variable a defined tween becomes in generated code.
 *
 * Named after the tween so the module reads, with the id as a suffix only
 * because two may share a name — `localActorVar`'s reasoning, and its shape.
 */
export const tweenVar = (name: string, blockId: string): string => {
  const stem =
    name
      .trim()
      .replace(/[^A-Za-z0-9]+(.)/g, (_, next: string) => next.toUpperCase())
      .replace(/[^A-Za-z0-9]/g, '') || 'tween';
  return `${stem.charAt(0).toLowerCase()}${stem.slice(1)}_${blockId.replace(
    /[^A-Za-z0-9]/g,
    '',
  )}`;
};

/** Keep a TWEEN dropdown showing the definitions this workspace holds. */
export const tweenOptionsExtension = liveDropdown(
  'world_tween_options',
  'TWEEN',
  tweenOptions,
);

/**
 * Whether this block sits inside a `define tween`'s mouth.
 *
 * `getSurroundParent`, because the mouth is a statement input: a block merely
 * chained BELOW the definition is beside it, not in it. Same walk and the same
 * reasoning as `inCameraBody`.
 *
 * A handler ends it, for the reason a camera body's walk stops at one: inside a
 * handler the subject is rebound and the block is about a moment rather than
 * about a destination.
 */
export const inTweenBody = (block: Blockly.Block): boolean => {
  for (
    let parent = block.getSurroundParent?.() ?? null;
    parent;
    parent = parent.getSurroundParent?.() ?? null
  ) {
    if (parent.type === DEFINE_TWEEN) {
      return true;
    }
    if (parent.type.startsWith('world_on_')) {
      return false;
    }
  }
  return false;
};

/**
 * One row of a tween's mouth, as generated code.
 *
 * An ordinary `set` block generates a WRITE; inside a tween the same block
 * names a DESTINATION instead. Reusing the blocks rather than inventing a
 * `move ⟨property⟩ to ⟨value⟩` is what keeps the tween's vocabulary exactly
 * the vocabulary of properties — every rule's, every actor's own, and the
 * foundation's — with nothing to keep in step.
 *
 * `from` is not here. It is read when the tween is PLAYED, because a
 * destination is a fact about where to go and not about where you were.
 */
export const tweenStepCode = (property: string, to: string): string =>
  `{property: ${property}, to: ${to}},\n`;
