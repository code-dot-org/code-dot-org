// A bag, and the things that go in it — the pair, from both ends.
//
// Collection keeps a RECORD and a record only grows: nothing can take a coin
// back out of a total. A bag is different — you put a key in, you use it, it
// is gone — and that difference is the whole of why this is not the row next
// to it (`rules/stock/inventory`, `enhance/collects`).
//
// TWO ACTORS AGAIN, the shape the moving platform set: `Carries` is the thing
// with the bag and `Can Be Carried` is what may go in it. A row electing only
// the first gives a learner a bag that nothing will ever be put into, which is
// the failure this shelf keeps having to be shaped against.
//
// AND WHAT GOES IN IT IS THE COMMONER ROW. Most projects have one carrier and
// several pocketable things, so the taker's end is offered plainly — one
// trait, no question — and, unlike riding or walking on ice, it is offered
// WHATEVER the project holds. A key that can be carried before anything can
// carry it is a key waiting for a bag rather than a trait doing nothing: the
// learner is very likely making the bag next.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {actorChoices, targetOf} from './actorChoices';
import {edit, electTraits, fileOf, importRules, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';

const CARRIES = 'Inventory#CarriesTrait';
const CARRIED = 'Inventory#CanBeCarriedTrait';

const contentsOf = (source: MultiFileSource, target: EnhanceTarget) => {
  const {path, root} = fileOf(target);
  const id = fileIdAt(source, path);
  return {contents: id ? source.files[id].contents : '', root};
};

export const carriesThingsEnhancement: Enhancement = {
  id: 'carries-things',
  subject: 'actor',
  name: 'Has a bag to put things in',
  description:
    'Gives this actor a bag: it picks up what it touches, holds it, and can spend it later — a key that opens one door and is then gone, a potion that is drunk. Different from “Collects things, and scores for them”, which keeps a running total that only ever goes up. The thing it picks up is told it may be carried, which is a line in ITS file.',
  brings: ['Carries', 'Can Be Carried, on the thing'],
  asks: {
    label: 'Picking up',
    options: actorChoices,
  },
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const {contents, root} = contentsOf(source, target);
    if (!wears(contents, CARRIES, root)) {
      return false;
    }
    if (answer === undefined) {
      return true;
    }
    const thing = contentsOf(source, targetOf(answer));
    return wears(thing.contents, CARRIED, thing.root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    if (answer === undefined) {
      return source;
    }
    let current = importRules(source, ['Inventory']);

    const bag = fileOf(target);
    const bagId = fileIdAt(current, bag.path);
    if (bagId !== undefined) {
      current = edit(current, bagId, contents =>
        electTraits(contents, bag.root, [CARRIES]),
      );
    }

    const thing = fileOf(targetOf(answer));
    const thingId = fileIdAt(current, thing.path);
    if (thingId !== undefined) {
      current = edit(current, thingId, contents =>
        electTraits(contents, thing.root, [CARRIED]),
      );
    }
    return current;
  },
};

export const canBeCarriedEnhancement: Enhancement = {
  id: 'can-be-carried',
  subject: 'actor',
  name: 'Can be picked up and carried',
  description:
    'Lets this actor be put in somebody’s bag: touched, taken, held, and spent later. It names no carrier, so whoever has a bag can pick it up. Different from “Collects things, and scores for them”, where what is picked up becomes a number and cannot be put back down.',
  brings: ['Can Be Carried'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {contents, root} = contentsOf(source, target);
    return wears(contents, CARRIED, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Inventory']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => electTraits(contents, root, [CARRIED]));
  },
};
