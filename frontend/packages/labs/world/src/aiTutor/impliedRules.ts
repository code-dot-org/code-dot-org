// The stock rules a proposed workspace needs and the project has not got.
//
// The tutor is shown what it may import (`ruleShelf`), and the natural answer
// to "my player falls off the edge" is `use trait Boundaries#Stays Across` —
// two rows, against the thirty-seven ground tiles it writes when Boundaries is
// not a word it knows. But a `use trait` naming a rule the project does not
// hold is a file that will not generate, so the offer would be refused every
// time and the better answer would never survive its own validation.
//
// So the reference is read as the request it is. A trait is stored as
// `<Rule Name>#<Export>Trait` and `use rule` stores a rule's name outright, so
// the name is right there in the file — nothing is guessed and no new field is
// added to the answer for the model to keep in step with what it wrote.
//
// INFERENCE, AND SO INCOMPLETE. A rule can also be needed for a property or an
// action block, whose type is `world_get_<Rule>_…` with the rule's name
// SLUGGED rather than spelled, and un-slugging is not a thing to do by
// guesswork. What that costs is an offer refused for a rule this did not spot,
// which is the behavior without any of this — a downgrade to prose, never a
// broken file.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {projectRuleMetas} from '../blockly/projectModules';
import {stockRuleByName, type StockRule} from '../rules/stock';
import {projectFiles} from '../runtime/projectFiles';

/** `"TRAIT": "Boundaries#StaysAcrossTrait"` — the name is before the hash. */
const TRAIT_REFERENCE = /"TRAIT"\s*:\s*"([^"#]+)#/g;

/** `"RULE": "Boundaries"` — `use rule` stores the name itself. */
const RULE_REFERENCE = /"RULE"\s*:\s*"([^"]+)"/g;

/** Every rule name a workspace mentions, however it mentions it. */
export const ruleNamesIn = (contents: string): string[] => {
  const found = new Set<string>();
  for (const pattern of [TRAIT_REFERENCE, RULE_REFERENCE]) {
    // `matchAll` on a fresh iterator each time: a `g` regex carries
    // `lastIndex`, and these are module constants reused across calls.
    for (const match of contents.matchAll(new RegExp(pattern))) {
      found.add(match[1]);
    }
  }
  return [...found];
};

/**
 * The stock rules `contents` names that `source` has not got.
 *
 * A rule the project already holds is not returned even if a stock rule shares
 * its name: the project's own is what its references resolve to, and importing
 * over it is exactly what `importStockRule` refuses to do anyway.
 */
export const impliedRules = (
  source: MultiFileSource,
  contents: readonly string[],
): StockRule[] => {
  const held = new Set(
    projectRuleMetas(projectFiles(source)).map(meta => meta.name),
  );
  const wanted = new Map<string, StockRule>();

  for (const one of contents) {
    for (const name of ruleNamesIn(one)) {
      if (held.has(name) || wanted.has(name)) {
        continue;
      }
      const stock = stockRuleByName(name);
      if (stock) {
        wanted.set(name, stock);
      }
    }
  }
  return [...wanted.values()];
};
