import {DEFAULT_FOLDER_ID} from '@code-dot-org/codebridge';
import type {
  MultiFileSource,
  ProjectFile,
  ProjectSources,
} from '@code-dot-org/core/api';

import {serializeSheetFile, sheetFileName} from './appearance/sheetFile';
import {
  spriteFileName,
  STOCK_ANIMATIONS,
  STOCK_SPRITES,
} from './appearance/stock';
import {serializeEffectDocument} from './effect/model';
import {rippleEffect} from './effect/stock';
import {
  arrowsRule,
  solidRule,
  collisionsRule,
  gravityRule,
  inputRule,
  motionRule,
} from './rules/stock';
import {TILE_SIZE, VIEWPORT_TILES} from './runtime/viewport';

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
//
// What none of them elects is being POSITIONED or having an APPEARANCE: every
// actor has those (`ActorBuilder`'s foundation), so what a template lists is
// what makes it that kind of actor and nothing else.

const GROUND_ACTOR = `import {ActorBuilder, SpriteProperty} from 'world-lab';
import {SolidTrait} from 'rules/solid';
import {ActsAsGroundTrait} from 'rules/gravity';

// A ground tile: landable (ActsAsGroundTrait, from the project's own gravity
// rule) and a wall (SolidTrait, from the engine's collision rule), drawn with
// the project's own "ground.png". A normal tile is both. Being somewhere and
// having a picture are not among the traits it elects — every actor has those.
export default new ActorBuilder({id: 'ground', name: 'Ground'})
  .useTraits([ActsAsGroundTrait, SolidTrait])
  .set(SpriteProperty, 'ground.png');
`;

const COIN_ACTOR = `import {ActorBuilder, AnimationProperty} from 'world-lab';

// A coin playing "coinSpin" — the animation in animations/coinSpin.anim. It
// elects no traits at all: an actor can be somewhere and be drawn without
// asking, so playing an animation is the whole of what makes this a coin.
export default new ActorBuilder({id: 'coin', name: 'Coin'})
  .set(AnimationProperty, 'coinSpin');
`;

const BALL_ACTOR = `import {ActorBuilder, AnimationProperty} from 'world-lab';

// A ball playing "pulse" — the animation in animations/game.anim.
export default new ActorBuilder({id: 'ball', name: 'Ball'})
  .set(AnimationProperty, 'pulse');
`;

// Blockly workspace helpers. A `.actor` / `.world` file is a Blockly
// workspace stored as serialized JSON (INTERFACE.md); the lab generates
// world-lab code from it before compiling. `nextBlock` chains statement blocks;
// `onEvent` builds a floating event-handler block (its own workspace root, so it
// sits beside the actor rather than chained inside it).
const nextBlock = (block: object, next?: object) =>
  next ? {...block, next: {block: next}} : block;

/**
 * A straight stack of blocks, first to last.
 *
 * Nesting `nextBlock` calls to build a long chain is a trap: it OVERWRITES the
 * `next` of whatever it is given, so wrapping a block that already had one drops
 * everything below it — silently, since the file still parses and the world
 * still loads, just without those rules. This takes the list.
 */
const stack = (blocks: object[]): object =>
  blocks.reduceRight((next, block) => nextBlock(block, next));

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
// The middle of tile `column`/`row` on the world's 10 × 10 grid — the point a
// placed actor's position names. Everything in the starter level is on the grid,
// because "the floor is the bottom row" should be true of the numbers as well as
// of the picture.
const tileCenter = (index: number) => index * TILE_SIZE + TILE_SIZE / 2;

/** A run of ground tiles along `row`, one per column in `columns`. */
const ground = (name: string, row: number, columns: readonly number[]) =>
  columns.map(column =>
    place(
      'actors/ground',
      `${name}${column}`,
      tileCenter(column),
      tileCenter(row),
    ),
  );

/** A column of ground tiles down `column`, one per row in `rows`. */
const wall = (name: string, column: number, rows: readonly number[]) =>
  rows.map(row =>
    place(
      'actors/ground',
      `${name}${row}`,
      tileCenter(column),
      tileCenter(row),
    ),
  );

const ALL_COLUMNS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const WALL_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

