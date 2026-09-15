// "Shoots on the space bar" — the row that is two actors and a rate.
//
// Zapping is deliberately half a mechanic (`rules/stock/zaps`): the rule owns
// how OFTEN a thing may fire and nothing at all about what it fires, because
// no property can hold an actor template and a stock rule therefore cannot
// name an Energy Ball somebody invented. It raises an event, and the project's
// own handler puts the shot in the world.
//
// So this row is the handler. The trait alone is the jetpack mistake in a new
// coat — blocks written, a key pressed, and nothing whatever in the room — and
// what fills the gap cannot be guessed, so the row ASKS which actor to send.
//
// WHAT IT WRITES, on the shooter:
//
//   when ⟨this actor⟩ presses ⟨space⟩:   make ⟨this actor⟩ zap
//   when ⟨this actor⟩ zaps:              add actor ⟨the shot⟩ as ⟨shot⟩
//                                          set position of ⟨shot⟩ to mine
//                                          set velocity of ⟨shot⟩ to
//                                            ⟨0, -6⟩ turned by my rotation
//
// TWO HANDLERS, because asking to zap is not zapping: the press asks, the
// recharge answers, and a learner who spawned the shot straight from the key
// press would have written a gun with no rate limit and nowhere to put one.
// That is the rule's design and this is it offered rather than explained.
//
// `as ⟨shot⟩`, which is the one subtlety in the blocks. An unnamed `add actor`
// makes the new actor `this actor` inside its own body — and the body here
// needs the SHOOTER, to read the place and the angle to fire from. Named, the
// shot is a variable and `this actor` goes on meaning the shooter, so both are
// in reach. The variable is declared in the file as well as named by the
// block: written without that, Blockly loads a block naming a variable it has
// never heard of (`enhance/typesOutText` was bitten by exactly this).
//
// IT FIRES THE WAY IT IS FACING, which for an actor that never turns is
// straight up — the vector is a block in the handler, and turning it into a
// platformer's sideways shot is one number a learner can see. Guessing a
// facing from what an actor happens to wear would be a rule this row does not
// have; showing the arithmetic is one it does not need.
//
// AND THE SHOT IS GIVEN WHAT A SHOT NEEDS: something to move with, something
// to hit with, and an end. The last is not tidiness — a game that fires six a
// second and removes none gets slower the longer it is played, which is a bug
// that arrives late and reads as the lab being slow (`enhance/expires`).

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {actorChoices, targetOf} from './actorChoices';
import {edit, electTraits, fileOf, importRules, me, wears} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, down, rootsOf, withVariable, type BlockJson} from './patch';

const ZAPS = 'Zapping#ZapsTrait';
const KEYBOARD = 'Input#TakesKeyboardInputTrait';
const SHOOTER_TRAITS = [ZAPS, KEYBOARD];

/** What the shot must be able to do to be a shot at all. */
const SHOT_TRAITS = [
  'Physics#CanMoveTrait',
  'Collisions#CanCollideTrait',
  'Expiry#ExpiresTrait',
];

const FIRE_KEY = 'space';
const PRESSES = 'world_on_Input_PressesEvent';
const ZAPPED = 'world_on_Zapping_ZapsEvent';
const MAKE_ZAP = 'world_do_Zapping_MakeZapAction';
const ADD = 'world_add_actor';

/** How fast a shot leaves, before it is turned to face the way the shooter is. */
const SPEED = 6;

/** The name the handler gives the shot it just placed. */
const SHOT_VAR = {id: 'zapping_shot', name: 'shot', type: 'Actor'};

const shot = () => ({
  block: {type: 'variables_get_Actor', fields: {VAR: SHOT_VAR}},
});

/** `⟨x or y⟩ of ⟨this actor⟩` — the shooter's, inside a named `add actor`. */
const mine = (component: 'x' | 'y') => ({
  block: {
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: component},
    inputs: {ACTOR: me()},
  },
});

/** `when ⟨me⟩ presses ⟨space⟩ → make ⟨me⟩ zap`. */
const asking = (): BlockJson => ({
  type: PRESSES,
  fields: {FILTER0: FIRE_KEY},
  next: {block: {type: MAKE_ZAP, inputs: {VALUE: me()}}},
});

