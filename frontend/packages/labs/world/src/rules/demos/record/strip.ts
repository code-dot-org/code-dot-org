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
// Player as a gray rectangle would demonstrate a rectangle.
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
// same color a box would have had.

import type {DrawCommand} from 'world-lab';

import {GLYPH_ADVANCE, GLYPH_HEIGHT, textPixels, textWidth} from './font';

/** One actor at one moment, as much of it as a box needs. */
export interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: [number, number, number];
  /**
   * A string to draw INSTEAD of the rectangle, centered where the box was.
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

/**
 * One actor at one moment, drawn from the commands its kind describes.
 *
 * The third and last thing an actor can be on screen (specs/DRAWING.md): it
 * wears a picture, it wears nothing, or it DRAWS itself — a Label, a bar, a
 * Speech Box. The driver rasterizes those commands with a canvas; this
 * rasterizes them with arithmetic, because a build step has no canvas.
 *
 * `scale` is how many strip pixels one drawing pixel is, so everything else
 * here is in the drawing's own coordinates and reads like the file that wrote
 * it.
 */
export interface Drawing {
  id: string;
  /** The actor's middle, in strip pixels, as everything else's is. */
  x: number;
  y: number;
  /** The drawing's canvas, in ITS coordinates — 64 by 8 for a bar. */
  width: number;
  height: number;
  scale: number;
  opacity?: number;
  commands: readonly DrawCommand[];
}

/** What a frame is made of: filled boxes, lettering, pictures and drawings. */
export type Cell = Box | Picture | Drawing;

const isPicture = (cell: Cell): cell is Picture => 'pixels' in cell;
const isDrawing = (cell: Cell): cell is Drawing => 'commands' in cell;

/**
 * A CSS color as bytes, for the colors a drawing carries.
 *
 * `#rgb` and `#rrggbb`, which is what every stock drawing writes and what the
 * color field a learner edits produces. Anything else THROWS rather than
 * guessing: a demo drawn in the wrong color is a demo that lies quietly, and
 * the day a drawing says `rgba(…)` is the day this should learn it on purpose.
 */
const colorOf = (css: string): [number, number, number] => {
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(css);
  if (short) {
    return [
      parseInt(short[1] + short[1], 16),
      parseInt(short[2] + short[2], 16),
      parseInt(short[3] + short[3], 16),
    ];
  }
  if (/^#[0-9a-f]{6}$/i.test(css)) {
    return rgb(css);
  }
  throw new Error(`the strip writer cannot read the color "${css}"`);
};

export interface StripSize {
  width: number;
  height: number;
}

/** How far apart wrapped lines sit, as a multiple of the glyph height. */
const LINE_SPACING = 1.25;

/**
 * `text` broken into lines of at most `columns` characters, words kept whole.
 *
 * The driver measures; this counts, because the font it draws in is one width
 * per character. A word longer than the column stays on its own line and
 * overhangs, which is the same answer the driver gives and the least
 * surprising of the wrong ones.
 */
