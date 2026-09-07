// "Climbs ladders with the arrow keys" — the control scheme, as blocks.
//
// A CONTROL SCHEME IS NOT A MECHANIC, and this is where the difference is put.
// `Climbing` says what a ladder is and what climbing one does; it says nothing
// about keys, because a robot that takes ladders when the player is above it
// climbs without a keyboard. The rule used to carry the keys anyway, as a
// second trait called "Climbs with Arrow Keys", and that had two costs.
//
// The rule had to depend on `Input`, so importing a ladder imported keyboard
// reading whether or not anything was steered by hand. And the keys were the
// RULE's: a learner could elect the trait or not, and could not see which keys
// or change them, when the bindings are exactly the part a game wants to
// change. A trait that exists only to wire two other things together is a rule
// doing a project's job.
//
// WHAT IT WRITES, all of it in the actor:
//
//   actors/<target>.actor    define actor named ⟨…⟩
//                              use trait ⟨Climbing#Climbs⟩
//                              use trait ⟨Input#TakesKeyboardInput⟩
//
//                            when ⟨me⟩ presses  ⟨up arrow⟩   start ⟨me⟩ climbing up
//                            when ⟨me⟩ releases ⟨up arrow⟩   stop  ⟨me⟩ climbing up
//                            when ⟨me⟩ presses  ⟨down arrow⟩ start ⟨me⟩ climbing down
//                            when ⟨me⟩ releases ⟨down arrow⟩ stop  ⟨me⟩ climbing down
//
// HANDLED, NOT POLLED — four moments rather than a question asked sixty times
// a second, and the shape `rules/climb` writes out in its own header. It was
// an `each frame` first, reading both keys and choosing between them with an
// if/else, and that was the actor doing the rule's job: every frame between
// the press and the release was spent re-deciding something that had not
// changed.
//
// WHAT MADE THE SWAP FREE is that the rule already refuses the cases the
// polling loop was there to cover. `start climbing` does nothing off a ladder,
// so a press in mid-air is not a flight key; `stop climbing` does nothing when
// no climb is running, so a stray release is silent; and the climb ends by
// itself when the ladder does, so arriving at the top needs no key at all.
// There was never any state here to keep — only the question.
//
// A RELEASE SAYS WHICH DIRECTION IT IS RELEASING, and that is not decoration.
// Two keys steer one mechanic, so swapping from up to down is a release and a
// press to be served — and on a keyboard those land on the SAME FRAME. Against
// a plain `stop climbing` whichever ran second won: pressing down while
// letting go of up started a descent and ended it again, in silence, and the
// jetpack level's ladder simply would not let a player back down
// (`jetpackPlays`). `stop climbing up` is a no-op on a climb that is going
// down, so the two events commute and the rule stops caring when they arrive.
// The reasoning is in `rules/climb`, which is where it belongs: this file
// binds keys, and what a release MEANS is the mechanic's business.
//
// ROOTS, NOT ROWS. A hat takes no previous connection, so it sits beside the
// `define actor` rather than under it (`patch.addRoot`) — unlike `each frame`,
// which is a row. In a WORLD's own `define actor` the hats are roots of the
// world and name their subject as `any ⟨kind⟩`, exactly as `enhance/health`
// does for the same reason.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt} from '../../runtime/projectFiles';

import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, append, hasRoot, holds, type BlockJson} from './patch';

const CLIMBS = 'Climbing#ClimbsTrait';
const KEYBOARD = 'Input#TakesKeyboardInputTrait';

/** Which file holds this actor, and which of its roots defines it. */
const fileOf = (target: EnhanceTarget) =>
  target.block
    ? {
        path: `${target.path}.world`,
        root: {type: 'world_actor', id: target.block},
      }
    : {path: `${target.path}.actor`, root: {type: 'world_actor'}};

/** Whether a `use trait` for `trait` is already in this actor's chain. */
const wears = (
  contents: string,
  trait: string,
  root: {type: string; id?: string},
): boolean =>
  holds(
    contents,
    root,
    block => block.type === 'world_use_trait' && block.fields?.TRAIT === trait,
  );

/**
 * `start ⟨me⟩ climbing up` and its two siblings, which take the actor.
 *
 * `VALUE`, not `ACTOR`: these are rule-level designed blocks with one
 * parameter, and a designed block's parameter socket is `VALUE` whatever the
 * parameter is called. Read off how the rule itself called them before these
 * handlers moved out of it — written as `ACTOR` the socket is empty and the
 * block asks nobody to climb, in silence.
 */
