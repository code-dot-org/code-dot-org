import {keyOutBackground} from '@cdo/apps/p5lab/spritelab/lab2/ai/items/removeBackground';

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

  it('soft matte suppresses green spill on edge pixels', () => {
    const data = rgba([GREEN, [0, 200, 0], [10, 20, 200]]);
    keyOutBackground(data, 3, 1, {soft: true});
    // The green-dominant edge pixel is pulled down to its max(R,B)=0.
    expect(data[1 * 4 + 1]).toBe(0);
  });

  it('does not cross the subject, so enclosed key color is preserved', () => {
    // green | red(subject barrier) | green — the far green is unreachable.
    const data = rgba([GREEN, [255, 0, 0], GREEN]);
    keyOutBackground(data, 3, 1);
    expect(alpha(data, 0)).toBe(0);
    expect(alpha(data, 1)).toBe(255);
    expect(alpha(data, 2)).toBe(255); // not connected to corner -> kept
  });

  describe('edgeSeededKey (blocks: subject may reach the corners)', () => {
    const RED = [255, 0, 0];
    const opts = {edgeSeededKey: [0, 255, 0]};

    it('keys a mid-edge sliver while keeping corner-touching subject', () => {
      // 3x3, red block touching every corner, one green sliver mid-left edge.
      // Corner-seeding would key the red itself; edge seeding keys only green.
      const data = rgba([
        ...[RED, RED, RED],
        ...[GREEN, RED, RED],
        ...[RED, RED, RED],
      ]);
      keyOutBackground(data, 3, 3, opts);
      expect(alpha(data, 3)).toBe(0); // the sliver
      [0, 1, 2, 4, 5, 6, 7, 8].forEach(i => expect(alpha(data, i)).toBe(255));
    });

    it('preserves enclosed key color (not border-connected)', () => {
      const data = rgba([
        ...[RED, RED, RED],
        ...[RED, GREEN, RED],
        ...[RED, RED, RED],
      ]);
      keyOutBackground(data, 3, 3, opts);
      [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(i =>
        expect(alpha(data, i)).toBe(255)
      );
    });

    it('still keys background connected to a green corner', () => {
      const data = rgba([GREEN, GREEN, RED]);
      keyOutBackground(data, 3, 1, opts);
      expect(alpha(data, 0)).toBe(0);
      expect(alpha(data, 1)).toBe(0);
      expect(alpha(data, 2)).toBe(255);
    });
  });
});
