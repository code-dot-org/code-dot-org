// The rules the project could have, as against the ones it has.
//
// Without this the tutor's whole vocabulary is what the student has already
// imported, and it answers inside that vocabulary — asked how to stop a player
// walking off the map it writes a ring of thirty-seven ground tiles, because
// tiles are what it can see. `Boundaries` does the same job in two rows and it
// had no way to know the rule exists.
//
// ABILITY AND TRAITS, NOT IMPLEMENTATION. The same division the project's own
// rules get (`ruleSummary`): what electing this would let an actor do, never
// the blocks behind it. A rule averages thirty thousand characters and the
// shelf holds twenty-nine of them.
//
// WHAT THE PROJECT ALREADY HOLDS IS LEFT OUT, because it is described in full
// in the section above this one, and listing it twice invites the model to
// import what it is already using.

import type {RuleMeta} from '../blockly/ruleMeta';
import {STOCK_RULES} from '../rules/stock';

/** One shelf entry, in the form the tutor reads. */
const describe = (rule: (typeof STOCK_RULES)[number]): string =>
  `- **${rule.name}** — ${rule.ability}. ` +
  (rule.subject === 'camera'
    ? `Traits a CAMERA elects (not an actor): ${rule.provides.join(', ')}. `
    : `Traits: ${rule.provides.join(', ')}. `) +
  rule.description;

/**
 * The importable rules, or nothing when the project already holds them all.
 *
 * `held` is the project's own rules, as the editor builds them for its palette,
 * so the two lists are drawn from one source and cannot disagree about what is
 * already in play.
 */
export const importableRules = (
  held: readonly RuleMeta[],
): string | undefined => {
  const have = new Set(held.map(meta => meta.name));
  const shelf = STOCK_RULES.filter(rule => !have.has(rule.name));
  if (!shelf.length) {
    return undefined;
  }

  return [
    '# Rules the project could import',
    '',
    'These are NOT in the project yet. To use one, write the actor file with a',
    '`use trait` row naming the trait you want — `Boundaries#StaysAcrossTrait`,',
    'spelled `<rule name>#<trait name with the spaces removed>Trait`. The rule',
    'is brought into the project for you when the student accepts.',
    '',
    'Prefer this to building the same behavior by hand. An actor that elects',
    '“Stays Across” cannot leave the map; a wall of tiles around the edge does',
    'the same thing with thirty-seven actors and is harder to change later.',
    '',
    'A CAMERA rule is different in one way: importing it does nothing on its',
    'own, and its traits go on a camera rather than on an actor. Unless the',
    'world defines a camera of its own, that means a row in the world file:',
    '',
    '    add trait ⟨Camera Follow#FollowsTrait⟩ to ⟨camera ⟨the main camera⟩⟩',
    '',
    'That row is `world_add_camera_trait`, which is the camera’s copy of the',
    'block — `world_add_trait` offers an actor’s traits and will not take one',
    'of a camera’s.',
    '',
    'and then the trait’s properties are set on that same camera. A camera',
    'trait elected on an actor reads correctly and does nothing at all.',
    '',
    ...shelf.map(describe),
  ].join('\n');
};
