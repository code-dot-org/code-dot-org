// Every scenario in the catalogue, built and ticked.
//
// There are five, and until this file none of them had ever been RUN by
// anything. `fixtures.test` reads them — counts their files, checks a
// subtraction, compares a board against the map it was made from — and every
// one of those checks passes for a project that throws on its first frame.
//
// The one that prompted this got further than that. The starter's scoreboard
// held the Writing trait, held the right text, and drew a plain green box,
// because "Shows Text" declares what an actor's words ARE and leaves the
// drawing to the actor that elects it (specs/DRAWING.md). Every structural
// test agreed it was fine. So the last test here asks the RENDER SNAPSHOT
// instead, of every actor in every scenario: a thing with words has to have
// something that paints them.
//
// Cheap for what it covers. Compiling a project is a second or so, and what it
// buys is that a shipped scenario cannot be broken in any way that stops it
// building, placing, or ticking.

import {describe, expect, it} from 'vitest';

import {PositionProperty} from '../engine';
import {
  WORLD_SCENARIOS,
  WORLD_SCENARIO_TAGS,
  type WorldScenarioTag,
} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject, type CompiledProject} from './support/compileProject';

const built = async (tag: WorldScenarioTag): Promise<CompiledProject> =>
  compileProject(projectFiles(WORLD_SCENARIOS[tag].source));

describe.each(WORLD_SCENARIO_TAGS)('the %s scenario', tag => {
  it('builds, and puts something in the world', async () => {
    // A world that builds EMPTY is the failure mode to fear here: `load map`
    // emits its `world.define` lines from a registry, and an empty map is
    // legal, so nothing downstream complains. Which is why `empty` is named
    // rather than skipped — it is the one scenario for which nothing placed is
    // the right answer, and saying so is what keeps the check meaningful for
    // the other four.
    const {world} = await built(tag);
    const placed = [...world.actors].length;

    expect(placed).toBe(tag === 'empty' ? 0 : placed);
    if (tag !== 'empty') {
      // More than three is what a GAME places — a board, a player, the things
      // it is about. A novel places two, a portrait and a box, and everything
      // that happens after that is somebody talking. So the floor is one: the
      // failure worth catching is a world that built EMPTY, and two is not
      // that.
      expect(placed).toBeGreaterThan(tag === 'novel' ? 1 : 3);
    }
  });

  it('ticks for a second without throwing', async () => {
    // Not an assertion about the game — each of the five is a different one —
    // but about the code the generator emitted for it. A rule that crashes on
    // its first frame is the bug `compileStockRules` was written for, one
    // level up.
    const {world} = await built(tag);

    expect(() => {
      for (let frame = 0; frame < 60; frame++) {
        world.tick(1 / 60);
      }
    }).not.toThrow();
  });

  it('keeps its actors somewhere, rather than losing them to NaN', async () => {
    // A vector arithmetic slip reads as an actor that simply is not drawn, and
    // NaN propagates: one bad frame and the position is NaN forever after.
    const {world} = await built(tag);
    for (let frame = 0; frame < 60; frame++) {
      world.tick(1 / 60);
    }

    for (const actor of world.actors) {
      const at = actor.get(PositionProperty);
      expect(Number.isFinite(at.x), `${actor.id} x`).toBe(true);
      expect(Number.isFinite(at.y), `${actor.id} y`).toBe(true);
    }
  });

  it('paints anything that carries words', async () => {
    // THE GREEN BOX. An actor may hold `Shows Text` and the right string and
    // still be painted as the fallback rectangle, because the rule has no
    // steps and paints nothing — the drawing belongs to the actor that elects
    // it. Nothing structural can tell the two apart, and the render snapshot
    // can.
    const {world, modules} = await built(tag);
    const text = modules['actors/label']?.TextProperty;
    if (!text) {
      return; // The scenario does not hold the Writing rule at all.
    }

    for (const state of world.renderSnapshot()) {
      const actor = state.actor as unknown as {
        id: string;
        hasProperty(p: unknown): boolean;
      };
      if (!actor.hasProperty(text)) {
        continue;
      }
      // A picture of some kind: its own drawing, or an appearance frame. What
      // it must not be is neither, which is the box.
      expect(
        Boolean(state.drawing ?? state.frame),
        `${tag}: ${actor.id} shows text and is drawn as a box`,
      ).toBe(true);
    }
  });
});

/**
 * A bar pointed at nobody, which is the other silent picture.
 *
 * `subject` is the Health Bar's own property and its drawing reads it: pointed
 * at nothing, the bar paints an empty track and every check above passes — it
 * builds, it ticks, its position is finite, it carries no words. The two
 * tellings of the platformer wire it two different ways (a placement naming
 * another entry in the same map; a block, because an arrangement holds one
 * kind and a reference across two of them names nothing), and only one of them
 * worked.
 */
describe.each(['simple', 'platformer-single'] as const)(
  'the %s platformer',
  tag => {
    it('points its health bar at somebody', async () => {
      const {world} = await built(tag);
      const bars = [...world.actors].filter(actor =>
        actor.ownProperties().some(property => property.id === 'subject'),
      );

      expect(bars.length, `${tag}: no health bar`).toBe(1);
      for (const bar of bars) {
        const subject = bar
          .ownProperties()
          .find(property => property.id === 'subject')!;
        // A LIST, and empty when the bar is pointed at nobody — which is why
        // this asks how long it is. `toBeTruthy` passed on the broken telling:
        // an actor-typed slot holds an actor COLLECTION, and an empty array is
        // an object.
        const about = bar.get(subject) as unknown as {length: number};
        expect(about.length, `${tag}: the bar is about nobody`).toBe(1);
      }
    });
  },
);
