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

describe('sheet slicing', () => {
  it('finds a row of frames from the solid runs, cut top to bottom', () => {
    const data = image(100, 20, [
      [5, 20, 2, 18],
      [30, 45, 2, 18],
      [55, 70, 2, 18],
      [80, 95, 2, 18],
    ]);
    expect(frameBoxes(data, 100, 20, 4, 127)).toEqual([
      {left: 5, right: 20, top: 0, bottom: 20},
      {left: 30, right: 45, top: 0, bottom: 20},
      {left: 55, right: 70, top: 0, bottom: 20},
      {left: 80, right: 95, top: 0, bottom: 20},
    ]);
  });

  it('reads a grid row by row when the model stacked the frames', () => {
    const data = image(100, 100, [
      [5, 20, 5, 45],
      [55, 70, 5, 45],
      [5, 20, 55, 95],
      [55, 70, 55, 95],
    ]);
    expect(
      frameBoxes(data, 100, 100, 4, 127).map(b => [b.left, b.top])
    ).toEqual([
      [5, 5],
      [55, 5],
      [5, 55],
      [55, 55],
    ]);
  });

  it('bridges a gap inside a frame narrower than the frame allows', () => {
    // A hand a pixel away from the body: 45–46 is a 1px gap in a 25px frame.
    const data = image(100, 20, [
      [5, 20, 2, 18],
      [30, 45, 2, 18],
      [46, 48, 2, 18],
      [55, 70, 2, 18],
      [80, 95, 2, 18],
    ]);
    expect(frameBoxes(data, 100, 20, 4, 127)[1]).toMatchObject({
      left: 30,
      right: 48,
    });
  });

  it('separates rows whose brims graze the feet above them', () => {
    // Two rows of two; the lower row's 1px-wide "brim" reaches into the gap.
    const data = image(100, 100, [
      [2, 42, 5, 45],
      [52, 92, 5, 45],
      [2, 42, 55, 95],
      [52, 92, 55, 95],
      [20, 21, 45, 55],
    ]);
    expect(
      frameBoxes(data, 100, 100, 4, 127).map(b => [b.left, b.top])
    ).toEqual([
      [2, 5],
      [52, 5],
      [2, 55],
      [52, 55],
    ]);
  });

  it('treats a wide picture as one row even where the figures thin out', () => {
    // Four figures in a 200 x 40 picture, each with a 1px "ankle" between body
    // and boots; the ankle lines must not split the picture into two rows.
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
    expect(found.every(b => b.top === 0 && b.bottom === 40)).toBe(true);
    expect(found.map(b => b.left)).toEqual([10, 60, 110, 160]);
  });

  it('falls back to an even grid, keeping the rows it found', () => {
    // Two rows found, but only three frames in them: cut 2 x 4 evenly.
    const data = image(100, 100, [
      [5, 20, 5, 45],
      [55, 70, 5, 45],
      [5, 20, 55, 95],
    ]);
    expect(frameBoxes(data, 100, 100, 8, 127)).toEqual(
      evenGrid(100, 100, 2, 4)
    );
  });

  it('falls back to a single row when the rows found do not divide the count', () => {
    const data = image(100, 100, [
      [5, 20, 5, 30],
      [5, 20, 35, 60],
      [5, 20, 65, 95],
    ]);
    expect(frameBoxes(data, 100, 100, 8, 127)).toEqual(
      evenGrid(100, 100, 1, 8)
    );
  });
});
