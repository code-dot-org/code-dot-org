// The `world_use_trait` dropdown lists the traits an actor may take — and a
// trait is available only when a rule that provides it is in play. "In play"
// means: attached to some `.world` file in the project, OR required (transitively)
// by one that is. Rather than mirror the engine's rule/trait structure here, we
// read it straight off the engine objects — the single source of truth — since a
// `.world`'s `use rule` blocks name rules by their `world-lab` export. (This
// imports the engine into the editor; that is deliberate — rules are headed
// toward being importable, inspectable project sources.)

import * as WorldLab from '../engine';
import {Trait} from '../engine';

import {liveDropdown} from './moduleOptions';

// A rule is a frozen record; we only need its trait set and dependencies.
interface RuleLike {
  readonly requires: readonly RuleLike[];
  readonly traits: Readonly<Record<string, Trait>>;
}

// Every Trait object → the name it's exported under (for `WorldLab.<name>` in
// generated code), discovered once from the engine namespace.
const TRAIT_EXPORT_NAME = new Map<Trait, string>();
for (const [name, value] of Object.entries(WorldLab)) {
  if (value instanceof Trait) {
    TRAIT_EXPORT_NAME.set(value, name);
  }
}

// The rules the project's worlds attach (their export names), refreshed from the
// project sources before the editor loads or the generator runs.
let projectRuleNames: string[] = [];

/** Replace the rule names the trait dropdown derives its traits from. */
export function setProjectRules(names: string[]): void {
  projectRuleNames = names;
}

/** The transitive closure of the named rules (each rule plus what it requires). */
function rulesInPlay(names: string[]): Set<RuleLike> {
  const rules = new Set<RuleLike>();
  const add = (rule: RuleLike | undefined): void => {
    if (!rule || rules.has(rule)) {
      return;
    }
    rules.add(rule);
    rule.requires.forEach(add);
  };
  for (const name of names) {
    add((WorldLab as Record<string, unknown>)[name] as RuleLike | undefined);
  }
  return rules;
}

/**
 * Current `[label, exportName]` options: every trait provided by a rule in play,
 * labelled by its display name, valued by its `world-lab` export (what the
 * generator writes). Sorted by label for a stable dropdown.
 */
export function traitOptions(): Array<[string, string]> {
  const traits = new Set<Trait>();
  for (const rule of rulesInPlay(projectRuleNames)) {
    for (const trait of Object.values(rule.traits)) {
      traits.add(trait);
    }
  }
  const options = [...traits]
    .map(
      trait =>
        [trait.name, TRAIT_EXPORT_NAME.get(trait) ?? ''] as [string, string],
    )
    .filter(([, exportName]) => exportName !== '')
    .sort((a, b) => a[0].localeCompare(b[0]));
  return options.length ? options : [['(none)', '']];
}

/** Make a block's `TRAIT` dropdown reflect the traits currently in play. */
export const traitOptionsExtension = liveDropdown(
  'world_trait_options',
  'TRAIT',
  traitOptions,
);
