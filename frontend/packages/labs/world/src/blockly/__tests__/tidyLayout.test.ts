// @vitest-environment node
//
// The arrangement, as arithmetic. What it cannot check is the only number that
// matters in the real thing — a block's height — because that is the renderer's
// answer and this file has no renderer (`world-lab-verification`). So the boxes
// here are made up, and what is claimed is what the arithmetic promises whatever
// the sizes turn out to be: nothing overlaps afterwards, and the order is kept.

import {describe, expect, it} from 'vitest';

import {
  arrangeTopBlocks,
  isFreeFloating,
  gapCenters,
  gapIndexFor,
  headerPlaces,
  orderKeys,
  placesOfDocument,
  type Box,
} from '../tidyLayout';

/** Whether any box shares area with another; touching edges do not count. */
const anyOverlap = (boxes: readonly Box[]): boolean =>
  boxes.some((a, index) =>
    boxes
      .slice(index + 1)
      .some(
        b =>
          a.x < b.x + b.width &&
          b.x < a.x + a.width &&
          a.y < b.y + b.height &&
          b.y < a.y + a.height,
      ),
  );

/** The boxes as the arrangement leaves them. */
const arranged = (boxes: readonly Box[]): Box[] => {
  const places = arrangeTopBlocks(boxes);
  return boxes.map((box, index) => ({
    ...places[index],
    width: box.width,
    height: box.height,
  }));
};

/** A stack of `count` handlers, piled up the way a generated actor writes them. */
const piled = (heights: readonly number[], step = 40): Box[] =>
  heights.map((height, index) => ({
    x: 20,
    y: 20 + index * step,
    width: 400,
    height,
  }));

describe('a block left on its own', () => {
  // The workspace is its top blocks; anything else alone at the top means
  // nothing and is deleted when dropped there (specs/LAZY_WORKSPACE_PLAN.md).
  const block = (
    shape: {previous?: boolean; output?: boolean},
    own: {shadow?: boolean; marker?: boolean} = {},
  ) => ({
    previousConnection: shape.previous ? {} : null,
    outputConnection: shape.output ? {} : null,
    isShadow: () => Boolean(own.shadow),
    isInsertionMarker: () => Boolean(own.marker),
  });

  it('is free-floating when it plugs into something', () => {
    expect(isFreeFloating(block({previous: true}))).toBe(true);
    expect(isFreeFloating(block({output: true}))).toBe(true);
  });

  it('is not, when it is a definition or a hat', () => {
    expect(isFreeFloating(block({}))).toBe(false);
  });

  it('is never a shadow or an insertion marker, which are Blockly’s', () => {
    expect(isFreeFloating(block({output: true}, {shadow: true}))).toBe(false);
    expect(isFreeFloating(block({previous: true}, {marker: true}))).toBe(false);
  });
});

describe('arranging the top blocks', () => {
  it('leaves nothing overlapping, whatever the heights', () => {
    for (const heights of [
      [2400, 180, 180, 180],
      [100, 900, 40, 1500, 60],
      [3000, 3000, 3000],
      [50],
    ]) {
      expect(anyOverlap(arranged(piled(heights)))).toBe(false);
    }
  });

  it('puts everything in one column, the definition first', () => {
    // One list, read top to bottom: the handlers under the definition, not
    // beside it.
    const places = arrangeTopBlocks(piled([2400, 180, 240, 200]));
    expect(new Set(places.map(place => place.x)).size).toBe(1);
    for (let index = 1; index < places.length; index += 1) {
      expect(places[index].y).toBeGreaterThan(places[index - 1].y);
    }
  });

  it('reads the order off the positions, not off the array', () => {
    // Blockly hands back top blocks in whatever order it holds them. What a
    // file means by "first" is what is highest on the page.
    const boxes: Box[] = [
      {x: 20, y: 300, width: 400, height: 100},
      {x: 20, y: 20, width: 400, height: 100},
      {x: 20, y: 160, width: 400, height: 100},
    ];
    const places = arrangeTopBlocks(boxes);
    expect(places[1]).toEqual({x: 20, y: 20});
    expect(places[2].y).toBeLessThan(places[0].y);
  });

  it('keeps the order of a file saved in two columns, definition first', () => {
    // The layout made columns before; a file saved then reads left column
    // first, top to bottom, then the next.
    const boxes: Box[] = [
      {x: 500, y: 20, width: 300, height: 100}, // first handler
      {x: 20, y: 20, width: 400, height: 900}, // the definition
      {x: 500, y: 160, width: 300, height: 100}, // second handler
    ];
    const places = arrangeTopBlocks(boxes);
    expect(places[1]).toEqual({x: 20, y: 20});
    expect(places[0].y).toBeLessThan(places[2].y);
    expect(places[0].y).toBeGreaterThan(900);
  });

  it('is settled after one pass: arranging again changes nothing', () => {
    // What makes it safe to run on every open. The gap it leaves is wider than
    // the overlap it tests for, so a workspace it has already arranged is one
    // it will not touch.
    const once = arranged(piled([2400, 180, 240, 1500, 60]));
    expect(anyOverlap(once)).toBe(false);
    expect(arrangeTopBlocks(once)).toEqual(once.map(({x, y}) => ({x, y})));
  });
});

