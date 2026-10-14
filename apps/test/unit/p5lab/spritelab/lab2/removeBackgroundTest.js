import {keyOutColor} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/removeBackground';

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

describe('SpriteLab2 keyOutColor', () => {
  const MAGENTA = [255, 0, 255];

  it('clears the key colour everywhere, enclosed gaps included', () => {
    // red | magenta (enclosed by red on this row) | red
    const data = rgba([
      [255, 0, 0],
      [250, 5, 250],
      [255, 0, 0],
    ]);
    keyOutColor(data, 3, 1, MAGENTA);
    expect(alpha(data, 0)).toBe(255);
    expect(alpha(data, 1)).toBe(0);
    expect(alpha(data, 2)).toBe(255);
  });

  it('takes the anti-aliased fringe next to cleared pixels, sharp or soft', () => {
    // magenta | half magenta half red (fringe) | red
    const fringe = [255, 0, 128];
    const sharp = rgba([MAGENTA, fringe, [255, 0, 0]]);
    keyOutColor(sharp, 3, 1, MAGENTA);
    expect(alpha(sharp, 1)).toBe(0);
    expect(alpha(sharp, 2)).toBe(255);
    const soft = rgba([MAGENTA, fringe, [255, 0, 0]]);
    keyOutColor(soft, 3, 1, MAGENTA, {soft: true});
    expect(alpha(soft, 1)).toBeGreaterThan(0);
    expect(alpha(soft, 1)).toBeLessThan(255);
    // Despilled: the fringe pixel loses its magenta cast (blue drops) so it
    // reads as the character's red, not a pink halo.
    expect(soft[1 * 4 + 2]).toBeLessThan(128);
    expect(soft[1 * 4]).toBe(255);
  });

  it('leaves a fringe-coloured pixel alone when nothing keyed touches it', () => {
    const data = rgba([
      [255, 0, 0],
      [255, 0, 128],
      [255, 0, 0],
    ]);
    keyOutColor(data, 3, 1, MAGENTA);
    expect(alpha(data, 1)).toBe(255);
  });

  it('clears a shaded, textured key colour, not just the pure one', () => {
    // Textured magenta background of varying shade around a purple robe pixel.
    const data = rgba([
      [255, 0, 255],
      [200, 20, 230],
      [180, 40, 210],
      [120, 60, 180], // robe: purple, stays
      [235, 60, 250],
    ]);
    keyOutColor(data, 5, 1, MAGENTA);
    expect([0, 1, 2, 4].map(i => alpha(data, i))).toEqual([0, 0, 0, 0]);
    expect(alpha(data, 3)).toBe(255);
  });

  it('keys green the same way', () => {
    const data = rgba([
      [0, 255, 0],
      [40, 220, 60],
      [60, 180, 50],
      [200, 120, 40],
    ]);
    keyOutColor(data, 4, 1, [0, 255, 0]);
    expect([0, 1, 2].map(i => alpha(data, i))).toEqual([0, 0, 0]);
    expect(alpha(data, 3)).toBe(255);
  });

  it('clears a backdrop that came back duller than the key', () => {
    // 7x5: a dull magenta (190, 29, 155) ring, scoring 126, under the
    // outright cutoff; inside, a red body with a purple robe column.
    const dull = [190, 29, 155];
    const red = [255, 0, 0];
    const robe = [120, 60, 180];
    const inner = [dull, red, red, red, robe, red, dull];
    const data = rgba([
      ...Array(7).fill(dull),
      ...inner,
      ...inner,
      ...inner,
      ...Array(7).fill(dull),
    ]);
    keyOutColor(data, 7, 5, MAGENTA);
    const kept = [];
    for (let i = 0; i < 35; i++) {
      if (alpha(data, i) > 0) {
        kept.push(i);
      }
    }
    expect(kept).toEqual([
      8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26,
    ]);
  });

  it("feathers a dull backdrop's fringe from the lowered cutoff", () => {
    const dull = [190, 29, 155];
    const red = [255, 0, 0];
    // Between the dull backdrop and red: scores 100, under the lowered
    // cutoff of 102 and above the band's floor.
    const fringe = [200, 20, 120];
    const inner = [dull, fringe, red, red, red, fringe, dull];
    const data = rgba([
      ...Array(7).fill(dull),
      ...inner,
      ...inner,
      ...inner,
      ...Array(7).fill(dull),
    ]);
    keyOutColor(data, 7, 5, MAGENTA, {soft: true});
    expect(alpha(data, 15)).toBeGreaterThan(0);
    expect(alpha(data, 15)).toBeLessThan(255);
    expect(alpha(data, 16)).toBe(255);
    expect(alpha(data, 14)).toBe(0);
  });

  it('floods a backdrop drawn in a colour of its own from the edges', () => {
    // 7x5: a white ring the key never scores; inside, a red body with one
    // white pixel enclosed in it that the flood cannot reach.
    const white = [255, 255, 255];
    const red = [255, 0, 0];
    const edge = [white, red, red, red, red, red, white];
    const middle = [white, red, white, red, red, red, white];
    const data = rgba([
      ...Array(7).fill(white),
      ...edge,
      ...middle,
      ...edge,
      ...Array(7).fill(white),
    ]);
    keyOutColor(data, 7, 5, MAGENTA);
    const kept = [];
    for (let i = 0; i < 35; i++) {
      if (alpha(data, i) > 0) {
        kept.push(i);
      }
    }
    expect(kept).toEqual([
      8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26,
    ]);
  });

  it("feathers an off-key backdrop's fringe when soft", () => {
    const white = [255, 255, 255];
    const red = [255, 0, 0];
    const fringe = [255, 200, 200];
    const inner = [white, fringe, red, red, red, fringe, white];
    const data = rgba([
      ...Array(7).fill(white),
      ...inner,
      ...inner,
      ...inner,
      ...Array(7).fill(white),
    ]);
    keyOutColor(data, 7, 5, MAGENTA, {soft: true});
    expect(alpha(data, 14)).toBe(0);
    expect(alpha(data, 15)).toBeGreaterThan(0);
    expect(alpha(data, 15)).toBeLessThan(255);
    expect(alpha(data, 16)).toBe(255);
  });

  it('leaves an off-key border alone when it is not one flat colour', () => {
    const white = [255, 255, 255];
    const blue = [0, 0, 255];
    const red = [255, 0, 0];
    const ring = i => (i % 2 ? white : blue);
    const inner = [white, red, red, red, red, red, blue];
    const data = rgba([
      ...Array.from({length: 7}, (_, i) => ring(i)),
      ...inner,
      ...inner,
      ...inner,
      ...Array.from({length: 7}, (_, i) => ring(i)),
    ]);
    keyOutColor(data, 7, 5, MAGENTA);
    for (let i = 0; i < 35; i++) {
      expect(alpha(data, i)).toBe(255);
    }
  });

  it('keeps the cutoff when the border varies', () => {
    // The same ring with the body crossing it: the border is not a flat
    // backdrop, so a dull pixel beside the body stays.
    const dull = [190, 29, 155];
    const red = [255, 0, 0];
    const data = rgba([
      ...[dull, red, red, red, red, red, dull],
      ...[dull, red, red, red, red, red, dull],
      ...[dull, red, red, dull, red, red, dull],
      ...[dull, red, red, red, red, red, dull],
      ...[dull, red, red, red, red, red, dull],
    ]);
    keyOutColor(data, 7, 5, MAGENTA);
    expect(alpha(data, 17)).toBe(255);
  });

  it('keeps the cutoff when the border is mostly transparent already', () => {
    // 5x5: a transparent ring, a red ring, and a dull magenta centre the
    // red ring walls off; the border says nothing about the backdrop.
    const red = [255, 0, 0];
    const dull = [190, 29, 155];
    const row = (...cells) => cells;
    const data = rgba([
      ...row(red, red, red, red, red),
      ...row(red, red, red, red, red),
      ...row(red, red, dull, red, red),
      ...row(red, red, red, red, red),
      ...row(red, red, red, red, red),
    ]);
    for (let i = 0; i < 25; i++) {
      const x = i % 5;
      const y = (i - x) / 5;
      if (x === 0 || y === 0 || x === 4 || y === 4) {
        data[i * 4 + 3] = 0;
      }
    }
    keyOutColor(data, 5, 5, MAGENTA);
    expect(alpha(data, 12)).toBe(255);
  });

  it('leaves the cutoff alone when the subject reaches the edges', () => {
    const data = rgba([
      [255, 0, 0],
      [190, 29, 155],
      [255, 0, 0],
    ]);
    keyOutColor(data, 3, 1, MAGENTA);
    expect(alpha(data, 1)).toBe(255);
  });
});
