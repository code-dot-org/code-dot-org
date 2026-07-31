// Hex in, shader floats out.
//
// This runs on a value a learner picked in a colour swatch and hands the result
// to a GPU uniform, where a wrong number is a wrong colour with no error and a
// NaN is an invisible sprite with no message. Worth pinning exactly.

import {describe, expect, it} from 'vitest';

import {rgb, rgba, toHex} from '../core/colour';

describe('rgb', () => {
  it('maps each byte onto 0–1', () => {
    expect(rgb('#ffffff')).toEqual([1, 1, 1]);
    expect(rgb('#000000')).toEqual([0, 0, 0]);
    expect(rgb('#ff8000')).toEqual([1, 0x80 / 255, 0]);
  });

  it('keeps the channels in order', () => {
    // Off-by-one on the substring indices swaps red and blue, which looks
    // plausible enough on a purple to survive a glance.
    const [r, g, b] = rgb('#102030');
    expect(r).toBeCloseTo(0x10 / 255);
    expect(g).toBeCloseTo(0x20 / 255);
    expect(b).toBeCloseTo(0x30 / 255);
  });

  it('accepts the three-digit form and a missing hash', () => {
    // `colour_blend` and hand-typed values both turn up in these sockets.
    expect(rgb('#f80')).toEqual(rgb('#ff8800'));
    expect(rgb('ff8800')).toEqual(rgb('#ff8800'));
  });

  it('ignores an alpha the value carries', () => {
    expect(rgb('#ff880040')).toEqual(rgb('#ff8800'));
  });

  it('is case insensitive', () => {
    expect(rgb('#FF8800')).toEqual(rgb('#ff8800'));
  });

  it('gives black for anything unreadable, never NaN', () => {
    // A NaN uniform blanks the sprite silently. Black is wrong in a way the
    // learner can see and reason about; NaN is wrong in a way they cannot.
    for (const bad of ['', 'red', '#12', '#gggggg', null, undefined]) {
      expect(rgb(bad as unknown as string)).toEqual([0, 0, 0]);
    }
  });
});

describe('rgba', () => {
  it('reads the alpha out of an eight-digit hex', () => {
    expect(rgba('#ff880040')).toEqual([1, 0x88 / 255, 0, 0x40 / 255]);
  });

  it('is opaque when the colour does not say otherwise', () => {
    // A picker has no way to express alpha, and a colour a learner chose from
    // a swatch is one they expect to see.
    expect(rgba('#000000')[3]).toBe(1);
    expect(rgba('#abc')[3]).toBe(1);
    expect(rgba([0.5, 0.5, 0.5])[3]).toBe(1);
  });

  it('is opaque black for anything unreadable', () => {
    expect(rgba('not a colour')).toEqual([0, 0, 0, 1]);
  });
});

describe('colours given as floats', () => {
  // What the `r g b a` block produces. It hands over numbers rather than hex
  // so an alpha survives and the channels are not quantized to 8 bits on the
  // way through — a learner dragging a slider to 0.337 gets 0.337.

  it('passes an array straight through', () => {
    expect(rgba([0.25, 0.5, 0.75, 0.337])).toEqual([0.25, 0.5, 0.75, 0.337]);
  });

  it('drops the alpha for rgb', () => {
    expect(rgb([0.25, 0.5, 0.75, 0.1])).toEqual([0.25, 0.5, 0.75]);
  });

  it('clamps every channel, and reads a short array as opaque black', () => {
    expect(rgba([2, -1, 0.5, 9])).toEqual([1, 0, 0.5, 1]);
    expect(rgba([])).toEqual([0, 0, 0, 1]);
  });

  it('treats a non-numeric channel as zero rather than NaN', () => {
    // Straight to a uniform, where NaN blanks the sprite with no message.
    expect(rgba(['x', 0.5, 0.5] as unknown as number[])).toEqual([
      0, 0.5, 0.5, 1,
    ]);
  });
});

describe('toHex', () => {
  it('round-trips a colour back to the picker', () => {
    // The seeded swatch on the block comes from the effect's declared default,
    // so this runs on every bounded colour parameter.
    for (const hex of ['#000000', '#ffffff', '#ff8800', '#102030']) {
      expect(toHex(rgb(hex))).toBe(hex);
    }
  });

  it('pads a single-digit channel', () => {
    // `(15).toString(16)` is 'f'; unpadded it shifts every later channel.
    expect(toHex([15 / 255, 0, 0])).toBe('#0f0000');
  });

  it('clamps and tolerates a short or absent array', () => {
    expect(toHex([2, -1, 0.5])).toBe('#ff0080');
    expect(toHex([1])).toBe('#ff0000');
    expect(toHex([])).toBe('#000000');
  });
});
