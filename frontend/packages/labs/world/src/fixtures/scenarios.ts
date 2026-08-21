// The projects the demo can load, one per thing worth showing.
//
// A lab is only as demonstrable as the projects it can be pointed at, and until
// now it could be pointed at one: the starter. Everything else — a breakout
// board, a meteor field, whatever the next rule needs to prove itself —
// lived as a temporary edit to `constants.ts` that had to be reverted before
// committing. Which means it was written once, verified once, and thrown away,
// and the next person to touch that rule wrote it again.
//
// So they live here, named, and the demo picks one (src/main.tsx). The same
// catalogue the mock API serves, so a scenario a person can select is a
// scenario a test can activate by tag.
//
// A scenario is a PROJECT and its instructions, nothing else. It says what a
// learner would have on screen, not what the lab does with it — the level
// properties around it are the same for all of them and are written once, in
// ./index.
//
// This is the interim shape, deliberately matching what `packages/users` does
// for account scenarios: a tag list, a record keyed by it, and a dropdown in
// the dev host. What it wants to become is a resource-panel tab that can also
// create and edit these, at which point the catalogue stops being a source file
// and this module becomes its seed.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {buildProject, DEFAULT_PROJECT, type ProjectSpec} from '../constants';
import type {WorldLevelData} from '../levelData';

import {BREAKOUT_SPEC} from './breakout';
import {BREAKOUT_SINGLE_SPEC} from './breakoutSingle';
import {FLAPPY_SPEC} from './flappy';
import {FLAPPY_SINGLE_SPEC} from './flappySingle';
import {METEORS_SPEC} from './meteors';
import {METEORS_SINGLE_SPEC} from './meteorsSingle';
import {PLATFORMER_SINGLE_SPEC} from './platformerSingle';
import {TAPPER_PROJECT} from './tapper';

/**
 * Every scenario's tag, in the order the switcher offers them.
 *
 * The tag is also the channel id the studio route carries
 * (`/projects/world/<tag>/edit`), so it is url-shaped: lower case, hyphens.
 */
export const WORLD_SCENARIO_TAGS = [
  // `simple` rather than `platformer`, which is what the switcher calls it.
  // The tag is the channel id a studio route carries, and this one has been
  // that since before the catalogue existed; renaming it would break the links
  // people already have for the sake of a tidier list.
  'simple',
  'platformer-single',
  'breakout',
  'breakout-single',
  'meteors',
  'meteors-single',
  'flappy',
  'flappy-single',
  'tapper',
  'empty',
] as const;

export type WorldScenarioTag = (typeof WORLD_SCENARIO_TAGS)[number];

/** The scenario the demo loads when nothing says otherwise. */
export const DEFAULT_SCENARIO_TAG: WorldScenarioTag = 'simple';

export interface WorldScenario {
  /** What the switcher shows. Title case, a few words. */
  name: string;
  /** What this one is FOR — the switcher's subtitle, and the reason it exists. */
  description: string;
  /** The project a learner opens into. */
  source: MultiFileSource;
  /** The level's instructions panel, as markdown. */
  instructions: string;
  /**
   * What this level says about the editor, if anything (../levelData).
   *
   * Everything in it is a teaching decision rather than a preference, which is
   * why it is a level's to make and not the lab's. Omitted by a scenario that
   * wants the editor's defaults, which is most of them.
   */
  levelData?: WorldLevelData;
}

/**
 * What a single-world scenario says: there is one file, so there is no file
 * browser.
 *
 * The claim those scenarios make is that the game is said entirely in
 * `main.world`, and a sidebar listing eleven other files argues with it — the
 * first thing it invites is the click that leaves the one file the scenario is
 * about. The files are still THERE and still compiled; what is gone is the
 * list. A rule is still reachable from the block that names it, which is the
 * way in that belongs to the lesson rather than beside it.
 */
const ONE_FILE: WorldLevelData = {showFileBrowser: false};

/**
 * An empty project: the folders and one world that does nothing.
 *
 * The folders are there and empty on purpose — the same eight the starter has,
 * because a folder is what gives a file its meaning here (an image under
 * `backgrounds/` is a backdrop, one under `sprites/` is not), and a learner
 * starting from nothing should not have to know that before they can upload a
 * picture.
 */
const EMPTY_WORLD = JSON.stringify({
  blocks: {
    blocks: [{type: 'world_world', x: 20, y: 20, fields: {NAME: 'My World'}}],
  },
});

const EMPTY_SPEC: ProjectSpec = {
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
      contents: EMPTY_WORLD,
      folderId: 'worlds',
      active: true,
      open: true,
    },
  },
  open: ['main'],
};

