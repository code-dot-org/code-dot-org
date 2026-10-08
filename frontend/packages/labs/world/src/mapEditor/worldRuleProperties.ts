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
import {memberLocalName, memberValue} from '../blockly/ruleRegistry';

import type {CameraProperty} from './worldCameraEdits';
import {vectorText, type WorldRuleProperty} from './worldProperties';

/**
 * What the world's window offers besides the world's own properties.
 *
 * READ-ONLY ONES ARE LEFT OUT. Scoring's `won` is worked out from the score
 * and the target, and a starting value for it means nothing; the rules say
 * which of their properties are theirs to compute.
 */
/**
 * A rule's own value as the text the window compares against. A vector's is
 * an object, `{x, y}`, and comes out as `"x,y"` the way the reader spells a
 * row's (`worldProperties.vectorText`); the rest are what `String` makes of
 * them.
 */
const defaultText = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'object' && 'x' in value && 'y' in value) {
    const held = value as {x: unknown; y: unknown};
    return vectorText({x: Number(held.x), y: Number(held.y)});
  }
  return String(value);
};

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
        default: defaultText(property.default),
      })),
  );
}

/** A trait a camera may elect, with the properties its inspector edits. */
export interface CameraTraitChoice {
  /** What a `use trait` row stores: `Camera Follow#FollowsTrait`. */
  value: string;
  name: string;
  /** The rule it comes from, which is where a learner adds or removes it. */
  rule: string;
  properties: CameraProperty[];
}

/**
 * The traits the project's rules offer a CAMERA, for a camera's inspector:
 * every trait whose subject is a camera, with its properties that a starting
 * value means something for (`readonly` ones are the trait's own working
 * state, as for the world's).
 */
export function cameraTraitChoices(
  files: Record<string, string>,
): CameraTraitChoice[] {
  return projectRuleMetas(files).flatMap(rule =>
    rule.traits
      .filter(trait => trait.subject === 'camera')
      .map(trait => ({
        value: memberValue(trait.ref),
        name: trait.name,
        rule: rule.name,
        properties: rule.properties
          .filter(
            property =>
              property.ownerTraitId === trait.id && !property.readonly,
          )
          .map(property => ({
            setter: `world_set_${memberLocalName(property.ref)}`,
            name: property.name,
            type: property.type,
          })),
      })),
  );
}
