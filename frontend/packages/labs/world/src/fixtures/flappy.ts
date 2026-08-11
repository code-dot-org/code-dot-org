// Flappy: a bird that only ever falls, a key that only ever un-falls it, and a
// level too wide to see.
//
// Here for the WIDE MAP, which is the thing none of the other scenarios have.
// Every board so far has been ten tiles by ten — one screen, nothing off it,
// which is the right answer for a first level and means the camera has never
// had anything to do. This one is 48 tiles across and still ten tall, so most
// of the level is off-screen at any moment and the view has to go and find it.
//
// Which makes it the first scenario where a CAMERA is a mechanic rather than a
// fact:
//
//   Camera Follow      points the view at the bird, so the level arrives
//   Camera Confined    stops the view at the two ends, so the first and last
//                      screens do not show the void past the level
//
// NOT Camera Ease and NOT Camera Deadzone, though both are stock rules and this
// looked like the game for them. The map is exactly one screen TALL, so
// "Confined" pins the view's y to the middle of it and nothing that smooths or
// slackens y has anything left to do — and the x motion is a constant, which
// easing turns into a constant lag rather than into smoothing. A game that
// wants those is one with vertical room: a platformer on a tall map, where the
// view should ignore a jump and follow a climb.
//
// The MECHANIC is two blocks, and both are choices worth reading:
//
//   the fall     "Affected by Gravity" and nothing else. There is no ground in
//                this level, so gravity never lands the bird and never stops
//                pulling — the rule's whole other half (rest height, landing,
//                "is on the ground?") is dead code here, which is what a game
//                made of one idea looks like.
//   the flap     SETS the velocity rather than applying a force. A force adds,
//                so holding the key would stack into an escape trajectory;
//                setting is what makes every flap the same height however many
//                came before it. It also re-states the forward speed, which is
//                the cheapest way to keep the bird's x honest.
//
// The bird is the meteors SHIP, turned 90° so its nose points the way it is
// going. Standing in for a bird until there is one to draw, which is also why
// the pipes are ground tiles: a fixture is worth having before its art is.
//
// What it is NOT, again: no restart, no death (crashing says so and the bird
// flies on), and the score is a coin count rather than pipes passed. Passing a
// pipe is the thing the lab cannot say yet — it needs "when my x goes past
// this actor's", which is a comparison against another actor's position every
// frame, and there is no block for a step a project defines.

import {
  ruleShim,
  stack,
  starterSprites,
  useTrait,
  type ProjectSpec,
} from '../constants';
import {
  cameraConfinedRule,
  cameraFollowRule,
  cameraRule,
  collectRule,
  collisionsRule,
  gravityRule,
  inputRule,
  motionRule,
  solidRule,
} from '../rules/stock';
import {TILE_SIZE} from '../runtime/viewport';

/** The middle of tile `index`, the same grid every other scenario uses. */
const at = (index: number) => index * TILE_SIZE + TILE_SIZE / 2;

/** How many tiles across the level is — four and a bit screens. */
export const MAP_COLUMNS = 48;
/** …and how many down, which is exactly one screen. See the header. */
export const MAP_ROWS = 10;

const place = (type: string, id: string, column: number, row: number) => ({
  type,
  id,
  properties: {positional: {position: {x: at(column), y: at(row)}}},
});

// The pipes, as (column, top row of the gap). Three tiles of gap, which is
// generous — this is a fixture to read and poke at, not a game to be beaten.
//
// The gaps walk up and down rather than wandering, for two reasons. A level
// whose difficulty is random is a level that cannot be looked at twice and
// compared; and no two neighbours differ by more than TWO rows, so the climb
// between them is always inside what a flap and a half buys. The first cut of
// this level had a four-row step in it and was unflyable in the middle.
//
// Seven tiles apart, which at the bird's speed is a bit over two seconds —
// four or five flaps, so there is room to line up on a gap rather than react
// to it.
const GAP_ROWS = 3;
const PIPE_SPACING = 7;
const GAP_TOPS = [4, 3, 5, 4, 6, 5];
const PIPES: ReadonlyArray<readonly [number, number]> = GAP_TOPS.map(
  (gapTop, index) => [8 + index * PIPE_SPACING, gapTop] as const,
);

