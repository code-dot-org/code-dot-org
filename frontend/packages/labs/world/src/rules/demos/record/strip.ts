// A recording as one strip of frames.
//
// A demo is played, each frame's actors are read off `renderSnapshot`, and the
// frames are laid side by side in one image. The dialog animates it with CSS
// `steps()`, so the first cell is the still and the strip is the motion — one
// asset for both (specs/RULE_DEMOS.md).
//
// BOXES, NOT SPRITES, and that is not a shortcut. A demo actor wears no
// picture, and an actor with no picture is what the driver already draws as a
// plain rectangle — so this paints what Phaser would paint, without needing
// Phaser, a canvas, or a browser in the build path. The day a demo wants a
// sprite is the day this grows a decoder or moves into the renderer; until
// then, a rule is being demonstrated rather than dressed.
//
// AND TEXT, which is the one exception and had to be. Writing puts a string on
// an actor, and no arrangement of rectangles says "SCORE" — so a box may carry
// text instead, drawn from a bitmap table (`./font`) in the same clip and the
// same colour a box would have had.

import {GLYPH_HEIGHT, textPixels, textWidth} from './font';

/** One actor at one moment, as much of it as a box needs. */
export interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colour: [number, number, number];
  /**
   * A string to draw INSTEAD of the rectangle, centred where the box was.
   *
   * Instead rather than over: a label is what the actor is, not a decoration
   * on it, and a rectangle behind the letters would be a box with text on it
   * — which is not what the rule draws.
   */
  text?: string;
  /** Whole-pixel scale for that text. Two is legible at this size. */
  textScale?: number;
}

export interface StripSize {
  width: number;
  height: number;
}

/** `#rrggbb` as bytes, for a palette written the way CSS writes one. */
export const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/**
 * Lay the frames out in a row, as RGBA bytes.
 *
 * Left to right in time, so `background-position` steps through them by whole
 * frame widths and nothing has to know how many there are but the CSS.
 *
 * Clipped rather than scaled: a demo that puts an actor outside the frame has
 * a demo world to fix, and silently shrinking everything to fit would hide it.
 */
export function drawStrip(
  frames: readonly Box[][],
  size: StripSize,
  background: [number, number, number],
): Uint8Array {
  const stripWidth = size.width * frames.length;
  const pixels = new Uint8Array(stripWidth * size.height * 4);
  // The ground colour, everywhere, before anything is drawn on it.
  for (let at = 0; at < pixels.length; at += 4) {
    pixels[at] = background[0];
    pixels[at + 1] = background[1];
    pixels[at + 2] = background[2];
    pixels[at + 3] = 255;
  }

  /** Light one pixel, if it is on the strip at all. */
  const put = (
    x: number,
    y: number,
    offset: number,
    colour: readonly [number, number, number],
  ) => {
    if (x < 0 || x >= size.width || y < 0 || y >= size.height) {
      return;
    }
    const at = (y * stripWidth + offset + x) * 4;
    pixels[at] = colour[0];
    pixels[at + 1] = colour[1];
    pixels[at + 2] = colour[2];
    pixels[at + 3] = 255;
  };

  frames.forEach((frame, index) => {
    const offset = index * size.width;
    for (const box of frame) {
      if (box.text !== undefined) {
        const scale = box.textScale ?? 2;
        // Centred on the actor's position, as a box is: the same anchor for
        // both, so a demo can swap one for the other without moving anything.
        const left = Math.round(box.x - textWidth(box.text, scale) / 2);
        const top = Math.round(box.y - (GLYPH_HEIGHT * scale) / 2);
        for (const [x, y] of textPixels(box.text, scale)) {
          put(left + x, top + y, offset, box.colour);
        }
        continue;
      }
      // Positions are the actor's MIDDLE, as everything in the engine is.
      const left = Math.round(box.x - box.width / 2);
      const top = Math.round(box.y - box.height / 2);
      for (let y = top; y < top + box.height; y++) {
        for (let x = left; x < left + box.width; x++) {
          put(x, y, offset, box.colour);
        }
      }
    }
  });

  return pixels;
}