// The starter level, laid out on the grid (runtime/viewport):
//
//   # . . . . . . . . #   0   #  wall
//   # . . . . . . . . #   1
//   # . . B . . . . . #   2   B  ball, floating
//   # . . . . . . C . #   3   C  coin, over the platform
//   # . P . . . . . . #   4   P  player, which falls to the floor
//   # . . . . . . . . #   5
//   # . . . . = = = . #   6   =  a platform, three tiles, one jump up
//   # . . . . . . . . #   7
//   # . . . . . . . . #   8
//   # # # # # # # # # #   9   #  the floor
//
// A room, on purpose. A jump clears about four tiles, so the platform is
// comfortably reachable from the floor and the coin sits over it; the walls mean
// the first thing a learner does — hold an arrow key — bumps into something
// rather than walking out of the world, which in ten columns takes a second and
// a half. Leaving the world is a thing to build deliberately.
const LEVEL1_MAP = JSON.stringify(
  {
    type: 'map',
    // Said out loud rather than left to the default, so the shipped map is a
    // worked example of the field: how many tiles across and down (the map
    // editor's Width/Height), against `tile`, which is how big ONE is.
    size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: [
      place('actors/player', 'Player', tileCenter(2), tileCenter(4)),
      ...ground('Floor', 9, ALL_COLUMNS),
      ...wall('WallLeft', 0, WALL_ROWS),
      ...wall('WallRight', 9, WALL_ROWS),
      ...ground('Platform', 6, [5, 6, 7]),
      place('actors/coin', 'Coin', tileCenter(6), tileCenter(3)),
      place('actors/ball', 'Ball', tileCenter(3), tileCenter(2)),
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
// Gravity, authored in Blockly rather than shimmed from the engine.
const ruleShim = (exportName: string): string =>
  `export {${exportName} as default} from 'world-lab';\n`;

// The world, authored in Blockly (`main.world`): a `world_world` root with the
// rules in play and the map whose actors it places.
//
// TWO rows, and both are choices. "Has Gravity" pulls in motion and collision
// through its own `requires`, and "Moves with Arrow Keys" pulls in motion the
// same way; a world could sensibly have neither. What is NOT here is the
// foundation — Space and Appearance, which the engine seeds into every world,
// and Input, which the project runs by holding `rules/input.rule`
// (blockly/foundation). Those were four more rows saying what no game can be
// without, which is four rows of noise on the first thing a learner reads.
// The rules named are project modules (`rules/*`), imported by the generated
// world.
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
            block: stack([
              {type: 'world_use_rule', fields: {RULE: 'Gravity'}},
              {type: 'world_use_rule', fields: {RULE: 'Arrow Keys'}},
              {type: 'world_load_map', fields: {MAP: 'maps/level1'}},
            ]),
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
            block: stack([
              {
                type: 'world_use_trait',
                fields: {TRAIT: 'Gravity#AffectedByGravityTrait'},
              },
              {
                type: 'world_use_trait',
                fields: {TRAIT: 'Arrow Keys#ControlledByArrowKeysTrait'},
              },
              // Hearing the keyboard is something an actor ELECTS. The world's
              // own key events are raised once a frame whatever is in it; this
              // trait is what makes `rules/input` also tell THIS actor, and it
              // is why that broadcast walks one player rather than every coin.
              {
                type: 'world_use_trait',
                fields: {TRAIT: 'Input#TakesKeyboardInputTrait'},
              },
              // Plays a learner-authored animation (game.anim) — its id is in
              // the dropdown because the lab feeds the project's animations to
              // the block (Phase D). Position is set by the map when the world
              // places this actor, not here.
              //
              // No `use trait Has Appearance` above it any more: every actor
              // has that, and being positioned, without electing either
              // (ActorBuilder's foundation). What is left are the two traits
              // that make this actor a PLAYER rather than a coin.
              {
                type: 'world_play_animation',
                fields: {ANIMATION: 'playerBob'},
              },
            ]),
          },
        },
        // Space to jump. WHICH key is on the hat — `rules/input` declares its
        // trait's events as "presses ⟨a key⟩", so the handler is registered for
        // the space bar and never runs for anything else (specs/ENUMS.md). What
        // is left inside is the one condition a filter cannot express:
        // gravity's own query, keeping the jump honest — no second jump in
        // mid-air.
        //
        // The TRAIT's event, not the world's. A world event is handed no actor
        // and registers on the world, which an `.actor` module has no binding
        // for — "this actor presses space" is the statement an actor can make.
        {
          type: 'world_on_Input_PressesEvent',
          fields: {FILTER0: 'space'},
          x: 20,
          y: 440,
          next: {
            block: {
              type: 'controls_if',
              inputs: {
                IF0: {
                  block: {
                    type: 'world_query_Gravity_IsOnTheGroundQuery',
                    inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                  },
                },
                DO0: {
                  block: {
                    type: 'world_do_Physics_ApplyForceAction',
                    inputs: {
                      VALUE: {
                        block: {
                          type: 'world_vector',
                          fields: {VECTOR: {x: 0, y: -5}},
                        },
                      },
                      ACTOR: {block: {type: 'world_this_actor'}},
                    },
                  },
                },
              },
            },
          },
        },
        onEvent(
          'Gravity_StartsFallingEvent',
          20,
          200,
          'Player started falling',
        ),
        onEvent('Gravity_StopsFallingEvent', 20, 320, 'Player landed!'),
      ],
    },
  },
  null,
  2,
);

