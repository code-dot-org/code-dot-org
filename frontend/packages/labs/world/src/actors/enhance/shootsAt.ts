// "Shoots whenever it can" — the enemy's gun.
//
// The player's row (`enhance/shoots`) fires on a key. An enemy has no key, so
// this row asks the Zapping rule to zap every frame and lets the recharge say
// no: the rate an enemy fires at is Zapping's own `recharge time`, set here
// to a number a learner can see and change. A timer would have said the same
// thing in a second rule.
//
// WHAT IT WRITES, on the shooter:
//
//   use trait ⟨Zaps⟩
//   set recharge time of ⟨this actor⟩ to ⟨1.5⟩
//   each frame:                         make ⟨this actor⟩ zap
//
//   when ⟨this actor⟩ zaps:             (the player's sending, shared)
//     add actor ⟨the shot⟩ as ⟨shot⟩ …
//
// IT FIRES THE WAY IT IS FACING, like the player's, and asks WHAT to send,
// like the player's. Aiming is a different verb: a rule that turns an actor
// toward something is a row of its own, and an enemy given both fires at
// whatever it was turned toward. Two rows a learner composes rather than one
// that asks two questions, which is the shelf's rule (specs/ENHANCEMENTS.md).
//
// The library holds a Shot for the question this asks (`actors/stock/shot`),
// which is the bullet most projects want and the one the import shelf offers.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {actorChoices, targetOf} from './actorChoices';
import {edit, electTraits, fileOf, importRules, me, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, append, holds, withVariable, type BlockJson} from './patch';
import {
  MAKE_ZAP,
  resend,
  sending,
  sends,
  SHOT_TRAITS,
  SHOT_VAR,
  ZAPS,
} from './shoots';

const RECHARGE = 'world_set_Zapping_RechargeTimeProperty';
const STEP = 'world_trait_step';

/** Seconds between shots. Slow enough to be dodged, which is the game. */
const RECHARGE_TIME = 1.5;

/** What the `each frame` is called, which is how it is found again. */
const STEP_NAME = 'fire when ready';

/** `set recharge time of ⟨me⟩ to ⟨1.5⟩`. */
const recharge = (): BlockJson => ({
  type: RECHARGE,
  inputs: {
    ACTOR: me(),
    VALUE: {shadow: {type: 'math_number', fields: {NUM: RECHARGE_TIME}}},
  },
});

/** `each frame: make ⟨me⟩ zap` — the asking, which the recharge answers. */
const firing = (): BlockJson => ({
  type: STEP,
  fields: {PHASE: 'decide', NAME: STEP_NAME},
  inputs: {DO: {block: {type: MAKE_ZAP, inputs: {VALUE: me()}}}},
});

/** Whether the chain already fires: the `each frame` this row names. */
const fires = (contents: string, root: {type: string; id?: string}) =>
  holds(
    contents,
    root,
    row => row.type === STEP && row.fields?.NAME === STEP_NAME,
  );

export const shootsAtEnhancement: Enhancement = {
  id: 'shoots-at',
  subject: 'actor',
  name: 'Shoots whenever it can',
  description:
    'Makes this actor fire on its own, as often as it has recharged: every second and a half it sends another actor of your choosing off the way it is facing — straight up for something that never turns, and the direction is a block in the handler. How often it fires and how fast a shot flies are blocks in its file. The thing it sends is given what a shot needs: a way of moving, something to hit with, and a few seconds to live.',
  brings: [
    'Zaps',
    'an each-frame that fires when recharged, and a handler for the shot',
    'Can Move, Can Collide and Expires, on what it sends',
  ],
  asks: {label: 'Sending', options: actorChoices},
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return (
      wears(contents, ZAPS, root) &&
      fires(contents, root) &&
      answer !== undefined &&
      sends(contents, target) === answer
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    if (answer === undefined) {
      return source;
    }
    let current = importRules(source, [
      'Zapping',
      'Physics',
      'Collisions',
      'Expiry',
    ]);

    const shooter = fileOf(target);
    const shooterId = fileIdAt(current, shooter.path);
    if (shooterId !== undefined) {
      current = edit(current, shooterId, contents => {
        let next = withVariable(
          electTraits(contents, shooter.root, [ZAPS]),
          SHOT_VAR,
        );
        if (!fires(next, shooter.root)) {
          next = append(next, shooter.root, [recharge(), firing()]);
        }
        return sends(next, target) === undefined
          ? addRoot(next, sending(target, answer))
          : resend(next, target, answer);
      });
    }

    const sent = fileOf(targetOf(answer));
    const sentId = fileIdAt(current, sent.path);
    if (sentId !== undefined) {
      current = edit(current, sentId, contents =>
        electTraits(contents, sent.root, SHOT_TRAITS),
      );
    }
    return current;
  },
};
