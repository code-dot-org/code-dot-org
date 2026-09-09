// Which names a block can see from where it sits.
//
// A variable in Blockly belongs to the WORKSPACE: the map is flat, and a
// dropdown on a getter offers every name of the right flavour whether or not
// the block could reach it. That was tolerable while the only variables in the
// lab were the ones a loop bound and the ones a rule took as parameters —
// there was no way to make a third kind, so the flat list and the real list
// were nearly the same list.
//
// `with ⟨number n⟩ as ⟨0⟩ do` makes them different. Its name exists inside one
// mouth (`domainBlocks.scopedLocal`), and a dropdown that went on offering it
// everywhere would be offering a name that generates a reference to a
// different variable — the module-level `var` Blockly writes for the same id.
//
// THE RULE IS ADDITIVE, and deliberately. A name a binder declares is visible
// inside that binder and nowhere else; a name NO binder declares is visible
// everywhere, because that is what it is — the free locals every stock rule
// uses in its step bodies, which nothing has migrated and which would
// otherwise vanish from the dropdown of the rule that owns them. So `with`
// scopes, and everything that was global stays global until something moves
// it.

import type {Block, Workspace} from 'blockly';

import {BODY_OWNER_ID} from './bodySurfaces';

/**
 * A block that gives a name to something, and where that name reaches.
 *
 * `over` is the inputs the binding covers, and leaving one out is the point:
 * `for each actor ⟨c⟩ in ⟨…⟩` does not bind `c` inside the list it is reading,
 * and `with ⟨n⟩ as ⟨…⟩` does not bind `n` inside the value it starts from —
 * that is `let n = n`, which is a different bug in every language that allows
 * it.
 */
interface Binder {
  /** Fields holding a variable id. */
  readonly fields: readonly string[];
  /** The inputs the binding is visible inside — {@link REST} for a stack. */
  readonly over: readonly string[];
}

/**
 * "Everything after this block in the stack it is in."
 *
 * Not an input, which is why it needs a name of its own: a `let` binds nothing
 * INSIDE itself, it binds the rows below it. Blockly's parent chain walks a
 * stack backwards — a stacked block's parent IS the block above it — so the
 * same walk that finds enclosing mouths finds earlier rows, and the only thing
 * that has to be said is which of the two a binder means.
 */
export const REST = '\u0000next';

const LOOP: Binder = {fields: ['VAR'], over: ['DO']};
const DECLARATION: Binder = {fields: ['VAR'], over: [REST]};

export const BINDERS: Readonly<Record<string, Binder>> = {
  // `let ⟨number n⟩ be ⟨0⟩` — the only one whose whole purpose is the scope,
  // and the only one that binds over the rows below it rather than inside
  // itself.
  world_let_number: DECLARATION,
  world_let_word: DECLARATION,
  world_let_boolean: DECLARATION,
  world_let_vector: DECLARATION,
  // …and the same vector said as two numbers, which binds exactly as its
  // sibling does (`domainBlocks.worldLetPosition`).
  world_let_position: DECLARATION,
  world_let_actor: DECLARATION,
  // The loops, which have always bound a name and never said where it reached.
  world_for_each: LOOP,
  world_for_each_number: LOOP,
  world_for_each_word: LOOP,
  world_for_each_place: LOOP,
  world_for_each_key: LOOP,
  world_for_each_typed: LOOP,
  world_for_each_button: LOOP,
  world_count_with: LOOP,
  // …and the three that bind a name inside ONE VALUE rather than a body: the
  // actor being tested, or measured, is bound in the test and not in the list
  // the test is applied to.
  world_filter_actors: {fields: ['VAR'], over: ['WHERE']},
  world_ordered_actors: {fields: ['VAR'], over: ['KEY']},
  world_extreme_actor: {fields: ['VAR'], over: ['KEY']},
};

/** A `define block`'s parameters, which are variables its mutator manages. */
const PARAMS_BLOCK = 'world_rule_block';

/**
 * Where a `define block`'s parameters reach, which is two places and was one.
 *
 * IN THE FILE the implementation sits in the head's `DO` mouth, so that is the
 * input the names cover. ON A BODY SURFACE it does not: the surface hangs the
 * implementation off the head's `next` (`bodySurfaces.bodyOf`), because a
 * member's block is the heading of the page rather than a box drawn round it.
 * The names have to follow it there, and until they did, every getter in every
 * `define block` implementation offered `???` — the parameters were in scope
 * of a mouth that surface leaves empty.
 *
 * ONLY THAT ONE HEAD gets the `next` chain, and the identity is what says so:
 * `bodyOf` gives it {@link BODY_OWNER_ID}, and nothing else on any surface
 * carries that id. On the INTERFACE the same `next` is the member list — what
 * the rule declares after this one — so binding over it there would put one
 * member's parameters in scope of the next member's body, which is a different
 * bug and a quieter one.
 */
const PARAMS_OVER = 'DO';

/** The variable ids a `define block` names as its parameters. */
function paramIds(block: Block): string[] {
  const state = (
    block as unknown as {
      saveExtraState?: () => {parts?: Array<{kind?: string; var?: string}>};
    }
  ).saveExtraState?.();
  return (state?.parts ?? [])
    .filter(part => part.kind === 'param' && typeof part.var === 'string')
    .map(part => part.var as string);
}

