// Which actor variables could hold more than one actor.
//
// An actor value is one actor or several (specs/ACTOR_LISTS.md), and generated
// code says which it is dealing with: a statement over several broadcasts, a
// value over several reads the first. Emitting that wrapper where it is not
// needed would put `WorldLab.each(…)` around every line of every actor file for
// a case those files do not have, so the generator asks first — and for a
// literal (`this actor`, `any ⟨Coin⟩`, `all actors`) the block itself is the
// answer.
//
// A VARIABLE is not so obliging. `each` in a `for each` holds one actor; the
// same name in a rule that pushes to it holds a list. Nothing in the block says
// so, so this reads the workspace and works it out: a variable is many if a
// `push` or `clear` names it, or if it is set from something already many.
//
// It is a static approximation and deliberately a conservative one — a variable
// this misses is one whose broadcast never happens, which is a wrong program,
// where a variable it names needlessly costs a wrapper nobody reads. When in
// doubt, many.

import type {Blockly} from '@code-dot-org/blockly';

/**
 * Blocks that do not hand out exactly one actor, whatever the workspace says.
 *
 * More than one for the first two. NONE, possibly, for `first actor … where`:
 * a search that matches nothing answers with a value holding no actors, and
 * zero needs the wrapper for the same reason many does — `WorldLab.each` over
 * it runs the statement no times, where the bare call would run it once on
 * nothing and throw.
 */
const MANY_BY_TYPE = new Set([
  'world_actor_kind',
  'world_all_actors',
  'world_all_cameras',
  'world_all_actors_in_layer',
  'world_first_where',
]);

/** The blocks that make a variable a list by naming it. */
const MAKES_MANY = new Set(['world_push_actor', 'world_clear_actors']);

/** The field those blocks name the variable in. */
const LIST_FIELD = 'LIST';

/** A variable-setter's field, as Blockly's own `variables_set_*` names it. */
const SET_FIELD = 'VAR';

/**
 * The ids of every actor variable in `workspace` that could hold several.
 *
 * Two passes' worth of reasoning, run to a fixed point: `push`/`clear` name a
 * variable outright, and `set ⟨a⟩ to ⟨b⟩` carries it on when `b` is many. The
 * loop settles because the set only grows and the variables are finite.
 */
export function manyActorVariables(
  workspace: Blockly.Workspace | null | undefined,
): Set<string> {
  const many = new Set<string>();
  if (!workspace) {
    return many;
  }
  for (const type of MAKES_MANY) {
    for (const block of workspace.getBlocksByType(type, false)) {
      const id = block.getFieldValue(LIST_FIELD);
      if (id) {
        many.add(id);
      }
    }
  }
  // `set ⟨a⟩ to ⟨b⟩` where b is many makes a many as well — and then anything
  // set from a, and so on.
  const setters = workspace
    .getBlocksByType('variables_set_Actor', false)
    .map(block => ({
      id: block.getFieldValue(SET_FIELD),
      from: block.getInputTargetBlock('VALUE'),
    }));
  let changed = true;
  while (changed) {
    changed = false;
    for (const {id, from} of setters) {
      if (!id || !from || many.has(id)) {
        continue;
      }
      const fromMany =
        MANY_BY_TYPE.has(from.type) ||
        (from.type === 'variables_get_Actor' &&
          many.has(from.getFieldValue('VAR') ?? ''));
      if (fromMany) {
        many.add(id);
        changed = true;
      }
    }
  }
  return many;
}

/**
 * Whether the block plugged into a socket could hand over several actors.
 *
 * The literals answer for themselves; a variable is answered for by the
 * workspace it is in.
 */
export function yieldsMany(plugged: Blockly.Block | null | undefined): boolean {
  if (!plugged) {
    return false;
  }
  if (MANY_BY_TYPE.has(plugged.type)) {
    return true;
  }
  if (plugged.type !== 'variables_get_Actor') {
    return false;
  }
  return manyActorVariables(plugged.workspace).has(
    plugged.getFieldValue('VAR') ?? '',
  );
}
