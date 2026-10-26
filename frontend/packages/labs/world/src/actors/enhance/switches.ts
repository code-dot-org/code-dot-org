// Switches and the walls they throw — a room whose shape you can change.
//
// Every other wall in this library is a fact about the level. This one is a
// fact about what you have DONE in it: stand on a plate and walls elsewhere
// appear or vanish (`rules/stock/switches`).
//
// MATCHED BY COLOUR, like teleport pads, and with the same consequence: there
// is nothing to point at and so nothing to ask. Both colours default to the
// same red, so a plate and a wall made by these two rows already work together
// without a learner setting anything — and two plates of one colour throw the
// same walls, which is a level design rather than a bug.
//
// BOTH OFFERED ALWAYS, unlike the teleport traveller or the platform rider.
// Those are nonsense with nothing to travel to and nothing to ride, and the
// thing they need is plainly the thing you make first. A plate and a wall are
// not like that: either is an equally sensible place to start, and a plate
// waiting for a wall is a plate waiting rather than a trait doing nothing —
// the reading `enhance/inventory` settled on for a key waiting for a bag.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const SWITCH = 'Switches#IsASwitchTrait';
const WALL = 'Switches#IsASwitchedWallTrait';

/** One end of the pair, as a row: the two differ in a trait and a sentence. */
const switchRow = (
  id: string,
  trait: string,
  name: string,
  description: string,
  brings: string,
): Enhancement => ({
  id,
  subject: 'actor',
  name,
  description,
  brings: [brings],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const fileId = fileIdAt(source, path);
    return wears(fileId ? source.files[fileId].contents : '', trait, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Switches']);
    const {path, root} = fileOf(target);
    const fileId = fileIdAt(current, path);
    return fileId === undefined
      ? current
      : edit(current, fileId, contents => electTraits(contents, root, [trait]));
  },
});

export const isASwitchEnhancement = switchRow(
  'is-a-switch',
  SWITCH,
  'Is a switch to stand on',
  'Makes this actor a plate: stand on it and the walls of its colour change — the ones that were there go, and the ones that were not appear. Its colour is a block in its file, and the colour is all that ties it to a wall, so two plates of one colour throw the same walls. It notices being walked ONTO rather than stood on, so resting on it does not flicker the room.',
  'Is a Switch',
);

export const isASwitchedWallEnhancement = switchRow(
  'is-a-switched-wall',
  WALL,
  'Is a wall a switch opens',
  'Makes this actor a wall that a plate of its colour throws: solid until the switch is stood on, and then not — or the other way round, for a wall the level starts open by setting “passes through things” on it. The colour is a block in its file, and matches the plate’s by default, so a switch and a wall made this way already work together.',
  'Is a Switched Wall',
);
