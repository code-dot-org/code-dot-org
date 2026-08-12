// Flappy again, said entirely in `main.world`.
//
// The fourth of the pairs, and the one with something none of the others have:
// a CAMERA to wire up. That turns out to be where the interesting difference
// is, because a camera has to be handed the thing it follows, and in this
// telling that thing is a world-local actor.
//
// In `./flappy` the world says `set actor to follow … to ⟨any ⟨Bird⟩⟩`, where
// `any ⟨Bird⟩` names a MODULE — `actors/bird`, a file, resolvable by anything
// in the project. Here the same block names `local:<the defining block's id>`,
// which nothing outside this file can say at all. The wiring reads the same
// and means something narrower, which is the whole lesson of these pairs in
// one block.
//
// The ORDER is the trap, and it is worse here than in the other three. Three
// things have to happen in sequence and only one of them looks like it must:
//
//   use rule …           before the map, or the world is built without it
//   create ⟨Bird⟩ …      before the camera, because `any ⟨Bird⟩` is READ when
//                        the camera is wired, and an empty list is not an error
//   look through …       after the camera exists to look through
//
// Get the middle one wrong and the game runs, the bird flies, the pipes are
// where they should be, and the view never moves — with nothing in the console
// to say why. `./flappy` has the same constraint against `load map`; what makes
// it sharper here is that `create in map` is four blocks rather than one, so
// there is more room to put the camera in the middle of them.
//
// Everything else is the usual subtraction: three actors and a `.map` file
// move in, the rules and the pictures stay as files (FLAPPY_SUPPORT_FILES),
// and the board is the same board (FLAPPY_ACTORS) grouped by kind.

import {stack, useTrait, type ProjectSpec} from '../constants';

import {
  FLAP,
  FLAPPY_ACTORS,
  MAP_COLUMNS,
  MAP_ROWS,
  FLAPPY_SUPPORT_FILES,
  FORWARD,
  GRAVITY,
  me,
  number,
  vector,
} from './flappy';

// A world-local actor is named by its DEFINING BLOCK'S id, so the ids are
// written down rather than generated (blockly/localActors).
const BIRD = 'flappyBirdDef';
const PIPE = 'flappyPipeDef';
const COIN = 'flappyCoinDef';
/** …and a camera by its own defining block's id (blockly/cameras). */
const CHASE = 'flappyChaseCameraSingle';

const local = (blockId: string) => `local:${blockId}`;

/** `any ⟨kind⟩` — the TEMPLATE, which is what a hat's subject wants. */
const kind = (blockId: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: local(blockId)}},
});

/**
 * The map's placements for one kind, as an arrangement.
 *
 * An entry is an id and its overrides; the KIND is on the block, so the `type`
 * each map entry carries is what selects them and is then dropped.
 */
const createInMap = (blockId: string, defBlockId: string, type: string) => ({
  type: 'world_create_in_map',
  id: blockId,
  fields: {
    ACTOR: local(defBlockId),
    PLACEMENTS: FLAPPY_ACTORS.filter(actor => actor.type === type).map(
      ({id, properties}) => ({id, properties}),
    ),
  },
});

const defineActor = (id: string, name: string, x: number, rows: object[]) => ({
  type: 'world_actor',
  id,
  x,
  y: 460,
  fields: {NAME: name},
  next: {block: stack(rows)},
});

/** A hat on `any ⟨Bird⟩`, which is where all four of this game's rules live. */
const onBird = (type: string, y: number, fields: object, body: object[]) => ({
  type,
  x: 20,
  y,
  ...(Object.keys(fields).length ? {fields} : {}),
  inputs: {ACTOR: kind(BIRD)},
  next: {block: stack(body)},
});

const log = (text: string) => ({type: 'world_log', fields: {TEXT: text}});
const removeMe = () => ({type: 'world_remove_actor', inputs: {ACTOR: me()}});

