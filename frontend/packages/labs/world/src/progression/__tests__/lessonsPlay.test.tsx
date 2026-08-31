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
import {STOCK_ACTORS} from '../../actors/stock';
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

// ── One file, until a lesson is about two ───────────────────────────────────
//
// The claim `ONE_FILE` makes (lessons/index): an early lesson says everything
// in `main.world`, and the sidebar that lists the rest of the project is off
// while it does. What the tests below hold it to is the pair of ways that can
// rot — a lesson that hides the browser and then tells the learner to open a
// file, and a lesson that quietly stops hiding it.

/** A path a learner would have to use the file browser to reach. */
const PATHS = /`(actors|rules|sprites|worlds|backgrounds|maps|effects)\//;

describe('a lesson with no file browser', () => {
  const oneFile = ids.filter(
    id => LESSONS[id].levelData?.showFileBrowser === false,
  );

  it('is what a lesson is unless it says otherwise', () => {
    // Every lesson but the ones whose subject IS a file.
    expect(oneFile).toHaveLength(ids.length - 8);
  });

  it.each(oneFile)('%s does not send the learner to a file', id => {
    expect(LESSONS[id].instructions).not.toMatch(PATHS);
  });

  it.each(oneFile)('%s keeps no actor of its own in a file', id => {
    // Not "has no other files": a lesson holds the rules and pictures it needs
    // and nobody has to open those. What it may not do is put an actor the
    // learner is meant to CHANGE somewhere they cannot see — so an `.actor`
    // file in a one-file lesson has to be one of the library's, untouched.
    const stock = new Set(STOCK_ACTORS.map(actor => actor.contents));
    for (const [path, contents] of Object.entries(
      projectFiles(LESSONS[id].source),
    )) {
      if (path.endsWith('.actor')) {
        expect(stock.has(contents), `${id} holds ${path}`).toBe(true);
      }
    }
  });
});

describe('a lesson that shows the file browser', () => {
  it('says why, in the lesson', () => {
    const shown = ids.filter(
      id => LESSONS[id].levelData?.showFileBrowser !== false,
    );
    expect(shown.sort()).toEqual([
      'look/sprite',
      'making/behavior',
      'making/block',
      'making/change',
      'making/property',
      'making/read',
      'making/trait',
      'memory/actor-state',
    ]);
    // Each says so where the learner reads it, rather than a sidebar simply
    // appearing one day.
    expect(LESSONS['memory/actor-state'].instructions).toContain(
      'first lesson with a second file',
    );
    expect(LESSONS['look/sprite'].instructions).toContain(
      'first lesson with a file browser',
    );
    // A Making lesson is spent inside a rule, which is a file by definition.
    expect(LESSONS['making/property'].instructions).toContain(
      'rules/wind.rule',
    );
  });
});
