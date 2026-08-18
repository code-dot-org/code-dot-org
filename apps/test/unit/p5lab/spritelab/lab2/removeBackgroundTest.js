import {keyOutBackground} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/removeBackground';

// Build an RGBA buffer from [r,g,b] triples, all fully opaque to start.
function rgba(pixels) {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(([r, g, b], i) => {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  });
  return data;
}

const alpha = (data, i) => data[i * 4 + 3];
const GREEN = [0, 255, 0];

describe('SpriteLab2 keyOutBackground', () => {
  it('sharp matte makes background-connected key pixels fully transparent', () => {
    // green | green | red(subject)
    const data = rgba([GREEN, GREEN, [255, 0, 0]]);
    keyOutBackground(data, 3, 1); // sharp (default)
    expect(alpha(data, 0)).toBe(0);
    expect(alpha(data, 1)).toBe(0);
    expect(alpha(data, 2)).toBe(255);
  });

  it('sharp matte produces only binary alpha (no partial edge pixels)', () => {
    // A near-green edge pixel is either fully cut or fully kept, never partial.
    const data = rgba([GREEN, [0, 200, 0], [255, 0, 0]]);
    keyOutBackground(data, 3, 1);
    [0, 1, 2].forEach(i => expect([0, 255]).toContain(alpha(data, i)));
  });

  it('soft matte feathers the edge ramp with partial alpha', () => {
    // green | green-blend edge | non-green subject
    const data = rgba([GREEN, [0, 200, 0], [10, 20, 200]]);
    keyOutBackground(data, 3, 1, {soft: true});
    expect(alpha(data, 0)).toBe(0); // pure key
    expect(alpha(data, 1)).toBeGreaterThan(0);
    expect(alpha(data, 1)).toBeLessThan(255); // feathered
    expect(alpha(data, 2)).toBe(255); // subject untouched
  });

  it('soft matte suppresses key spill on edge pixels', () => {
    const data = rgba([GREEN, [0, 200, 0], [10, 20, 200]]);
    keyOutBackground(data, 3, 1, {soft: true});
    // The key-dominant edge pixel is pulled down to its max(R,B)=0.
    expect(data[1 * 4 + 1]).toBe(0);
  });

  it('soft matte cuts near-invisible ramp output to fully transparent', () => {
    // green | faint veil (chroma distance just past the low threshold) | subject
    const data = rgba([GREEN, [0, 215, 0], [10, 20, 200]]);
    keyOutBackground(data, 3, 1, {soft: true});
    // The ramp would give ~43 alpha — background noise, not an edge.
    expect(alpha(data, 1)).toBe(0);
    expect(alpha(data, 2)).toBe(255);
  });

  it('keys any corner-sampled color, not just green', () => {
    // blue | blue | yellow(subject) — the key is whatever the corner holds.
    const BLUE = [0, 0, 255];
    const data = rgba([BLUE, BLUE, [255, 220, 0]]);
    keyOutBackground(data, 3, 1);
    expect(alpha(data, 0)).toBe(0);
    expect(alpha(data, 1)).toBe(0);
    expect(alpha(data, 2)).toBe(255);
  });

  it('soft matte suppresses spill for any single-channel key', () => {
    // blue key: the blue-dominant edge pixel is pulled down to max(R,G).
    const data = rgba([
      [0, 0, 255],
      [0, 30, 200],
      [200, 180, 10],
    ]);
    keyOutBackground(data, 3, 1, {soft: true});
    expect(data[1 * 4 + 2]).toBe(30);
  });

  it('soft matte skips spill suppression for mixed keys', () => {
    // Magenta key (r and b tie): clamping one channel would shift hue, so
    // the edge pixel's channels are left alone (alpha still feathers).
    const MAGENTA = [255, 0, 255];
    const data = rgba([MAGENTA, [200, 0, 200], [10, 220, 20]]);
    keyOutBackground(data, 3, 1, {soft: true});
    expect(data[1 * 4]).toBe(200);
    expect(data[1 * 4 + 2]).toBe(200);
    expect(alpha(data, 1)).toBeGreaterThan(0);
    expect(alpha(data, 1)).toBeLessThan(255);
  });

  it('does not cross the subject, so enclosed key color is preserved', () => {
    // green | red(subject barrier) | green — the far green is unreachable.
    const data = rgba([GREEN, [255, 0, 0], GREEN]);
    keyOutBackground(data, 3, 1);
    expect(alpha(data, 0)).toBe(0);
    expect(alpha(data, 1)).toBe(255);
    expect(alpha(data, 2)).toBe(255); // not connected to corner -> kept
  });
});
