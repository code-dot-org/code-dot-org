// The catalogue's invariants — the ones specs/PROGRESSION.md states and the
// map's readability depends on.
//
// The map is only trustworthy if what it draws is what it means: a learner
// looking at a tile should be able to see what stands between them and it
// without a legend. That holds exactly while every prerequisite is a NEIGHBOUR,
// which nothing but this file enforces. The rest is the same kind of thing —
// nobody is stranded, no two tiles are in the same place, a region is a shape.

import {describe, expect, it} from 'vitest';

import {STOCK_ACTORS} from '../../actors/stock';
import {STOCK_RULES} from '../../rules/stock';
import {TILES} from '../catalogue';
import {adjacent, ring} from '../hex';
import {GRANTED_BY, TILES_BY_ID, tileState, unlockKey} from '../index';
import {FOUNDATIONS, GENRES, REGIONS, region} from '../regions';
import type {Tile} from '../types';

const at = (id: string) => TILES_BY_ID.get(id);
const where = (t: Tile) => `${t.id} at ${t.at.join(',')}`;

describe('the map', () => {
  it('puts every tile somewhere of its own', () => {
    const taken = new Map<string, string>();
    for (const t of TILES) {
      const key = t.at.join(',');
      expect(
        taken.get(key),
        `${t.id} shares a cell with ${taken.get(key)}`,
      ).toBe(undefined);
      taken.set(key, t.id);
    }
  });

  it('requires only tiles that exist', () => {
    for (const t of TILES) {
      for (const need of t.requires) {
        expect(at(need), `${t.id} requires ${need}`).toBeDefined();
      }
    }
  });

  // The load-bearing one. An edge that is not a shared side is an edge the map
  // cannot draw, and a prerequisite a learner cannot see.
  it('requires only its neighbors', () => {
    for (const t of TILES) {
      for (const need of t.requires) {
        const other = at(need)!;
        expect(
          adjacent(t.at, other.at),
          `${where(t)} requires ${where(other)}, which it does not touch`,
        ).toBe(true);
      }
    }
  });

  it('leaves nobody stranded', () => {
    // The closure of "everything I need is done", from nothing. A tile that
    // never joins it is one no learner can ever open — usually a cycle, or a
    // prerequisite that was renamed on one side only.
    const done = new Set<string>();
    for (let pass = 0; pass < TILES.length; pass++) {
      for (const t of TILES) {
        if (!done.has(t.id) && t.requires.every(need => done.has(need))) {
          done.add(t.id);
        }
      }
    }
    expect([...TILES].filter(t => !done.has(t.id)).map(t => t.id)).toEqual([]);
  });

  it('starts at the center', () => {
    const roots = TILES.filter(t => t.requires.length === 0);
    expect(roots.map(t => t.id)).toEqual(['origin/first-world']);
    expect(roots[0].at).toEqual([0, 0]);
  });

  it('draws each region as one shape', () => {
    for (const {id, scattered} of REGIONS) {
      if (scattered) {
        continue;
      }
      const cells = TILES.filter(t => t.region === id).map(t => t.at);
      expect(cells.length, `region ${id} has no tiles`).toBeGreaterThan(0);
      const reached = [cells[0]];
      for (const cell of reached) {
        for (const other of cells) {
          if (!reached.includes(other) && adjacent(cell, other)) {
            reached.push(other);
          }
        }
      }
      expect(
        reached.length,
        `region ${id} is in ${cells.length - reached.length + 1} pieces`,
      ).toBe(cells.length);
    }
  });

  it('stays within six rings of the center', () => {
    // Not a law, a budget: the whole map has to fit on a screen at a size that
    // fits a title. If this fails, the layout grew rather than the catalogue.
    for (const t of TILES) {
      expect(ring(t.at), where(t)).toBeLessThanOrEqual(6);
    }
  });
});

describe('the regions', () => {
  it('name every region their tiles claim, and no others', () => {
    const claimed = new Set(TILES.map(t => t.region));
    expect([...claimed].sort()).toEqual(REGIONS.map(r => r.id).sort());
  });

  it('name a tile after the region it is in', () => {
    for (const t of TILES) {
      expect(t.id.split('/')[0], `${t.id} is in ${t.region}`).toBe(t.region);
    }
  });

  // The design's central claim about the map's shape: a genre is entered
  // through one tile, and that tile touches both of the foundations it is
  // between. Everything about where the regions sit follows from this.
  it('enter each genre from both of the foundations it lies between', () => {
    for (const id of GENRES) {
      const {between} = region(id);
      const gates = TILES.filter(
        t =>
          t.region === id && t.requires.some(need => at(need)!.region !== id),
      );
      expect(gates.length, `${id} has ${gates.length} ways in`).toBe(1);
      const from = gates[0].requires.map(need => at(need)!.region).sort();
      expect(from, `${id} is entered from ${from.join(' and ')}`).toEqual(
        [...between!].sort(),
      );
    }
  });

  // A gate is only fair if both its prerequisites are shallow. Two foundations
  // swept to the end before a genre opens would be the linear course this
  // design exists to avoid (specs/PROGRESSION.md).
  it('gate a genre behind shallow tiles only', () => {
    const depth = (id: string): number => {
      const t = at(id)!;
      return t.requires.length === 0
        ? 0
        : 1 + Math.max(...t.requires.map(depth));
    };
    for (const id of GENRES) {
      const gate = TILES.find(
        t => t.region === id && t.requires.some(n => at(n)!.region !== id),
      )!;
      for (const need of gate.requires) {
        expect(
          depth(need),
          `${id} is gated behind ${need}`,
        ).toBeLessThanOrEqual(2);
      }
    }
  });

  it('give every foundation a tile touching Origin', () => {
    for (const id of FOUNDATIONS) {
      const first = TILES.filter(
        t => t.region === id && t.requires.includes('origin/first-world'),
      );
      expect(first.length, `${id} reaches Origin ${first.length} ways`).toBe(1);
    }
  });
});