// Learner-authored animations — a `.anim` file (JSON on disk), discriminated by
// `type: 'animation'` (INTERFACE.md §Animations). Every `.anim` in the project is
// registered when the world is built, so a file being here is what makes its
// animations playable. Both of these scale one image per frame rather than
// reading a strip, and both are selectable in the `play animation` dropdown:
// "pulse" (the ball) and "playerBob" (the player). Each says its timing once,
// as a frame rate, rather than repeating a delay on every frame — a frame only
// carries a delay when it is an exception (engine animationTypes.frameDelay).
const GAME_ANIMATIONS = JSON.stringify(
  {
    type: 'animation',
    animations: {
      pulse: {
        frameRate: 6,
        frames: [
          {sprite: 'ball.png', scale: 0.7},
          {sprite: 'ball.png', scale: 1.0},
          {sprite: 'ball.png', scale: 1.3},
          {sprite: 'ball.png', scale: 1.0},
        ],
      },
      playerBob: {
        frameRate: 7,
        frames: [
          {sprite: 'player.png', scale: 1.0},
          {sprite: 'player.png', scale: 1.25},
          {sprite: 'player.png', scale: 1.0},
          {sprite: 'player.png', scale: 0.8},
        ],
      },
    },
  },
  null,
  2,
);

/**
 * A starter file as written below: no id, and naming its folder rather than
 * pointing at one. {@link numbered} supplies both.
 */
type StarterFile = Omit<ProjectFile, 'id'>;

/** What the starter is written as, before it has any ids. */
interface StarterSpec {
  /** Folder names, all at the project root. */
  folders: readonly string[];
  /** Files by a readable key, each naming its folder in `folderId`. */
  files: Record<string, StarterFile>;
  /** Which files start open, by key. The first is the active tab. */
  open: readonly string[];
}

/**
 * The starter project, numbered.
 *
 * Ids in a Codebridge project are stringified integers: `getNextFileId` and
 * `getNextFolderId` are max-plus-one arithmetic over them, and an id that is
 * not an integer makes every id they hand out afterwards `"NaN"` — so two
 * files written in a row both land on `"NaN"` and the second replaces the
 * first. (The helpers now skip non-integers rather than choking on them, but a
 * project that keeps to the contract is the point; this is where world's ids
 * come from.)
 *
 * Numbers are also unreadable, and the starter is a document people edit. So
 * it is written by name — `main`, `sprite-coin`, `rules` — and numbered here on
 * the way out, with the names resolved to the ids they were given. Nothing
 * outside this file should ever name a starter file by id; tests use
 * {@link starterFile}.
 */
function numbered(spec: StarterSpec): {
  source: MultiFileSource;
  /** The id each file was given, by the key it is written under. */
  ids: ReadonlyMap<string, string>;
} {
  const folderIds = new Map(
    spec.folders.map((name, index) => [name, String(index + 1)]),
  );
  const fileIds = new Map(
    Object.keys(spec.files).map((key, index) => [key, String(index + 1)]),
  );

  const folders: MultiFileSource['folders'] = {};
  for (const [name, id] of folderIds) {
    folders[id] = {id, name, parentId: DEFAULT_FOLDER_ID};
  }

  const files: MultiFileSource['files'] = {};
  for (const [key, file] of Object.entries(spec.files)) {
    const folderId = folderIds.get(file.folderId);
    if (!folderId) {
      throw new Error(
        `starter file “${key}” is in “${file.folderId}”, which is not a starter folder`,
      );
    }
    files[fileIds.get(key) as string] = {
      ...file,
      id: fileIds.get(key) as string,
      folderId,
    };
  }

  return {
    source: {
      files,
      folders,
      openFiles: spec.open.map(key => {
        const id = fileIds.get(key);
        if (!id) {
          throw new Error(
            `starter opens “${key}”, which is not a starter file`,
          );
        }
        return id;
      }),
    },
    ids: fileIds,
  };
}

/**
 * The stock images the starter project ships copies of, as project files.
 *
 * Written here rather than pasted as base64: they are the same bytes the import
 * dialog hands out (`appearance/stock`), so the starter project cannot drift
 * from what a learner would get by importing one.
 */
