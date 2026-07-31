import type {MultiFileSource, ProjectSources} from '@code-dot-org/core/api';

import {serializeEffectDocument} from './effect/model';
import {rippleEffect} from './effect/stock';

/**
 * The world the game starts in — the driver's compile + run entry point
 * (PLAN §6). Fixed for the slice; later a level/appOptions field selects it.
 */
export const ENTRY_FILE = 'worlds/main.world';

/**
 * The default project for a new World Lab: a small gravity game across the
 * conventional directories. The learner imports the engine as `world-lab`; the
 * compiler resolves that to the self-hosted engine, and the preview runs the
 * default-exported World. There is no `index.html` — the host page is the
 * sandbox's fixed shell (PLAN §6).
 */
// The actors are TEMPLATES — a set of traits and appearance, but no position:
// the world (main.world, authored in Blockly) places each instance and sets its
// per-instance position. `ground` is a JS template, `player` a Blockly `.actor`;
// the world adds all of them the same way. (The player is arrow-key controlled,
// so it also carries the input trait — authored in its `.actor` file.)

const GROUND_ACTOR = `import {ActorBuilder, GroundTrait, SolidTrait, AppearanceTrait, SpriteProperty} from 'world-lab';

// A ground tile: landable (GroundTrait) and a wall (SolidTrait), drawn with the
// built-in "ground" sprite. A normal tile is both.
export default new ActorBuilder({id: 'ground', name: 'Ground'})
  .useTraits([GroundTrait, SolidTrait, AppearanceTrait])
  .set(SpriteProperty, 'ground');
`;

const COIN_ACTOR = `import {ActorBuilder, PositionalTrait, AppearanceTrait, AnimationProperty} from 'world-lab';

// A coin playing the built-in "coinSpin" animation.
export default new ActorBuilder({id: 'coin', name: 'Coin'})
  .useTraits([PositionalTrait, AppearanceTrait])
  .set(AnimationProperty, 'coinSpin');
`;

const BALL_ACTOR = `import {ActorBuilder, PositionalTrait, AppearanceTrait, AnimationProperty} from 'world-lab';

// A ball playing "pulse" — the animation authored in animations/game.anim.
export default new ActorBuilder({id: 'ball', name: 'Ball'})
  .useTraits([PositionalTrait, AppearanceTrait])
  .set(AnimationProperty, 'pulse');
`;

// Blockly workspace helpers. A `.actor` / `.world` file is a Blockly
// workspace stored as serialized JSON (INTERFACE.md); the lab generates
// world-lab code from it before compiling. `nextBlock` chains statement blocks;
// `onEvent` builds a floating event-handler block (its own workspace root, so it
// sits beside the actor rather than chained inside it).
const nextBlock = (block: object, next?: object) =>
  next ? {...block, next: {block: next}} : block;

// Each event has its own cap-hat block (`world_on_<event>`); the handler body
// attaches below it as the next statement, not nested in a `do` input.
const onEvent = (event: string, x: number, y: number, message: string) => ({
  type: `world_on_${event}`,
  x,
  y,
  next: {block: {type: 'world_log', fields: {TEXT: message}}},
});

// A Map is the raw world-population document (WorldBuilder.loadMap): each
// entry places an instance of an actor template by its module path, with an
// optional id and property overrides keyed by owner (trait) id then property id
// — `positional.position` is the actor's start position. A dedicated map editor
// will author these; for now it is edited as JSON.
const place = (type: string, id: string, x: number, y: number) => ({
  type,
  id,
  properties: {positional: {position: {x, y}}},
});
const LEVEL1_MAP = JSON.stringify(
  {
    type: 'map',
    tile: {width: 32, height: 32},
    actors: [
      place('actors/player', 'Player', 480, 80),
      place('actors/ground', 'Ground', 480, 440),
      place('actors/coin', 'Coin', 660, 220),
      place('actors/ball', 'Ball', 300, 220),
    ],
  },
  null,
  2,
);

