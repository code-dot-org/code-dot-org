// Which rule a name means.
//
// A rule is referred to by its NAME — `use rule ⟨Has Gravity⟩` stores "Gravity",
// a trait reads `Gravity#AffectedByGravityTrait`, a step anchors on
// `Physics#reposition`, and a member's block type is
// `world_get_Gravity_FallingProperty`. Nothing anywhere says where the rule
// lives, which is the point: a `.rule` file can be renamed or moved into another
// folder and every reference to it still resolves.
//
// WHERE it lives is needed exactly once, when generating code: a project rule is
// imported from its module. That is what this answers. The mapping is built from
// the same parse the toolbox categories come from, so a rule that can be seen
// can be resolved.
//
// Two rules with one name is therefore not a cosmetic problem but an ambiguous
// reference; the first registered wins and {@link duplicateRuleNames} reports
// the rest, so the editor can say so rather than silently picking.

import type {MemberRef, RuleMeta} from './ruleMeta';

let builtins: readonly RuleMeta[] = [];
let projectRules: readonly RuleMeta[] = [];

/** The engine's rules, registered once at startup (builtinMeta). */
export function registerBuiltinRules(metas: readonly RuleMeta[]): void {
  builtins = metas;
}

/**
 * The project's parsed `.rule` rules, refreshed whenever its files change.
 *
 * Both the editor and the headless generator do this before they read a
 * workspace: the editor to fill dropdowns, the generator to resolve the
 * references it is about to write.
 */
export function registerProjectRules(metas: readonly RuleMeta[]): void {
  projectRules = metas;
}

/** Every rule in play, project rules first — a project rule shadows nothing. */
function all(): RuleMeta[] {
  return [...builtins, ...projectRules];
}

/** The rule a name means, or undefined if the project has no such rule. */
export function ruleByName(name: string): RuleMeta | undefined {
  return all().find(rule => rule.name === name);
}

/** Names claimed by more than one rule — an ambiguous reference each. */
export function duplicateRuleNames(): string[] {
  const seen = new Set<string>();
  const duplicated = new Set<string>();
  for (const rule of all()) {
    if (seen.has(rule.name)) {
      duplicated.add(rule.name);
    }
    seen.add(rule.name);
  }
  return [...duplicated];
}

/**
 * Where a named rule comes from, for the generator.
 *
 * `{source: 'builtin', exportName}` is `WorldLab.<exportName>`; `{source:
 * 'project', modulePath}` is an import from that module. An unknown name
 * resolves to nothing, and the caller decides what to do about it — a `.js`
 * rule, which declares no name, is referred to by its module and lands here.
 */
export function ruleLocation(
  name: string,
):
  | {source: 'builtin'; exportName: string}
  | {source: 'project'; modulePath: string}
  | undefined {
  const rule = ruleByName(name);
  if (!rule) {
    return undefined;
  }
  return rule.source === 'project' && rule.modulePath
    ? {source: 'project', modulePath: rule.modulePath}
    : {source: 'builtin', exportName: rule.ref.exportName};
}

/** A member reference's rule name — what it is stored as. */
export function refRuleName(ref: MemberRef): string {
  return ref.ruleName ?? '';
}

// ── The reference format ─────────────────────────────────────────────────────
// One string form for every stored reference to a rule member: `<RuleName>#<Export>`
// — a trait dropdown's value, an event's, a step anchor's. Nothing else is
// stored, so a rule's file may be renamed, moved, or promoted out of the engine
// into a `.rule` (or back) and every reference to it still points at it.

/** Encode a member reference as the value a field stores. */
export function memberValue(ref: MemberRef): string {
  return ref.ruleName ? `${ref.ruleName}#${ref.exportName}` : ref.exportName;
}

/**
 * Decode a stored value back to a member reference, resolving it against the
 * registry: which rule the name means, and — if it is a project rule — the
 * module its members are imported from.
 *
 * An unregistered name still decodes (to the name and export it carries) so a
 * dropdown holding it keeps its value while the rule that defines it is being
 * written; only code generation needs it to resolve.
 */