/** `when ⟨me⟩ zaps → add actor ⟨answer⟩ as ⟨shot⟩, place it and send it`. */
const sending = (_target: EnhanceTarget, answer: string): BlockJson => ({
  type: ZAPPED,
  next: {
    block: {
      type: ADD,
      fields: {ACTOR: answer, NAMED: 'named', VAR: SHOT_VAR},
      extraState: {named: true},
      inputs: {
        DO: {
          block: {
            type: 'world_set_position',
            inputs: {ACTOR: shot(), X: mine('x'), Y: mine('y')},
            next: {
              block: {
                type: 'world_set_Physics_VelocityProperty',
                inputs: {
                  ACTOR: shot(),
                  VALUE: {
                    block: {
                      type: 'world_vector_rotate',
                      inputs: {
                        VECTOR: {
                          block: {
                            type: 'world_vector',
                            fields: {VECTOR: {x: 0, y: -SPEED}},
                          },
                        },
                        DEGREES: {
                          block: {
                            type: 'world_get_Space_RotationProperty',
                            inputs: {ACTOR: me()},
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

/** Whether a root is one of the two hats this row writes, about this actor. */
const isOurs =
  (_target: EnhanceTarget, hat: string, holds: string) =>
  (block: BlockJson): boolean => {
    if (block.type !== hat) {
      return false;
    }
    if (hat === PRESSES && block.fields?.FILTER0 !== FIRE_KEY) {
      return false;
    }
    const named = (block.inputs?.ACTOR as {block?: BlockJson} | undefined)
      ?.block?.fields?.ACTOR;
    return (
      named === undefined && [...down(block)].some(row => row.type === holds)
    );
  };

/** What the zap handler currently sends, if the file holds one. */
const sends = (contents: string, target: EnhanceTarget): string | undefined => {
  for (const root of rootsOf(contents)) {
    if (!isOurs(target, ZAPPED, ADD)(root)) {
      continue;
    }
    for (const row of down(root)) {
      if (row.type === ADD) {
        return row.fields?.ACTOR as string | undefined;
      }
    }
  }
  return undefined;
};

/** Send something else instead, in place — asked again is a change of mind. */
const resend = (
  contents: string,
  target: EnhanceTarget,
  answer: string,
): string => {
  const workspace = JSON.parse(contents) as {blocks?: {blocks?: BlockJson[]}};
  for (const root of workspace.blocks?.blocks ?? []) {
    if (!isOurs(target, ZAPPED, ADD)(root)) {
      continue;
    }
    for (const row of down(root)) {
      if (row.type === ADD) {
        row.fields = {...row.fields, ACTOR: answer};
      }
    }
  }
  return JSON.stringify(workspace, null, 2);
};

export const shootsEnhancement: Enhancement = {
  id: 'shoots',
  subject: 'actor',
  name: 'Shoots on the space bar',
  description:
    'Gives this actor a gun: press the space bar and it sends another actor of your choosing off the way it is facing — straight up for something that never turns, and the direction is a block in the handler. How long it must recharge between shots is a block in its file, so a fast finger fires at a rate rather than as fast as it can tap. The thing it sends is given what a shot needs: a way of moving, something to hit with, and a few seconds to live, so the room does not fill up with shots nobody can see.',
  brings: [
    'Zaps',
    'Reads the Keyboard',
    'a handler for the space bar and one for the shot',
    'Can Move, Can Collide and Expires, on what it sends',
  ],
  asks: {label: 'Sending', options: actorChoices},
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return (
      SHOOTER_TRAITS.every(trait => wears(contents, trait, root)) &&
      rootsOf(contents).some(isOurs(target, PRESSES, MAKE_ZAP)) &&
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
      'Input',
      'Physics',
      'Collisions',
      'Expiry',
    ]);

    const shooter = fileOf(target);
    const shooterId = fileIdAt(current, shooter.path);
    if (shooterId !== undefined) {
      current = edit(current, shooterId, contents => {
        let next = withVariable(
          electTraits(contents, shooter.root, SHOOTER_TRAITS),
          SHOT_VAR,
        );
        if (!rootsOf(next).some(isOurs(target, PRESSES, MAKE_ZAP))) {
          // Beside the definition rather than under it: a hat takes no
          // previous connection, and `DisableOrphansPlugin` grays out a
          // top-level block that has one along with everything below it.
          next = addRoot(next, asking());
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
