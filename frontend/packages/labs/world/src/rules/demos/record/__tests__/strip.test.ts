// Laying a recording out as one strip.
//
// The renderer is pure — frames in, pixels out — so the things worth pinning
// are the ones a picture would not obviously show: that time runs left to
// right in whole frame widths, that a position is an actor's MIDDLE as it is
// everywhere else in the engine, and that an actor wandering out of frame is
// clipped rather than quietly scaling everything to fit.

import {describe, expect, it} from 'vitest';

import {drawStrip, rgb, type Box} from '../strip';

const SIZE = {width: 4, height: 4};
const BLACK: [number, number, number] = [0, 0, 0];
const RED = rgb('#ff0000');

/** The colour at a pixel, as `[r,g,b]`. */
const pixel = (
  pixels: Uint8Array,
  stripWidth: number,
  x: number,
  y: number,
): number[] => {
  const at = (y * stripWidth + x) * 4;
  return [pixels[at], pixels[at + 1], pixels[at + 2]];
};

const box = (x: number, y: number): Box => ({
  id: 'one',
  x,
  y,
  width: 2,
  height: 2,
  colour: RED,
});

describe('drawStrip', () => {
  it('is as wide as the frames it was given', () => {
    const pixels = drawStrip([[], [], []], SIZE, BLACK);

    expect(pixels.length).toBe(4 * 3 * 4 * 4);
  });

  it('paints the background everywhere, opaque', () => {
    const pixels = drawStrip([[]], SIZE, rgb('#102030'));

    expect(pixel(pixels, 4, 0, 0)).toEqual([16, 32, 48]);
    expect(pixels[3]).toBe(255);
  });

  it('puts each frame one frame-width along', () => {
    // Time runs left to right, so `background-position` steps through by whole
    // frames and the CSS needs to know nothing but how many there are.
    const pixels = drawStrip([[box(1, 1)], [box(1, 1)]], SIZE, BLACK);

    expect(pixel(pixels, 8, 0, 0)).toEqual(RED);
    expect(pixel(pixels, 8, 4, 0)).toEqual(RED);
    // …and nothing in the first frame where the second one's box is.
    expect(pixel(pixels, 8, 3, 3)).toEqual(BLACK);
  });

  it('draws a box around its middle', () => {
    // Every position in the engine is an actor's middle, and a renderer that
    // treated one as a corner would put everything half a body down and right.
    const pixels = drawStrip([[box(2, 2)]], SIZE, BLACK);

    expect(pixel(pixels, 4, 1, 1)).toEqual(RED);
    expect(pixel(pixels, 4, 2, 2)).toEqual(RED);
    expect(pixel(pixels, 4, 0, 0)).toEqual(BLACK);
  });

  it('clips an actor that leaves the frame', () => {
    // Rather than scaling to fit: a demo that puts an actor outside its frame
    // has a demo world to fix, and shrinking everything would hide it.
    const pixels = drawStrip([[box(0, 0)]], SIZE, BLACK);

    expect(pixel(pixels, 4, 0, 0)).toEqual(RED);
    expect(pixels.length).toBe(4 * 4 * 4);
  });

  it('does not bleed one frame into the next', () => {
    // The bug a strip invites: a box near the right edge of frame one drawn
    // into the left edge of frame two, so a still shows a ghost.
    const pixels = drawStrip([[box(4, 2)], []], SIZE, BLACK);

    expect(pixel(pixels, 8, 4, 2)).toEqual(BLACK);
    expect(pixel(pixels, 8, 5, 2)).toEqual(BLACK);
  });
});

describe('rgb', () => {
  it('reads a CSS colour', () => {
    expect(rgb('#c678dd')).toEqual([198, 120, 221]);
  });
});
