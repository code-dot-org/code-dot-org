// The `world_use_trait` dropdown lists the traits an actor may take — a trait is
// available only when a rule that provides it is in play: attached to some
// `.world` file in the project, or required (transitively) by one. The rules are
// described as `RuleMeta` (the built-in library now; project `.rule` files join
// the same set later), so this reads metadata rather than the engine's rule
// objects directly — the seam that lets project rules contribute traits.

import {BUILTIN_RULE_META} from './builtinMeta';
import {liveDropdown} from './moduleOptions';
import type {MemberRef, RuleMeta, StepMeta} from './ruleMeta';

// The `TRAIT` dropdown value encodes how the generator names the trait: a
// built-in is its `world-lab` export name; a project trait is
// `<modulePath>#<exportName>` so `use trait` can import it from the rule module
// (see `refFromTraitValue` in domainBlocks). Built-in values are unchanged, so
// saved actors keep working.
const traitValue = (ref: MemberRef): string =>
  ref.source === 'project' && ref.modulePath
    ? `${ref.modulePath}#${ref.exportName}`
    : ref.exportName;

// Built-in rules indexed by `world-lab` export name — what a `.world`'s `use
// rule` block names, and what a rule's `requires` lists (a built-in export name
// or a project module path, uniformly).
const metaByExport = new Map<string, RuleMeta>();
for (const rule of BUILTIN_RULE_META) {
  if (rule.ref.exportName) {
    metaByExport.set(rule.ref.exportName, rule);
  }
}

// The project's declarative `.rule` rules, indexed by module path (what a world's
// or another rule's `use rule` names). Refreshed per project.
let projectByModule = new Map<string, RuleMeta>();

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

// The rules the project's worlds attach — a built-in export name or a project
// `.rule` module path — refreshed before the editor loads or the generator runs.
let projectRuleRefs: string[] = [];

/** Replace the rule references the trait dropdown derives its traits from. */
export function setProjectRules(refs: string[]): void {
  projectRuleRefs = refs;
}

// A rule reference resolves to a built-in (by export name) or a project `.rule`
// (by module path). `requires` uses the same reference form, so the transitive
// closure is one resolver. (A `.js` shim dependency resolves at runtime but not
// here — it is not a parsed `.rule` — so its traits aren't surfaced.)
const resolveRef = (ref: string): RuleMeta | undefined =>
  metaByExport.get(ref) ?? projectByModule.get(ref);

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
      const value = traitValue(trait.ref);
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
// run before/after one of them (gravity before Motion's `reposition`). The value
// encodes the anchor for codegen: `<owner>#<stepId>`, `owner` being a built-in
// rule export name or a project rule module path (as `stepAnchorRef` decodes).
const stepValue = (step: StepMeta): string => {
  const owner = step.ownerRef;
  const key =
    owner.source === 'project' && owner.modulePath
      ? owner.modulePath
      : owner.exportName;
  return `${key}#${step.id}`;
};

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
      const value = stepValue(step);
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
// an action can raise one. The value uses the SAME encoding as a trait — a
// built-in's export name, or `<modulePath>#<exportName>` for a project rule's —
// so `refFromTraitValue` decodes it unchanged, including the self-reference case
// that lets a rule emit its own event without importing its own module.

/**
 * `[label, value]` options for the event dropdown: every event a rule in play
 * declares, labelled `<Rule> ▸ <event>`. Deduped, sorted by label.
 *
 * Every rule's events, not just the authoring rule's own. A rule may legitimately
 * raise another's — "Has Gravity" is what tells an actor it started falling, and
 * a project rule extending it would say the same thing the same way.
 */
export function eventOptions(): Array<[string, string]> {
  const seen = new Set<string>();
  const options: Array<[string, string]> = [];
  for (const rule of [...BUILTIN_RULE_META, ...projectByModule.values()]) {
    for (const event of rule.events) {
      const value = traitValue(event.ref);
      if (!value || seen.has(value)) {
        continue;
      }
      seen.add(value);
      options.push([`${rule.name} \u25b8 ${event.name}`, value]);
    }
  }
  options.sort((a, b) => a[0].localeCompare(b[0]));
  return options.length ? options : [['(none)', '']];
}

/** Make a block's `EVENT` dropdown reflect the events currently in play. */
export const eventOptionsExtension = liveDropdown(
  'world_event_options',
  'EVENT',
  eventOptions,
);
