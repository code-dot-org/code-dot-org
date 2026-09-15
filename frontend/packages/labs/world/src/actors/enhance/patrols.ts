// "Walks a beat" — the second thing a level needs after a player.
//
// A level whose only moving thing is the player is a level with nothing in it.
// Steering is about YOU — it chases, it flees — and this is what an actor does
// when you are not there: a guard pacing a corridor, a lift on its track, a
// platform sliding back and forth (`rules/stock/patrol`).
//
// ONE TRAIT, which is the shortest row on this shelf and needs its case made.
// The shelf's test is that an enhancement takes more than one edit, and this
// takes one — so on the letter of it this belongs on the rule shelf. What the
// rule shelf gives is the RULE: a `.rule` file in the project and a name in a
// dropdown. Between that and a patrolling guard there is still a `use trait`
// row to drag and the right trait to find among ninety, and the learner has to
// know that "Patrol" is where walking-about lives before they can go looking.
// A verb the actor did not have is the case `specs/ENHANCEMENTS.md` names, and
// it is worth a row whether the verb costs one line or four.
//
// ACROSS, because that is the enemy a side-on level wants and the one the
// stock Crawler is (the starter, `constants`). Down is a lift rather than a
// guard — a different thing rather than the other half of this one — so the
// description points at it instead of the row electing both and making every
// patroller walk a rectangle.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const PATROLS_ACROSS = 'Patrol#PatrolsAcrossTrait';

export const patrolsEnhancement: Enhancement = {
  id: 'patrols',
  // The ACTOR's: walking a beat is a fact about the thing that walks, and
  // every line lands in its own chain.
  subject: 'actor',
  name: 'Walks a beat',
  description:
    'Sets this actor pacing left and right on its own, turning round at the end of each leg — a guard on its beat, a platform on its track. How fast it walks and how long before it turns are blocks in its file, and the length of the beat is the two multiplied. An actor that should go up and down instead takes “Patrols Down”, and one that takes both walks a rectangle.',
  brings: ['Patrols Across'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    return wears(id ? source.files[id].contents : '', PATROLS_ACROSS, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Patrol']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents =>
          electTraits(contents, root, [PATROLS_ACROSS]),
        );
  },
};