const climbing = (action: string): BlockJson => ({
  type: `world_do_Climbing_${action}Action`,
  inputs: {VALUE: {block: {type: 'world_this_actor'}}},
});

/** Who the hat is about: this actor's file, or one kind among a world's. */
const subjectOf = (target: EnhanceTarget) =>
  target.block
    ? {
        block: {
          type: 'world_actor_kind',
          fields: {ACTOR: `local:${target.block}`},
        },
      }
    : undefined;

/**
 * One handler: a key, an edge, and the climbing block it calls.
 *
 * `FILTER0` is the key the hat is narrowed to, which is how every other
 * keyboard handler in the lab is written — the alternative is one hat for all
 * keys and an `if` under it, which is the polling this replaced with the
 * question moved one line down.
 *
 * `ACTOR` is left OFF for an actor file, where a hat is already about the kind
 * whose file it is in, and named for a world, where it is not.
 */
const handler = (
  target: EnhanceTarget,
  edge: 'Presses' | 'Releases',
  key: string,
  action: string,
): BlockJson => {
  const subject = subjectOf(target);
  return {
    type: `world_on_Input_${edge}Event`,
    fields: {FILTER0: key},
    ...(subject ? {inputs: {ACTOR: subject}} : {}),
    next: {block: climbing(action)},
  };
};

/**
 * The four of them, in the order a reader meets them: up, then down, each
 * with the release that ends it.
 *
 * EXPORTED, because the shipped projects need the same blocks a learner gets
 * from the sparkles — the jetpack Pilot and two lessons steer a climb this
 * way. Written twice they would drift, and the one that drifted would be the
 * one nobody was looking at.
 */
export const climbArrowsHandlers = (
  target: EnhanceTarget = {kind: 'actor', path: '', name: ''},
): BlockJson[] => [
  handler(target, 'Presses', 'up arrow', 'StartClimbingUp'),
  handler(target, 'Releases', 'up arrow', 'StopClimbingUp'),
  handler(target, 'Presses', 'down arrow', 'StartClimbingDown'),
  handler(target, 'Releases', 'down arrow', 'StopClimbingDown'),
];

/**
 * Whether this actor already reads the arrows for its climbing.
 *
 * ONE HANDLER IS ENOUGH TO ASK ABOUT — the press that starts a climb up — and
 * that is deliberate. Asking for all four would call a learner who deleted the
 * one they did not want "not enhanced" and offer to write the set again; this
 * is idempotent against exactly the edit the enhancement exists to invite.
 *
 * SUBJECT AND ALL. In a world the same file holds every actor's handlers, so
 * "somebody presses up" is not the question — "does THIS kind" is.
 */
const startsAClimb =
  (target: EnhanceTarget) =>
  (block: BlockJson): boolean => {
    if (
      block.type !== 'world_on_Input_PressesEvent' ||
      block.fields?.FILTER0 !== 'up arrow'
    ) {
      return false;
    }
    const named = (block.inputs?.ACTOR as {block?: BlockJson} | undefined)
      ?.block?.fields?.ACTOR;
    return target.block
      ? named === `local:${target.block}`
      : named === undefined;
  };

const reads = (contents: string, target: EnhanceTarget): boolean =>
  hasRoot(contents, startsAClimb(target));

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

export const climbArrowsEnhancement: Enhancement = {
  id: 'climbs-with-arrows',
  subject: 'actor',
  name: 'Climbs ladders with the arrow keys',
  description:
    'Lets this actor climb anything that can be climbed, steered with up and down. The keys are blocks in its file, so change them to whatever your game uses — and an actor that should climb without a keyboard takes the trait and leaves these out.',
  brings: ['Climbs Ladders', 'Reads the Keyboard'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return (
      wears(contents, CLIMBS, root) &&
      wears(contents, KEYBOARD, root) &&
      reads(contents, target)
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = source;
    for (const name of ['Climbing', 'Input']) {
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
      for (const trait of [CLIMBS, KEYBOARD]) {
        if (!wears(next, trait, root)) {
          next = append(next, root, [
            {type: 'world_use_trait', fields: {TRAIT: trait}},
          ]);
        }
      }
      if (!reads(next, target)) {
        // Beside the definition rather than under it: a hat takes no previous
        // connection, and `DisableOrphansPlugin` grays out a top-level block
        // that has one along with everything below it.
        for (const hat of climbArrowsHandlers(target)) {
          next = addRoot(next, hat);
        }
      }
      return next;
    });
  },
};
