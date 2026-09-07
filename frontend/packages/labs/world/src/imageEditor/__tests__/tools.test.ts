// The pixel editor's drawing tools, which had no tests at all.
//
// They are already pure — `tools.ts` says so at the top, and works on an
// ImageData-shaped buffer precisely so that it can be tested without a
// canvas. Nothing was stopping this file existing; it simply did not.
//
// Each test below is a claim the tools' own comments make. The ones worth
// the space are the two the flood fill makes, because both are invisible
// when they break: a fill that compares against its NEIGHBOUR creeps across
// a gradient and floods the picture, and a fill that marks pixels visited by
// looking at their color never terminates when the fill color is inside
// the tolerance.

import {describe, expect, it} from 'vitest';

import {
  drawCircle,
  drawRect,
  floodFill,
  stamp,
  stampLine,
  TRANSPARENT,
  type Raster,
  type RGBA,
} from '../tools';

const RED: RGBA = [255, 0, 0, 255];
const BLUE: RGBA = [0, 0, 255, 255];

/** A raster of `w`×`h` transparent pixels. */
const blank = (w: number, h: number): Raster => ({
  width: w,
  height: h,
  data: new Uint8ClampedArray(w * h * 4),
});

/** A raster filled with one color. */
const filled = (w: number, h: number, color: RGBA): Raster => {
  const raster = blank(w, h);
  for (let i = 0; i < w * h; i++) {
    raster.data.set(color, i * 4);
  }
  return raster;
};

/** The color at a point, as a plain array. */
const at = (raster: Raster, x: number, y: number): number[] => {
  const i = (y * raster.width + x) * 4;
  return [...raster.data.slice(i, i + 4)];
};

/** Every point that is not transparent, as `x,y` strings, in raster order. */
const painted = (raster: Raster): string[] => {
  const points: string[] = [];
  for (let y = 0; y < raster.height; y++) {
    for (let x = 0; x < raster.width; x++) {
      if (raster.data[(y * raster.width + x) * 4 + 3] !== 0) {
        points.push(`${x},${y}`);
      }
    }
  }
  return points;
};

describe('stamp', () => {
  it('is one pixel at size one', () => {
    const raster = blank(5, 5);
    stamp(raster, 2, 2, 1, RED);
    expect(painted(raster)).toEqual(['2,2']);
  });

  it('is as centered as an even size allows', () => {
    // `start` is `floor((size − 1) / 2)`, so an even brush cannot straddle
    // the point evenly and leans down and to the right instead.
    const raster = blank(6, 6);
    stamp(raster, 2, 2, 2, RED);
    expect(painted(raster)).toEqual(['2,2', '3,2', '2,3', '3,3']);
  });

  it('centers an odd size on the point', () => {
    const raster = blank(6, 6);
    stamp(raster, 2, 2, 3, RED);
    expect(painted(raster)).toContain('1,1');
    expect(painted(raster)).toContain('3,3');
    expect(painted(raster)).toHaveLength(9);
  });

  it('clips at the edges rather than wrapping', () => {
    // Without the bounds check a stamp at the left edge would write to the
    // end of the row above, which is a mark on the other side of the picture.
    // A size-4 brush at the origin reaches from −1 to +2 on both axes; what
    // is left after clipping is the three-by-three that is actually in the
    // picture.
    const raster = blank(4, 4);
    stamp(raster, 0, 0, 4, RED);
    expect(painted(raster)).toEqual([
      '0,0',
      '1,0',
      '2,0',
      '0,1',
      '1,1',
      '2,1',
      '0,2',
      '1,2',
      '2,2',
    ]);
  });

  it('erases to transparent when given no color', () => {
    const raster = filled(3, 3, RED);
    stamp(raster, 1, 1, 1, null);
    expect(at(raster, 1, 1)).toEqual([0, 0, 0, 0]);
    expect(at(raster, 0, 0)).toEqual([255, 0, 0, 255]);
  });

  it('draws transparent as a color, which is not the same thing', () => {
    // `TRANSPARENT` is a pickable color, so it goes through the ordinary
    // path and composes with every tool. The result is the same pixels; what
    // differs is that a tool need not know about erasing.
    const raster = filled(3, 3, RED);
    stamp(raster, 1, 1, 1, TRANSPARENT);
    expect(at(raster, 1, 1)).toEqual([0, 0, 0, 0]);
  });
});

