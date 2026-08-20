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
  collectRule,
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
// per-instance position. All four are `.actor` files, which is to say Blockly
// workspaces: a learner who wants to know what a ground tile IS opens it and
// reads three rows, rather than reading JavaScript they have not been taught.
//
// They were JS `ActorBuilder` modules until the blocks could say everything the
// builders said. A project can still hold one — the compiler treats every
// module alike, and `blockly/projectModules` scans `.js` and `.ts` beside the
// block files — but nothing in the starter is one, and a starter is read before
// it is understood.
//
// What none of them elects is being POSITIONED or having an APPEARANCE: every
// actor has those (`ActorBuilder`'s foundation), so what a template lists is
// what makes it that kind of actor and nothing else.

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
export const stack = (blocks: object[]): object =>
  blocks.reduceRight((next, block) => nextBlock(block, next));

/**
 * `use trait ⟨Rule#Trait⟩` — the row that gives an actor a share of a rule.
 *
 * The dropdown stores a trait as its rule's NAME and the export name its own
 * name derives (`traitOptions`), so "Acts as Ground" declared by the rule named
 * "Gravity" is `Gravity#ActsAsGroundTrait`. Not a module path: the rule is
 * found by name wherever its file sits, and a value that names nothing falls
 * back to the first option rather than failing.
 */
export const useTrait = (trait: string) => ({
  type: 'world_use_trait',
  fields: {TRAIT: trait},
});

/**
 * A one-block `.actor` file: a `define actor` root and the body under it.
 *
 * Three of the starter's four are exactly this. The player is not, because it
 * also has event handlers, and a handler is its own top-level block rather than
 * something chained inside the definition.
 */
const actorFile = (name: string, rows: object[]) =>
  JSON.stringify(
    {
      blocks: {
        blocks: [
          {
            type: 'world_actor',
            x: 20,
            y: 20,
            fields: {NAME: name},
            next: {block: stack(rows)},
          },
        ],
      },
    },
    null,
    2,
  );

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
//   # . . . . . . C . #   3   C  a coin, over the platform
//   # . P . . . . . . #   4   P  player, which falls to the floor
//   # . . . . . . . . #   5
//   # . . . . = = = . #   6   =  a platform, three tiles, one jump up
//   # . . . . . . . . #   7
//   # . . . C . . . C #   8      …and two on the floor, where walking finds them
//   # # # # # # # # # #   9   #  the floor
//
// A room, on purpose. A jump clears about four tiles, so the platform is
// comfortably reachable from the floor and the third coin sits over it; the
// walls mean the first thing a learner does — hold an arrow key — bumps into
// something rather than walking out of the world, which in ten columns takes a
// second and a half. Leaving the world is a thing to build deliberately.
//
// THREE coins rather than one, because the console prints how many have been
// taken: with a single coin that number is only ever 1, and a count that cannot
// count reads as a decoration on the block rather than as the question it is.
// Two of them are on the walking path, so the first thing a learner does also
// shows them the mechanic; the third asks for the jump they have just been told
// about.
/**
 * What the starter level places, in the order the map lists it.
 *
 * Exported because the level is told twice — as a `.map` file here, and as
 * `create ⟨kind⟩ in map` arrangements in the single-world telling
 * (fixtures/platformerSingle), which groups these by type. Two hand-written
 * copies of a board is two boards, and the pair is only worth having if the
 * board in it is the same one.
 */
export const LEVEL1_ACTORS = [
  place('actors/player', 'Player', tileCenter(2), tileCenter(4)),
  ...ground('Floor', 9, ALL_COLUMNS),
  ...wall('WallLeft', 0, WALL_ROWS),
  ...wall('WallRight', 9, WALL_ROWS),
  ...ground('Platform', 6, [5, 6, 7]),
  // Three coins, in the order a learner will meet them: two on the floor
  // that walking right takes, and one that has to be jumped for.
  place('actors/coin', 'Coin1', tileCenter(4), tileCenter(8)),
  place('actors/coin', 'Coin2', tileCenter(8), tileCenter(8)),
  place('actors/coin', 'Coin3', tileCenter(6), tileCenter(3)),
  place('actors/ball', 'Ball', tileCenter(3), tileCenter(2)),
];

const LEVEL1_MAP = JSON.stringify(
  {
    type: 'map',
    // Said out loud rather than left to the default, so the shipped map is a
    // worked example of the field: how many tiles across and down (the map
    // editor's Width/Height), against `tile`, which is how big ONE is.
    size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: LEVEL1_ACTORS,
  },
  null,
  2,
);

