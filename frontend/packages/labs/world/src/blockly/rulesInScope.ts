// Which rules a `.rule` is allowed to reach for.
//
// A project holds every rule it has imported, and the toolbox used to offer all
// of them in every file. That is right for a WORLD, which runs the lot
// (`projectModules`), and wrong for a rule, which says what it depends on and
// then gets handed blocks from rules it never imported. What comes of that is
// not a warning — it is a project that will not compile, from a block the
// editor itself offered.
//
// So the answer here is the TRANSITIVE closure of what the file says: what it
// uses, what those use, and so on down. The same closure `traitOptions` walks
// for the trait dropdown, because a rule's `use rule` and a world's attachment
// are the same kind of reference.
//
// THE SEED IS ITS OWN `use rule` ROWS, PLUS ITSELF — a rule calls the blocks it
// designs and reads the properties it declares — and, on top of those, any rule
// whose block the file ALREADY HOLDS. That last is not a loophole: it makes one
// property true unconditionally, which is that THE TOOLBOX CANNOT HIDE A BLOCK
// THE FILE IS USING. A learner who opens a file, sees a block, and cannot find
// another like it anywhere in the toolbox has been told the editor is broken,
// and they are not wrong.
//
// A WORLD GETS EVERYTHING, because it runs every rule the project holds.
//
// AND SO DOES AN ACTOR, which is the answer this arrived at second. An actor
// declares traits, so the closure over them is easy to compute and looks like
// the same idea — but a trait is not the only way an actor touches a rule, and
// six of the shipped files prove it: the Pilot wins the game and adds to the
// score without being a Goal or a Scoreboard, a health bar reads the health of
// the thing it hangs over, a ledge damages whoever lands on it. A `use trait`
// in any of them would be a lie about what the actor IS. Narrowing on traits
// alone would have hidden those; narrowing on traits plus what is already
// written keeps them, but only for the file that already had them — a rule can
// affect an actor's shape or another actor's traits without either of them
// saying so, and the editor has no way to know which. So an actor is offered
// every rule, and the one place a declaration is the whole story is a `.rule`.
//
// THE ENGINE'S OWN RULES ARE NEVER OUT OF SCOPE. `Space` and `Appearance` are
// what every actor has before it elects anything — a position is not something
// a rule can invent (`builtinMeta`) — so they are not in this reckoning at all.
// Only the project's `.rule` files are, which is what `outOfScope` returns and
// why it is derived from the rules it is given rather than from the toolbox.
//
// WHAT NARROWING TAKES AWAY IS THE WAY IN, NOT THE BLOCKS. The caller hands
// this to `withoutCategories`, which drops a category and leaves every
// definition standing — so a file that already holds a block from a rule it no
// longer names still renders it and still generates it. Electing a trait puts
// the category back, which is the loop this is meant to have: say what you
// depend on, and its blocks appear.

import type {RuleMeta} from './ruleMeta';

/**
 * Which rule each block type belongs to, by the rule's NAME.
 *
 * Read off the palette's own toolbox rather than kept as a second list, because
 * what is being asked is precisely "would hiding this category take that block
 * away" — and the categories are the thing that would be hidden. A block in no
 * rule category (`if`, `set position`, a variable) is in nobody's and is never
 * hidden by this.
 */
export function blockOwners(
  toolbox: unknown,
  rules: readonly RuleMeta[],
): Map<string, string> {
  const owners = new Map<string, string>();
  if (!Array.isArray(toolbox)) {
    return owners;
  }
  const names = new Set(rules.map(rule => rule.name));
  for (const category of toolbox as Array<{
    name?: string;
    blocks?: unknown[];
  }>) {
    if (!category?.name || !names.has(category.name)) {
      continue;
    }
    for (const item of category.blocks ?? []) {
      // An entry may be a whole flyout item rather than a type; those name no
      // block and cannot be what a file is using.
      if (typeof item === 'string' && !owners.has(item)) {
        owners.set(item, category.name);
      }
    }
  }
  return owners;
}

/** The file a palette is being built for. */
export interface ScopedFile {
  /** `rule` narrows; anything else, or nothing, does not. */
  kind?: string;
  /** The `.rule` being edited, as a module path, so it can find its own meta. */
  module?: string;
  /** Its contents, which is where what it already holds is read from. */
  contents?: string;
}

/** A saved block, as far as this needs to see one. */
interface SavedBlock {
  type?: string;
  fields?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Every block in a saved document, at any depth. */
function* everyBlock(node: unknown): Generator<SavedBlock> {
  if (Array.isArray(node)) {
    for (const item of node) {
      yield* everyBlock(item);
    }
    return;
  }
  if (!node || typeof node !== 'object') {
    return;
  }
  const block = node as SavedBlock;
  if (typeof block.type === 'string') {
    yield block;
  }
  for (const value of Object.values(block)) {
    yield* everyBlock(value);
  }
}

/**
 * The rule NAME a `use trait` value names.
 *
 * The dropdown stores a trait as its rule's name and the export its own name
 * derives — "Acts as Ground" declared by "Gravity" is `Gravity#ActsAsGround
 * Trait` (`constants.useTrait`) — so the rule is everything before the `#`. A
 * value with no `#` names no rule and is skipped rather than guessed at: an
 * empty dropdown reads as `''`, and treating that as a rule called nothing
 * would put every unnamed rule in scope.
 */
const ruleOfTrait = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const hash = value.indexOf('#');
  return hash > 0 ? value.slice(0, hash) : undefined;
};

