// The starter platformer, said entirely in `main.world`.
//
// The third of the pairs, and the one a learner is most likely to actually be
// looking at, since the platformer is what a new project opens into. What the
// diff with the starter shows is the same thing the other two show — what
// moving a thing into a file buys — except that here the thing moved is the
// project a learner already has, rather than a game written to make a point.
//
// It is also the pair with the most in it. Breakout moved four actors and a
// board; this moves four actors, a board, and the FIVE HANDLERS that make the
// player a player: a jump, two things it says about falling, and the count of
// what it has picked up. All of them are hats on `any ⟨Player⟩` here, and all
// of them still belong to the template — so a second player added to the
// arrangement gets its own jump, its own landing message, and its own coins,
// exactly as a second `player.actor` instance would.
//
// What does NOT move is everything that was never an actor: the rules, the
// animations, the pictures, the effect. Those are files in both tellings, and
// they are the same files — this project is the starter minus five entries
// (STARTER_SPEC), not a second list that happens to look like it.
//
// The BOARD is shared too, and by the same reasoning: `LEVEL1_ACTORS` is what
// the `.map` file lists, grouped by kind here because an arrangement belongs to
// the kind it places. So the two boards cannot drift, and the diff stays about
// the telling.
//
// One thing is genuinely lost, and it is worth knowing before copying the
// shape: a `.map` file is a document, and the map editor opens it. An
// arrangement is a FIELD on a block — clicking it opens the grid, and it is
// edited in place, in the world that uses it. Which is the right answer for a
// board that belongs to one game and the wrong one for a board that several
// worlds share.

import {
  LEVEL1_ACTORS,
  stack,
  STARTER_SPEC,
  useTrait,
  type ProjectSpec,
} from '../constants';

// A world-local actor is named by its DEFINING BLOCK'S id, so the ids are
// written down rather than generated (blockly/localActors).
const PLAYER = 'platformerPlayerDef';
const GROUND = 'platformerGroundDef';
const COIN = 'platformerCoinDef';
const BALL = 'platformerBallDef';
const SCOREBOARD = 'platformerScoreboardDef';

const local = (blockId: string) => `local:${blockId}`;

/** `⟨this actor⟩`, which inside a hat means the actor the event fired for. */
const me = () => ({block: {type: 'world_this_actor'}});

/** `set text of ⟨who⟩ to …` — the scoreboard's only verb. */
const setText = (who: object, value: object) => ({
  type: 'world_set_Writing_TextProperty',
  inputs: {ACTOR: who, VALUE: {block: value}},
});

/** `any ⟨kind⟩` — a hat's subject, and so the TEMPLATE rather than an instance. */
const kind = (blockId: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: local(blockId)}},
});

/**
 * The starter map's placements for one kind, as an arrangement.
 *
 * An entry is an id and its property overrides; the KIND is on the block, so
 * the `type` each map entry carries is what selects them and is then dropped.
 */
const placementsOf = (type: string) =>
  LEVEL1_ACTORS.filter(actor => actor.type === type).map(
    ({id, properties}) => ({
      id,
      properties,
    }),
  );

const createInMap = (blockId: string, defBlockId: string, type: string) => ({
  type: 'world_create_in_map',
  id: blockId,
  fields: {ACTOR: local(defBlockId), PLACEMENTS: placementsOf(type)},
});

const defineActor = (id: string, name: string, x: number, rows: object[]) => ({
  type: 'world_actor',
  id,
  x,
  y: 420,
  fields: {NAME: name},
  next: {block: stack(rows)},
});

/** A hat on `any ⟨Player⟩` whose whole body is one line of console text. */
const says = (event: string, y: number, message: string) => ({
  type: `world_on_${event}`,
  x: 20,
  y,
  inputs: {ACTOR: kind(PLAYER)},
  next: {block: {type: 'world_log', fields: {TEXT: message}}},
});

