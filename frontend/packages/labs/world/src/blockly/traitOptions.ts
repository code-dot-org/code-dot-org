// The `world_use_trait` dropdown lists the traits an actor may take — a trait is
// available only when a rule that provides it is in play: attached to some
// `.world` file in the project, or required (transitively) by one. The rules are
// described as `RuleMeta` (the built-in library now; project `.rule` files join
// the same set later), so this reads metadata rather than the engine's rule
// objects directly — the seam that lets project rules contribute traits.

import type {Blockly} from '@code-dot-org/blockly';

// For the side effect: importing it is what registers the built-in rules, and
// `ruleByName` below resolves nothing without them. It used to come in with
// `BUILTIN_RULE_META`, which the step-anchor dropdown read; that dropdown is
// gone and the registration still has to happen.
import './builtinMeta';
import {liveDropdown} from './moduleOptions';
import {pascal, type RuleMeta} from './ruleMeta';
import {memberValue, ruleByName} from './ruleRegistry';

// The project's declarative `.rule` rules, indexed by module path (what a world's
// or another rule's `use rule` names). Refreshed per project.
let projectByModule = new Map<string, RuleMeta>();

/**
 * What each parsed project rule IS and GIVES, by module path.
 *
 * `use rule` is a sentence about the world, so it is labelled by the ability
 * ("Has Gravity") and stores the rule's name ("Gravity"). A module the editor
 * has not parsed — a `.js` rule, or a `.rule` mid-edit — is absent, and the
 * caller falls back to naming it by its file, which is all it can be named by.
 */
export function projectRuleIdentities(): Map<
  string,
  {name: string; ability: string}
> {
  const identities = new Map<string, {name: string; ability: string}>();
  for (const [modulePath, meta] of projectByModule) {
    identities.set(modulePath, {name: meta.name, ability: meta.ability});
  }
  return identities;
}

/** Register the project's parsed `.rule` metadata (for resolving project rules
 *  a world attaches, and their transitive requires). */
export function setProjectRuleMeta(metas: RuleMeta[]): void {
  projectByModule = new Map();
  for (const meta of metas) {
    if (meta.modulePath) {
      projectByModule.set(meta.modulePath, meta);
    }
  }
}

// The rules the project's worlds attach — a rule NAME, or the module path of a
// `.js` rule, which has no declared name. Refreshed before the editor loads or
// the generator runs.
let projectRuleRefs: string[] = [];

/** Replace the rule references the trait dropdown derives its traits from. */
export function setProjectRules(refs: string[]): void {
  projectRuleRefs = refs;
}

// A rule reference resolves by NAME, wherever that rule lives. `requires` uses
// the same reference form, so the transitive closure is one resolver. A `.js`
// rule names no rule, so it is referenced by its module and resolves at runtime
// but not here — it is not a parsed `.rule`, and its traits aren't surfaced.
const resolveRef = (ref: string): RuleMeta | undefined =>
  ruleByName(ref) ?? projectByModule.get(ref);

/** The transitive closure of the referenced rules (each plus what it requires). */
function rulesInPlay(refs: string[]): Set<RuleMeta> {
  const rules = new Set<RuleMeta>();
  const add = (rule: RuleMeta | undefined): void => {
    if (!rule || rules.has(rule)) {
      return;
    }
    rules.add(rule);
    for (const dep of rule.requires) {
      add(resolveRef(dep));
    }
  };
  for (const ref of refs) {
    add(resolveRef(ref));
  }
  return rules;
}

/**
 * Current `[label, exportName]` options: every trait provided by a rule in play,
 * labelled by its display name, valued by its `world-lab` export (what the
 * generator writes). Deduped by export, sorted by label for a stable dropdown.
 */
/**
 * What the thing electing a trait here IS — an actor, or a camera.
 *
 * A trait belongs to whatever takes it (`TraitMeta.subject`), so the dropdown
 * has to know where it is being asked from: inside `define camera` only camera
 * traits make sense, and inside `define actor` only an actor's. Offering both
 * everywhere would put "Affected by Gravity" on a camera, which is the
 * meaningless-trait problem this project has already avoided twice.
 *
 * Inside `define trait`, the answer is that TRAIT's own subject: a camera
 * trait's dependencies are camera traits.
 */
export function traitSubjectFor(field?: {
  getSourceBlock(): unknown;
}): 'actor' | 'camera' {
  const block = field?.getSourceBlock() as
    | {
        getSurroundParent?(): unknown;
        getParent?(): unknown;
      }
    | null
    | undefined;
  for (
    let parent = block?.getParent?.() as
      | {
          type?: string;
          getParent?(): unknown;
          getFieldValue?(n: string): string;
        }
      | null
      | undefined;
    parent;
    parent = parent.getParent?.() as typeof parent
  ) {
    if (parent.type === 'world_define_camera') {
      return 'camera';
    }
    if (parent.type === 'world_actor') {
      return 'actor';
    }
    if (parent.type === 'world_rule_trait') {
      return parent.getFieldValue?.('SUBJECT') === 'camera'
        ? 'camera'
        : 'actor';
    }
  }
  return 'actor';
}

