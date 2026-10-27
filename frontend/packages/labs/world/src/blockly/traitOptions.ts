// The `world_use_trait` dropdown lists the traits an actor may take — a trait is
// available only when a rule that provides it is in play: attached to some
// `.world` file in the project, or required (transitively) by one. The rules are
// described as `RuleMeta` (the built-in library now; project `.rule` files join
// the same set later), so this reads metadata rather than the engine's rule
// objects directly — the seam that lets project rules contribute traits.

// For the side effect: importing it is what registers the built-in rules, and
// `ruleByName` below resolves nothing without them. It used to come in with
// `BUILTIN_RULE_META`, which the step-anchor dropdown read; that dropdown is
// gone and the registration still has to happen.
import './builtinMeta';
import {liveDropdown, orNone} from './moduleOptions';
import type {RuleMeta, TraitMeta} from './ruleMeta';
import {memberValue, ruleByName} from './ruleRegistry';

// The project's declarative `.rule` rules, indexed by module path (what a world's
// or another rule's `use rule` names). Refreshed per project.
let projectByModule = new Map<string, RuleMeta>();

/**
 * What each parsed project rule IS and GIVES, by module path.
 *
 * `use rule` is a sentence about the world, so it is labeled by the ability
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
 * labeled by its display name, valued by its `world-lab` export (what the
 * generator writes). Deduped by export, sorted by label for a stable dropdown.
 */
/**
 * The subject a trait DECLARES, by the value a dropdown stores.
 *
 * `add trait ⟨…⟩ to ⟨…⟩` can name any trait from anywhere, so what decides
 * whether its target is a camera is the trait itself, not the surroundings.
 *
 * Undefined for a value naming a trait nothing in play declares — a rule
 * deleted, or a file that outlived one. The caller then leaves the socket as
 * it was rather than guessing.
 */
export function subjectOfTraitValue(
  value: string,
): 'actor' | 'camera' | undefined {
  for (const rule of rulesInPlay(projectRuleRefs)) {
    for (const trait of rule.traits) {
      if (trait.ref.exportName && memberValue(trait.ref) === value) {
        return trait.subject ?? 'actor';
      }
    }
  }
  return undefined;
}

function traitOptionsFor(wanted?: 'actor' | 'camera'): Array<[string, string]> {
  const seen = new Set<string>();
  const options: Array<[string, string]> = [];
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
  return orNone(options);
}

/**
 * Which kind of thing takes the trait a reference names — an actor, or a
 * camera — from the rules in play. Undefined for a value nothing declares.
 *
 * What the generator asks under `define actor`: a camera trait elected there
 * is the Viewport's main camera's, and compiles to a different call.
 */
export function traitSubjectOfValue(
  value: string,
): 'actor' | 'camera' | undefined {
  for (const rule of rulesInPlay(projectRuleRefs)) {
    for (const trait of rule.traits) {
      if (trait.ref.exportName && memberValue(trait.ref) === value) {
        return trait.subject ?? 'actor';
      }
    }
  }
  return undefined;
}

/**
 * The trait a field value names, from the rules in play — its name as its
 * author wrote it, and its description. Undefined for a value nothing declares.
 */
export function traitOfValue(value: string): TraitMeta | undefined {
  for (const rule of rulesInPlay(projectRuleRefs)) {
    for (const trait of rule.traits) {
      if (trait.ref.exportName && memberValue(trait.ref) === value) {
        return trait;
      }
    }
  }
  return undefined;
}

/**
 * Only the traits an ACTOR can take, and only the ones a CAMERA can.
 *
 * `add trait ⟨…⟩ to ⟨…⟩` exists twice in the toolbox — once for each subject —
 * because one block offering both put every camera trait in front of somebody
 * wiring up an actor, and a camera trait elected on an actor reads correctly
 * and does nothing at all. Narrowing the list is what stops the mistake being
 * available, which is better than catching it afterwards.
 */
export function actorTraitOptions(): Array<[string, string]> {
  return traitOptionsFor('actor');
}

export function cameraTraitOptions(): Array<[string, string]> {
  return traitOptionsFor('camera');
}

/** For `has trait`: every trait, because the subject is a value, not a place. */
export function anyTraitOptions(): Array<[string, string]> {
  return traitOptionsFor(undefined);
}

/** Make `has trait`'s dropdown reflect every trait in play. */
export const actorTraitOptionsExtension = liveDropdown(
  'world_actor_trait_options',
  'TRAIT',
  actorTraitOptions,
);

export const cameraTraitOptionsExtension = liveDropdown(
  'world_camera_trait_options',
  'TRAIT',
  cameraTraitOptions,
);

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