const SINGLE_WORLD = JSON.stringify({
  blocks: {
    blocks: [
      // The world at the top left, where a reader starts. Its actors are
      // hoisted above it in the generated module whatever the layout says
      // (blockly/assembleActorModule), so the canvas is laid out for reading.
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'Flappy'},
        next: {
          block: stack([
            {
              type: 'world_set_Gravity_AmountOfGravityProperty',
              inputs: {VALUE: number(GRAVITY)},
            },
            // The block the file telling gets for free. `load map` learns a
            // world's size from the document; a world that arranges its own
            // actors has no document, so without this the world is one screen
            // — and a one-screen world is a camera that cannot move, since
            // "Confined to the Map" clamps it to the only place it fits.
            //
            // It also decides how wide the arrangement grid is: the field
            // reads this block (fields/mapGridSize), so the editor draws the
            // level rather than the first tenth of it.
            {
              type: 'world_set_map_size',
              inputs: {X: number(MAP_COLUMNS), Y: number(MAP_ROWS)},
            },
            // The board: one block per kind, because that is what an
            // arrangement is — one kind of thing in a lot of places.
            createInMap('placePipes', PIPE, 'actors/pipe'),
            createInMap('placeCoins', COIN, 'actors/coin'),
            createInMap('placeBird', BIRD, 'actors/bird'),
            // …and the camera AFTER the bird exists. See the header: `any
            // ⟨Bird⟩` is read here, and reading it too early is a view that
            // never moves and never says so.
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
                        // The one block that reads differently from the file
                        // telling: a local actor, which no other file could
                        // name.
                        VALUE: kind(BIRD),
                      },
                    },
                  ]),
                },
              },
            },
            {type: 'world_use_camera', fields: {CAMERA: `camera:${CHASE}`}},
          ]),
        },
      },
      // Then the three actors, in the order the game reads: the thing you fly,
      // the things that stop you, and the things worth having.
      defineActor(BIRD, 'Bird', 20, [
        useTrait('Gravity#AffectedByGravityTrait'),
        useTrait('Input#TakesKeyboardInputTrait'),
        useTrait('Collection#CollectsTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'ship.png'}},
        {
          type: 'world_set_Space_RotationProperty',
          inputs: {ACTOR: me(), VALUE: number(90)},
        },
        // Weightless until the first flap — "tap to start" as a property.
        {
          type: 'world_set_Gravity_GravityScaleProperty',
          inputs: {ACTOR: me(), VALUE: number(0)},
        },
      ]),
      defineActor(PIPE, 'Pipe', 420, [
        useTrait('Collisions#CanCollideTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'ground.png'}},
      ]),
      defineActor(COIN, 'Coin', 800, [
        useTrait('Collection#CanBeCollectedTrait'),
        {type: 'world_set_sprite', fields: {SPRITE: 'coin.png'}},
      ]),
      // The flap: give the bird weight, then throw it up. Setting the speed
      // rather than pushing is what makes every flap the same height.
      onBird('world_on_Input_PressesEvent', 700, {FILTER0: 'up arrow'}, [
        {
          type: 'world_set_Gravity_GravityScaleProperty',
          inputs: {ACTOR: me(), VALUE: number(1)},
        },
        {
          type: 'world_set_Physics_VelocityProperty',
          inputs: {ACTOR: me(), VALUE: vector(FORWARD, FLAP)},
        },
      ]),
      // Both ways to lose take the bird OUT, which is what makes it an ending
      // rather than a remark — and ends the camera too, since `actor to
      // follow` empties and the follow step is guarded on it.
      onBird(
        'world_on_Collisions_StartsTouchingEvent',
        900,
        {FILTER0: local(PIPE)},
        [log('Crashed!'), removeMe()],
      ),
      onBird('world_on_Space_LeftMapEvent', 1060, {}, [
        log('Out of the world!'),
        removeMe(),
      ]),
      // The score.
      onBird('world_on_Collection_CollectsEvent', 1220, {}, [
        {
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
      ]),
    ],
  },
});

export const FLAPPY_SINGLE_SPEC: ProjectSpec = {
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
      contents: SINGLE_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    ...FLAPPY_SUPPORT_FILES,
  },
  open: ['main'],
};
