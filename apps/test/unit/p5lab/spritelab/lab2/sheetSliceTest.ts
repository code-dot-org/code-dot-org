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

const corners = (boxes: {left: number; top: number}[]) =>
  boxes.map(b => [b.left, b.top]);

describe('sheet slicing', () => {
  it('finds a row of frames as blobs, tight to their pixels', () => {
    const data = image(100, 20, [
      [5, 20, 2, 18],
      [30, 45, 3, 17],
      [55, 70, 2, 18],
      [80, 95, 2, 18],
    ]);
    expect(frameBoxes(data, 100, 20, 4, 127)).toEqual([
      {left: 5, right: 20, top: 2, bottom: 18},
      {left: 30, right: 45, top: 3, bottom: 17},
      {left: 55, right: 70, top: 2, bottom: 18},
      {left: 80, right: 95, top: 2, bottom: 18},
    ]);
  });

  it('reads a grid row by row when the model stacked the frames', () => {
    const data = image(100, 100, [
      [55, 70, 5, 45],
      [5, 20, 55, 95],
      [5, 20, 5, 45],
      [55, 70, 55, 95],
    ]);
    expect(corners(frameBoxes(data, 100, 100, 4, 127))).toEqual([
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
    const found = frameBoxes(data, 100, 40, 2, 127);
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
    const found = frameBoxes(data, 200, 40, 4, 127);
    expect(found).toHaveLength(4);
    expect(found.every(b => b.top === 2 && b.bottom === 38)).toBe(true);
  });

  it('splits two rows whose frames touch, at the sparsest line', () => {
    // A brim one pixel wide joins each lower frame to the one above it; the
    // cut falls just below the upper frame, and the brim stays with its hat.
    const data = image(100, 100, [
      [2, 42, 5, 45],
      [52, 92, 5, 45],
      [2, 42, 55, 95],
      [52, 92, 55, 95],
      [20, 21, 45, 55],
      [70, 71, 45, 55],
    ]);
    expect(frameBoxes(data, 100, 100, 4, 127)).toEqual([
      {left: 2, right: 42, top: 5, bottom: 45},
      {left: 52, right: 92, top: 5, bottom: 45},
      {left: 2, right: 42, top: 45, bottom: 95},
      {left: 52, right: 92, top: 45, bottom: 95},
    ]);
  });

  it('falls back to a single-row grid for a wide picture it cannot read', () => {
    const data = image(200, 40, [[5, 195, 2, 38]]);
    expect(frameBoxes(data, 200, 40, 8, 127)).toEqual(evenGrid(200, 40, 1, 8));
  });

  it('falls back to the squarest grid for a square picture it cannot read', () => {
    const data = image(100, 100, [[5, 95, 5, 95]]);
    expect(frameBoxes(data, 100, 100, 8, 127)).toEqual(
      evenGrid(100, 100, 2, 4)
    );
  });
});
