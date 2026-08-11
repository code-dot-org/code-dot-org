// The projects the demo can load, one per thing worth showing.
//
// A lab is only as demonstrable as the projects it can be pointed at, and until
// now it could be pointed at one: the starter. Everything else — a breakout
// board, an asteroids field, whatever the next rule needs to prove itself —
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

import {BREAKOUT_SPEC} from './breakout';

/**
 * Every scenario's tag, in the order the switcher offers them.
 *
 * The tag is also the channel id the studio route carries
 * (`/projects/world/<tag>/edit`), so it is url-shaped: lower case, hyphens.
 */
export const WORLD_SCENARIO_TAGS = ['simple', 'breakout', 'empty'] as const;

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
}

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
      'The starter project: gravity, arrow keys, a map with ground and a coin.',
    source: DEFAULT_PROJECT.source,
    instructions:
      '## World Lab\n\nBuild a game world in code. Edit the world and ' +
      'actors under `worlds/` and `actors/`.\n\n' +
      '- The preview runs your game as you edit\n' +
      '- Click the preview, then use the arrow keys to move the player, and space to jump\n' +
      '- Animations are files under `animations/`: open one to edit its frames\n' +
      '- `console.log` output appears in the Console\n' +
      '- Try changing the player’s start position, gravity, or move speed',
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
