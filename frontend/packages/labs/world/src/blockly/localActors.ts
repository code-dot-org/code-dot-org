// Actors defined inside a `.world` file.
//
// An actor is normally a file: `actors/coin.actor` exports a builder, and any
// world that wants coins imports it. That is right for an actor two levels
// share and wrong for one that belongs to a single world — a button that only
// this menu has, a boss that only this level fights. Those wanted a file each,
// in a folder shared with the ones that are actually shared.
//
// So `define actor` also works at the top level of a `.world` file, where it
// builds a template the world can place and nobody else can reach. There is no
// module, no export, and no import: the builder is a `const` in the world's own
// module, which is exactly what "does not exist outside this world" means when
// the file IS the world.
//
// Two consequences drive the details here:
//
//   - The dropdown that places one (`add actor`) has to offer it, and a
//     dropdown value outlives the thing it names. So the value is the DEFINING
//     BLOCK'S ID and the label is the actor's name: renaming the actor keeps
//     every `add actor` pointing at it, and two actors both called "Actor" —
//     which is the default text, so this happens — stay telling apart.
//   - The generated code has to be readable, because a learner can open it. So
//     the variable is named after the actor, with the id as a suffix only
//     because two of them may share a name.

import type {Blockly} from '@code-dot-org/blockly';

/** Marks a dropdown value as naming a world-local actor rather than a module. */
const PREFIX = 'local:';

/** The `world_actor` block type — a definition root in either kind of file. */
const DEFINE_ACTOR = 'world_actor';

/** The `world_world` block type; its presence is what makes a file a world. */
const DEFINE_WORLD = 'world_world';

/** What an ACTOR dropdown stores for a world-local actor. */
export const localActorValue = (blockId: string): string =>
  `${PREFIX}${blockId}`;

/** The defining block's id, or undefined if this value names a module. */
export const localActorBlockId = (value: string): string | undefined =>
  value.startsWith(PREFIX) ? value.slice(PREFIX.length) : undefined;

/** An actor's id — the ActorBuilder's, and the `type` a placed one carries. */
export const actorIdFromName = (name: string): string =>
  name.replaceAll(/[^A-Za-z0-9_]/g, '_');

/**
 * The variable a world-local actor's builder is bound to.
 *
 * Named for the actor so the generated module reads as what it is, and
 * suffixed with the block id because the name is not unique — `define actor`
 * starts out saying "Actor", so a world with two of them has two of those.
 */
export const localActorVar = (name: string, blockId: string): string => {
  const stem = actorIdFromName(name) || 'actor';
  return `actor_${stem}_${blockId.replaceAll(/[^A-Za-z0-9_]/g, '')}`;
};

/** The workspace a field's block belongs to — a flyout asks about its target. */
const workspaceOf = (
  field: Blockly.Field | undefined,
): Blockly.Workspace | undefined => {
  const workspace = field?.getSourceBlock()?.workspace as
    | Blockly.WorkspaceSvg
    | undefined;
  if (!workspace) {
    return undefined;
  }
  // A block in a flyout is a preview of one you might drag out, so the question
  // is asked of the workspace it would land in (see editingRule).
  return (
    (workspace.isFlyout ? workspace.targetWorkspace : workspace) ?? undefined
  );
};

/** Whether this workspace is a world — i.e. whether a `define world` is in it. */
export const definesWorld = (
  workspace: Blockly.Workspace | undefined,
): boolean =>
  Boolean(workspace?.getTopBlocks(false).some(b => b.type === DEFINE_WORLD));

/** Every actor defined in this workspace, in the order the blocks are in. */
export const localActorsIn = (
  workspace: Blockly.Workspace | undefined,
): Array<{blockId: string; name: string}> =>
  (workspace?.getTopBlocks(false) ?? [])
    .filter(block => block.type === DEFINE_ACTOR)
    .map(block => ({
      blockId: block.id,
      name: String(block.getFieldValue('NAME') ?? ''),
    }));

/**
 * The `[label, value]` rows an ACTOR dropdown offers for this workspace's own
 * actors. Empty for a file that defines none, which is every `.actor` file.
 */
export const localActorOptions = (
  field: Blockly.Field | undefined,
): Array<[string, string]> =>
  localActorsIn(workspaceOf(field)).map(({blockId, name}) => [
    name || 'Actor',
    localActorValue(blockId),
  ]);

/** The actor a dropdown value names, looked up in the block's own workspace. */
export const localActorFor = (
  block: Blockly.Block,
  value: string,
): {name: string; variable: string; type: string} | undefined => {
  const blockId = localActorBlockId(value);
  if (!blockId) {
    return undefined;
  }
  const defining = block.workspace.getBlockById(blockId);
  // The definition can be gone — deleted while an `add actor` still names it.
  // The caller emits nothing rather than a reference to a variable no line
  // declares, which would be a compile error over a block the learner can see
  // is unfinished.
  if (!defining || defining.type !== DEFINE_ACTOR) {
    return undefined;
  }
  const name = String(defining.getFieldValue('NAME') ?? '');
  return {
    name,
    variable: localActorVar(name, blockId),
    type: actorIdFromName(name),
  };
};