/** Every id `block` binds, and the inputs each binding reaches. */
function bindingsOf(block: Block): {ids: string[]; over: readonly string[]} {
  if (block.type === PARAMS_BLOCK) {
    return {
      ids: paramIds(block),
      over: block.id === BODY_OWNER_ID ? [PARAMS_OVER, REST] : [PARAMS_OVER],
    };
  }
  const binder = BINDERS[block.type];
  if (!binder) {
    return {ids: [], over: []};
  }
  const ids = binder.fields
    .map(name => block.getFieldValue(name))
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
  return {ids, over: binder.over};
}

/** Every id bound by some binder anywhere on the workspace. */
export function boundIds(workspace: Workspace): Set<string> {
  const bound = new Set<string>();
  for (const block of workspace.getAllBlocks(false)) {
    for (const id of bindingsOf(block).ids) {
      bound.add(id);
    }
  }
  return bound;
}

/**
 * Every id some block on the workspace WRITES — a setter, or a binder.
 *
 * NOT every id a block names, and not the variable map. Both of those hold
 * more than the file does, and in the same way: every block in the TOOLBOX
 * carries a default name — `amount`, `flag`, `text`, `other` — and Blockly
 * makes the variable so the flyout can draw it, so a getter dragged out of the
 * drawer arrives carrying one of them. Counting a READ as making a name is
 * what let that dragged getter turn `flag` into a name of the file's, offered
 * everywhere, for a variable nothing ever assigns.
 *
 * A name is made by being written to. That is what a rule's free locals are —
 * set in a step body and declared by nothing — and it is exactly what a
 * dangling read is not.
 */
export function writtenIds(workspace: Workspace): Set<string> {
  const written = new Set<string>();
  for (const block of workspace.getAllBlocks(false)) {
    const binds = bindingsOf(block).ids;
    // A setter is the other way a name comes to exist. Recognised by the
    // shape of its type rather than by a list, so a new flavour needs no
    // entry here (`createTypedVariable`).
    const assigns = /^variables_set_/.test(block.type)
      ? block.getVarModels().map(one => one.getId())
      : [];
    for (const id of [...binds, ...assigns]) {
      written.add(id);
    }
  }
  return written;
}

/**
 * Where `child` sits on `parent` — an input's name, or {@link REST}.
 *
 * {@link REST} when it is simply the next row down, which is what a stacked
 * block's parent link means and is the whole of how a declaration's scope is
 * worked out.
 */
function inputHolding(parent: Block, child: Block): string | undefined {
  if (parent.getNextBlock() === child) {
    return REST;
  }
  for (const input of parent.inputList) {
    const target = input.connection?.targetBlock();
    if (!target) {
      continue;
    }
    // The FIRST block in a statement stack is the input's target; the ones
    // after it are its `next`. Walk the stack, because a getter three rows
    // down a loop's body is as much inside that body as the first row is.
    for (let at: Block | null = target; at; at = at.getNextBlock()) {
      if (at === child) {
        return input.name;
      }
    }
  }
  return undefined;
}

/**
 * The variable ids `block` can see: what its ancestors bind, plus everything
 * nobody binds.
 *
 * Walked from the block outwards, asking at each step which INPUT the child
 * came out of — a name bound over `DO` is not in scope in the list beside it.
 */
export function idsInScope(block: Block): Set<string> {
  const workspace = block.workspace;
  const seen = new Set<string>();
  // Everything the file USES that no binder declares. These are its own — a
  // rule's free locals, which nothing has migrated — and the two halves are
  // both needed: without `used` the toolbox's default names are offered
  // everywhere, and without `bound` a local would be.
  const bound = boundIds(workspace);
  for (const id of writtenIds(workspace)) {
    if (!bound.has(id)) {
      seen.add(id);
    }
  }
  let child: Block = block;
  for (let at = block.getParent(); at; at = at.getParent()) {
    const {ids, over} = bindingsOf(at);
    const input = inputHolding(at, child);
    if (ids.length && input !== undefined && over.includes(input)) {
      for (const id of ids) {
        seen.add(id);
      }
    }
    child = at;
  }
  return seen;
}

/**
 * Whether `block`'s own name is ALREADY declared where it stands.
 *
 * Two `let`s for one name in one body would generate two `let`s for one
 * identifier, which is a SyntaxError that takes the whole module down. The
 * second is an assignment instead — which is what a reader means by writing it
 * twice, and is what every language that allows the shape does.
 *
 * Asked of the tree rather than remembered during generation: the same walk
 * that decides what a dropdown offers decides this, so the editor and the
 * compiler cannot disagree about which `let` a name belongs to.
 */
export function isRedeclaration(block: Block): boolean {
  const id = block.getFieldValue('VAR');
  if (typeof id !== 'string' || !id) {
    return false;
  }
  let child: Block = block;
  for (let at = block.getParent(); at; at = at.getParent()) {
    const {ids, over} = bindingsOf(at);
    const where = inputHolding(at, child);
    if (
      ids.includes(id) &&
      where !== undefined &&
      over.includes(where) &&
      at !== block
    ) {
      return true;
    }
    child = at;
  }
  return false;
}
