// A recording as one strip of frames.
//
// A demo is played, each frame's actors are read off `renderSnapshot`, and the
// frames are laid side by side in one image. The dialog animates it with CSS
// `steps()`, so the first cell is the still and the strip is the motion — one
// asset for both (specs/RULE_DEMOS.md).
//
// BOXES, and PICTURES since the actor demos arrived. A rule demo's actor wears
// no picture, and an actor with no picture is what the driver already draws as
// a plain rectangle — so a box paints what Phaser would paint, without Phaser,
// a canvas, or a browser in the build path. An ACTOR demo is the opposite
// case: what it is demonstrating is a thing you can see, and drawing the stock
// Player as a grey rectangle would demonstrate a rectangle.
//
// The day that came, this grew a blitter and not a decoder. The pictures are
// OURS — `scripts/generate-sprites` draws every one of them — so the recorder
// asks that script for the RGBA it encoded (`stockPixels`) rather than
// decoding the PNG it made from it. A decoder here would be a second copy of
// the format, kept in step by hand, to arrive back where the drawing already
// was.
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

/**
 * One actor at one moment, drawn from an image rather than filled.
 *
 * Everything is in STRIP pixels and already transformed: the recorder knows
 * where the view is and how much the frame shrinks the world, and this knows
 * how to put pixels down. `source` is the rectangle of `pixels` to take, which
 * is the animation cell the engine says is showing.
 */
export interface Picture {
  id: string;
  /** The actor's middle, as a box's is. */
  x: number;
  y: number;
  /** How big to draw it, which is the cell's size after every scale. */
  width: number;
  height: number;
  /** Drawn mirrored, which is how an actor walking left is drawn. */
  flip?: boolean;
  /** 1 opaque, 0 invisible — an actor fading is a thing rules do. */
  opacity?: number;
  pixels: {width: number; height: number; data: Uint8Array};
  source: {x: number; y: number; width: number; height: number};
}

/** What a frame is made of: filled boxes, lettering, and pictures. */
export type Cell = Box | Picture;

const isPicture = (cell: Cell): cell is Picture => 'pixels' in cell;

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
  frames: readonly Cell[][],
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

  /**
   * Blend one pixel over what is under it.
   *
   * Over rather than onto: sprites here are mostly transparent — a 32-pixel
   * square with a 12-pixel figure in it — and a copy would draw every actor
   * inside a rectangle of background, hiding whatever it stands in front of.
   * Straight source-over on opaque ground, which is what the strip is.
   */
  const blend = (
    x: number,
    y: number,
    offset: number,
    colour: readonly [number, number, number],
    alpha: number,
  ) => {
    if (alpha <= 0 || x < 0 || x >= size.width || y < 0 || y >= size.height) {
      return;
    }
    if (alpha >= 1) {
      put(x, y, offset, colour);
      return;
    }
    const at = (y * stripWidth + offset + x) * 4;
    for (let channel = 0; channel < 3; channel++) {
      pixels[at + channel] = Math.round(
        colour[channel] * alpha + pixels[at + channel] * (1 - alpha),
      );
    }
  };

  /**
   * Draw a picture, sampling NEAREST.
   *
   * No smoothing, and the same reason the preview canvas turns it off: these
   * are 32-pixel drawings, and an interpolated one is a smudge. A demo frame
   * shrinks the world by a whole number, so nearest sampling lands on a
   * regular grid rather than on a stutter.
   */
  const draw = (picture: Picture, offset: number) => {
    const {source, pixels: image} = picture;
    const left = Math.round(picture.x - picture.width / 2);
    const top = Math.round(picture.y - picture.height / 2);
    const opacity = picture.opacity ?? 1;
    for (let y = 0; y < picture.height; y++) {
      const sy = source.y + Math.floor((y * source.height) / picture.height);
      for (let x = 0; x < picture.width; x++) {
        const column = picture.flip ? picture.width - 1 - x : x;
        const sx =
          source.x + Math.floor((column * source.width) / picture.width);
        const at = (sy * image.width + sx) * 4;
        blend(
          left + x,
          top + y,
          offset,
          [image.data[at], image.data[at + 1], image.data[at + 2]],
          (image.data[at + 3] / 255) * opacity,
        );
      }
    }
  };

  frames.forEach((frame, index) => {
    const offset = index * size.width;
    for (const cell of frame) {
      if (isPicture(cell)) {
        draw(cell, offset);
        continue;
      }
      const box = cell;
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
