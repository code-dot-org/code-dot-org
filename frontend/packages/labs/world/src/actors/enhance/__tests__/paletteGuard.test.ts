// Every block an enhancement writes must exist.
//
// A row writes blocks by their generated type names — `world_use_trait`,
// `world_set_CameraFollow_ActorToFollowProperty`, `world_on_Health_…` — and
// nothing in the type system connects those strings to the blocks that define
// them. Retire a block, rename a rule member, change how a generated type is
// spelled, and the row still compiles, its arithmetic tests still pass, and
// what it writes is a file that will not open. `blockly/__tests__/shippedBlocks`
// asks this question of the starter project; this asks it of the shelf.
//
// So every row is applied, to a fresh copy of a project with something in it,
// and every block type the result names is looked up in the palette the
// generator would build for that result. The palette is built from the RESULT
// rather than the source, because a row imports the rules whose blocks it then
// writes.
//
// Two targets, because there are two kinds of address (specs/ENHANCEMENTS.md):
// an actor with a file of its own, and one a world defines for itself. The
// body of a patch is the same either way and the hat's subject is not, so
// both are walked.
//
// What this cannot see is a block that exists but has changed shape — a
// socket renamed under a type still holding the old name. That fails quietly
// at generation, and the played test beside each row is what catches it.

import * as Blockly from 'blockly';
import {describe, expect, it} from 'vitest';

import {typesIn} from '../../../__tests__/support/blockTypes';
import {buildDomainPalette} from '../../../blockly/domainBlocks';
import {
  projectOwnMetas,
  projectRuleMetas,
} from '../../../blockly/projectModules';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {
  ENHANCEMENTS,
  type Enhancement,
  type EnhanceTarget,
} from '../enhancements';

type Source = typeof WORLD_SCENARIOS.empty.source;

const WORKSPACE_FILE = /\.(rule|actor|world)$/;

/** The empty scenario with the named stock actors imported. */
const withActors = (...ids: string[]): Source => {
  let source: Source = WORLD_SCENARIOS.empty.source;
  for (const id of ids) {
    source = importStockActor(source, stockActorById(id)!).source;
  }
  return source;
};

/**
 * Every block type a project's workspace files name, with the file it is in.
 *
 * Whole project rather than the target's file alone: a row that names another
 * actor writes into that actor's file too, and the rules it imports are files
 * the starter may never have carried.
 */
const namedTypes = (source: Source): Map<string, string[]> => {
  const found = new Map<string, string[]>();
  for (const [path, contents] of Object.entries(projectFiles(source))) {
    if (WORKSPACE_FILE.test(path)) {
      found.set(path, typesIn(contents));
    }
  }
  return found;
};

/** The types the generator's palette would define for this project. */
const paletteOf = (source: Source): Set<string> => {
  const files = projectFiles(source);
  return new Set(
    buildDomainPalette(projectRuleMetas(files), {
      allRuleModules: true,
      ownProperties: projectOwnMetas(files),
    }).blocks.map(block => block.type),
  );
};

/**
 * Whether a row changed any workspace file at all.
 *
 * Contents rather than block types, because for an actor a world defines the
 * whole patch lands in a file that already names most of what it writes — a
 * second `use trait` in the world file is a new row and not a new type.
 */
const wroteSomething = (before: Source, after: Source): boolean => {
  const was = projectFiles(before);
  return Object.entries(projectFiles(after)).some(
    ([path, contents]) => WORKSPACE_FILE.test(path) && contents !== was[path],
  );
};

/** The first answer a row's question offers, when it asks one. */
const answerFor = (
  row: Enhancement,
  source: Source,
  target: EnhanceTarget,
): string | undefined => row.asks?.options(source, target)[0]?.value;

/**
 * A project in which every gated row is on offer.
 *
 * The other end of a pair is not shown until its partner is in the project
 * (`Enhancement.offered`): nothing rides until something carries, nobody uses
 * a teleport pad until there is one. Folding every ungated row onto the
 * target first, the way the wizard folds ticked rows, is what unlocks them —
 * and the rows it folds are ones this file has already checked on their own.
 */
const unlocked = (base: Source, target: EnhanceTarget): Source => {
  let source = base;
  for (const row of ENHANCEMENTS) {
    if (
      row.subject !== target.kind ||
      row.offered ||
      row.refuse?.(source, target) ||
      row.applied(source, target, answerFor(row, source, target))
    ) {
      continue;
    }
    source = row.apply(source, target, answerFor(row, source, target));
  }
  return source;
};

/**
 * Applies every row for this kind of target and checks what each wrote.
 *
 * Returns the rows that were skipped as already applied, so a caller can say
 * how many it expected — a walk that quietly skipped everything would pass.
 */