/** One pipe: every tile in its column that is not the gap. */
const pipe = (column: number, gapTop: number) => {
  const rows: number[] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    if (row < gapTop || row >= gapTop + GAP_ROWS) {
      rows.push(row);
    }
  }
  return rows.map(row =>
    place('actors/pipe', `Pipe${column}_${row}`, column, row),
  );
};

/**
 * Everything the level places, in the order the map lists it.
 *
 * Exported because the level is told twice, as `./platformerSingle` tells the
 * starter's twice: as this `.map` file, and as `create ⟨kind⟩ in map`
 * arrangements grouped by kind. A second hand-written board would be a second
 * board, and the pair is only worth having if the board in it is the same one.
 */
export const FLAPPY_ACTORS = [
  place('actors/bird', 'Bird', 2, 5),
  ...PIPES.flatMap(([column, gapTop]) => pipe(column, gapTop)),
  // A coin in the middle of each gap: the reward for going through rather
  // than over, and the only score this game has.
  ...PIPES.map(([column, gapTop], index) =>
    place('actors/coin', `Coin${index}`, column, gapTop + 1),
  ),
];

const FLAPPY_MAP = JSON.stringify(
  {
    type: 'map',
    // The whole point of this scenario. `world.mapBounds()` reads this, which
    // is what "Confined to the Map" stops the view against.
    size: {width: MAP_COLUMNS, height: MAP_ROWS},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: FLAPPY_ACTORS,
  },
  null,
  2,
);

/** `⟨this actor⟩`. */
export const me = () => ({block: {type: 'world_this_actor'}});

export const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

export const vector = (x: number, y: number) => ({
  block: {type: 'world_vector', fields: {VECTOR: {x, y}}},
});

/** What the world sets `amount of gravity` to. See {@link FLAP}. */
export const GRAVITY = 9;

/**
 * How fast the bird goes forward, and how hard a flap throws it up.
 *
 * UNITS PER SECOND, both of them, and a unit is 100px
 * (`WorldLab.PIXELS_PER_UNIT`) — Physics integrates `velocity x frameTime x
 * pixelsPerUnit`, so nothing here is per-frame and none of it changes if the
 * frame rate does. The world's `amount of gravity` is in the same units per
 * second SQUARED, which is why it reads as 9 rather than as something small.
 *
 * Worth writing down because getting it wrong is not subtle, and it was got
 * wrong twice: at 3 the first press sends the bird off the top of the level
 * and it never comes back, and the arithmetic that produced 3 was done in
 * pixels per frame, which is not what any of these are.
 *
 * As set, at 100px to the unit and against the world's gravity of 9:
 *
 *   a flap rises   2.8^2 / (2 x 9) = 0.44 units, a tile and a bit
 *   …reaching      the top of its arc in 2.8 / 9 = about a third of a second
 *   so flapping    a bit over once a second holds altitude
 *   and the level  goes by at 100px a second, putting ~2.25s between pipes
 *
 * Tuned down from the first cut in three passes, and the last one is the
 * instructive one: HALVING GRAVITY ALONE MAKES THE JUMP TALLER. Rise is
 * v^2/2a, so gravity and the flap are not independent dials — cutting `a` in
 * half doubles the height unless `v` comes down by root two with it. Which is
 * what happened here: 18 and -4 became 9 and -2.8, the arc is the same size,
 * and the whole of it takes half again as long. That is the difference between
 * "too fast to react to" and this.
 */
export const FORWARD = 1.0;
export const FLAP = -2.8;

