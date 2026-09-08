// Painting a drawing's commands onto a 2D canvas.
//
// The engine describes (specs/DRAWING.md, `core/drawing`) and this draws. Split
// from the TEXTURES that hold the results (`drawingTextures`) because those are
// Phaser's and this is not: it takes a context and a command list and touches
// nothing else. The import dialog's actor previews paint with it — in the lab,
// where Phaser is not loaded and must not be, since importing it there both
// grows the bundle and brings a library that reads a canvas as it initialises,
// which jsdom has none of.
//
// ONE PAINTER, so a preview of an actor and the actor in the game cannot
// disagree about what its drawing means.

import type {DrawCommand, TextAnchor} from 'world-lab';

/**
 * The typeface a drawing's text is set in.
 *
 * ONE LINE, deliberately. specs/DRAWING.md records that a bitmap font cut from
 * a sheet the project holds is the right long answer and that it needs an asset
 * pipeline this does not have yet; the blocks name what they want (`size`,
 * a color) rather than how a browser is asked for it, so replacing this
 * changes this file and no project file.
 */
const FONT_STACK = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

/**
 * The `font` a canvas is set to for text at `size`.
 *
 * EXPORTED so that whatever MEASURES text and whatever draws it cannot
 * disagree about what they are talking about. The engine can now ask how wide
 * a line is (`World.textWidth`) — a caret has to sit after the last letter,
 * and only the half holding the font knows where that is — and the measurer it
 * is handed sets this same string on a canvas of its own
 * (`runtime/driver/textMetrics`). Two font strings would be two fonts, in the
 * one place nobody would look.
 */
export const fontAt = (size: number): string => `${size}px ${FONT_STACK}`;

/** How far apart the lines of a wrapped block sit, as a multiple of the size. */
const LINE_SPACING = 1.25;

/**
 * `text` broken into lines that fit `width`, or one line when there is none.
 *
 * Words, never letters: a break inside a word is a typo the reader has to
 * un-see. A single word wider than the column stays on its own line and
 * overhangs, which is the least surprising of the wrong answers — the
 * alternative is hyphenating, and this lab has no dictionary.
 *
 * A newline the author typed is honoured as a break, so a two-line name plate
 * does not depend on the column being narrow enough.
 */
const wrapped = (
  context: CanvasRenderingContext2D,
  text: string,
  width: number | undefined,
): string[] => {
  if (width === undefined || width <= 0) {
    return [text];
  }
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > width) {
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

/** How an anchor maps onto the two things a canvas calls the same idea. */
const ALIGNMENT: Record<
  TextAnchor,
  {align: CanvasTextAlign; baseline: CanvasTextBaseline}
> = {
  'top left': {align: 'left', baseline: 'top'},
  top: {align: 'center', baseline: 'top'},
  'top right': {align: 'right', baseline: 'top'},
  left: {align: 'left', baseline: 'middle'},
  center: {align: 'center', baseline: 'middle'},
  right: {align: 'right', baseline: 'middle'},
  'bottom left': {align: 'left', baseline: 'bottom'},
  bottom: {align: 'center', baseline: 'bottom'},
  'bottom right': {align: 'right', baseline: 'bottom'},
};

/** Draw one command. Every command carries its own paint, so nothing persists. */
function draw(
  context: CanvasRenderingContext2D,
  command: DrawCommand,
  imageFor: (sprite: string) => CanvasImageSource | undefined,
): void {
  if (command.op === 'image') {
    const source = imageFor(command.sprite);
    if (!source) {
      return;
    }
    const cell = command.cell;
    if (cell) {
      // One rectangle of a spritesheet, drawn at its own size: a sheet is an
      // image some things read rectangles out of, which is the same thing
      // `set sprite` means by a cell.
      context.drawImage(
        source,
        cell.x,
        cell.y,
        cell.width,
        cell.height,
        command.x,
        command.y,
        cell.width,
        cell.height,
      );
      return;
    }
    context.drawImage(source, command.x, command.y);
    return;
  }
  if (command.stroke !== undefined) {
    context.strokeStyle = command.stroke;
    context.lineWidth = command.strokeWidth;
  }
  if (command.fill !== undefined) {
    context.fillStyle = command.fill;
  }
  switch (command.op) {
    case 'rectangle':
      if (command.fill !== undefined) {
        context.fillRect(command.x, command.y, command.width, command.height);
      }
      if (command.stroke !== undefined) {
        context.strokeRect(command.x, command.y, command.width, command.height);
      }
      return;
    case 'circle':
      context.beginPath();
      context.arc(
        command.x,
        command.y,
        Math.max(0, command.radius),
        0,
        Math.PI * 2,
      );
      if (command.fill !== undefined) {
        context.fill();
      }
      if (command.stroke !== undefined) {
        context.stroke();
      }
      return;
    case 'line':
      // A line has no interior, so it is drawn only when there is a color to
      // draw it in — which the pen guarantees by falling back to the fill.
      if (command.stroke === undefined) {
        return;
      }
      context.beginPath();
      context.moveTo(command.x1, command.y1);
      context.lineTo(command.x2, command.y2);
      context.stroke();
      return;
    case 'text': {
      const {align, baseline} = ALIGNMENT[command.anchor] ?? ALIGNMENT.center;
      context.font = fontAt(command.size);
      context.textAlign = align;
      context.textBaseline = baseline;
      // WHERE THE LINES BREAK IS DECIDED HERE, because this is the half
      // holding the measuring tape: the engine has no canvas and so no way to
      // ask how wide a word is. It says how wide the column may be; this works
      // out what fits (specs/DRAWING.md).
      const lines = wrapped(context, command.text, command.wrapWidth);
      // Under one another from the point given, which is what "one line under
      // another" means for every anchor: a box anchored at its top grows down,
      // and one anchored in the middle is centered as a block.
      const step = command.size * LINE_SPACING;
      const first =
        command.y -
        (baseline === 'middle' ? ((lines.length - 1) * step) / 2 : 0);
      lines.forEach((line, at) => {
        const y = first + at * step;
        // Outline first so a stroked letter is read over its own edge rather
        // than under it, which is what an outlined font looks like everywhere.
        if (command.stroke !== undefined) {
          context.strokeText(line, command.x, y);
        }
        if (command.fill !== undefined) {
          context.fillText(line, command.x, y);
        }
      });
      return;
    }
  }
}

/**
 * Run a whole command list onto a context.
 *
 * Shared with the map editor's thumbnails (`frameThumbnail`), which draw the
 * same picture at a different size: a palette entry showing something other
 * than what will land on the map would be a picker that lies.
 */
export function paintDrawing(
  context: CanvasRenderingContext2D,
  commands: readonly DrawCommand[],
  imageFor: (sprite: string) => CanvasImageSource | undefined,
): void {
  for (const command of commands) {
    context.save();
    draw(context, command, imageFor);
    context.restore();
  }
}
