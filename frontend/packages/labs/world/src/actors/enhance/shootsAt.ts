// "Shoots at somebody" — the enemy's gun.
//
// The player's row (`enhance/shoots`) fires on a key and sends what it is
// told to, the way it is facing. An enemy has no key and no facing worth
// trusting; it fires whenever it may, and it aims. So this row is the same
// two blocks the Zapping rule asks for, answered differently: the asking is
// an `each frame` that says `make me zap` and lets the recharge say no, and
// the sending aims every shot at whoever it was told to shoot at.
//
// WHAT IT WRITES, on the shooter:
//
//   use trait ⟨Zaps⟩
//   set recharge time of ⟨this actor⟩ to ⟨1.5⟩
//   each frame:                         make ⟨this actor⟩ zap
//
//   when ⟨this actor⟩ zaps:
//     for each actor ⟨aim⟩ in ⟨any ⟨target⟩⟩:
//       add actor ⟨Shot⟩ as ⟨shot⟩:
//         set position of ⟨shot⟩ to mine
//         set velocity of ⟨shot⟩ to ⟨4⟩ in direction ⟨direction of
//           ⟨where ⟨aim⟩ is⟩ − ⟨where I am⟩⟩
//
// ASKED SIXTY TIMES A SECOND, and answered no almost every time: `make … zap`
// is a cooldown check and nothing else, so the rate an enemy fires at is
// Zapping's own `recharge time`, which this sets to a number a learner can
// see and change. A timer would say the same thing in a second rule.
//
// A LOOP RATHER THAN `first actor of`. There is usually one player and there
// may be none, and a shot aimed at nobody is a vector of nothing. Looping
// over `any ⟨target⟩` sends one shot per target and none when there is
// nobody, with no test for either case; two players get shot at twice, which
// is what a turret would do.
//
// IT SENDS THE STOCK SHOT and asks only whom to aim at. The shelf asks one
// question per row, and of the two this row could ask, what to send is the
// one with a good default: a `Shot` in the library that flies, hits, hurts
// and expires (`actors/stock/shot`). It is a file once it is brought in, so
// what a shot looks like is the learner's to change; what it is aimed at is
// the answer here, and asked again it re-aims rather than adding a second
// hat — the hunt rows' reading (`enhance/hunts`).

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

import {actorChoices} from './actorChoices';
import {
  edit,
  electTraits,
  fileOf,
  importRules,
  kindOf,
  me,
  wears,
} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import {
  addRoot,
  append,
  down,
  holds,
  rootsOf,
  withVariable,
  type BlockJson,
} from './patch';

const ZAPS = 'Zapping#ZapsTrait';
const ZAPPED = 'world_on_Zapping_ZapsEvent';
const MAKE_ZAP = 'world_do_Zapping_MakeZapAction';
const RECHARGE = 'world_set_Zapping_RechargeTimeProperty';
const STEP = 'world_trait_step';
const FOR_EACH = 'world_for_each';
const ADD = 'world_add_actor';

/** What it sends: the library's Shot, by the path it is imported at. */
const SHOT = 'actors/shot';

/** Seconds between shots. Slow enough to be dodged, which is the game. */
const RECHARGE_TIME = 1.5;
/** How fast a shot leaves. Slower than the player's, for the same reason. */
const SPEED = 4;

/** What the `each frame` is called, which is how it is found again. */
const STEP_NAME = 'fire when ready';

/** The loop's name for the actor being aimed at. */
const AIM_VAR = {id: 'shootsAt_aim', name: 'aim', type: 'Actor'};
/** The name the handler gives the shot it just placed. */
const SHOT_VAR = {id: 'shootsAt_shot', name: 'shot', type: 'Actor'};

const named = (variable: object) => ({
  block: {type: 'variables_get_Actor', fields: {VAR: variable}},
});

/** `⟨x or y⟩ of ⟨who⟩`. */
const axisOf = (who: object, component: 'x' | 'y') => ({
  block: {
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: component},
    inputs: {ACTOR: who},
  },
});

/** `x ⟨…⟩ y ⟨…⟩` — where `who` is, as a vector. */
const whereIs = (who: object) => ({
  block: {
    type: 'world_vector_of',
    inputs: {X: axisOf(who, 'x'), Y: axisOf(who, 'y')},
  },
});