const BIRD_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Bird'},
        next: {
          block: stack([
            // Gravity brings "Can Move" and "Can Collide" with it, which is
            // everything else this actor needs to fall, to hit a pipe, and to
            // take a coin.
            useTrait('Gravity#AffectedByGravityTrait'),
            useTrait('Input#TakesKeyboardInputTrait'),
            useTrait('Collection#CollectsTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'ship.png'}},
            // The ship points up; the bird goes right.
            {
              type: 'world_set_Space_RotationProperty',
              inputs: {ACTOR: me(), VALUE: number(90)},
            },
            // Weightless until the first flap, which is what "tap to start"
            // IS — and here it is a property rather than a state machine,
            // because gravity already has a per-actor dial for exactly this.
            //
            // Not a nicety. A world starts running the moment it compiles, so
            // a bird that falls from frame one has left the map before a
            // reader has finished looking at the level, and the scenario
            // greets them with an empty screen and "Out of the world!".
            {
              type: 'world_set_Gravity_GravityScaleProperty',
              inputs: {ACTOR: me(), VALUE: number(0)},
            },
          ]),
        },
      },
      // The flap. Up rather than space: this lab already spends space on the
      // platformer's jump, and an arrow is the key a hand is already on.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'up arrow'},
        x: 20,
        y: 320,
        next: {
          block: stack([
            // The first one of these is what starts the game; the rest are
            // no-ops that cost a property write.
            {
              type: 'world_set_Gravity_GravityScaleProperty',
              inputs: {ACTOR: me(), VALUE: number(1)},
            },
            {
              type: 'world_set_Physics_VelocityProperty',
              inputs: {ACTOR: me(), VALUE: vector(FORWARD, FLAP)},
            },
          ]),
        },
      },
      // Crashing, which is the end of the game.
      //
      // Taking the bird OUT is what makes it an ending rather than a remark.
      // Said and not acted on, the bird flew on through the pipe and the
      // console filled with "Crashed!" once a frame; stopping it instead would
      // have been undone by the next flap, since nothing here remembers that
      // the game is over. Removal is the one ending this project can state
      // without a flag it would have to define, and it ends the CAMERA too —
      // "actor to follow" empties, the follow step is guarded on it, and the
      // view holds where it was.
      {
        type: 'world_on_Collisions_StartsTouchingEvent',
        fields: {FILTER0: 'actors/pipe'},
        x: 20,
        y: 460,
        next: {
          block: stack([
            {type: 'world_log', fields: {TEXT: 'Crashed!'}},
            {type: 'world_remove_actor', inputs: {ACTOR: me()}},
          ]),
        },
      },
      // …and the other way to lose, which needs no pipes at all. The map is
      // one screen tall, so the floor and the ceiling ARE its edges.
      {
        type: 'world_on_Space_LeftMapEvent',
        x: 20,
        y: 580,
        next: {
          block: stack([
            {type: 'world_log', fields: {TEXT: 'Out of the world!'}},
            {type: 'world_remove_actor', inputs: {ACTOR: me()}},
          ]),
        },
      },
      // The score.
      {
        type: 'world_on_Collection_CollectsEvent',
        x: 20,
        y: 700,
        next: {
          block: {
            type: 'world_print',
            inputs: {
              VALUE: {
                block: {
                  type: 'world_count_of_kind',
                  fields: {TYPE: 'actors/coin'},
                  inputs: {
                    LIST: {
                      block: {
                        type: 'world_get_Collection_CollectedProperty',
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
    ],
  },
});

// A pipe segment. It does not move, it is not solid, and it has no opinion
// about what hits it — being TOUCHABLE is the whole of its job, and the bird's
// handler does the rest. Not solid on purpose: a solid pipe would stop the bird
// dead against it and leave it sitting there, which reads as a bug rather than
// as a crash.
const PIPE_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Pipe'},
        next: {
          block: stack([
            useTrait('Collisions#CanCollideTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'ground.png'}},
          ]),
        },
      },
    ],
  },
});

const COIN_ACTOR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        x: 20,
        y: 20,
        fields: {NAME: 'Coin'},
        next: {
          block: stack([
            useTrait('Collection#CanBeCollectedTrait'),
            {type: 'world_set_sprite', fields: {SPRITE: 'coin.png'}},
          ]),
        },
      },
    ],
  },
});

/** The `define camera` block's id, which is how the dropdown names it. */
const CHASE = 'flappyChaseCamera';