describe('stampLine', () => {
  it('leaves no gaps on a diagonal', () => {
    // The reason it exists: a fast pointer move reports two far-apart points,
    // and stamping only those would leave a dotted line.
    const raster = blank(8, 8);
    stampLine(raster, 0, 0, 7, 7, 1, RED);
    expect(painted(raster)).toEqual([
      '0,0',
      '1,1',
      '2,2',
      '3,3',
      '4,4',
      '5,5',
      '6,6',
      '7,7',
    ]);
  });

  it('is connected on a shallow slope, one step per column', () => {
    const raster = blank(8, 4);
    stampLine(raster, 0, 0, 7, 2, 1, RED);
    const marks = painted(raster);
    expect(marks).toHaveLength(8);
    // Every column has exactly one mark: a line, not a stair with holes.
    expect(new Set(marks.map(mark => mark.split(',')[0])).size).toBe(8);
  });

  it('goes both ways', () => {
    const forward = blank(6, 6);
    const backward = blank(6, 6);
    stampLine(forward, 0, 0, 5, 5, 1, RED);
    stampLine(backward, 5, 5, 0, 0, 1, RED);
    expect(painted(backward)).toEqual(painted(forward));
  });

  it('paints a single point when both ends are the same', () => {
    const raster = blank(4, 4);
    stampLine(raster, 2, 2, 2, 2, 1, RED);
    expect(painted(raster)).toEqual(['2,2']);
  });
});

describe('floodFill', () => {
  it('fills the region it starts in and stops at a boundary', () => {
    // A wall of blue down the middle; filling the left half must not reach
    // the right.
    const raster = filled(6, 3, RED);
    for (let y = 0; y < 3; y++) {
      raster.data.set(BLUE, (y * 6 + 3) * 4);
    }
    floodFill(raster, 0, 0, [0, 255, 0, 255]);

    expect(at(raster, 0, 0)).toEqual([0, 255, 0, 255]);
    expect(at(raster, 2, 2)).toEqual([0, 255, 0, 255]);
    expect(at(raster, 3, 1)).toEqual([0, 0, 255, 255]); // the wall
    expect(at(raster, 4, 1)).toEqual([255, 0, 0, 255]); // beyond it
  });

  it('goes round a corner, not just along a row', () => {
    // An L of transparent through a solid field: the fill has to turn.
    const raster = filled(5, 5, RED);
    for (const [x, y] of [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ]) {
      raster.data.set(TRANSPARENT, (y * 5 + x) * 4);
    }
    floodFill(raster, 0, 0, BLUE);

    expect(at(raster, 2, 2)).toEqual([0, 0, 255, 255]);
    expect(at(raster, 4, 4)).toEqual([255, 0, 0, 255]);
  });

  it('measures tolerance from the CLICKED color, so it cannot creep', () => {
    // THE ONE THAT MATTERS. A gradient where each step is within tolerance of
    // its neighbor but the far end is nothing like the start. Comparing
    // against the neighbor would walk the whole gradient and flood the
    // picture; comparing against the clicked color stops where the
    // difference from THAT exceeds the tolerance.
    const raster = blank(10, 1);
    for (let x = 0; x < 10; x++) {
      raster.data.set([x * 20, 0, 0, 255], x * 4);
    }
    floodFill(raster, 0, 0, BLUE, 50);

    // Within 50 of the clicked 0: x = 0, 1, 2 (0, 20, 40).
    expect(at(raster, 2, 0)).toEqual([0, 0, 255, 255]);
    expect(at(raster, 3, 0)).toEqual([60, 0, 0, 255]);
    expect(at(raster, 9, 0)).toEqual([180, 0, 0, 255]);
  });

  it('terminates when the fill color is itself within the tolerance', () => {
    // THE OTHER ONE. Painted-ness cannot mark a pixel visited, because with a
    // tolerance the new color may still match the region — so a fill that
    // used the color as its record would revisit for ever. The visited
    // bitmap is what bounds the walk; without it this test hangs rather than
    // fails, which is the honest signal.
    const raster = filled(16, 16, [100, 100, 100, 255]);
    floodFill(raster, 8, 8, [110, 110, 110, 255], 60);

    expect(at(raster, 0, 0)).toEqual([110, 110, 110, 255]);
    expect(at(raster, 15, 15)).toEqual([110, 110, 110, 255]);
  });

  it('does nothing when the click is outside the picture', () => {
    const raster = filled(4, 4, RED);
    const before = [...raster.data];
    floodFill(raster, -1, 2, BLUE);
    floodFill(raster, 4, 2, BLUE);
    expect([...raster.data]).toEqual(before);
  });

  it('fills a single pixel when nothing beside it matches', () => {
    const raster = filled(3, 3, RED);
    raster.data.set(BLUE, (1 * 3 + 1) * 4);
    floodFill(raster, 1, 1, [0, 255, 0, 255]);
    expect(at(raster, 1, 1)).toEqual([0, 255, 0, 255]);
    expect(at(raster, 0, 1)).toEqual([255, 0, 0, 255]);
  });
});