describe('the order the editor keeps', () => {
  // The layout remembers where it put each top block. Blockly moves blocks on
  // its own — expanding a body nudges apart what overlaps it, the definition
  // included — and an order read off positions would follow the nudge.
  const box = (x: number, y: number): Box => ({x, y, width: 300, height: 100});

  it('keeps a block where it was placed, however it has been nudged', () => {
    const ids = ['define', 'first', 'second'];
    // Blockly nudged the definition right and down, past the first handler.
    const boxes = [box(68, 180), box(20, 152), box(20, 284)];
    const placed = new Map([
      ['define', 20],
      ['first', 152],
      ['second', 284],
    ]);
    const places = arrangeTopBlocks(
      boxes,
      orderKeys(ids, boxes, placed, new Set()),
    );
    expect(places[0]).toEqual({x: 20, y: 20});
    expect(places[1].y).toBeLessThan(places[2].y);
  });

  it('places a block the learner moved by where it was dropped', () => {
    const ids = ['define', 'first', 'second'];
    // The second handler dropped between the definition and the first.
    const boxes = [box(20, 20), box(20, 152), box(20, 140)];
    const placed = new Map([
      ['define', 20],
      ['first', 152],
      ['second', 284],
    ]);
    const places = arrangeTopBlocks(
      boxes,
      orderKeys(ids, boxes, placed, new Set(['second'])),
    );
    expect(places[2].y).toBeLessThan(places[1].y);
    expect(places[0]).toEqual({x: 20, y: 20});
  });

  it('puts a block back before the one that closed up into its place', () => {
    // An undone delete returns at its old position, which the next block
    // moved up into.
    const ids = ['define', 'next', 'restored'];
    const boxes = [box(20, 20), box(20, 152), box(20, 152)];
    const placed = new Map([
      ['define', 20],
      ['next', 152],
    ]);
    const places = arrangeTopBlocks(
      boxes,
      orderKeys(ids, boxes, placed, new Set()),
    );
    expect(places[2].y).toBeLessThan(places[1].y);
  });

  it('reads a saved file’s order off its positions, before anything moves', () => {
    const places = placesOfDocument([
      {id: 'handler', x: 500, y: 20},
      {id: 'define', x: 20, y: 20},
      {id: 'later', x: 500, y: 300},
    ]);
    expect([...places.entries()].sort((a, b) => a[1] - b[1])).toEqual([
      ['define', 0],
      ['handler', 1],
      ['later', 2],
    ]);
  });

  it('takes the file’s own order when it gives no positions', () => {
    const places = placesOfDocument([{id: 'b'}, {id: 'a'}]);
    expect(places.get('b')).toBeLessThan(places.get('a')!);
  });
});

describe('dragging a top block between the others', () => {
  // Every section is collapsed to its header while one is dragged; these say
  // which gap it is over and how the headers part to show it.
  const headers = [
    {y: 20, height: 40},
    {y: 92, height: 40},
    {y: 164, height: 40},
  ];

  it('is over the gap above the first header whose middle it has not passed', () => {
    expect(gapIndexFor(headers, {y: 0, height: 40})).toBe(0);
    expect(gapIndexFor(headers, {y: 60, height: 40})).toBe(1);
    expect(gapIndexFor(headers, {y: 500, height: 40})).toBe(3);
  });

  it('opens the gap it is over by the dragged header’s height', () => {
    // 40-high headers, 32 apart; a 50-high header held over gap 1.
    expect(headerPlaces([40, 40, 40], 1, 50)).toEqual([
      20,
      20 + 40 + 32 + 50 + 32,
      20 + 40 + 32 + 50 + 32 + 40 + 32,
    ]);
    // Over the end, nothing moves.
    expect(headerPlaces([40, 40], 2, 50)).toEqual([20, 92]);
  });
});

describe('where the “+” between sections goes', () => {
  const sections = [
    {y: 20, height: 100},
    {y: 152, height: 40},
  ];

  it('is the middle of each gap, and past the last', () => {
    expect(gapCenters(sections, true)).toEqual([136, 208]);
  });

  it('is above the first too, unless the first is the file’s definition', () => {
    expect(gapCenters(sections, false)).toEqual([10, 136, 208]);
  });

  it('is half a gap above a first further down', () => {
    const lower = sections.map(section => ({...section, y: section.y + 100}));
    expect(gapCenters(lower, false)[0]).toBe(104);
  });

  it('is at the top of an empty file', () => {
    expect(gapCenters([], false)).toEqual([20]);
  });
});