function starterSprites(ids: readonly string[]) {
  const files: Record<string, StarterFile> = {};
  for (const id of ids) {
    const sprite = STOCK_SPRITES.find(entry => entry.id === id);
    if (!sprite) {
      continue;
    }
    files[`sprite-${id}`] = {
      name: spriteFileName(id),
      language: 'png',
      contents: '',
      folderId: 'sprites',
      url: sprite.dataUrl,
      mimeType: 'image/png',
    };
    // A grid ships with the file that says it is one, the same as an import
    // writes it — without the `.sheet`, `coinSpin.png` is a wide picture and the
    // animation editor has no cells to offer.
    if (sprite.sheet) {
      const name = sheetFileName(spriteFileName(id));
      files[`sheet-${id}`] = {
        name,
        language: 'json',
        contents: serializeSheetFile(sprite.sheet),
        folderId: 'sprites',
      };
    }
  }
  return files;
}

/** A stock animation shipped as a project file, exactly as an import leaves it. */
function starterAnimation(id: string): Record<string, StarterFile> {
  const animation = STOCK_ANIMATIONS.find(entry => entry.id === id);
  if (!animation) {
    return {};
  }
  return {
    [`anim-${id}`]: {
      name: `${id}.anim`,
      language: 'anim',
      contents: `${JSON.stringify(animation.document, null, 2)}\n`,
      folderId: 'animations',
    },
  };
}

const STARTER = numbered({
  folders: [
    'rules',
    'worlds',
    'actors',
    'animations',
    'sprites',
    // Empty until something is imported into it, and present anyway: the
    // folder is what makes an image a backdrop (BACKGROUNDS.md §5), so a
    // learner who uploads a sky needs somewhere to put it that means that.
    'backgrounds',
    'maps',
    'effects',
  ],
  files: {
    main: {
      name: 'main.world',
      language: 'world',
      contents: MAIN_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
    player: {
      name: 'player.actor',
      language: 'actor',
      contents: PLAYER_ACTOR,
      folderId: 'actors',
    },
    ground: {
      name: 'ground.js',
      language: 'javascript',
      contents: GROUND_ACTOR,
      folderId: 'actors',
    },
    coin: {
      name: 'coin.js',
      language: 'javascript',
      contents: COIN_ACTOR,
      folderId: 'actors',
    },
    ball: {
      name: 'ball.js',
      language: 'javascript',
      contents: BALL_ACTOR,
      folderId: 'actors',
    },
    gameAnimations: {
      name: 'game.anim',
      language: 'anim',
      contents: GAME_ANIMATIONS,
      folderId: 'animations',
    },
    level1: {
      name: 'level1.map',
      language: 'map',
      contents: LEVEL1_MAP,
      folderId: 'maps',
    },
    gravityRule: {
      name: 'gravity.rule',
      language: 'rule',
      contents: gravityRule,
      folderId: 'rules',
    },
    arrowsRule: {
      name: 'arrows.rule',
      language: 'rule',
      contents: arrowsRule,
      folderId: 'rules',
    },
    inputRule: {
      name: 'input.rule',
      language: 'rule',
      contents: inputRule,
      folderId: 'rules',
    },
    motionRule: {
      name: 'motion.rule',
      language: 'rule',
      contents: motionRule,
      folderId: 'rules',
    },
    collisionsRule: {
      name: 'collisions.rule',
      language: 'rule',
      contents: collisionsRule,
      folderId: 'rules',
    },
    solidRule: {
      name: 'solid.rule',
      language: 'rule',
      contents: solidRule,
      folderId: 'rules',
    },
    animationRule: {
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
      name: 'ripple.effect',
      language: 'effect',
      contents: serializeEffectDocument(rippleEffect),
      folderId: 'effects',
    },
    // The images. A project draws only what it holds, so the four the starter
    // level uses are files in it — copies of the stock drawings, exactly as
    // importing them would leave them, and editable from here on.
    ...starterSprites(['player', 'ground', 'coin', 'ball', 'coinSpin']),
    // …and one animation copied in whole, frames and image both: the coin's
    // spin, which reads six squares out of one strip. The other two
    // animations here scale a single image instead — between them they show
    // the two ways an animation is made.
    ...starterAnimation('coinSpin'),
  },
  open: ['main'],
});

export const DEFAULT_PROJECT: ProjectSources<MultiFileSource> = {
  source: STARTER.source,
};

/**
 * A starter file by the name it is written under in {@link numbered}.
 *
 * The project's ids are numbers, so a caller that wants `gravity.rule` cannot
 * reasonably ask for it by id. Throws rather than returning undefined: every
 * caller is asserting something about a file it believes is there, and a typo
 * should say so rather than read as an empty file.
 */
export function starterFile(key: string): ProjectFile {
  const id = STARTER.ids.get(key);
  const file = id === undefined ? undefined : STARTER.source.files[id];
  if (!file) {
    throw new Error(`no starter file called “${key}”`);
  }
  return file;
}

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