const FLAPPY_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Flappy'},
        next: {
          block: stack([
            {type: 'world_use_rule', fields: {RULE: 'Gravity'}},
            {type: 'world_use_rule', fields: {RULE: 'Collection'}},
            // Both pull in "Camera", which is what actually moves the view;
            // naming it too would be a row saying what these two already say.
            {type: 'world_use_rule', fields: {RULE: 'Camera Follow'}},
            {type: 'world_use_rule', fields: {RULE: 'Camera Confined'}},
            // Said out loud although it is also the rule's default, because it
            // is the one number that decides how this game feels and it should
            // be one click from the world a reader is already looking at. The
            // instructions point at it.
            {
              type: 'world_set_Gravity_AmountOfGravityProperty',
              inputs: {VALUE: number(GRAVITY)},
            },
            {type: 'world_load_map', fields: {MAP: 'maps/flappy'}},
            // AFTER the map, and this is the one ordering that matters here.
            // `any ⟨Bird⟩` is read when this runs, so a camera defined above
            // `load map` would be handed an empty list and would sit still for
            // the whole game — with nothing in the console to say why.
            {
              type: 'world_define_camera',
              id: CHASE,
              fields: {NAME: 'Chase'},
              inputs: {
                DO: {
                  block: stack([
                    useTrait('Camera Follow#FollowsTrait'),
                    useTrait('Camera Confined#ConfinedToTheMapTrait'),
                    {
                      type: 'world_set_CameraFollow_ActorToFollowProperty',
                      inputs: {
                        ACTOR: {block: {type: 'world_this_camera'}},
                        VALUE: {
                          block: {
                            type: 'world_actor_kind',
                            fields: {ACTOR: 'actors/bird'},
                          },
                        },
                      },
                    },
                  ]),
                },
              },
            },
            // A world has a camera without asking, and it is not this one.
            {
              type: 'world_use_camera',
              fields: {CAMERA: `camera:${CHASE}`},
            },
          ]),
        },
      },
    ],
  },
});

/**
 * The rules and pictures, which are the same in both tellings.
 *
 * Neither is an actor and neither is the map, so neither moves into the
 * world when the actors do — `./flappySingle` takes this list whole. A copy
 * would be a copy that could go stale.
 */
export const FLAPPY_SUPPORT_FILES: ProjectSpec['files'] = {
  motionRuleFile: {
    name: 'motion.rule',
    language: 'rule',
    contents: motionRule,
    folderId: 'rules',
  },
  collisionsRuleFile: {
    name: 'collisions.rule',
    language: 'rule',
    contents: collisionsRule,
    folderId: 'rules',
  },
  // Gravity requires it — landing is worked out against solid ground, and a
  // project that names Gravity and does not hold this fails to COMPILE with
  // "cannot resolve 'Solid Bodies'". Nothing here is solid; the rule is a
  // dependency, not a mechanic this game chose.
  solidRuleFile: {
    name: 'solid.rule',
    language: 'rule',
    contents: solidRule,
    folderId: 'rules',
  },
  gravityRuleFile: {
    name: 'gravity.rule',
    language: 'rule',
    contents: gravityRule,
    folderId: 'rules',
  },
  inputRuleFile: {
    name: 'input.rule',
    language: 'rule',
    contents: inputRule,
    folderId: 'rules',
  },
  collectRuleFile: {
    name: 'collect.rule',
    language: 'rule',
    contents: collectRule,
    folderId: 'rules',
  },
  cameraRuleFile: {
    name: 'camera.rule',
    language: 'rule',
    contents: cameraRule,
    folderId: 'rules',
  },
  cameraFollowRuleFile: {
    name: 'cameraFollow.rule',
    language: 'rule',
    contents: cameraFollowRule,
    folderId: 'rules',
  },
  cameraConfinedRuleFile: {
    name: 'cameraConfined.rule',
    language: 'rule',
    contents: cameraConfinedRule,
    folderId: 'rules',
  },
  animationRuleFile: {
    name: 'animation.js',
    language: 'javascript',
    contents: ruleShim('AnimationRule'),
    folderId: 'rules',
  },
  ...starterSprites(['ship', 'ground', 'coin']),
};

export const FLAPPY_SPEC: ProjectSpec = {
  folders: [
    'rules',
    'worlds',
    'actors',
    'animations',
    'sprites',
    'backgrounds',
    'maps',
    'effects',
  ],
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: FLAPPY_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    bird: {
      name: 'bird.actor',
      language: 'actor',
      contents: BIRD_ACTOR,
      folderId: 'actors',
    },
    pipe: {
      name: 'pipe.actor',
      language: 'actor',
      contents: PIPE_ACTOR,
      folderId: 'actors',
    },
    coin: {
      name: 'coin.actor',
      language: 'actor',
      contents: COIN_ACTOR,
      folderId: 'actors',
    },
    flappyMap: {
      name: 'flappy.map',
      language: 'map',
      contents: FLAPPY_MAP,
      folderId: 'maps',
    },
    ...FLAPPY_SUPPORT_FILES,
  },
  open: ['main'],
};
