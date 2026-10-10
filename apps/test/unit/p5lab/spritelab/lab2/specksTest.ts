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

  it('counts alpha at the threshold as clear, and a patch at the share as kept', () => {
    const data = picture([
      [0, 0, 20, 20],
      [30, 30, 2, 1],
    ]);
    // 2 of 400 is exactly 0.5%.
    expect(clearMinorComponents(data, SIDE, SIDE, 64)).toBe(0);
    data[(30 * SIDE + 31) * 4 + 3] = 64;
    expect(clearMinorComponents(data, SIDE, SIDE, 64)).toBe(1);
  });

  it('copes with a one-pixel-wide picture and with thousands of patches', () => {
    const line = new Uint8ClampedArray(1 * 9 * 4);
    [0, 1, 2, 3, 4, 5, 8].forEach(y => (line[y * 4 + 3] = 255));
    expect(clearMinorComponents(line, 1, 9, 64, 0.5)).toBe(1);
    // A dot on every other pixel of a 200x200 lattice beside a body.
    const side = 200;
    const dots = new Uint8ClampedArray(side * side * 4);
    for (let y = 0; y < side; y += 2) {
      for (let x = 0; x < side; x += 2) {
        dots[(y * side + x) * 4 + 3] = 255;
      }
    }
    for (let y = 100; y < 160; y++) {
      for (let x = 100; x < 160; x++) {
        dots[(y * side + x) * 4 + 3] = 255;
      }
    }
    expect(clearMinorComponents(dots, side, side, 64)).toBeGreaterThan(9000);
  });

  it('clears nothing from an empty or single-patch picture', () => {
    expect(clearMinorComponents(picture([]), SIDE, SIDE, 64)).toBe(0);
    expect(clearMinorComponents(picture([[0, 0, 5, 5]]), SIDE, SIDE, 64)).toBe(
      0
    );
  });
});
