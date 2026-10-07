// @vitest-environment node
//
// The arrangement, as arithmetic. What it cannot check is the only number that
// matters in the real thing — a block's height — because that is the renderer's
// answer and this file has no renderer (`world-lab-verification`). So the boxes
// here are made up, and what is claimed is what the arithmetic promises whatever
// the sizes turn out to be: nothing overlaps afterwards, and the order is kept.

import {describe, expect, it} from 'vitest';

import {arrangeTopBlocks, isFreeFloating, type Box} from '../tidyLayout';

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

  it('gives the definition a column and starts the handlers beside it', () => {
    // The first block is the thing the file is about and usually the tallest
    // in it. The second starts a column however short the first turned out —
    // which is the case no fixed gap could get right, because a `define actor`
    // runs from one row to a couple of thousand pixels.
    const [root, first] = arrangeTopBlocks(piled([2400, 180]));
    expect(first.x).toBeGreaterThan(root.x);
    expect(first.y).toBe(root.y);
  });

  it('stacks the handlers in the order the file listed them', () => {
    const places = arrangeTopBlocks(piled([300, 180, 240, 200]));
    for (let index = 2; index < places.length; index += 1) {
      expect(places[index].y).toBeGreaterThan(places[index - 1].y);
      expect(places[index].x).toBe(places[index - 1].x);
    }
  });

  it('reads the order off the positions, not off the array', () => {
    // The generated file writes the definition first and the handlers in order,
    // but nothing guarantees a saved workspace does: Blockly hands back top
    // blocks in whatever order it holds them. What a file means by "first" is
    // what is highest on the page.
    const boxes: Box[] = [
      {x: 20, y: 300, width: 400, height: 100},
      {x: 20, y: 20, width: 400, height: 100},
      {x: 20, y: 160, width: 400, height: 100},
    ];
    const places = arrangeTopBlocks(boxes);
    // The one that was highest keeps its own column; the other two follow in
    // the order they read in, not the order they were given in.
    expect(places[1]).toEqual({x: 20, y: 20});
    expect(places[2].y).toBeLessThan(places[0].y);
    expect(places[2].x).toBe(places[0].x);
  });

  it('wraps into a further column rather than running off the page', () => {
    // Fifteen handlers at 300 each is four and a half thousand pixels of
    // scrolling past a definition a quarter of that. The wrap is what keeps
    // the file roughly as tall as the thing it is about.
    const places = arrangeTopBlocks(piled(new Array<number>(15).fill(300)));
    const columns = new Set(places.map(place => place.x));
    expect(columns.size).toBeGreaterThan(2);
  });

  it('never cuts a stack in half to make a column fit', () => {
    // A stack taller than the column budget still goes somewhere whole: there
    // is no such thing as half a handler.
    const places = arrangeTopBlocks(piled([100, 9000, 100]));
    expect(places).toHaveLength(3);
    expect(anyOverlap(arranged(piled([100, 9000, 100])))).toBe(false);
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