// The standard rules, shipped as project source under `rules/` rather than
// referenced from the engine bundle. Each is a re-export shim of the built-in
// rule — identical behavior and OBJECT IDENTITY (so an actor's `WorldLab.<Trait>`
// still matches the rule the world runs), but authored in the project: the
// world's `use rule` blocks import these, and a learner can later "eject" a shim
// to a full `RuleBuilder` source to modify a mechanic. (Only the rules the world
// names need a shim; their dependencies are pulled in transitively.)
const ruleShim = (exportName: string): string =>
  `export {${exportName} as default} from 'world-lab';\n`;

// The world, authored in Blockly (`main.world`): a `world_world` root with the
// rules in play, the animation file it registers, and the map whose actors it
// places. "Has Gravity" pulls in motion and collision; "Responds to Input"
// moves arrow-controlled actors; "Has Appearance" draws sprites and animations.
// The rules are project modules (`rules/*`), imported by the generated world.
//
// Rules and animations first, then the map: `load map` builds the world, and a
// `use rule` below it would arrive too late to be part of it (WorldBuilder
// throws rather than quietly dropping it). Only those two are ordered — `set`
// and `add effect` forward to the live world, so they may sit anywhere.
const MAIN_WORLD = JSON.stringify(
  {
    blocks: {
      blocks: [
        {
          type: 'world_world',
          x: 20,
          y: 20,
          fields: {NAME: 'Platform World'},
          next: {
            block: nextBlock(
              {type: 'world_use_rule', fields: {RULE: 'rules/gravity'}},
              nextBlock(
                {type: 'world_use_rule', fields: {RULE: 'rules/input'}},
                nextBlock(
                  {type: 'world_use_rule', fields: {RULE: 'rules/animation'}},
                  nextBlock(
                    {
                      type: 'world_use_animations',
                      fields: {FILE: 'animations/game'},
                    },
                    {type: 'world_load_map', fields: {MAP: 'maps/level1'}},
                  ),
                ),
              ),
            ),
          },
        },
      ],
    },
  },
  null,
  2,
);

const PLAYER_ACTOR = JSON.stringify(
  {
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {NAME: 'Player'},
          next: {
            block: nextBlock(
              {
                type: 'world_use_trait',
                fields: {TRAIT: 'AffectedByGravityTrait'},
              },
              nextBlock(
                {
                  type: 'world_use_trait',
                  fields: {TRAIT: 'ControlledByArrowsTrait'},
                },
                nextBlock(
                  // Appearance is now explicit: `play animation` only sets the
                  // animation, so the actor must elect the trait itself.
                  {
                    type: 'world_use_trait',
                    fields: {TRAIT: 'AppearanceTrait'},
                  },
                  // Plays a learner-authored animation (game.anim) — its id is
                  // in the dropdown because the lab feeds the project's
                  // animations to the block (Phase D). Position is set by the
                  // map when the world places this actor, not here.
                  {
                    type: 'world_play_animation',
                    fields: {ANIMATION: 'playerBob'},
                  },
                ),
              ),
            ),
          },
        },
        onEvent('startsFalling', 20, 200, 'Player started falling'),
        onEvent('stopsFalling', 20, 320, 'Player landed!'),
      ],
    },
  },
  null,
  2,
);