/**
 * The rules a document names: the traits it elects, and the blocks it calls.
 * `undefined` if the document cannot be read.
 *
 * THE TWO EMPTY ANSWERS ARE NOT THE SAME ONE, and conflating them is how this
 * hides most of the toolbox. A rule that names nothing is offered nothing
 * beyond itself; a file that does not parse — mid-save, or written by
 * something else — is one this cannot speak for, and the caller offers
 * everything. Both are "no rules found", and only the second is a reason not
 * to narrow.
 *
 * `use trait` counts even here, where the file is a `.rule`: a trait may
 * require another rule's trait, and that is a dependency written exactly the
 * way an actor's election is.
 */
function rulesNamedIn(
  contents: string,
  owners: ReadonlyMap<string, string>,
): string[] | undefined {
  let document: unknown;
  try {
    document = JSON.parse(contents);
  } catch {
    return undefined;
  }
  const named: string[] = [];
  for (const block of everyBlock(document)) {
    if (block.type === 'world_use_trait') {
      const rule = ruleOfTrait(block.fields?.TRAIT);
      if (rule) {
        named.push(rule);
      }
    }
    const owner = block.type ? owners.get(block.type) : undefined;
    if (owner) {
      named.push(owner);
    }
  }
  return named;
}

/**
 * The rules a file may reach for, by NAME — or `undefined` for "all of them".
 *
 * `undefined` rather than the full set, so a caller cannot narrow by accident:
 * every path that does not know what a file depends on says so out loud, and
 * the toolbox is left as it was. That is the safe direction, and it is the one
 * a world, the headless generator and an unreadable file all take.
 */
export function rulesInScope(
  file: ScopedFile,
  rules: readonly RuleMeta[],
  owners: ReadonlyMap<string, string> = new Map(),
): ReadonlySet<string> | undefined {
  if (file.kind !== 'rule') {
    return undefined;
  }
  const byName = new Map<string, RuleMeta>();
  const byModule = new Map<string, RuleMeta>();
  for (const rule of rules) {
    // FIRST WINS, matching `ruleByName`: two rules may claim one name
    // (`duplicateRuleNames`), and a reference that is ambiguous is ambiguous
    // the same way wherever it is resolved.
    if (!byName.has(rule.name)) {
      byName.set(rule.name, rule);
    }
    if (rule.modulePath) {
      byModule.set(rule.modulePath, rule);
    }
  }
  // A reference is a NAME wherever that rule lives, or a module path for a rule
  // that declares no name — the same two forms `traitOptions` resolves, because
  // a rule's `requires` and a world's attachment are the same reference.
  const resolve = (ref: string) => byName.get(ref) ?? byModule.get(ref);

  // What the file itself names — its traits and the rule blocks it holds. An
  // unreadable file names nothing it can be held to, so it is not narrowed.
  const named =
    file.contents === undefined
      ? undefined
      : rulesNamedIn(file.contents, owners);
  if (!named) {
    return undefined;
  }
  const own = file.module ? byModule.get(file.module) : undefined;
  if (!own) {
    // The file being edited is not among the rules handed over — one still
    // being written, or one that does not parse. Nothing to close over, and
    // nothing worth hiding.
    return undefined;
  }
  const seeds: string[] = [...named, own.name, ...own.requires];

  const inScope = new Set<string>();
  const add = (rule: RuleMeta | undefined): void => {
    if (!rule || inScope.has(rule.name)) {
      return;
    }
    inScope.add(rule.name);
    for (const dep of rule.requires) {
      add(resolve(dep));
    }
  };
  for (const seed of seeds) {
    add(resolve(seed));
  }
  return inScope;
}

/**
 * The rule categories to leave out, ready for `withoutCategories`.
 *
 * The complement rather than the set itself, because hiding is what the toolbox
 * filter takes and because the complement is the safer shape to compute: it
 * names only rules that were handed over, so a category this does not know
 * about — `Actor`, `Logic`, `Space` — cannot be hidden by it.
 */
export function rulesOutOfScope(
  file: ScopedFile,
  rules: readonly RuleMeta[],
  owners: ReadonlyMap<string, string> = new Map(),
): string[] {
  const inScope = rulesInScope(file, rules, owners);
  if (!inScope) {
    return [];
  }
  return rules.map(rule => rule.name).filter(name => !inScope.has(name));
}
