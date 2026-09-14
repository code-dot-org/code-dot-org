// "Drives like a car" — the other way to read the arrow keys.
//
// WHERE "MOVES IN ALL FOUR DIRECTIONS" SAYS RIGHT *IS* MOVING RIGHT, this says
// right is TURNING, and up is a push in whatever direction the actor is
// pointing. Letting go of everything leaves it coasting exactly as it was: a
// spaceship, a car, an asteroid ship (`rules/stock/drive`).
//
// A THIRD MOVEMENT ROW rather than a question under one of the others, for the
// same reason the top-down row is a second: which of these a learner wants is
// answered by what kind of game they are making, and that is a choice between
// rows rather than a sub-question about one. All three are the arrow keys and
// none of them is the others.
//
// NO KEYBOARD TRAIT, unlike the two that read the arrows through `Arrow Keys`.
// This rule reads them itself, so the row is one trait — which is worth saying
// because the asymmetry looks like an omission.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const DRIVEN = 'Arrow Drive#DrivenByArrowKeysTrait';

export const drivesEnhancement: Enhancement = {
  id: 'drives',
  subject: 'actor',
  name: 'Drives like a car',
  description:
    'Gives this actor a steering wheel instead of a direction: the left and right arrows turn it, and the up arrow pushes it whichever way it is pointing. Let go and it carries on, because nothing stops it — how hard it pushes, how fast it turns, and how much it skates rather than grips are blocks in its file. A spaceship, a car, a boat.',
  brings: ['Driven by Arrow Keys'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    return wears(id ? source.files[id].contents : '', DRIVEN, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Arrow Drive']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => electTraits(contents, root, [DRIVEN]));
  },
};
