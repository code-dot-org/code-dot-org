import {describe, expect, it} from 'vitest';

import {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from '../colorUtils';

describe('colorUtils', () => {
  it('round-trips hex through rgb', () => {
    expect(rgbToHex(1, 0, 0.502)).toBe('#ff0080');
    expect(hexToRgb('#ff0080')).toEqual({r: 1, g: 0, b: 0.502});
  });

  it('round-trips rgb through hsl', () => {
    const hsl = rgbToHsl(0.2, 0.6, 0.9);
    const back = hslToRgb(hsl.h, hsl.s, hsl.l);
    expect(back.r).toBeCloseTo(0.2, 2);
    expect(back.g).toBeCloseTo(0.6, 2);
    expect(back.b).toBeCloseTo(0.9, 2);
  });

  it('treats gray as zero saturation without dividing by zero', () => {
    expect(rgbToHsl(0.5, 0.5, 0.5)).toEqual({h: 0, s: 0, l: 0.5});
    const gray = hslToRgb(0, 0, 0.5);
    expect(gray.r).toBeCloseTo(0.5, 5);
  });

  it('matches the GLSL helper for a known hue', () => {
    // 120° fully saturated at half lightness is pure green.
    const green = hslToRgb(120, 1, 0.5);
    expect(green.r).toBeCloseTo(0, 5);
    expect(green.g).toBeCloseTo(1, 5);
    expect(green.b).toBeCloseTo(0, 5);
  });
});