export const WORLD_SCENARIOS: Record<WorldScenarioTag, WorldScenario> = {
  simple: {
    name: 'Platformer',
    description:
      'The starter project: gravity, arrow keys, and a room with coins to ' +
      'collect — two on the floor and one that has to be jumped for — a ' +
      'score to reach, and something walking about that will hurt you.',
    source: DEFAULT_PROJECT.source,
    instructions:
      '## World Lab\n\nBuild a game world in code. Edit the world and ' +
      'actors under `worlds/` and `actors/`.\n\n' +
      '- The preview runs your game as you edit\n' +
      '- Click the preview, then use the arrow keys to move the player, and space to jump\n' +
      '- Walk into a coin to take it: the coin is `Can Be Collected` and the ' +
      'player `Collects`, the Scoreboard adds ten, and the Console counts ' +
      'what it has\n' +
      '- Take all three and you win; the Scoreboard says so\n' +
      '- Avoid the Crawler, which walks its beat and takes a heart off you ' +
      'each time it touches — watch the bar at the top right, and three and ' +
      'it is over\n' +
      '- Animations are files under `animations/`: open one to edit its frames\n' +
      '- `console.log` output appears in the Console\n' +
      '- Try changing the player’s start position, gravity, or move speed — or ' +
      'make the ball collectible too, which is one row in `ball.actor`',
  },
  'platformer-single': {
    name: 'Platformer (single world)',
    description:
      'The starter with nothing outside main.world: the four actors are ' +
      'defined in it, the board is `create in map`, and the player’s five ' +
      'handlers are hats.',
    source: buildProject(PLATFORMER_SINGLE_SPEC).source,
    levelData: ONE_FILE,
    instructions:
      '## The starter, in one file\n\nThe same game as **Platformer**, said ' +
      'entirely in `main.world`.\n\n' +
      '- The four actors are `define actor` blocks in the world — no files, ' +
      'no imports, and nothing else can reach them\n' +
      '- The board is `create ⟨kind⟩ in map`, one block per kind: click the ' +
      'arrangement to edit it\n' +
      '- The player’s handlers are hats on `any ⟨Player⟩`, so they belong to ' +
      'every player there will be — add a second one to the arrangement and ' +
      'it jumps too\n' +
      '- The rules, the animations and the pictures are still files — they ' +
      'were never actors, so there was nothing to move. There is no file ' +
      'list here, so open a rule from the ⟨eye⟩ on the block that names it',
  },
  breakout: {
    name: 'Breakout',
    description:
      'A paddle, a bouncing ball, and two rows of bricks to clear. Every ' +
      'mechanic in it is a stock rule.',
    source: buildProject(BREAKOUT_SPEC).source,
    instructions:
      '## Breakout\n\nClear the bricks without losing the ball.\n\n' +
      '- Click the preview, then use the left and right arrow keys\n' +
      '- The bricks are `Can Be Collected` and the ball `Collects` them — the ' +
      'Console counts what it has taken\n' +
      '- The room is open at the bottom: `when ⟨Ball⟩ leaves the map` is how ' +
      'it notices\n' +
      '- Try a bouncier ball, a wider paddle, or a third row of bricks',
  },
  'breakout-single': {
    name: 'Breakout (single world)',
    description:
      'The same game with nothing outside main.world: the actors are defined ' +
      'in it and the board is `create in map`. What a file buys, as a diff.',
    source: buildProject(BREAKOUT_SINGLE_SPEC).source,
    levelData: ONE_FILE,
    instructions:
      '## Breakout, in one file\n\nThe same game as **Breakout**, said ' +
      'entirely in `main.world`.\n\n' +
      '- The four actors are `define actor` blocks in the world — no files, ' +
      'no imports, and nothing else can reach them\n' +
      '- The board is `create ⟨kind⟩ in map`: click the arrangement to edit it\n' +
      '- The ball\u2019s handlers are hats here, on `any ⟨Ball⟩`\n' +
      '- Compare it with **Breakout** to see what moving a thing into a file buys',
  },
  meteors: {
    name: 'Meteors',
    description:
      'A ship that turns and thrusts, rocks that drift and wrap, and a gun ' +
      'with a reload. Arrow Drive, Screen Wrap, Shooting and Expiry.',
    source: buildProject(METEORS_SPEC).source,
    instructions:
      '## Meteors\n\nTurn, thrust, and shoot the rocks.\n\n' +
      '- Click the preview, then left and right to TURN and up to thrust — ' +
      'there is no friction, so you drift\n' +
      '- Space fires. `make ⟨this actor⟩ fire` asks; the reload time answers\n' +
      '- A shot is whatever the `fires` handler makes it — look in ' +
      '`ship.actor`\n' +
      '- Everything wraps at the edges, which is what makes a small map a ' +
      'whole world',
  },
  'meteors-single': {
    name: 'Meteors (single world)',
    description:
      'The same game with nothing outside main.world — including the handler ' +
      'that spawns a shot, which is what breakout has no equivalent of.',
    source: buildProject(METEORS_SINGLE_SPEC).source,
    levelData: ONE_FILE,
    instructions:
      '## Meteors, in one file\n\nThe same game as **Meteors**, said ' +
      'entirely in `main.world`.\n\n' +
      '- The three actors are `define actor` blocks in the world\n' +
      '- The rocks are `create ⟨Meteor⟩ in map`, and each one\u2019s heading ' +
      'is written into the arrangement rather than rolled\n' +
      '- The ship\u2019s handlers are hats on `any ⟨Ship⟩` — including the ' +
      'one that spawns a shot\n' +
      '- Compare it with **Meteors** to see what moving a thing into a file buys',
  },
  flappy: {
    name: 'Flappy',
    description:
      'A bird that only falls, a key that un-falls it, and a level 48 tiles ' +
      'wide — the first scenario whose map is bigger than the screen, so the ' +
      'camera has something to do.',
    source: buildProject(FLAPPY_SPEC).source,
    instructions:
      '## Flappy\n\nFly through the gaps. The up arrow is the only control.\n\n' +
      '- Click the preview, then press up to flap — the bird is always ' +
      'falling and always moving right\n' +
      '- The level is **48 tiles wide** and the screen is ten, so most of it ' +
      'is off to the right. `Camera Follow` brings it to you and ' +
      '`Camera Confined` stops the view at the ends\n' +
      '- The flap **sets** the speed rather than pushing: a push would add up, ' +
      'and every flap should be the same height\n' +
      '- A coin in each gap is the score. Touching a pipe says so and lets ' +
      'you fly on — there is no restart yet\n' +
      '- Try a wider gap, a heavier bird (`amount of gravity`), or a look ' +
      'offset on the camera so it shows more of what is coming',
  },
  'flappy-single': {
    name: 'Flappy (single world)',
    description:
      'The same game with nothing outside main.world — including the camera, ' +
      'which here is handed a bird no other file could name.',
    source: buildProject(FLAPPY_SINGLE_SPEC).source,
    levelData: ONE_FILE,
    instructions:
      '## Flappy, in one file\n\nThe same game as **Flappy**, said entirely ' +
      'in `main.world`.\n\n' +
      '- The three actors are `define actor` blocks in the world, and the ' +
      'board is `create ⟨kind⟩ in map`, one block per kind\n' +
      '- The camera is the interesting one: `set actor to follow` is handed a ' +
      'WORLD-LOCAL bird, which nothing outside this file can name\n' +
      '- It is wired **after** the bird is placed. Before it, `any ⟨Bird⟩` is ' +
      'an empty list and the view never moves — and nothing says so\n' +
      '- Compare it with **Flappy** to see what moving a thing into a file buys',
  },
  tapper: {
    name: 'Tapper',
    description:
      'Click the coins. The mouse is the only input that can say WHERE as ' +
      'well as when, and this is the smallest game that needs the difference.',
    source: TAPPER_PROJECT.source,
    instructions:
      '## Tapper\n\nClick the coins to take them.\n\n' +
      '- Click the preview first, then click a coin — the coin elects `Can Be ' +
      'Clicked`, and that one row is the whole of what makes it clickable\n' +
      '- The count is the WORLD\u2019s: `define property ⟨score⟩` sits in ' +
      '`define world`, so it outlives the coin that raised the event, and the ' +
      'Label is told what to say\n' +
      '- One press is told three times. `when ⟨left⟩ is pressed` is the ' +
      'WORLD\u2019s: it happened to nobody, so the handler has to ask where — ' +
      'watch it print a point for the clicks that hit nothing too\n' +
      '- `is clicked with` is the COIN\u2019s: it landed on that coin, so the ' +
      'handler already knows who, and `this actor` is it\n' +
      '- `presses mouse button` is the scoreboard\u2019s: it elected `Takes ' +
      'Mouse Input`, so it hears every press wherever it landed and prints ' +
      'which button — try the right one\n' +
      '- `mouse position` is not an event at all: it is where the pointer is ' +
      'IN THE WORLD, a different number from where it is on the screen as soon ' +
      'as the camera moves, and it answers whenever you ask\n' +
      '- `crosshair.actor` follows the pointer with `each frame`, which is work ' +
      'a KIND of actor does without a rule to do it in — open it and change ' +
      'which moment of the frame it runs in',
  },
  empty: {
    name: 'Empty',
    description:
      'One world that does nothing, and the folders to put things in. What a ' +
      'learner starting from scratch sees.',
    source: buildProject(EMPTY_SPEC).source,
    instructions:
      '## An empty world\n\nNothing is in it yet.\n\n' +
      '- `use rule` to give the world an ability, then `use trait` to give an ' +
      'actor a share of it\n' +
      '- Actors are files under `actors/`; add one and place it with `add actor`\n' +
      '- Upload a picture into `sprites/` to draw with, or `backgrounds/` for a backdrop',
  },
};

/** Whether a string names a scenario — for reading one out of a URL. */
export function isScenarioTag(tag: string | null): tag is WorldScenarioTag {
  return (WORLD_SCENARIO_TAGS as readonly string[]).includes(tag ?? '');
}
