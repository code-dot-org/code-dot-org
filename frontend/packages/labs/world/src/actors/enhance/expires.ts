// "Disappears after a while" — the other half of anything that makes things.
//
// Something has to put bullets in the world and something has to take them
// out. A game that fires six shots a second and never removes one gets slower
// the longer it is played, which is a bug that arrives late and reads as the
// lab being slow rather than as the game being wrong (`rules/stock/expires`).
//
// ONE TRAIT AND A NUMBER, and the number is a block in the actor's own file:
// how many seconds it gets. The row does not ask, because the answer is a
// duration rather than a thing in the project, and a duration is exactly what
// a learner can see and change afterwards.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const EXPIRES = 'Expiry#ExpiresTrait';

export const expiresEnhancement: Enhancement = {
  id: 'expires',
  subject: 'actor',
  name: 'Disappears after a while',
  description:
    'Takes this actor out of the world a few seconds after it appears — a bullet, a puff of smoke, a power-up nobody picked up. How long it gets is a block in its file. Anything a game makes over and over wants this, or the room fills up with things nobody can see any more and the game slows down.',
  brings: ['Expires'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    return wears(id ? source.files[id].contents : '', EXPIRES, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Expiry']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => electTraits(contents, root, [EXPIRES]));
  },
};