// The world, authored in Blockly (`main.world`): a `world_world` root and the
// map whose actors it places.
//
// NO `use rule` ROWS, and this is where that reads loudest, since this is the
// first thing a learner sees. The rules in play are the ones under `rules/` —
// gravity, the arrow keys, collection, and the four those pull in through their
// own `requires` — and the project holds them, which is the whole of saying so
// (blockly/projectModules). It used to be three rows here and a standing
// question about why Space, Appearance and Input were not among them.
//
// Animations go the same way and always did, which is where the argument came
// from: a file is not a thing a world opts into, it is a thing the project has.
//
// One ordering survives, and it is the generator's rather than the author's:
// rules and animations are emitted before the map, because `load map` builds
// the World and a rule arriving after it is too late (WorldBuilder throws
// rather than quietly dropping it).
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
              useTrait('Gravity#AffectedByGravityTrait'),
              useTrait('Arrow Keys#MovesAcrossTrait'),
              // Hearing the keyboard is something an actor ELECTS. The world's
              // own key events are raised once a frame whatever is in it; this
              // trait is what makes `rules/input` also tell THIS actor, and it
              // is why that broadcast walks one player rather than every coin.
              useTrait('Input#TakesKeyboardInputTrait'),
              // The other side of the coin's "Can Be Collected": what makes
              // walking into one take it. The player names no kind here — the
              // rule takes whatever it touches that says it can be taken, so
              // making a second kind of thing collectible is an edit to that
              // thing and not to this file.
              useTrait('Collection#CollectsTrait'),
              // Plays a learner-authored animation (game.anim) — its id is in
              // the dropdown because the lab feeds the project's animations to
              // the block (Phase D). Position is set by the map when the world
              // places this actor, not here.
              //
              // No `use trait Has Appearance` above it any more: every actor
              // has that, and being positioned, without electing either
              // (ActorBuilder's foundation). What is left are the traits that
              // make this actor a PLAYER rather than a coin.
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
        // The score, such as it is. Taking the coin is the RULE's business —
        // this handler is only told that it happened, which is why the coin is
        // already out of the world by the time anything reads the count.
        //
        // `collected` is a list of what was taken rather than a tally, so "how
        // many coins" is a question asked of it rather than a second number
        // kept alongside it. Which is the answer to "and how many of the other
        // thing", too, without a second counter and without remembering to
        // increment it.
        {
          type: 'world_on_Collection_CollectsEvent',
          x: 20,
          y: 620,
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
                          inputs: {
                            ACTOR: {block: {type: 'world_this_actor'}},
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
      ],
    },
  },
  null,
  2,
);

// A ground tile: landable ("Acts as Ground", from the project's own gravity
// rule) and a wall ("Solid", from its own solid-bodies rule), drawn with the
// project's own "ground.png". A normal tile is both.
//
// Both traits come from rules the project HOLDS, and that is the whole of what
// this file has to get right: gravity's ground loop matches its own trait, so a
// tile electing some other rule's would compile, run, and hold nothing up.
// Naming a trait by rule name rather than by module is what makes that hard to
// get wrong — there is only one "Gravity" in play.
const GROUND_ACTOR = actorFile('Ground', [
  useTrait('Gravity#ActsAsGroundTrait'),
  useTrait('Solid Bodies#SolidTrait'),
  {type: 'world_set_sprite', fields: {SPRITE: 'ground.png'}},
]);

// A coin playing "coinSpin" — the animation in animations/coinSpin.anim — and
// electing to be takeable.
//
// "Can Be Collected" is the whole of the coin's side of collecting: it does not
// know what a player is, and the player does not know what a coin is. That is
// the point of the rule having two traits rather than one — a game says which
// kinds of thing can be picked up, and which kinds pick things up, and the two
// lists have nothing to do with each other.
//
// Being touchable is not among the rows, because "Can Be Collected" requires
// "Can Collide" and a trait brings its own dependencies. A coin that could be
// taken but could not be touched would be a rule that silently does nothing.
const COIN_ACTOR = actorFile('Coin', [
  {type: 'world_play_animation', fields: {ANIMATION: 'coinSpin'}},
  useTrait('Collection#CanBeCollectedTrait'),
]);

// A ball playing "pulse" — the animation in animations/game.anim.
const BALL_ACTOR = actorFile('Ball', [
  {type: 'world_play_animation', fields: {ANIMATION: 'pulse'}},
]);

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
 * pointing at one. {@link buildProject} supplies both.
 */
type StarterFile = Omit<ProjectFile, 'id'>;

/** What the starter is written as, before it has any ids. */
/**
 * A project written the way a person would describe one: folders by name, files
 * by a readable key, and which of them start open.
 *
 * Exported because the starter is no longer the only project the demo can load
 * — the fixture catalogue (src/fixtures) describes one per game it shows off,
 * and each of them wants to be written like this rather than as a table of
 * numeric ids.
 */
export interface ProjectSpec {
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
export function buildProject(spec: ProjectSpec): {
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
export function starterSprites(ids: readonly string[]) {
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

/**
 * The starter, written out.
 *
 * Exported because it is now told twice: once as it stands, and once with the
 * actors and the map moved into `main.world` (fixtures/platformerSingle). The
 * second one is the first one minus five files, so it takes this rather than
 * restating the rules, the pictures and the animations — a copy of that list
 * would be a copy that could go stale, and the whole point of the pair is that
 * only the TELLING differs.
 */
export const STARTER_SPEC: ProjectSpec = {
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
      name: 'ground.actor',
      language: 'actor',
      contents: GROUND_ACTOR,
      folderId: 'actors',
    },
    coin: {
      name: 'coin.actor',
      language: 'actor',
      contents: COIN_ACTOR,
      folderId: 'actors',
    },
    ball: {
      name: 'ball.actor',
      language: 'actor',
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
    collectRule: {
      name: 'collect.rule',
      language: 'rule',
      contents: collectRule,
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
};

const STARTER = buildProject(STARTER_SPEC);

export const DEFAULT_PROJECT: ProjectSources<MultiFileSource> = {
  source: STARTER.source,
};

/**
 * A starter file by the name it is written under in {@link buildProject}.
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
