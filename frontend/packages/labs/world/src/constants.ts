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
const MAIN_SCENE = `import {SceneBuilder, ActorBuilder, GroundTrait, PositionProperty, Vector} from 'world-lab';
import PlatformWorld from 'worlds/platform';
import Player from 'actors/player';

// A Scene glues a World (the rules) to the Actors living in it.
const scene = new SceneBuilder({id: 'game', name: 'Game'});
scene.useWorld(PlatformWorld);
scene.addActor(Player);

// The ground the player lands on.
scene.addActor(
  new ActorBuilder({id: 'ground', name: 'Ground'})
    .useTraits([GroundTrait])
    .set(PositionProperty, new Vector(200, 260)),
);

export default scene;
`;

const PLATFORM_WORLD = `import {WorldBuilder, GravityRule} from 'world-lab';

// A World is the set of rules in play. "Has Gravity" pulls in motion and
// collision automatically.
export default new WorldBuilder({id: 'platform', name: 'Platform World'}).useRules(
  [GravityRule],
);
`;

const PLAYER_ACTOR = `import {
  ActorBuilder,
  AffectedByGravityTrait,
  PositionProperty,
  StartsFallingEvent,
  StopsFallingEvent,
  Vector,
} from 'world-lab';

// An Actor is a set of traits (which add properties) plus event handlers.
const player = new ActorBuilder({id: 'player', name: 'Player'})
  .useTraits([AffectedByGravityTrait])
  .set(PositionProperty, new Vector(200, 20));

player.on(StartsFallingEvent, () => console.log('Player started falling'));
player.on(StopsFallingEvent, () => console.log('Player landed!'));

export default player;
`;

// A starter `.rule` — a Blockly workspace stored as serialized JSON. It is not
// yet imported by the scene (Blockly → world-lab code generation is the next
// increment); it exists so the Blockly editor has something to open.
const EXAMPLE_RULE = JSON.stringify(
  {
    blocks: {
      blocks: [
        {type: 'controls_if', x: 40, y: 40},
        {type: 'math_number', x: 40, y: 140, fields: {NUM: 42}},
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
        name: 'player.js',
        language: 'javascript',
        contents: PLAYER_ACTOR,
        folderId: 'actors',
      },
      example: {
        id: 'example',
        name: 'example.rule',
        language: 'rule',
        contents: EXAMPLE_RULE,
        folderId: 'rules',
      },
    },
    folders: {
      scenes: {id: 'scenes', name: 'scenes', parentId: '0'},
      worlds: {id: 'worlds', name: 'worlds', parentId: '0'},
      actors: {id: 'actors', name: 'actors', parentId: '0'},
      rules: {id: 'rules', name: 'rules', parentId: '0'},
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