const SINGLE_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      // The world at the top left, where a reader starts. Its actors are
      // hoisted above it in the generated module whatever the layout says
      // (blockly/assembleActorModule).
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Platform World'},
        next: {
          block: stack([
            // One block per kind, which is what an arrangement is: the room is
            // 31 ground tiles and they are one field, because they are one
            // kind of thing placed in 31 spots.
            createInMap('placeGround', GROUND, 'actors/ground'),
            createInMap('placePlayer', PLAYER, 'actors/player'),
            createInMap('placeCoins', COIN, 'actors/coin'),
            createInMap('placeBall', BALL, 'actors/ball'),
            createInMap('placeScoreboard', SCOREBOARD, 'actors/scoreboard'),
            // Three coins at ten each. The starter says this in its own
            // `main.world`, and here it is the same line in the same place.
            {
              type: 'world_set_Scoring_TargetScoreProperty',
              inputs: {
                VALUE: {block: {type: 'math_number', fields: {NUM: 30}}},
              },
            },
          ]),
        },
      },
      // Then the four actors, in the order the game reads: the room, the thing
      // that walks around it, the things it can take, and the decoration.
      // The x's are measured rather than guessed: these four blocks are
      // between 283 and 345 wide, so a 300 gutter — which is what the other
      // single-world scenarios use — overlaps two of the three gaps.
      defineActor(GROUND, 'Ground', 20, [
        useTrait('Gravity#ActsAsGroundTrait'),
        useTrait('Solid Bodies#SolidTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'ground.png'}},
      ]),
      defineActor(PLAYER, 'Player', 360, [
        useTrait('Gravity#AffectedByGravityTrait'),
        useTrait('Jumping#JumpsTrait'),
        useTrait('Arrow Keys#MovesAcrossTrait'),
        useTrait('Input#TakesKeyboardInputTrait'),
        useTrait('Collection#CollectsTrait'),
        {type: 'world_play_animation', fields: {ANIMATION: 'playerBob'}},
      ]),
      defineActor(COIN, 'Coin', 760, [
        {type: 'world_play_animation', fields: {ANIMATION: 'coinSpin'}},
        useTrait('Collection#CanBeCollectedTrait'),
      ]),
      defineActor(BALL, 'Ball', 1140, [
        {type: 'world_play_animation', fields: {ANIMATION: 'pulse'}},
      ]),
      defineActor(SCOREBOARD, 'Scoreboard', 1520, [
        useTrait('Writing#ShowsTextTrait'),
        useTrait('Scoring#WatchesTheScoreTrait'),
        // `this actor`, not `any ⟨Scoreboard⟩`. A definition body runs while
        // the module is still being assembled — the actors are hoisted above
        // the world — so resolving a KIND here reaches for a world that does
        // not exist yet, and the module throws on load.
        setText(me(), {type: 'text', fields: {TEXT: 'SCORE 0'}}),
      ]),
      // Space to jump. WHICH key is on the hat, so the handler is registered
      // for the space bar and never runs for anything else; the rest is the
      // Jumping rule's, which is what keeps it honest in mid-air.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'space'},
        x: 20,
        y: 700,
        inputs: {ACTOR: kind(PLAYER)},
        next: {
          block: {
            type: 'world_do_Jumping_MakeJumpAction',
            inputs: {VALUE: me()},
          },
        },
      },
      says('Gravity_StartsFallingEvent', 900, 'Player started falling'),
      says('Gravity_StopsFallingEvent', 1020, 'Player landed!'),
      // The score, twice over. `add 10 to the score` is the game's number,
      // shown on the Scoreboard; the print below it asks `collected`, which is
      // a LIST of what was taken rather than a tally, so "how many coins" is a
      // question asked of it rather than a second number kept beside it.
      {
        type: 'world_on_Collection_CollectsEvent',
        x: 520,
        y: 700,
        inputs: {ACTOR: kind(PLAYER)},
        next: {
          block: {
            type: 'world_do_Scoring_AddToTheScoreAction',
            inputs: {
              VALUE: {block: {type: 'math_number', fields: {NUM: 10}}},
            },
            next: {
              block: {
                type: 'world_print',
                inputs: {
                  VALUE: {
                    block: {
                      type: 'world_count_of_kind',
                      fields: {TYPE: local(COIN)},
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
        },
      },
      // The scoreboard's own two handlers — the ACTOR's events, which is what
      // "Watches the Score" is for. In the starter these live in
      // `scoreboard.actor`; here they are hats on `any ⟨Scoreboard⟩`, and they
      // still belong to the template, so a second scoreboard would keep itself
      // up to date too.
      {
        type: 'world_on_Scoring_SeesTheScoreChangeEvent',
        x: 1020,
        y: 700,
        inputs: {ACTOR: kind(SCOREBOARD)},
        next: {
          block: setText(me(), {
            type: 'text_join',
            extraState: {itemCount: 2},
            inputs: {
              ADD0: {block: {type: 'text', fields: {TEXT: 'SCORE '}}},
              ADD1: {block: {type: 'world_get_Scoring_ScoreProperty'}},
            },
          }),
        },
      },
      {
        type: 'world_on_Scoring_SeesTheGameWonEvent',
        x: 1020,
        y: 840,
        inputs: {ACTOR: kind(SCOREBOARD)},
        next: {
          block: setText(me(), {type: 'text', fields: {TEXT: 'YOU WIN'}}),
        },
      },
    ],
  },
});

// Everything the starter holds except the four actors and the map, which have
// moved into the world above. Written as a subtraction so that a rule or a
// picture added to the starter arrives here too — the alternative is a second
// list, and a second list is a thing to forget.
const MOVED_IN = [
  'main',
  'player',
  'ground',
  'coin',
  'ball',
  'scoreboard',
  'level1',
];

const SUPPORT_FILES = Object.fromEntries(
  Object.entries(STARTER_SPEC.files).filter(([key]) => !MOVED_IN.includes(key)),
);

export const PLATFORMER_SINGLE_SPEC: ProjectSpec = {
  // The same folders, `actors/` and `maps/` included and empty. A folder is
  // what gives a file its meaning here, and the first thing a learner does with
  // a project this size is outgrow it.
  folders: STARTER_SPEC.folders,
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: SINGLE_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    ...SUPPORT_FILES,
  },
  open: ['main'],
};