// Learner-authored animations — a `.anim` file (JSON on disk), discriminated by `type: 'animation'`
// (INTERFACE.md §Animations). The world imports and registers them
// (`useAnimations(parseAnimationFile(...))`). Both scale a built-in sprite per
// frame, showing the per-frame `scale` the stock strip animations don't use, and
// both become selectable in the `world_play_animation` Blockly dropdown: "pulse"
// (the ball, in JS) and "playerBob" (the player, authored in Blockly).
const GAME_ANIMATIONS = JSON.stringify(
  {
    type: 'animation',
    animations: {
      pulse: {
        name: 'Pulse',
        frames: [
          {sprite: 'ball', scale: 0.7, delay: 160},
          {sprite: 'ball', scale: 1.0, delay: 160},
          {sprite: 'ball', scale: 1.3, delay: 160},
          {sprite: 'ball', scale: 1.0, delay: 160},
        ],
      },
      playerBob: {
        name: 'Player Bob',
        frames: [
          {sprite: 'player', scale: 1.0, delay: 150},
          {sprite: 'player', scale: 1.25, delay: 150},
          {sprite: 'player', scale: 1.0, delay: 150},
          {sprite: 'player', scale: 0.8, delay: 150},
        ],
      },
    },
  },
  null,
  2,
);

export const DEFAULT_PROJECT: ProjectSources<MultiFileSource> = {
  source: {
    files: {
      main: {
        id: 'main',
        name: 'main.world',
        language: 'world',
        contents: MAIN_WORLD,
        folderId: 'worlds',
        active: true,
        open: true,
      },
      player: {
        id: 'player',
        name: 'player.actor',
        language: 'actor',
        contents: PLAYER_ACTOR,
        folderId: 'actors',
      },
      ground: {
        id: 'ground',
        name: 'ground.js',
        language: 'javascript',
        contents: GROUND_ACTOR,
        folderId: 'actors',
      },
      coin: {
        id: 'coin',
        name: 'coin.js',
        language: 'javascript',
        contents: COIN_ACTOR,
        folderId: 'actors',
      },
      ball: {
        id: 'ball',
        name: 'ball.js',
        language: 'javascript',
        contents: BALL_ACTOR,
        folderId: 'actors',
      },
      gameAnimations: {
        id: 'gameAnimations',
        name: 'game.anim',
        language: 'anim',
        contents: GAME_ANIMATIONS,
        folderId: 'animations',
      },
      level1: {
        id: 'level1',
        name: 'level1.map',
        language: 'map',
        contents: LEVEL1_MAP,
        folderId: 'maps',
      },
      gravityRule: {
        id: 'gravityRule',
        name: 'gravity.js',
        language: 'javascript',
        contents: ruleShim('GravityRule'),
        folderId: 'rules',
      },
      inputRule: {
        id: 'inputRule',
        name: 'input.js',
        language: 'javascript',
        contents: ruleShim('InputRule'),
        folderId: 'rules',
      },
      animationRule: {
        id: 'animationRule',
        name: 'animation.js',
        language: 'javascript',
        contents: ruleShim('AnimationRule'),
        folderId: 'rules',
      },
      // A starter shader graph, so `effects/` is not an empty folder and the
      // effect editor opens on something worth reading. Deliberately not
      // applied to anything: the tutorial is about gravity and input, and a
      // permanently rippling player would be a distraction from it. Dragging
      // Dragging `add effect` under an actor is how a learner tries it.
      rippleEffect: {
        id: 'rippleEffect',
        name: 'ripple.effect',
        language: 'effect',
        contents: serializeEffectDocument(rippleEffect),
        folderId: 'effects',
      },
    },
    folders: {
      rules: {id: 'rules', name: 'rules', parentId: '0'},
      worlds: {id: 'worlds', name: 'worlds', parentId: '0'},
      actors: {id: 'actors', name: 'actors', parentId: '0'},
      animations: {id: 'animations', name: 'animations', parentId: '0'},
      maps: {id: 'maps', name: 'maps', parentId: '0'},
      effects: {id: 'effects', name: 'effects', parentId: '0'},
    },
    openFiles: ['main'],
  },
};

/**
 * Which of the workspace's two panes are showing. Mirrors web-lab's `ViewMode`;
 * the segmented buttons in the workspace header switch between them.
 */
export const ViewMode = {
  SPLIT: 'split',
  CODE: 'code',
  PREVIEW: 'preview',
} as const;

export type ViewModeType = (typeof ViewMode)[keyof typeof ViewMode];