describe('drawRect', () => {
  it('takes its corners in any order', () => {
    const one = blank(8, 8);
    const other = blank(8, 8);
    drawRect(one, 1, 1, 5, 4, 1, RED, false);
    drawRect(other, 5, 4, 1, 1, 1, RED, false);
    expect(painted(other)).toEqual(painted(one));
  });

  it('paints every interior pixel when filled', () => {
    const raster = blank(8, 8);
    drawRect(raster, 1, 1, 3, 2, 1, RED, true);
    expect(painted(raster)).toEqual(['1,1', '2,1', '3,1', '1,2', '2,2', '3,2']);
  });

  it('is hollow when it is not, and closed all the way round', () => {
    const raster = blank(8, 8);
    drawRect(raster, 1, 1, 5, 5, 1, RED, false);
    expect(at(raster, 3, 3)).toEqual([0, 0, 0, 0]); // the middle is empty
    for (const [x, y] of [
      [1, 1],
      [5, 1],
      [1, 5],
      [5, 5],
      [3, 1],
      [3, 5],
      [1, 3],
      [5, 3],
    ]) {
      expect(at(raster, x, y), `${x},${y}`).toEqual([255, 0, 0, 255]);
    }
  });

  it('draws an outline as thick as the brush', () => {
    const thin = blank(12, 12);
    const thick = blank(12, 12);
    drawRect(thin, 2, 2, 9, 9, 1, RED, false);
    drawRect(thick, 2, 2, 9, 9, 3, RED, false);
    expect(painted(thick).length).toBeGreaterThan(painted(thin).length);
    // The stroke straddles the edge, so it reaches a pixel inside it.
    expect(at(thick, 3, 2)).toEqual([255, 0, 0, 255]);
  });
});

describe('drawCircle', () => {
  it('paints a disc when filled, and nothing outside the radius', () => {
    const raster = blank(11, 11);
    drawCircle(raster, 5, 5, 3, 1, RED, true);
    expect(at(raster, 5, 5)).toEqual([255, 0, 0, 255]);
    expect(at(raster, 5, 2)).toEqual([255, 0, 0, 255]); // on the radius
    expect(at(raster, 5, 1)).toEqual([0, 0, 0, 0]); // beyond it
    expect(at(raster, 2, 2)).toEqual([0, 0, 0, 0]); // the corner
  });

  it('is hollow when it is not', () => {
    const raster = blank(13, 13);
    drawCircle(raster, 6, 6, 4, 1, RED, false);
    expect(at(raster, 6, 6)).toEqual([0, 0, 0, 0]);
    expect(at(raster, 6, 2)).toEqual([255, 0, 0, 255]);
  });

  it('is symmetric about both axes, which is what eight octants buys', () => {
    const raster = blank(15, 15);
    drawCircle(raster, 7, 7, 5, 1, RED, false);
    for (const [x, y] of [
      [7, 2],
      [7, 12],
      [2, 7],
      [12, 7],
    ]) {
      expect(at(raster, x, y), `${x},${y}`).toEqual([255, 0, 0, 255]);
    }
  });

  it('is a single point at radius zero', () => {
    const raster = blank(5, 5);
    drawCircle(raster, 2, 2, 0, 1, RED, true);
    expect(painted(raster)).toEqual(['2,2']);
  });

  it('rounds a fractional radius rather than drawing nothing', () => {
    // The radius arrives from a drag, so it is rarely whole.
    const raster = blank(11, 11);
    drawCircle(raster, 5, 5, 2.6, 1, RED, false);
    expect(painted(raster).length).toBeGreaterThan(0);
  });
});
