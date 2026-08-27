// Every lesson's starting project, built and ticked.
//
// A lesson is a project a learner opens into, and the failure to fear is not a
// broken assertion but a broken PROJECT: a wrong block type, a socket named
// something else, an actor whose rule never arrived. All of those compile — the
// generator mints a stand-in for a block type nothing defines, so the file
// loads and does nothing (AGENTS.md) — so nothing but running it says whether
// a lesson works.
//
// The same bargain `scenariosPlay` makes for the demo scenarios, and the same
// cost: a second or so per project, in exchange for a lesson that cannot be
// shipped in a state where it fails to build, place, or tick.

import {describe, expect, it} from 'vitest';

import {
  compileProject,
  type CompiledProject,
} from '../../__tests__/support/compileProject';
import {PositionProperty} from '../../engine';
import {projectFiles} from '../../runtime/projectFiles';
import {TILES_BY_ID} from '../index';
import {LESSONS} from '../lessons';
import type {TileId} from '../types';

const ids = Object.keys(LESSONS) as TileId[];

const built = async (id: TileId): Promise<CompiledProject> =>
  compileProject(projectFiles(LESSONS[id].source));

describe('every lesson', () => {
  it('belongs to a tile that exists', () => {
    for (const id of ids) {
      expect(TILES_BY_ID.has(id), id).toBe(true);
    }
  });

  it('says what it is, in the words the switcher shows', () => {
    for (const id of ids) {
      expect(LESSONS[id].name.length, id).toBeGreaterThan(2);
      expect(LESSONS[id].description.length, id).toBeGreaterThan(20);
      expect(LESSONS[id].instructions, id).toContain('### What you do');
    }
  });
});

describe.each(ids)('the %s lesson', id => {
  it('builds, and puts something in the world', async () => {
    // A world that builds EMPTY is the quiet failure: `add actor` names a file
    // by path, and a path nothing matches places nothing and says nothing.
    const {world} = await built(id);
    expect([...world.actors].length).toBeGreaterThan(0);
  });

  it('ticks for a second without throwing', async () => {
    const {world} = await built(id);
    expect(() => {
      for (let frame = 0; frame < 60; frame++) {
        world.tick(1 / 60);
      }
    }).not.toThrow();
  });

  it('keeps its actors somewhere real', async () => {
    // NaN propagates: one bad frame of vector arithmetic and a position is NaN
    // for the rest of the run, which reads as an actor that is simply not drawn.
    const {world} = await built(id);
    for (let frame = 0; frame < 60; frame++) {
      world.tick(1 / 60);
    }
    for (const actor of world.actors) {
      const at = actor.get(PositionProperty);
      expect(Number.isFinite(at.x), `${id}: ${actor.id} x`).toBe(true);
      expect(Number.isFinite(at.y), `${id}: ${actor.id} y`).toBe(true);
    }
  });
});

// The two lessons that make a claim about what the starting project DOES, as
// opposed to what it holds. Both claims are the first line of the instructions,
// and both would be silently false if the project were subtly wrong.
describe('what a lesson starts out doing', () => {
  it('has the speed lesson crossing the screen by hand', async () => {
    const {world} = await built('motion/speed');
    const hero = [...world.actors][0];
    const from = hero.get(PositionProperty).x;
    for (let frame = 0; frame < 60; frame++) {
      world.tick(1 / 60);
    }
    // Two pixels a frame, sixty frames — the handler the lesson asks them to
    // delete. Loose bounds: what matters is that it moved, and rightwards.
    expect(hero.get(PositionProperty).x).toBeGreaterThan(from + 60);
  });

  it('has the gravity lesson hanging in the air', async () => {
    const {world} = await built('motion/gravity');
    const before = [...world.actors].map(a => a.get(PositionProperty).y);
    for (let frame = 0; frame < 60; frame++) {
      world.tick(1 / 60);
    }
    const after = [...world.actors].map(a => a.get(PositionProperty).y);
    // Nothing has elected `Affected by Gravity` yet, so nothing falls. If this
    // starts failing, the lesson has been given away in its own starter.
    expect(after).toEqual(before);
  });
});