describe('what a tile unlocks', () => {
  it('is granted by exactly one tile', () => {
    const seen = new Map<string, string>();
    for (const t of TILES) {
      for (const unlock of t.unlocks) {
        const key = unlockKey(unlock);
        // Two lessons granting one thing leaves "which lesson taught me this"
        // without an answer, which is the whole of the link back from a rule's
        // row to its lesson (specs/PROGRESSION_UI.md).
        expect(seen.get(key), `${key} is granted by ${seen.get(key)} too`).toBe(
          undefined,
        );
        seen.set(key, t.id);
      }
    }
  });

  it('names a rule that exists, unless it says it does not', () => {
    const ids = new Set(STOCK_RULES.map(rule => rule.id));
    for (const t of TILES) {
      for (const unlock of t.unlocks) {
        if (unlock.kind !== 'rule') {
          continue;
        }
        // Both directions. A missing rule that forgot the flag is a tile that
        // silently unlocks nothing; a flag left on a rule that has since been
        // written is a lesson still describing itself as unbuilt.
        expect(ids.has(unlock.id), `${t.id} unlocks rule ${unlock.id}`).toBe(
          !unlock.proposed,
        );
      }
    }
  });

  it('names an actor that exists', () => {
    const ids = new Set(STOCK_ACTORS.map(actor => actor.id));
    for (const t of TILES) {
      for (const unlock of t.unlocks) {
        if (unlock.kind === 'actor' && !unlock.proposed) {
          expect(ids.has(unlock.id), `${t.id} unlocks actor ${unlock.id}`).toBe(
            true,
          );
        }
      }
    }
  });

  // The other direction, and the one that found two gaps: not "does this
  // unlock exist" but "is there a lesson for everything the library ships".
  // Something on the shelf that no tile grants is something a learner can only
  // meet by accident, and the reverse link from it leads nowhere.
  it('covers every stock rule', () => {
    const missing = STOCK_RULES.filter(
      rule => !GRANTED_BY.has(unlockKey({kind: 'rule', id: rule.id})),
    ).map(rule => rule.id);
    expect(missing).toEqual([]);
  });

  it('covers every stock actor', () => {
    const missing = STOCK_ACTORS.filter(
      actor => !GRANTED_BY.has(unlockKey({kind: 'actor', id: actor.id})),
    ).map(actor => actor.id);
    expect(missing).toEqual([]);
  });

  it('gives every tile something to give, bar the one that is an assembly', () => {
    // `adventure/rooms` grants nothing, and it is the only one. A door is
    // `clear world` and `load map` in a handler, and both blocks are already
    // somebody's to give (`arcade/bricks`, `place/map`); what the lesson adds
    // is that the two together are a way out of the room, which is not a thing
    // that can be put on a shelf. Inventing a block to have something to unlock
    // would be a worse map.
    //
    // Named rather than counted, so the second tile that gives nothing has to
    // come here and argue for itself.
    for (const t of TILES) {
      if (t.id === 'adventure/rooms') {
        expect(t.unlocks).toEqual([]);
        expect(t.offers?.length ?? 0).toBeGreaterThan(0);
        continue;
      }
      expect(t.unlocks.length, `${t.id} unlocks nothing`).toBeGreaterThan(0);
    }
  });
});

describe('what a tile promises', () => {
  it('says how it will be checked, and how that check could be cheated', () => {
    for (const t of TILES) {
      expect(t.check.says.length, `${t.id} says nothing`).toBeGreaterThan(20);
      expect(
        t.check.falsePass.length,
        `${t.id} has no false pass written down`,
      ).toBeGreaterThan(20);
    }
  });

  // A `shape` check passes for a program that has never run, so it is only the
  // right answer when what the lesson produces is not a STATE — a file, or a
  // declaration whose effect nothing can observe from inside the world. Anywhere
  // else it is the easy way out, and the catalogue should not drift into taking
  // it, so the list is written down and this test is the argument.
  //
  //   memory/variable — a name for a value, which is a fact about the workspace
  //     and nothing else: the same program runs the same either way.
  //   place/layers    — fixed and parallax are applied by the DRIVER as it
  //     draws, so an actor in a fixed layer is at the same world position as one
  //     that is not. What the lesson makes is the declaration.
  //   making/read     — the product is having opened a file.
  it('leans on shape checks only where there is no state to read', () => {
    const shapes = TILES.filter(t => t.check.kind === 'shape').map(t => t.id);
    expect(shapes).toEqual(['memory/variable', 'place/layers', 'making/read']);
  });
});

describe('a learner', () => {
  it('starts with one tile open and everything else shut', () => {
    const none = new Set<string>();
    const open = TILES.filter(t => tileState(none, t.id) === 'open');
    expect(open.map(t => t.id)).toEqual(['origin/first-world']);
  });

  it('opens all six foundations by finishing the first tile', () => {
    const done = new Set(['origin/first-world']);
    const open = TILES.filter(t => tileState(done, t.id) === 'open');
    expect(open.map(t => t.region).sort()).toEqual([...FOUNDATIONS].sort());
  });
});
