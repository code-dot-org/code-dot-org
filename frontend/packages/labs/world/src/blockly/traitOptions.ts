// The `world_use_trait` dropdown lists the traits an actor may take — a trait is
// available only when a rule that provides it is in play: attached to some
// `.world` file in the project, or required (transitively) by one. The rules are
// described as `RuleMeta` (the built-in library now; project `.rule` files join
// the same set later), so this reads metadata rather than the engine's rule
// objects directly — the seam that lets project rules contribute traits.

import {BUILTIN_RULE_META} from './builtinMeta';
import {liveDropdown} from './moduleOptions';
import type {RuleMeta, StepMeta} from './ruleMeta';
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
export function traitOptions(): Array<[string, string]> {
  const seen = new Set<string>();
  const options: Array<[string, string]> = [];
  for (const rule of rulesInPlay(projectRuleRefs)) {
    for (const trait of rule.traits) {
      if (!trait.ref.exportName) {
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

/** Make a block's `TRAIT` dropdown reflect the traits currently in play. */
export const traitOptionsExtension = liveDropdown(
  'world_trait_options',
  'TRAIT',
  traitOptions,
);

// ── Step anchors (for `define step`'s before/after ordering) ─────────────────
// A step's `STEP` dropdown lists steps other rules provide — a project step may
// run before/after one of them (gravity before Physics's `reposition`). The
// value is the same shape as every other reference: `<RuleName>#<stepId>`, the
// step being named within the rule that runs it (as `stepAnchorRef` decodes).
const stepValue = (step: StepMeta, rule: RuleMeta): string =>
  `${step.ownerRef.ruleName || rule.name}#${step.id}`;

/**
 * `[label, value]` options for the step anchor dropdown: every built-in step
 * (always an available anchor) plus the project's own `.rule` steps, labelled
 * `<Rule> ▸ <step>`. Deduped, sorted by label.
 */
export function stepOptions(): Array<[string, string]> {
  const seen = new Set<string>();
  const options: Array<[string, string]> = [];
  const rules = [...BUILTIN_RULE_META, ...projectByModule.values()];
  for (const rule of rules) {
    for (const step of rule.steps) {
      const value = stepValue(step, rule);
      if (!seen.has(value)) {
        seen.add(value);
        options.push([`${rule.name} ▸ ${step.name}`, value]);
      }
    }
  }
  options.sort((a, b) => a[0].localeCompare(b[0]));
  return options.length ? options : [['(none)', '']];
}

/** Make a block's `STEP` dropdown reflect the steps available to anchor to. */
export const stepOptionsExtension = liveDropdown(
  'world_step_options',
  'STEP',
  stepOptions,
);

// ── Events (for `emit`) ─────────────────────────────────────────────────────
// The `EVENT` dropdown lists every event a rule in play declares, so a step or
// an action can raise one. The value uses the SAME encoding as a trait —
// `<RuleName>#<exportName>` — so one decoder reads both, including the
// self-reference case that lets a rule emit its own event without importing its
// own module.
