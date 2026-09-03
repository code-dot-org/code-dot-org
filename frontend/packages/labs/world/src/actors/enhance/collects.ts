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

import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt} from '../../runtime/projectFiles';

import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, append, hasRoot, holds, type BlockJson} from './patch';

const COLLECTS = 'Collection#CollectsTrait';
/** `when ⟨…⟩ collects ⟨any⟩` — the event the Collection rule raises. */
const COLLECTS_HAT = 'world_on_Collection_CollectsEvent';
/** What one thing is worth, which is what the starter says a coin is worth. */
const WORTH = 10;

/** Which file holds this actor, and which of its roots defines it. */
const fileOf = (target: EnhanceTarget) =>
  target.block
    ? {
        path: `${target.path}.world`,
        root: {type: 'world_actor', id: target.block},
      }
    : {path: `${target.path}.actor`, root: {type: 'world_actor'}};

/** Who the hat is about: this actor's file, or one kind among a world's. */
const subjectOf = (target: EnhanceTarget) =>
  target.block
    ? {
        block: {
          type: 'world_actor_kind',
          fields: {ACTOR: `local:${target.block}`},
        },
      }
    : {block: {type: 'world_this_actor'}};

/** Whether a `use trait` for `trait` is already in this actor's chain. */
const hasTrait = (
  contents: string,
  trait: string,
  root: {type: string; id?: string},
): boolean =>
  holds(
    contents,
    root,
    block => block.type === 'world_use_trait' && block.fields?.TRAIT === trait,
  );

/** `when ⟨this actor⟩ collects ⟨any⟩: add ten to the score`. */
const handler = (target: EnhanceTarget): BlockJson => ({
  type: COLLECTS_HAT,
  inputs: {ACTOR: subjectOf(target)},
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

/** Rewrite one file's contents, leaving the rest of the project alone. */
const edit = (
  source: MultiFileSource,
  id: string,
  change: (contents: string) => string,
): MultiFileSource => ({
  ...source,
  files: {
    ...source.files,
    [id]: {...source.files[id], contents: change(source.files[id].contents)},
  },
});

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
    return hasTrait(contents, COLLECTS, root) && scores(contents);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = source;
    for (const name of ['Collection', 'Scoring']) {
      const rule = STOCK_RULES.find(one => one.name === name);
      if (rule) {
        current = importStockRule(current, rule).source;
      }
    }

    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    if (!id) {
      return current;
    }
    return edit(current, id, contents => {
      let next = contents;
      if (!hasTrait(next, COLLECTS, root)) {
        next = append(next, root, [
          {type: 'world_use_trait', fields: {TRAIT: COLLECTS}},
        ]);
      }
      if (!scores(next)) {
        next = addRoot(next, handler(target));
      }
      return next;
    });
  },
};
