// What a gated lesson offers, and the one way gating can go badly wrong.
//
// Hiding blocks is easy; hiding a block a lesson tells the learner to add is a
// trap that looks exactly like a gate. So the table below says, for each lesson
// written so far, which blocks its instructions ask the learner to REACH FOR —
// and the test insists every one of them is in the toolbox at that point.
//
// The table is written by hand and read from the instructions, because nothing
// else knows: a lesson's starting project does not contain the blocks the
// lesson asks for, and its solved project is a thing only a test has.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../../blockly/domainBlocks';
import {projectRuleMetas} from '../../blockly/projectModules';
import {projectFiles} from '../../runtime/projectFiles';
import {TILES} from '../catalogue';
import {GRANTED_BY, tile} from '../index';
import {LESSONS} from '../lessons';
import {holds as heldBy, shelfKeys} from '../shelf';
import {shelvedToolbox, EARNED_BLOCKS} from '../toolboxShelf';
import type {TileId} from '../types';

/**
 * The blocks each lesson tells the learner to go and find.
 *
 * NOT everything a solved project contains — the starter's own blocks are
 * already on screen, and a block in a rule's drawer was never gated. These are
 * the ones the instructions send somebody to the toolbox for.
 */
const ASKS_FOR: Partial<Record<TileId, readonly string[]>> = {
  'origin/first-world': [
    'world_add_actor',
    'world_set_sprite',
    'world_set_position',
  ],
  'input/arrows': ['world_use_trait'],
  'input/press': ['world_use_trait', 'world_log'],
  'input/mouse': ['world_use_trait', 'world_log'],
  'input/two-hands': ['world_use_trait'],
  'motion/speed': ['world_use_trait'],
  'motion/gravity': ['world_use_trait', 'world_log'],
  'motion/force': [],
  'motion/units': [],
  'motion/drag': ['world_use_trait'],
  'motion/tween': [
    'world_play_tween_here',
    'world_set_position',
    'world_define_tween',
    'world_play_tween',
  ],
  'logic/if': [
    'world_trait_step',
    'controls_if',
    'logic_compare',
    'world_get_Space_PositionProperty',
  ],
  'logic/collision': ['world_use_trait', 'world_log'],
  'logic/and-or': ['logic_operation', 'world_get_Space_PositionProperty'],
  'look/sprite': ['world_set_sprite'],
  'place/position': ['world_set_position', 'world_random_place', 'math_number'],
  'logic/kinds': [
    'controls_if',
    'world_is_a',
    'world_event_actor',
    'world_log',
  ],
  // The two Memory lessons need numbers and arithmetic, which are Place's
  // lesson on a branch they never touch — so those tiles OFFER them, and these
  // two rows are what says an offer reaches the toolbox as a grant does.
  'memory/variable': [
    'variables_set_Number',
    'variables_get_Number',
    'math_number',
    'math_arithmetic',
  ],
  'memory/many': ['world_for_each', 'world_all_actors', 'world_set_sprite'],
};

/** Every tile on the shortest way to this one, itself excluded. */
const before = (id: TileId): TileId[] => {
  const done: TileId[] = [];
  const walk = (at: TileId) => {
    for (const need of tile(at).requires) {
      if (!done.includes(need)) {
        walk(need);
        done.push(need);
      }
    }
  };
  walk(id);
  return done;
};

/** The toolbox a learner sees while doing a lesson, having done its run-up. */
const offeredAt = (id: TileId): Set<string> => {
  const files = projectFiles(LESSONS[id]!.source);
  const {toolbox} = buildDomainPalette(projectRuleMetas(files), {
    fileKind: 'world',
  });
  const keys = shelfKeys(new Set(before(id)));
  const granted = new Set(GRANTED_BY.keys());
  const shown = shelvedToolbox(toolbox, {
    holds: unlock => heldBy(keys, granted, unlock),
    offering: id,
  }) as {blocks?: unknown[]}[];
  return new Set(
    shown.flatMap(category =>
      (category.blocks ?? [])
        .map(item =>
          typeof item === 'string' ? item : (item as {type?: string}).type,
        )
        .filter((type): type is string => typeof type === 'string'),
    ),
  );
};

const written = Object.keys(LESSONS) as TileId[];

describe.each(written)('the %s lesson', id => {
  it('offers every block its instructions send you to find', () => {
    const asked = ASKS_FOR[id];
    expect(asked, `${id} is not in ASKS_FOR`).toBeDefined();
    const offered = offeredAt(id);
    for (const type of asked ?? []) {
      expect(offered.has(type), `${id} asks for ${type}`).toBe(true);
    }
  });
});

describe('a gated first lesson', () => {
  // The number this whole mechanism exists for. Ungated it is twelve drawers
  // and a hundred and fifty-seven blocks, on a screen whose own detail pane
  // says the lesson unlocks the Actor drawer.
  it('is small enough to read', () => {
    const offered = offeredAt('origin/first-world');
    expect(offered.size).toBeLessThan(20);
  });

  it('is not so small the lesson cannot be done', () => {
    const offered = offeredAt('origin/first-world');
    expect(offered.has('world_actor')).toBe(true);
    expect(offered.has('world_world')).toBe(true);
  });
});

describe('the earned set', () => {
  // A rule's blocks are never gated: a project that HOLDS Gravity has Gravity's
  // blocks, earned or not, because a lesson may hand you anything (an edge
  // means readiness, not possession). No tile grants a rule's blocks one by
  // one, so no rule drawer can become earned — this says so.
  it('holds no block a project rule generates', () => {
    const generated = [...EARNED_BLOCKS].filter(type =>
      /^world_(do|get|set|on|query|emit)_[A-Z]/.test(type),
    );
    // Space and Appearance only: the engine's own two rules, which every
    // project has, and whose `set position` and `set sprite` are core
    // vocabulary rather than a mechanic anybody opted into.
    expect(generated.every(type => /_(Space|Appearance)_/.test(type))).toBe(
      true,
    );
  });

  // …and the catalogue is still allowed to SAY it grants one, because that is
  // what a learner reads. `arcade/bounce` unlocks "the bounciness property";
  // it simply does not gate the drawer that property lives in.
  it('lets a tile still name one as an unlock', () => {
    const named = TILES.flatMap(t =>
      t.unlocks
        .filter(u => u.kind === 'block')
        .map(u => (u as {type: string}).type),
    );
    expect(named).toContain('world_set_SolidBodies_BouncinessProperty');
    expect(EARNED_BLOCKS.has('world_set_SolidBodies_BouncinessProperty')).toBe(
      false,
    );
  });
});
