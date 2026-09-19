// The world-scoped properties of the rules a project holds, as the world's
// inspector shows them (specs/WORLD_RULE_FIELDS_PLAN.md).
//
// Every rule the project holds, because that is every rule the world runs: a
// world's module emits a `useRules` for each of them (`domainBlocks`,
// `world_world`), so a project that holds Scoring has a target score whether
// or not anything says so.
//
// Here rather than in `worldProperties`, which is surgery on a world's JSON
// and knows nothing of rules, and rather than inside the editor that renders
// them, so that what the fields offer can be tested against the real rules.

import {projectRuleMetas} from '../blockly/projectModules';
import {memberLocalName} from '../blockly/ruleRegistry';

import type {WorldRuleProperty} from './worldProperties';

/**
 * What the world's window offers besides the world's own properties.
 *
 * READ-ONLY ONES ARE LEFT OUT. Scoring's `won` is worked out from the score
 * and the target, and a starting value for it means nothing; the rules say
 * which of their properties are theirs to compute.
 */
export function worldRuleProperties(
  files: Record<string, string>,
): WorldRuleProperty[] {
  return projectRuleMetas(files).flatMap(rule =>
    rule.properties
      .filter(property => property.scope === 'world' && !property.readonly)
      .map(property => ({
        setter: `world_set_${memberLocalName(property.ref)}`,
        name: property.name,
        type: property.type,
        rule: rule.name,
        default:
          property.default === undefined || property.default === null
            ? ''
            : String(property.default),
      })),
  );
}
