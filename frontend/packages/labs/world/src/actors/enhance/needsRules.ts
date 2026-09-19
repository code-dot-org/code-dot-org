// What a row of the Enhance checklist would take from the library
// (specs/ENHANCE_GATE_PLAN.md).
//
// WORKED OUT BY TAKING IT. An enhancement's `apply` is a pure fold over a
// project source, and every stock rule lands as `rules/<id>.rule`
// (`rules/importStockRule`), so applying a row to a copy and diffing the rule
// files names exactly the rules it brings — the ones it asks for, and the
// ones those pull in behind them. Nothing is written down twice, and a row
// that changes what it imports cannot drift from what the gate asks about.
//
// A RULE THE PROJECT ALREADY HOLDS IS NOT BEING TAKEN: the import leaves one
// it finds alone, so it is not in the diff. That is the shelf's own rule —
// what a project can TAKE, not what it has (`progression/shelf`).

import type {MultiFileSource} from '@code-dot-org/core/api';

import {projectFiles} from '../../runtime/projectFiles';

import type {Enhancement, EnhanceTarget} from './enhancements';

const RULE_PATH = /^rules\/(.+)\.rule$/;

/** The stock rule ids a project holds, by the file each one lands in. */
const ruleIdsIn = (source: MultiFileSource): Set<string> => {
  const found = new Set<string>();
  for (const path of Object.keys(projectFiles(source))) {
    const matched = RULE_PATH.exec(path);
    if (matched) {
      found.add(matched[1]);
    }
  }
  return found;
};

/**
 * The stock rules this row would add to `source`, by id — empty when it
 * would add none, which is the common answer.
 */
export function rulesAddedBy(
  source: MultiFileSource,
  target: EnhanceTarget,
  enhancement: Enhancement,
  answer?: string,
): string[] {
  const before = ruleIdsIn(source);
  let after: Set<string>;
  try {
    after = ruleIdsIn(enhancement.apply(source, target, answer));
  } catch {
    // A row that will not apply to this target takes nothing: whether it is
    // offered at all is `offered` and `refuse`'s question, not this one.
    return [];
  }
  return [...after].filter(id => !before.has(id));
}
