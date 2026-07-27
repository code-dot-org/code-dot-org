import type {MultiFileSource, ProjectSources} from '@code-dot-org/core/api';

/**
 * The scene the game starts on — the driver's compile + run entry point
 * (PLAN §6). Fixed for the slice; later a level/appOptions field selects it.
 */
export const ENTRY_FILE = 'scenes/main.js';

/**
 * The default project for a new World Lab: a small gravity game across the
 * conventional directories. The learner imports the engine as `world-lab`; the
 * compiler resolves that to the self-hosted engine, and the preview runs the
 * default-exported Scene. There is no `index.html` — the host page is the
 * sandbox's fixed shell (PLAN §6).
 */
const MAIN_SCENE = `import {SceneBuilder, ActorBuilder, GroundTrait, PositionalTrait, AppearanceTrait, PositionProperty, SpriteProperty, AnimationProperty, Vector} from 'world-lab';
import PlatformWorld from 'worlds/platform';
import Player from 'actors/player';

// A Scene glues a World (the rules) to the Actors living in it.
const scene = new SceneBuilder({id: 'game', name: 'Game'});
scene.useWorld(PlatformWorld);
scene.addActor(Player);

// The ground the player lands on, drawn with the built-in "ground" sprite.
scene.addActor(
  new ActorBuilder({id: 'ground', name: 'Ground'})
    .useTraits([GroundTrait, AppearanceTrait])
    .set(PositionProperty, new Vector(200, 260))
    .set(SpriteProperty, 'ground'),
);

// A coin floating above the ground, playing the "coinSpin" animation.
scene.addActor(
  new ActorBuilder({id: 'coin', name: 'Coin'})
    .useTraits([PositionalTrait, AppearanceTrait])
    .set(PositionProperty, new Vector(320, 70))
    .set(AnimationProperty, 'coinSpin'),
);

export default scene;
`;

const PLATFORM_WORLD = `import {WorldBuilder, GravityRule, InputRule, AnimationRule} from 'world-lab';

// A World is the set of rules in play. "Has Gravity" pulls in motion and
// collision automatically; "Responds to Input" lets arrow-key-controlled actors
// move; "Has Appearance" draws actors with sprites and animations.
export default new WorldBuilder({id: 'platform', name: 'Platform World'}).useRules(
  [GravityRule, InputRule, AnimationRule],
);
`;

// The player is authored in Blockly — a `.actor` file is a Blockly workspace
// stored as serialized JSON (INTERFACE.md). The lab generates world-lab code
// from it before compiling; the scene imports it exactly like a `.js` actor.
// Shows both representations — JS scene/world, Blockly actor — in one project.
//
// The `world_actor` block holds the actor's configuration (traits, start
// position). Each event handler is a separate top-level block floating in the
// workspace — its own starting block — so the events sit beside the actor, not
// chained inside it.
const nextBlock = (block: object, next?: object) =>
  next ? {...block, next: {block: next}} : block;

const onEvent = (event: string, x: number, y: number, message: string) => ({
  type: 'world_on_event',
  x,
  y,
  fields: {EVENT: event},
  inputs: {
    HANDLER: {block: {type: 'world_log', fields: {TEXT: message}}},
  },
});

const PLAYER_ACTOR = JSON.stringify(
  {
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          x: 20,
          y: 20,
          fields: {ID: 'player', NAME: 'Player'},
          inputs: {
            BODY: {
              block: nextBlock(
                {type: 'world_use_trait', fields: {TRAIT: 'affected'}},
                nextBlock(
                  {type: 'world_use_trait', fields: {TRAIT: 'controlled'}},
                  nextBlock(
                    {type: 'world_set_position', fields: {X: 200, Y: 20}},
                    {type: 'world_set_sprite', fields: {SPRITE: 'player'}},
                  ),
                ),
              ),
            },
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

export const DEFAULT_PROJECT: ProjectSources<MultiFileSource> = {
  source: {
    files: {
      main: {
        id: 'main',
        name: 'main.js',
        language: 'javascript',
        contents: MAIN_SCENE,
        folderId: 'scenes',
        active: true,
        open: true,
      },
      platform: {
        id: 'platform',
        name: 'platform.js',
        language: 'javascript',
        contents: PLATFORM_WORLD,
        folderId: 'worlds',
      },
      player: {
        id: 'player',
        name: 'player.actor',
        language: 'actor',
        contents: PLAYER_ACTOR,
        folderId: 'actors',
      },
    },
    folders: {
      scenes: {id: 'scenes', name: 'scenes', parentId: '0'},
      worlds: {id: 'worlds', name: 'worlds', parentId: '0'},
      actors: {id: 'actors', name: 'actors', parentId: '0'},
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
