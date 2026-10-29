// A Scroll View on the stage (`scrollViews`, specs/ONE_WORLD_PLAN.md, step 8).

import {describe, expect, it} from 'vitest';

import type {Placement} from '../mapModel';
import {
  clipCorners,
  clipsOf,
  contentOf,
  insideClip,
  isInside,
  scrollViewsHolding,
} from '../scrollViews';

const at = (
  type: string,
  id: string,
  x: number,
  y: number,
  parent?: string,
): Placement => ({
  type,
  id,
  properties: {
    positional: {position: {x, y}, ...(parent ? {parent} : {})},
  },
});

/** A 100 by 60 window at (200, 100), holding three 80 by 20 rows. */
const ACTORS: Placement[] = [
  at('actors/scrollView', 'List', 200, 100),
  at('actors/label', 'One', 0, -20, 'List'),
  at('actors/label', 'Two', 0, 20, 'List'),
  at('actors/label', 'Three', 0, 60, 'List'),
  at('actors/panel', 'Box', 50, 50),
];
const boxOf = (actor: Placement) =>
  actor.type === 'actors/scrollView'
    ? {width: 100, height: 60}
    : {width: 80, height: 20};
const scrolls = (actor: Placement) => actor.type === 'actors/scrollView';
const named = (id: string) => ACTORS.find(actor => actor.id === id)!;

describe('a Scroll View’s content', () => {
  it('reaches from its window’s top left to its lowest child', () => {
    // The third row's foot is 60 + 30 + 10 below the window's top.
    expect(contentOf(named('List'), ACTORS, boxOf)).toEqual({
      width: 100,
      height: 100,
    });
  });

  it('is the window when what it holds fits', () => {
    const fits = ACTORS.filter(actor => actor.id !== 'Three');
    expect(contentOf(named('List'), fits, boxOf)).toEqual({
      width: 100,
      height: 60,
    });
  });
});

describe('what clips a placement', () => {
  it('is every Scroll View holding it, and nothing for one held by none', () => {
    expect(scrollViewsHolding(named('Two'), ACTORS, scrolls)).toEqual([
      named('List'),
    ]);
    expect(scrollViewsHolding(named('Box'), ACTORS, scrolls)).toEqual([]);
  });

  it('is the window, closed, so a row below it cannot be clicked', () => {
    const [clip] = clipsOf(named('Three'), ACTORS, scrolls, boxOf, null);
    // The window is 70 to 130 down the canvas.
    expect(insideClip({x: 200, y: 120}, clip)).toBe(true);
    expect(insideClip({x: 200, y: 160}, clip)).toBe(false);
    expect(clipCorners(clip)).toEqual([
      {x: 150, y: 70},
      {x: 250, y: 70},
      {x: 250, y: 130},
      {x: 150, y: 130},
    ]);
  });

  it('is the whole content and room below it, opened', () => {
    const [clip] = clipsOf(named('Three'), ACTORS, scrolls, boxOf, 'List');
    // Content 100 tall, and the window's 60 again: 70 to 230.
    expect(insideClip({x: 200, y: 160}, clip)).toBe(true);
    expect(insideClip({x: 200, y: 229}, clip)).toBe(true);
    expect(insideClip({x: 200, y: 231}, clip)).toBe(false);
  });

  it('follows the Scroll View’s scale', () => {
    const doubled = ACTORS.map(actor =>
      actor.id === 'List'
        ? {
            ...actor,
            properties: {
              positional: {position: {x: 200, y: 100}, scale: {x: 2, y: 2}},
            },
          }
        : actor,
    );
    const [clip] = clipsOf(named('Two'), doubled, scrolls, boxOf, null);
    expect(clipCorners(clip)[2]).toEqual({x: 300, y: 160});
  });
});

describe('what is inside an opened Scroll View', () => {
  it('is what it holds, and not itself or anything else', () => {
    const list = named('List');
    expect(isInside(named('Two'), list, ACTORS)).toBe(true);
    expect(isInside(list, list, ACTORS)).toBe(false);
    expect(isInside(named('Box'), list, ACTORS)).toBe(false);
  });
});