export function refFromValue(value: string): MemberRef {
  const hash = value.indexOf('#');
  if (hash < 0) {
    // No rule named: a built-in's bare export, and the empty `(none)` value.
    return {source: 'builtin', exportName: value};
  }
  const ruleName = value.slice(0, hash);
  const exportName = value.slice(hash + 1);
  const rule = ruleByName(ruleName);
  return {
    source: rule?.source ?? 'project',
    exportName,
    ruleName,
    modulePath: rule?.modulePath,
  };
}

/**
 * The module a reference is imported from, or undefined for a built-in.
 *
 * The registry answers first — it knows where the rule lives NOW — and the ref's
 * own `modulePath` is the fallback, which is what a ref built by the parser
 * (rather than decoded from a value) carries.
 */
export function refModule(ref: MemberRef): string | undefined {
  if (ref.ruleName) {
    const located = ruleLocation(ref.ruleName);
    if (located) {
      return located.source === 'project' ? located.modulePath : undefined;
    }
  }
  return ref.source === 'project' ? ref.modulePath : undefined;
}

/**
 * Whether the rule a reference names is one the project still has.
 *
 * A DEAD REFERENCE is a thing a project can now hold, and holding one used to
 * stop the whole thing running. Deleting `rules/gravity.rule` leaves every
 * `use trait Affected by Gravity` in the project naming a rule nothing
 * declares — and `refModule` answers with the path the reference was built
 * with, so the generated module imported a file that is not there and the
 * compile failed outright:
 *
 *   cannot resolve 'rules/gravity' from 'actors/player.actor'
 *
 * The project stopped at the door: not the actor that elected the trait, the
 * whole project, with the message naming a file the learner may never have
 * opened. So the emitting side asks this first and writes nothing at all,
 * which leaves the actor without that trait and everything else running — and
 * the block says so on its own face (extensions/missingRule).
 *
 * A reference with no rule name is the engine's own bare export and always
 * resolves; it is compiled into the runtime rather than imported.
 */
export function refResolves(ref: MemberRef): boolean {
  return !ref.ruleName || ruleByName(ref.ruleName) !== undefined;
}

// Which rule each MEMBER block belongs to, by block type.
//
// A `use trait` block names its trait in a field, so what it refers to can be
// read off the block. Every other member block — a hat, a query, a getter, an
// action — names its member in the block TYPE, and the reference itself lives
// in the closure the definition was built with. Nothing on the block can be
// asked about it.
//
// So the factories say, once, as they define each block. What reads it is the
// warning (extensions/missingRule): a block whose rule the project no longer
// has generates nothing, and a block that generates nothing has to say so.
const ruleByBlockType = new Map<string, string>();

/** Record that `blockType` is a member of `ruleName` (called at definition). */
export function registerMemberBlockType(
  blockType: string,
  ruleName: string | undefined,
): void {
  if (ruleName) {
    ruleByBlockType.set(blockType, ruleName);
  }
}

// A stand-in's rule, which is known LESS precisely: it was read back out of
// the block type, where the name has had its punctuation taken out and been
// guessed at again (standInBlocks). Kept apart from the real map so that
// registering the rule again overwrites the guess with the rule's own name,
// rather than the guess shadowing it.
const standInRuleByBlockType = new Map<string, string>();

/** Record the rule a synthesised stand-in stands in for. */
export function registerStandInRule(
  blockType: string,
  ruleName: string | undefined,
): void {
  if (ruleName) {
    standInRuleByBlockType.set(blockType, ruleName);
  }
}

/** The rule a member block belongs to, if it is one and the rule is missing. */
export function missingRuleOfBlockType(blockType: string): string | undefined {
  const ruleName =
    ruleByBlockType.get(blockType) ?? standInRuleByBlockType.get(blockType);
  return ruleName && !ruleByName(ruleName) ? ruleName : undefined;
}

/**
 * A rule name as an identifier fragment — for block TYPES, which are registry
 * keys and must not contain punctuation ("Arrow Keys" → `ArrowKeys`).
 */
export function ruleSlug(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, '');
}