/**
 * The traits in play, optionally narrowed to what one kind of thing can take.
 *
 * TWO CALLERS ASKING TWO QUESTIONS. `use trait` is ELECTING one, and knows from
 * where it sits what is doing the electing — filtering there is what keeps
 * "Affected by Gravity" off a camera. `has trait` is ASKING about whatever is
 * plugged into its socket, and that is undecidable at edit time: a camera's
 * value is Actor-typed on purpose, so a `for each actor` walking `all cameras`
 * looks exactly like one walking actors. Filtering there hid every camera trait
 * from the one loop that needed them.
 */
/**
 * The traits THIS workspace declares, when it is a `.rule`.
 *
 * A rule must always see its own traits, however no world attaches it yet.
 * `rulesInPlay` answers "what may a world use", which is the right question in
 * an `.actor` or a `.world` and the wrong one in the rule being written: a
 * learner defining a trait cannot then name it in the same file's step, which
 * is the very next thing they will try.
 *
 * Read from the workspace's own blocks rather than from the parsed registry so
 * a trait appears the moment it is named — a registry refreshes on a parse, and
 * waiting for one is the same delay by a different route (`localActorsIn` and
 * `layersIn` do this for the same reason).
 */
function ownTraitOptions(
  field: {getSourceBlock(): unknown} | undefined,
  wanted?: 'actor' | 'camera',
): Array<[string, string]> {
  const source = field?.getSourceBlock() as
    | {workspace?: Blockly.WorkspaceSvg & {targetWorkspace?: unknown}}
    | null
    | undefined;
  const raw = source?.workspace;
  const workspace = (raw?.isFlyout ? raw.targetWorkspace : raw) as
    | {getTopBlocks?(ordered: boolean): unknown[]}
    | undefined;
  const tops = (workspace?.getTopBlocks?.(false) ?? []) as Array<{
    type?: string;
    getFieldValue?(name: string): string | null;
  }>;
  const rule = tops.find(block => block.type === 'world_rule');
  if (!rule) {
    return []; // not a `.rule` workspace — nothing of its own to offer
  }
  const ruleName = String(rule.getFieldValue?.('NAME') ?? '') || 'Rule';
  return tops
    .filter(block => block.type === 'world_rule_trait')
    .map(block => ({
      name: String(block.getFieldValue?.('NAME') ?? ''),
      subject:
        block.getFieldValue?.('SUBJECT') === 'camera' ? 'camera' : 'actor',
    }))
    .filter(
      trait => trait.name && (wanted === undefined || trait.subject === wanted),
    )
    .map(
      trait =>
        [trait.name, `${ruleName}#${pascal(trait.name)}Trait`] as [
          string,
          string,
        ],
    );
}

function traitOptionsFor(
  wanted?: 'actor' | 'camera',
  field?: {getSourceBlock(): unknown},
): Array<[string, string]> {
  const seen = new Set<string>();
  const options: Array<[string, string]> = [];
  // Its own first, so a rule being written can always name what it declares.
  for (const own of ownTraitOptions(field, wanted)) {
    if (!seen.has(own[1])) {
      seen.add(own[1]);
      options.push(own);
    }
  }
  for (const rule of rulesInPlay(projectRuleRefs)) {
    for (const trait of rule.traits) {
      if (
        !trait.ref.exportName ||
        (wanted !== undefined && (trait.subject ?? 'actor') !== wanted)
      ) {
        continue;
      }
      const value = memberValue(trait.ref);
      if (!seen.has(value)) {
        seen.add(value);
        options.push([trait.name, value]);
      }
    }
  }
  options.sort((a, b) => a[0].localeCompare(b[0]));
  return options.length ? options : [['(none)', '']];
}

/** For `use trait`: only what the thing electing here can actually take. */
export function traitOptions(
  field?: Blockly.FieldDropdown,
): Array<[string, string]> {
  return traitOptionsFor(traitSubjectFor(field), field);
}

/** For `has trait`: every trait, because the subject is a value, not a place. */
export function anyTraitOptions(
  field?: Blockly.FieldDropdown,
): Array<[string, string]> {
  return traitOptionsFor(undefined, field);
}

/** Make `use trait`'s dropdown reflect the traits the subject here can take. */
export const traitOptionsExtension = liveDropdown(
  'world_trait_options',
  'TRAIT',
  traitOptions,
);

/** Make `has trait`'s dropdown reflect every trait in play. */
export const anyTraitOptionsExtension = liveDropdown(
  'world_any_trait_options',
  'TRAIT',
  anyTraitOptions,
);

// ── Events (for `emit`) ─────────────────────────────────────────────────────
// The `EVENT` dropdown lists every event a rule in play declares, so a step or
// an action can raise one. The value uses the SAME encoding as a trait —
// `<RuleName>#<exportName>` — so one decoder reads both, including the
// self-reference case that lets a rule emit its own event without importing its
// own module.
