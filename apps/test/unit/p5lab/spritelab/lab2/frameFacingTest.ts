import {
  facingDistance,
  isMirrored,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/frameFacing';

const WIDTH = 6;
const HEIGHT = 2;

// An asymmetric figure: the left third red, the middle third blue, the
// right third empty.
function base(): Uint8ClampedArray {
  const data = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < 4; x++) {
      const p = (y * WIDTH + x) * 4;
      data[p] = x < 2 ? 255 : 0;
      data[p + 2] = x < 2 ? 0 : 255;
      data[p + 3] = 255;
    }
  }
  return data;
}

function mirror(data: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const from = (y * WIDTH + x) * 4;
      const to = (y * WIDTH + (WIDTH - 1 - x)) * 4;
      out.set(data.subarray(from, from + 4), to);
    }
  }
  return out;
}

describe('SpriteLab2 frameFacing', () => {
  it('measures a frame against the base and against its mirror', () => {
    const b = base();
    expect(facingDistance(b, b, WIDTH, HEIGHT, false)).toBe(0);
    expect(facingDistance(mirror(b), b, WIDTH, HEIGHT, true)).toBe(0);
    // Mirrored, the figure matches the base only in the middle third: four
    // of the six columns drawn in either are mismatches. Centred on the
    // frame instead, every column is red against blue, which is worse.
    expect(facingDistance(mirror(b), b, WIDTH, HEIGHT, false)).toBeCloseTo(
      2 / 3
    );
  });

  it('compares the figures by their drawn centres, wherever each sits', () => {
    // The base shifted two columns right is the same figure.
    const shifted = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
    const b = base();
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < 4; x++) {
        const from = (y * WIDTH + x) * 4;
        shifted.set(b.subarray(from, from + 4), (y * WIDTH + x + 2) * 4);
      }
    }
    expect(facingDistance(shifted, b, WIDTH, HEIGHT, false)).toBe(0);
    expect(isMirrored(shifted, b, WIDTH, HEIGHT)).toBe(false);
  });

  it('calls a mirror image mirrored and a small change not', () => {
    const b = base();
    expect(isMirrored(mirror(b), b, WIDTH, HEIGHT)).toBe(true);
    const changed = base();
    changed[(0 * WIDTH + 3) * 4 + 1] = 200;
    expect(isMirrored(changed, b, WIDTH, HEIGHT)).toBe(false);
    expect(isMirrored(b, b, WIDTH, HEIGHT)).toBe(false);
  });

  it('treats an empty frame as facing the base', () => {
    const empty = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
    expect(facingDistance(empty, empty, WIDTH, HEIGHT, false)).toBe(0);
    expect(isMirrored(empty, base(), WIDTH, HEIGHT)).toBe(false);
  });
});
