import {
  evenGrid,
  frameBoxes,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/sheetSlice';

// RGBA data for a w x h image with solid boxes at the given [left, right, top, bottom).
function image(
  width: number,
  height: number,
  solid: [number, number, number, number][]
) {
  const data = new Uint8ClampedArray(width * height * 4);
  solid.forEach(([left, right, top, bottom]) => {
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        data[(y * width + x) * 4 + 3] = 255;
      }
    }
  });
  return data;
}

// A character about half as wide as it is tall, like the plate.
const ASPECT = 0.5;

const corners = (boxes: {left: number; top: number}[]) =>
  boxes.map(b => [b.left, b.top]);
const boxWidth = (b: {left: number; right: number}) => b.right - b.left;

describe('sheet slicing', () => {
  it('finds a row of frames as blobs, tight to their pixels', () => {
    const data = image(100, 40, [
      [5, 20, 2, 38],
      [30, 45, 4, 36],
      [55, 70, 2, 38],
      [80, 95, 2, 38],
    ]);
    expect(frameBoxes(data, 100, 40, 4, 127, ASPECT)).toEqual([
      {left: 5, right: 20, top: 2, bottom: 38},
      {left: 30, right: 45, top: 4, bottom: 36},
      {left: 55, right: 70, top: 2, bottom: 38},
      {left: 80, right: 95, top: 2, bottom: 38},
    ]);
  });

  it('reads a grid row by row when the model stacked the frames', () => {
    const data = image(100, 100, [
      [55, 75, 5, 45],
      [5, 25, 55, 95],
      [5, 25, 5, 45],
      [55, 75, 55, 95],
    ]);
    expect(corners(frameBoxes(data, 100, 100, 4, 127, ASPECT))).toEqual([
      [5, 5],
      [55, 5],
      [5, 55],
      [55, 55],
    ]);
  });

  it('keeps a detached hat tip and hand with their frame', () => {
    const data = image(100, 40, [
      [5, 20, 8, 38],
      [10, 13, 2, 6], // hat tip, above the body
      [22, 25, 20, 24], // hand, off to the side
      [55, 70, 8, 38],
    ]);
    const found = frameBoxes(data, 100, 40, 2, 127, ASPECT);
    expect(found).toHaveLength(2);
    expect(found[0]).toEqual({left: 5, right: 25, top: 2, bottom: 38});
  });

  it('keeps thin ankles inside one frame', () => {
    const boxes: [number, number, number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const left = 10 + i * 50;
      boxes.push(
        [left, left + 20, 2, 25],
        [left + 9, left + 11, 25, 30],
        [left, left + 20, 30, 38]
      );
    }
    const data = image(200, 40, boxes);
    const found = frameBoxes(data, 200, 40, 4, 127, ASPECT);
    expect(found).toHaveLength(4);
    expect(found.every(b => b.top === 2 && b.bottom === 38)).toBe(true);
  });

  it('cuts a row of frames that touch side by side, one frame wide each', () => {
    // Six figures 20 wide and 40 tall with no gap between them: one blob
    // 120 wide, which for a frame half as wide as tall is six frames.
    const data = image(140, 50, [[10, 130, 5, 45]]);
    const found = frameBoxes(data, 140, 50, 6, 127, ASPECT);
    expect(found).toHaveLength(6);
    expect(found.map(b => b.left)).toEqual([10, 30, 50, 70, 90, 110]);
    expect(found.every(b => b.top === 5 && b.bottom === 45)).toBe(true);
  });

  it('leaves striding frames whole when they are wider than the plate', () => {
    // A thin figure: standing, 12 wide and 40 tall; mid-stride 22 wide.
    const boxes: [number, number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      boxes.push([2 + i * 30, 24 + i * 30, 2, 42]);
    }
    const data = image(360, 44, boxes);
    const found = frameBoxes(data, 360, 44, 12, 127, 0.3);
    expect(found).toHaveLength(12);
    expect(found.every(b => boxWidth(b) === 22)).toBe(true);
  });

  it('cuts a touching pair by the width of the frames around it', () => {
    // Five thin striding frames 22 wide, the third and fourth touching.
    const data = image(200, 44, [
      [2, 24, 2, 42],
      [32, 54, 2, 42],
      [62, 106, 2, 42],
      [122, 144, 2, 42],
      [152, 174, 2, 42],
    ]);
    const found = frameBoxes(data, 200, 44, 6, 127, 0.3);
    expect(found.map(b => b.left)).toEqual([2, 32, 62, 84, 122, 152]);
  });

  it('cuts two rows whose frames touch, at the sparsest line', () => {
    // A brim one pixel wide joins each lower frame to the one above it; the
    // brim's lines tie for sparsest, so the cut falls at the even division.
    const data = image(100, 100, [
      [2, 22, 5, 45],
      [52, 72, 5, 45],
      [2, 22, 55, 95],
      [52, 72, 55, 95],
      [12, 13, 45, 55],
      [62, 63, 45, 55],
    ]);
    const found = frameBoxes(data, 100, 100, 4, 127, ASPECT);
    expect(corners(found)).toEqual([
      [2, 5],
      [52, 5],
      [2, 50],
      [52, 50],
    ]);
  });

  it('cuts only the columns whose rows touch', () => {
    // Two rows of four; in columns 2 and 3 a brim joins the rows.
    const boxes: [number, number, number, number][] = [];
    for (let c = 0; c < 4; c++) {
      const left = 2 + c * 25;
      boxes.push([left, left + 20, 5, 45], [left, left + 20, 55, 95]);
      if (c === 1 || c === 2) {
        boxes.push([left + 9, left + 10, 45, 55]);
      }
    }
    const data = image(100, 100, boxes);
    const found = frameBoxes(data, 100, 100, 8, 127, ASPECT);
    expect(found).toHaveLength(8);
    expect(found.every(b => b.bottom - b.top <= 50)).toBe(true);
    expect(
      found.map(b => ((b.top + b.bottom) / 2 < 50 ? 'top' : 'bottom'))
    ).toEqual([
      'top',
      'top',
      'top',
      'top',
      'bottom',
      'bottom',
      'bottom',
      'bottom',
    ]);
  });

  // A row of `count` frames 20 wide and 40 tall, 25 apart.
  function rowOf(count: number) {
    const boxes: [number, number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      boxes.push([2 + i * 25, 22 + i * 25, 2, 42]);
    }
    return {data: image(count * 25, 44, boxes), width: count * 25};
  }
  const column = (b: {left: number}) => (b.left - 2) / 25;

  it('keeps every frame of a longer cycle than asked for', () => {
    const {data, width} = rowOf(12);
    const found = frameBoxes(data, width, 44, 8, 127, ASPECT);
    expect(found.map(column)).toEqual([...Array(12).keys()]);
  });

  it('keeps a shorter cycle than asked for', () => {
    const {data, width} = rowOf(6);
    expect(frameBoxes(data, width, 44, 8, 127, ASPECT).map(column)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
  });

  it('thins a run far longer than asked for to frames spread through it', () => {
    const {data, width} = rowOf(20);
    expect(frameBoxes(data, width, 44, 8, 127, ASPECT).map(column)).toEqual([
      0, 2, 5, 7, 10, 12, 15, 17,
    ]);
  });

  it('falls back to the squarest grid for a picture it cannot read', () => {
    // One blob of frame shape where eight were asked for.
    const data = image(100, 100, [[5, 25, 5, 45]]);
    expect(frameBoxes(data, 100, 100, 8, 127, ASPECT)).toEqual(
      evenGrid(100, 100, 2, 4)
    );
  });
});
