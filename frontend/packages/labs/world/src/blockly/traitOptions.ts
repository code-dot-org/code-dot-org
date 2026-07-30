// The `world_use_trait` dropdown lists the traits an actor may take — a trait is
// available only when a rule that provides it is in play: attached to some
// `.world` file in the project, or required (transitively) by one. The rules are
// described as `RuleMeta` (the built-in library now; project `.rule` files join
// the same set later), so this reads metadata rather than the engine's rule
// objects directly — the seam that lets project rules contribute traits.

import {BUILTIN_RULE_META} from './builtinMeta';
import {liveDropdown} from './moduleOptions';
import type {MemberRef, RuleMeta} from './ruleMeta';

// The `TRAIT` dropdown value encodes how the generator names the trait: a
// built-in is its `world-lab` export name; a project trait is
// `<modulePath>#<exportName>` so `use trait` can import it from the rule module
// (see `refFromTraitValue` in domainBlocks). Built-in values are unchanged, so
// saved actors keep working.
const traitValue = (ref: MemberRef): string =>
  ref.source === 'project' && ref.modulePath
    ? `${ref.modulePath}#${ref.exportName}`
    : ref.exportName;

// The rules the editor knows, indexed for resolution: by `world-lab` export name
// (what a `.world`'s `use rule` block names) and by rule id (what `requires`
// lists). Built-ins now; project `.rule` metadata will extend these.
const metaByExport = new Map<string, RuleMeta>();
const metaById = new Map<string, RuleMeta>();
for (const rule of BUILTIN_RULE_META) {
  if (rule.ref.exportName) {
    metaByExport.set(rule.ref.exportName, rule);
  }
  metaById.set(rule.id, rule);
}

// The project's declarative `.rule` rules, indexed by module path (what a world's
// `use rule` names) and id (what `requires` lists). Refreshed per project.
let projectByModule = new Map<string, RuleMeta>();
let projectById = new Map<string, RuleMeta>();

/** Register the project's parsed `.rule` metadata (for resolving project rules
 *  a world attaches, and their transitive requires). */
export function setProjectRuleMeta(metas: RuleMeta[]): void {
  projectByModule = new Map();
  projectById = new Map();
  for (const meta of metas) {
    if (meta.modulePath) {
      projectByModule.set(meta.modulePath, meta);
    }
    projectById.set(meta.id, meta);
  }
}

// The rules the project's worlds attach — a built-in export name or a project
// `.rule` module path — refreshed before the editor loads or the generator runs.
let projectRuleRefs: string[] = [];

/** Replace the rule references the trait dropdown derives its traits from. */
export function setProjectRules(refs: string[]): void {
  projectRuleRefs = refs;
}

// A ref resolves to a built-in (by export name) or a project rule (by module
// path); a rule's `requires` lists ids across both sets.
const resolveRef = (ref: string): RuleMeta | undefined =>
  metaByExport.get(ref) ?? projectByModule.get(ref);
const resolveId = (id: string): RuleMeta | undefined =>
  metaById.get(id) ?? projectById.get(id);

/** The transitive closure of the referenced rules (each plus what it requires). */
function rulesInPlay(refs: string[]): Set<RuleMeta> {
  const rules = new Set<RuleMeta>();
  const add = (rule: RuleMeta | undefined): void => {
    if (!rule || rules.has(rule)) {
      return;
    }
    rules.add(rule);
    for (const id of rule.requires) {
      add(resolveId(id));
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