const checkShelf = (
  base: Source,
  target: EnhanceTarget,
): {missing: string[]; wroteNothing: string[]; skipped: string[]} => {
  const missing: string[] = [];
  const wroteNothing: string[] = [];
  const skipped: string[] = [];
  let unlockedBase: Source | undefined;

  for (const row of ENHANCEMENTS.filter(one => one.subject === target.kind)) {
    // The gated rows start from the folded project; everything else starts
    // clean, so one row's blocks cannot stand in for another's.
    let source = base;
    if (row.offered && !row.offered(base, target)) {
      unlockedBase ??= unlocked(base, target);
      source = unlockedBase;
    }
    if (row.offered && !row.offered(source, target)) {
      missing.push(`${row.id}: nothing on the shelf makes it offered`);
      continue;
    }
    const answer = answerFor(row, source, target);
    if (row.asks && answer === undefined) {
      missing.push(`${row.id}: asks, and the project offers no answer`);
      continue;
    }
    if (row.refuse?.(source, target) || row.applied(source, target, answer)) {
      skipped.push(row.id);
      continue;
    }

    const after = row.apply(source, target, answer);
    if (!wroteSomething(source, after)) {
      wroteNothing.push(row.id);
      continue;
    }
    // Every type in the result, not only the new ones: a row that imports a
    // rule brings that rule's whole file, and what it appends is read beside
    // what was there. Deduplicated, since a chain says `use trait` often.
    const palette = paletteOf(after);
    for (const [path, types] of namedTypes(after)) {
      for (const type of new Set(types)) {
        // Ours, or Blockly's own (`controls_if`, `math_number`, …), which are
        // registered by importing blockly at all.
        if (!palette.has(type) && !Blockly.Blocks[type]) {
          missing.push(`${row.id} → ${path}: ${type}`);
        }
      }
    }
  }
  return {missing, wroteNothing, skipped};
};

describe('the enhancement shelf', () => {
  // A bare actor to enhance, with a player and a floor beside it for the rows
  // that ask who to follow, chase or carry. The Coin is chosen because it
  // arrives with almost nothing: a row that reads it as already done is a row
  // that reads everything as already done.
  describe('on an actor with a file', () => {
    const base = withActors('coin', 'player', 'ground');
    const COIN = {kind: 'actor' as const, path: 'actors/coin', name: 'Coin'};

    it('names only blocks that exist', () => {
      const {missing, wroteNothing, skipped} = checkShelf(base, COIN);
      expect(missing).toEqual([]);
      expect(wroteNothing).toEqual([]);
      // A guard on the guard: nothing about a Coin is already done, and the
      // one row that steps aside does so because a Coin has no words to type.
      expect(skipped).toEqual(['typesOutText']);
    });
  });

  // …and a Label, so the typewriter's blocks are walked on a file too.
  describe('on a Label', () => {
    const base = withActors('label', 'player', 'ground');
    const LABEL = {kind: 'actor' as const, path: 'actors/label', name: 'Label'};

    it('names only blocks that exist', () => {
      const {missing, wroteNothing, skipped} = checkShelf(base, LABEL);
      expect(missing).toEqual([]);
      expect(wroteNothing).toEqual([]);
      expect(skipped).toEqual([]);
    });
  });

  describe('on an actor a world defines for itself', () => {
    // No file of its own: a `define actor` block among the world's roots. The
    // single-world starter's Coin is the bland one, for the reason above.
    const base = WORLD_SCENARIOS['platformer-single'].source;
    const COIN = {
      kind: 'actor' as const,
      path: 'worlds/main',
      block: 'platformerCoinDef',
      name: 'Coin',
    };

    it('names only blocks that exist', () => {
      const {missing, wroteNothing, skipped} = checkShelf(base, COIN);
      expect(missing).toEqual([]);
      expect(wroteNothing).toEqual([]);
      // One row has a reason to step aside here and no more: typing out text
      // refuses a world's own actor, because its declarations do not hoist
      // out of a block scope (specs/ENHANCEMENTS.md).
      expect(skipped).toEqual(['typesOutText']);
    });
  });

  describe('on a world', () => {
    const base = withActors('coin', 'player', 'ground');
    const WORLD = {
      kind: 'world' as const,
      path: 'worlds/main',
      name: 'My World',
    };

    it('names only blocks that exist', () => {
      const {missing, wroteNothing, skipped} = checkShelf(base, WORLD);
      expect(missing).toEqual([]);
      expect(wroteNothing).toEqual([]);
      expect(skipped).toEqual([]);
    });
  });

  it('walks enough of the shelf to be worth trusting', () => {
    // The shelf is the thing under test, so its size is pinned loosely: a
    // registry that came back empty would pass every check above.
    expect(
      ENHANCEMENTS.filter(one => one.subject === 'actor').length,
    ).toBeGreaterThan(20);
    expect(
      ENHANCEMENTS.filter(one => one.subject === 'world').length,
    ).toBeGreaterThan(1);
  });
});
