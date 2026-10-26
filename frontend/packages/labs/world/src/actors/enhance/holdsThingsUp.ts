// "Holds things up" — the floor, and everything that acts like one.
//
// The other half of `enhance/falls`, and useless without it in both
// directions: an actor that falls with nothing underneath drops out of the
// world, and a floor in a game where nothing falls is a picture. The two rows
// are the two sides of one sentence, which is why they were added together.
//
// TWO TRAITS, out of two rules, and they are genuinely different claims. `Acts
// as Ground` is what gravity's landing step looks for — it is what makes a
// thing something to come to REST on, and what "is on the ground?" reads.
// `Solid` is what stops a body passing through another, which is a fact about
// collision rather than about falling. A ledge wants both; a wall wants only
// the second, and a cloud platform you can jump up through wants only the
// first. The Ground the library ships elects exactly this pair
// (`actors/stock/ground`).
//
// Gravity brings Solid Bodies along on its own, so the second import is a
// no-op in every project that has the first. It is named anyway, because this
// row elects a trait out of each and a reader asking where `Solid` came from
// should find the answer in the list rather than in another rule's
// requirements.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const GROUND = 'Gravity#ActsAsGroundTrait';
const SOLID = 'Solid Bodies#SolidTrait';
const TRAITS = [GROUND, SOLID];

export const holdsThingsUpEnhancement: Enhancement = {
  id: 'holds-things-up',
  subject: 'actor',
  name: 'Holds things up',
  description:
    'Makes this actor something others can stand on — a floor, a ledge, a platform. Anything that falls comes to rest on it instead of dropping past, and nothing walks through it. A platform that should also move takes “Walks a beat” as well.',
  brings: ['Acts as Ground', 'Solid'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return TRAITS.every(trait => wears(contents, trait, root));
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Gravity', 'Solid Bodies']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => electTraits(contents, root, TRAITS));
  },
};
