import {clearMinorComponents} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/specks';

const SIDE = 40;

// A transparent SIDE x SIDE canvas with the given opaque rectangles.
function picture(
  rects: Array<[number, number, number, number]>
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(SIDE * SIDE * 4);
  for (const [left, top, width, height] of rects) {
    for (let y = top; y < top + height; y++) {
      for (let x = left; x < left + width; x++) {
        data[(y * SIDE + x) * 4 + 3] = 255;
      }
    }
  }
  return data;
}

const opaqueCount = (data: Uint8ClampedArray) => {
  let count = 0;
  for (let p = 3; p < data.length; p += 4) {
    if (data[p] > 0) {
      count++;
    }
  }
  return count;
};

describe('SpriteLab2 clearMinorComponents', () => {
  it('clears a one-pixel edge line beside a large body', () => {
    // A 30x30 body and a 7-pixel line on the right edge (0.8% of it).
    const data = picture([
      [2, 2, 30, 30],
      [SIDE - 1, 10, 1, 7],
    ]);
    expect(clearMinorComponents(data, SIDE, SIDE, 64, 0.01)).toBe(7);
    expect(opaqueCount(data)).toBe(900);
  });

  it('keeps a detached part that is a real share of the body', () => {
    // A hat held clear of the head: 6x6 is 4% of the body.
    const data = picture([
      [2, 8, 30, 30],
      [10, 0, 6, 6],
    ]);
    expect(clearMinorComponents(data, SIDE, SIDE, 64)).toBe(0);
    expect(opaqueCount(data)).toBe(936);
  });

  it('counts diagonal neighbours as one patch', () => {
    // Two pixels touching only at a corner, beside a body: together they
    // are one patch, and far too small to keep.
    const data = picture([
      [2, 2, 30, 30],
      [36, 36, 1, 1],
      [37, 37, 1, 1],
    ]);
    expect(clearMinorComponents(data, SIDE, SIDE, 64)).toBe(2);
  });

  it('clears nothing from an empty or single-patch picture', () => {
    expect(clearMinorComponents(picture([]), SIDE, SIDE, 64)).toBe(0);
    expect(clearMinorComponents(picture([[0, 0, 5, 5]]), SIDE, SIDE, 64)).toBe(
      0
    );
  });
});