const wrapped = (text: string, columns: number | undefined): string[] => {
  if (columns === undefined || columns < 1) {
    return text.split('\n');
  }
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && candidate.length > columns) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
};

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
  // The ground color, everywhere, before anything is drawn on it.
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
    color: readonly [number, number, number],
  ) => {
    if (x < 0 || x >= size.width || y < 0 || y >= size.height) {
      return;
    }
    const at = (y * stripWidth + offset + x) * 4;
    pixels[at] = color[0];
    pixels[at + 1] = color[1];
    pixels[at + 2] = color[2];
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
    color: readonly [number, number, number],
    alpha: number,
  ) => {
    if (alpha <= 0 || x < 0 || x >= size.width || y < 0 || y >= size.height) {
      return;
    }
    if (alpha >= 1) {
      put(x, y, offset, color);
      return;
    }
    const at = (y * stripWidth + offset + x) * 4;
    for (let channel = 0; channel < 3; channel++) {
      pixels[at + channel] = Math.round(
        color[channel] * alpha + pixels[at + channel] * (1 - alpha),
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

  /**
   * Rasterize a drawing's commands.
   *
   * The same five operations the driver's painter takes (`core/drawing`), in
   * the same order they arrive, with the same last-writer-wins overlap — so
   * what differs between this and the game is the anti-aliasing and the
   * typeface, and not what is drawn on top of what.
   *
   * TEXT IS THE BITMAP FONT, upper case and blocky, where the game sets it in
   * a real one. A demo of a Label has to show a word; five by seven is the
   * word, and the alternative is a browser in the build path to render one
   * string (specs/RULE_DEMOS.md).
   */
  const describe = (drawing: Drawing, offset: number) => {
    const {scale} = drawing;
    const left = drawing.x - (drawing.width * scale) / 2;
    const top = drawing.y - (drawing.height * scale) / 2;
    const opacity = drawing.opacity ?? 1;
    /** A point of the drawing, in strip pixels. */
    const at = (x: number, y: number) =>
      [Math.round(left + x * scale), Math.round(top + y * scale)] as const;
    const spot = (
      x: number,
      y: number,
      color: readonly [number, number, number],
      weight: number,
    ) => {
      // A stroke is drawn as a square brush, which is what a whole-pixel
      // renderer can honestly do with a line width.
      const arm = Math.max(0, Math.round((weight * scale) / 2) - 1);
      for (let dy = -arm; dy <= arm; dy++) {
        for (let dx = -arm; dx <= arm; dx++) {
          blend(x + dx, y + dy, offset, color, opacity);
        }
      }
    };

    for (const command of drawing.commands) {
      const fill = 'fill' in command && command.fill;
      const stroke = 'stroke' in command && command.stroke;
      const weight =
        ('strokeWidth' in command ? command.strokeWidth : undefined) ?? 1;

      if (command.op === 'rectangle') {
        const [x0, y0] = at(command.x, command.y);
        const [x1, y1] = at(
          command.x + command.width,
          command.y + command.height,
        );
        if (fill) {
          const color = colorOf(fill);
          for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
              blend(x, y, offset, color, opacity);
            }
          }
        }
        if (stroke) {
          const color = colorOf(stroke);
          for (let x = x0; x < x1; x++) {
            spot(x, y0, color, weight);
            spot(x, y1 - 1, color, weight);
          }
          for (let y = y0; y < y1; y++) {
            spot(x0, y, color, weight);
            spot(x1 - 1, y, color, weight);
          }
        }
        continue;
      }

      if (command.op === 'circle') {
        const [cx, cy] = at(command.x, command.y);
        const radius = command.radius * scale;
        const fillColor = fill ? colorOf(fill) : undefined;
        const strokeColor = stroke ? colorOf(stroke) : undefined;
        const arm = Math.ceil(radius) + 1;
        for (let y = -arm; y <= arm; y++) {
          for (let x = -arm; x <= arm; x++) {
            const distance = Math.sqrt(x * x + y * y);
            if (fillColor && distance <= radius) {
              blend(cx + x, cy + y, offset, fillColor, opacity);
            }
            if (strokeColor && Math.abs(distance - radius) <= weight / 2) {
              blend(cx + x, cy + y, offset, strokeColor, opacity);
            }
          }
        }
        continue;
      }

      if (command.op === 'line') {
        if (!stroke) {
          continue;
        }
        const color = colorOf(stroke);
        const [x0, y0] = at(command.x1, command.y1);
        const [x1, y1] = at(command.x2, command.y2);
        const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
        for (let step = 0; step <= steps; step++) {
          spot(
            Math.round(x0 + ((x1 - x0) * step) / steps),
            Math.round(y0 + ((y1 - y0) * step) / steps),
            color,
            weight,
          );
        }
        continue;
      }

      if (command.op === 'text') {
        if (!fill) {
          continue;
        }
        const color = colorOf(fill);
        // Whole pixels, and at least one: a glyph scaled by a fraction is a
        // smudge, and one scaled to nothing is a gap.
        const glyphScale = Math.max(
          1,
          Math.round((command.size * scale) / GLYPH_HEIGHT),
        );
        const height = GLYPH_HEIGHT * glyphScale;
        const [x, y] = at(command.x, command.y);
        const anchor = command.anchor;
        // WHERE THE LINES BREAK is the drawer's business, as it is the
        // driver's, and for the same reason: the engine says how wide the
        // column may be and whoever holds the measuring tape decides what fits
        // (specs/DRAWING.md). This tape is a fixed-width font, so the answer is
        // division rather than measurement.
        const lines = wrapped(
          command.text,
          command.wrapWidth === undefined
            ? undefined
            : (command.wrapWidth * scale) / (GLYPH_ADVANCE * glyphScale),
        );
        const step = Math.round(height * LINE_SPACING);
        // Under one another from the point given, and centered as a BLOCK for
        // the anchors that center — the same arithmetic the driver does.
        const middle = !anchor.includes('top') && !anchor.includes('bottom');
        const first = middle ? y - ((lines.length - 1) * step) / 2 : y;
        lines.forEach((line, index) => {
          const width = textWidth(line, glyphScale);
          const originX = anchor.includes('left')
            ? x
            : anchor.includes('right')
              ? x - width
              : x - width / 2;
          const lineY = first + index * step;
          const originY = anchor.includes('bottom')
            ? lineY - height
            : middle
              ? lineY - height / 2
              : lineY;
          for (const [dx, dy] of textPixels(line, glyphScale)) {
            blend(
              Math.round(originX) + dx,
              Math.round(originY) + dy,
              offset,
              color,
              opacity,
            );
          }
        });
        continue;
      }

      // `image`, which a stock drawing has never used: a picture inside a
      // drawing is a sprite the actor could have worn. Say so rather than
      // record a hole.
      throw new Error(
        `the strip writer cannot draw a "${command.op}" command yet`,
      );
    }
  };

  frames.forEach((frame, index) => {
    const offset = index * size.width;
    for (const cell of frame) {
      if (isPicture(cell)) {
        draw(cell, offset);
        continue;
      }
      if (isDrawing(cell)) {
        describe(cell, offset);
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
          put(left + x, top + y, offset, box.color);
        }
        continue;
      }
      // Positions are the actor's MIDDLE, as everything in the engine is.
      const left = Math.round(box.x - box.width / 2);
      const top = Math.round(box.y - box.height / 2);
      for (let y = top; y < top + box.height; y++) {
        for (let x = left; x < left + box.width; x++) {
          put(x, y, offset, box.color);
        }
      }
    }
  });

  return pixels;
}
