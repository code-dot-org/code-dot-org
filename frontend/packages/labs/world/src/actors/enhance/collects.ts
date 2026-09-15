// "Collects things, and scores for them" — what the starter's player does, in
// one act.
//
// Two halves that are useless apart. `Collects` is what makes an actor able to
// take a Coin: the coin already declares `Can Be Collected` and nothing
// happens until something can do the collecting. And taking one is worth
// nothing until a handler says what it is worth — collection knows nothing
// about scoring and scoring knows nothing about coins, which is the whole
// point of both rules and the reason the wiring belongs to the project
// (`actors/stock/coin` says the same thing from the coin's side).
//
// WHAT IT WRITES, all of it in the actor:
//
//   actors/<target>.actor    use trait ⟨Collection#Collects⟩
//
//                            when ⟨this actor⟩ collects ⟨any⟩:
//                              add ⟨10⟩ to the score
//
// TEN, WITHOUT ASKING, and the number is the starter's own. A shelf that
// stopped to ask would be asking about the one thing already sitting in the
// learner's file in a block they can read and change — which is what an
// enhancement is FOR: work they could have done by hand, done for them, left
// where they can edit it.
//
// THE SCORE IS THE WORLD'S, not the actor's: `add to the score` is a world
// action, so two players collecting add to one number. That is what a score
// is, and a game that wants one each wants a property of its own.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {edit, electTraits, fileOf, importRules, me, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, hasRoot, type BlockJson} from './patch';

const COLLECTS = 'Collection#CollectsTrait';
/** `when ⟨…⟩ collects ⟨any⟩` — the event the Collection rule raises. */
const COLLECTS_HAT = 'world_on_Collection_CollectsEvent';
/** What one thing is worth, which is what the starter says a coin is worth. */
const WORTH = 10;

/** `when ⟨this actor⟩ collects ⟨any⟩: add ten to the score`. */
const handler = (): BlockJson => ({
  type: COLLECTS_HAT,
  inputs: {ACTOR: me()},
  next: {
    block: {
      type: 'world_do_Scoring_AddToTheScoreAction',
      inputs: {
        VALUE: {block: {type: 'math_number', fields: {NUM: WORTH}}},
      },
    },
  },
});

/** Whether this actor already scores for what it takes. */
const scores = (contents: string): boolean =>
  hasRoot(contents, block => block.type === COLLECTS_HAT);

export const collectsEnhancement: Enhancement = {
  id: 'collects',
  // The ACTOR's: the trait and the handler both land in its own file, and what
  // it collects is whatever declares itself collectable.
  subject: 'actor',
  name: 'Collects things, and scores for them',
  description:
    'Lets this actor pick up anything that can be collected — a Coin, say — and adds ten to the score each time it does. The ten is a block in its file, so change it to whatever a coin is worth in your game.',
  brings: ['Collects Things', 'Keeps Score'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return wears(contents, COLLECTS, root) && scores(contents);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Collection', 'Scoring']);

    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    if (!id) {
      return current;
    }
    return edit(current, id, contents => {
      let next = electTraits(contents, root, [COLLECTS]);
      if (!scores(next)) {
        next = addRoot(next, handler());
      }
      return next;
    });
  },
};