/** `⟨SPEED⟩ in direction ⟨direction of ⟨where aim is⟩ − ⟨where I am⟩⟩`. */
const towardAim = () => ({
  block: {
    type: 'world_vector_from_angle',
    inputs: {
      LENGTH: {shadow: {type: 'math_number', fields: {NUM: SPEED}}},
      DEGREES: {
        block: {
          type: 'world_vector_direction',
          inputs: {
            VECTOR: {
              block: {
                type: 'world_vector_math',
                fields: {OP: 'SUBTRACT'},
                inputs: {A: whereIs(named(AIM_VAR)), B: whereIs(me())},
              },
            },
          },
        },
      },
    },
  },
});

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

/** `when ⟨me⟩ zaps: for each ⟨aim⟩ in ⟨any ⟨target⟩⟩: send a shot at it`. */
const sending = (target: string): BlockJson => ({
  type: ZAPPED,
  next: {
    block: {
      type: FOR_EACH,
      fields: {VAR: AIM_VAR},
      inputs: {
        SOURCE: kindOf(target),
        DO: {
          block: {
            type: ADD,
            fields: {ACTOR: SHOT, NAMED: 'named', VAR: SHOT_VAR},
            extraState: {named: true},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {
                    ACTOR: named(SHOT_VAR),
                    X: axisOf(me(), 'x'),
                    Y: axisOf(me(), 'y'),
                  },
                  next: {
                    block: {
                      type: 'world_set_Physics_VelocityProperty',
                      inputs: {ACTOR: named(SHOT_VAR), VALUE: towardAim()},
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

/** Whether a root is the hat this row writes: `zaps`, holding the loop. */
const isOurs = (block: BlockJson): boolean =>
  block.type === ZAPPED &&
  block.inputs?.ACTOR === undefined &&
  [...down(block)].some(row => row.type === FOR_EACH);

/** The loop under that hat, if the file holds one. */
const loopIn = (contents: string): BlockJson | undefined => {
  for (const root of rootsOf(contents)) {
    if (!isOurs(root)) {
      continue;
    }
    for (const row of down(root)) {
      if (row.type === FOR_EACH) {
        return row;
      }
    }
  }
  return undefined;
};

/** Whom the hat currently aims at, as the loop's list names them. */
const aimedAt = (contents: string): string | undefined => {
  const source = (loopIn(contents)?.inputs?.SOURCE as {block?: BlockJson})
    ?.block;
  return source?.fields?.ACTOR as string | undefined;
};

/** Aim at somebody else, in place — asked again is a change of mind. */
const reaim = (contents: string, target: string): string => {
  const workspace = JSON.parse(contents) as {blocks?: {blocks?: BlockJson[]}};
  for (const root of workspace.blocks?.blocks ?? []) {
    if (!isOurs(root)) {
      continue;
    }
    for (const row of down(root)) {
      if (row.type === FOR_EACH) {
        row.inputs = {...row.inputs, SOURCE: kindOf(target)};
      }
    }
  }
  return JSON.stringify(workspace, null, 2);
};

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
  name: 'Shoots at somebody',
  description:
    'Makes this actor fire at whoever you name, whenever it has recharged: a Shot leaves it aimed straight at each one of them, every second and a half. How often it fires and how fast a shot flies are blocks in its file, and the Shot is a file of its own you can repaint. A shot hurts what it hits, if what it hits has health.',
  brings: [
    'Zaps',
    'a Shot, in a file of its own',
    'an each-frame that fires when recharged, and a handler that aims',
  ],
  refuse(_source: MultiFileSource, target: EnhanceTarget) {
    // The Shot shooting shots would be a room that fills itself.
    return target.path === SHOT ? 'A shot does not shoot.' : undefined;
  },
  asks: {label: 'Shooting at', options: actorChoices},
  applied(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return (
      wears(contents, ZAPS, root) &&
      fires(contents, root) &&
      answer !== undefined &&
      aimedAt(contents) === answer
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget, answer?: string) {
    if (answer === undefined) {
      return source;
    }
    let current = importRules(source, ['Zapping']);
    // The Shot, and the rules it wears, the way the health row brings its bar.
    current = importStockActor(current, stockActorById('shot')!).source;

    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    if (id === undefined) {
      return current;
    }
    return edit(current, id, contents => {
      let next = electTraits(contents, root, [ZAPS]);
      next = withVariable(withVariable(next, AIM_VAR), SHOT_VAR);
      if (!fires(next, root)) {
        next = append(next, root, [recharge(), firing()]);
      }
      return aimedAt(next) === undefined
        ? addRoot(next, sending(answer))
        : reaim(next, answer);
    });
  },
};
