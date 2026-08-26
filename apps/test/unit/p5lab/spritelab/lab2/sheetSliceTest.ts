import {
  columnSpans,
  equalColumns,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/sheetSlice';

// RGBA data for a w x h image whose solid columns are the given x-ranges.
function image(width: number, height: number, solid: [number, number][]) {
  const data = new Uint8ClampedArray(width * height * 4);
  solid.forEach(([left, right]) => {
    for (let y = 0; y < height; y++) {
      for (let x = left; x < right; x++) {
        data[(y * width + x) * 4 + 3] = 255;
      }
    }
  });
  return data;
}

describe('sheet slicing', () => {
  it('finds the frames from the solid runs across the row', () => {
    const data = image(100, 10, [
      [5, 20],
      [30, 45],
      [55, 70],
      [80, 95],
    ]);
    expect(columnSpans(data, 100, 10, 4, 127)).toEqual([
      {left: 5, right: 20},
      {left: 30, right: 45},
      {left: 55, right: 70},
      {left: 80, right: 95},
    ]);
  });

  it('bridges a gap inside a frame narrower than the frame allows', () => {
    // A hand a pixel away from the body: 45–46 is a 1px gap in a 25px frame.
    const data = image(100, 10, [
      [5, 20],
      [30, 45],
      [46, 48],
      [55, 70],
      [80, 95],
    ]);
    expect(columnSpans(data, 100, 10, 4, 127)[1]).toEqual({
      left: 30,
      right: 48,
    });
  });

  it('falls back to equal columns when the runs do not come to the count', () => {
    const data = image(100, 10, [
      [5, 20],
      [55, 70],
    ]);
    expect(columnSpans(data, 100, 10, 4, 127)).toEqual(equalColumns(100, 4));
  });

  it('ignores faint pixels below the threshold', () => {
    const data = image(60, 4, [[10, 20]]);
    data[(0 * 60 + 40) * 4 + 3] = 40;
    expect(columnSpans(data, 60, 4, 1, 127)).toEqual([{left: 10, right: 20}]);
  });
});
