// The geometry the map is drawn from.
//
// Worth testing because all of it is wrong in ways that look plausible: a
// hexagon rotated 30° is still a hexagon, an outline that keeps the shared
// sides is still an outline, and an edge bar on the wrong side of a tile still
// draws a bar. Each of these pins the thing that would otherwise be checked by
// squinting.

import {describe, expect, it} from 'vitest';

import {DIRECTIONS, plus, type Axial} from '../hex';
import {
  boundaryPath,
  cellCorners,
  center,
  edgeBar,
  extent,
  SIDE_DIRECTIONS,
  UNIT_CORNERS,
  wrapTitle,
} from '../mapGeometry';

const ORIGIN: Axial = [0, 0];

describe('a hexagon', () => {
  it('has six corners, all one radius out', () => {
    expect(UNIT_CORNERS).toHaveLength(6);
    for (const {x, y} of UNIT_CORNERS) {
      expect(Math.hypot(x, y)).toBeCloseTo(1);
    }
  });

  // Pointy-top, which is what the axial conversion assumes. Flat-top is the
  // same six points rotated 30°, and everything else here would still "work".
  it('is pointy-top: a corner at the top, a flat side facing east', () => {
    const top = UNIT_CORNERS.find(corner => corner.y < -0.99);
    expect(top?.x).toBeCloseTo(0);
    const east = UNIT_CORNERS.filter(corner => corner.x > 0.8);
    expect(east).toHaveLength(2);
  });

  it('scales and insets about its own center', () => {
    const full = cellCorners([1, -1], 10);
    const small = cellCorners([1, -1], 10, 0.5);
    const at = center([1, -1], 10);
    for (let i = 0; i < 6; i++) {
      expect(small[i].x - at.x).toBeCloseTo((full[i].x - at.x) / 2);
      expect(small[i].y - at.y).toBeCloseTo((full[i].y - at.y) / 2);
    }
  });
});

describe('a side', () => {
  // The one relation the whole renderer rests on: side `s` is the side facing
  // `SIDE_DIRECTIONS[s]`. Get it wrong and outlines keep the wrong edges and
  // every prerequisite bar lands on the wrong face.
  it('faces the neighbor it says it does', () => {
    const corners = cellCorners(ORIGIN, 10);
    SIDE_DIRECTIONS.forEach((direction, side) => {
      const a = corners[side];
      const b = corners[(side + 1) % 6];
      const mid = {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
      const neighbor = center(plus(ORIGIN, DIRECTIONS[direction]), 10);
      // The midpoint of a shared side is exactly halfway between the centers.
      expect(mid.x).toBeCloseTo(neighbor.x / 2);
      expect(mid.y).toBeCloseTo(neighbor.y / 2);
    });
  });
});

describe('a region outline', () => {
  it('draws all six sides of a lone cell', () => {
    expect(boundaryPath([ORIGIN], 10).match(/M/g)).toHaveLength(6);
  });

  it('drops the side two cells share', () => {
    const pair = [ORIGIN, DIRECTIONS.E as Axial];
    expect(boundaryPath(pair, 10).match(/M/g)).toHaveLength(10);
  });

  it('draws a ring around a hole rather than filling it in', () => {
    // The six cells around the center, without the center. Each keeps four
    // sides — two are shared with the cells beside it — so eighteen face out
    // and six face the hole. The six are the point: a region with a hole in it
    // has two boundaries, and both have to be drawn.
    const ring = Object.values(DIRECTIONS).map(d => [...d] as unknown as Axial);
    expect(boundaryPath(ring, 10).match(/M/g)).toHaveLength(24);
  });
});

describe('an edge bar', () => {
  it('lies on the side the two cells share', () => {
    const bar = edgeBar(ORIGIN, DIRECTIONS.SE as Axial, 10)!;
    const mid = {
      x: (bar[0].x + bar[1].x) / 2,
      y: (bar[0].y + bar[1].y) / 2,
    };
    const neighbor = center(DIRECTIONS.SE as Axial, 10);
    expect(mid.x).toBeCloseTo(neighbor.x / 2);
    expect(mid.y).toBeCloseTo(neighbor.y / 2);
  });

  it('is shorter than the side, by the fraction asked for', () => {
    const side = 10; // a hexagon's side equals its circumradius
    const bar = edgeBar(ORIGIN, DIRECTIONS.W as Axial, 10, 0.5)!;
    expect(Math.hypot(bar[0].x - bar[1].x, bar[0].y - bar[1].y)).toBeCloseTo(
      side * 0.5,
    );
  });

  it('draws nothing between cells that do not touch', () => {
    expect(edgeBar(ORIGIN, [3, 0], 10)).toBeUndefined();
  });
});

describe('the extent', () => {
  it('holds every cell, with a hexagon of margin', () => {
    const cells: Axial[] = [ORIGIN, [2, -1], [-1, 2]];
    const box = extent(cells, 10);
    for (const cell of cells) {
      const at = center(cell, 10);
      expect(at.x - 10).toBeGreaterThanOrEqual(box.x);
      expect(at.y - 10).toBeGreaterThanOrEqual(box.y);
      expect(at.x + 10).toBeLessThanOrEqual(box.x + box.width);
      expect(at.y + 10).toBeLessThanOrEqual(box.y + box.height);
    }
  });
});

describe('a title', () => {
  it('stays on one line when it fits', () => {
    expect(wrapTitle('Down', {width: 60, charWidth: 5})).toEqual(['Down']);
  });

  it('breaks between words', () => {
    expect(
      wrapTitle('A described movement', {width: 60, charWidth: 5}),
    ).toEqual(['A described', 'movement']);
  });

  it('keeps a word too long for a line rather than dropping it', () => {
    expect(
      wrapTitle('Antidisestablishmentarianism', {width: 20, charWidth: 5}),
    ).toEqual(['Antidisestablishmentarianism']);
  });

  it('ends in an ellipsis when there is more than will fit', () => {
    const lines = wrapTitle('Three rules, and behavior nobody wrote at all', {
      width: 50,
      charWidth: 5,
      lines: 2,
    });
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith('…')).toBe(true);
  });
});
