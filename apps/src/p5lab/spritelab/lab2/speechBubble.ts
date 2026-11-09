// The say and think bubbles over a sprite, drawn for this lab in place of
// the shared library's: the page's font, one ink for the border and the
// text, room around the text, the bubble kept inside the view, and the
// tail one path with the bubble, leaning toward the speaker.

import {ellipsify} from '@cdo/apps/utils';

import {APP_HEIGHT, APP_WIDTH} from '../../constants';

// p5's own text rendering, the parts the drawing uses.
interface BubbleCanvas {
  push(): void;
  pop(): void;
  textFont(font: string): void;
  textSize(size: number): void;
  textAlign(horizontal: string, vertical: string): void;
  BASELINE: string;
  textWidth(text: string): number;
  fill(color: string): void;
  noStroke(): void;
  stroke(color: string): void;
  strokeWeight(weight: number): void;
  strokeJoin(join: string): void;
  text(text: string, x: number, y: number): void;
  rect(x: number, y: number, w: number, h: number, radius: number): void;
  ellipse(x: number, y: number, d: number): void;
  beginShape(): void;
  vertex(x: number, y: number): void;
  bezierVertex(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): void;
  endShape(mode: string): void;
  CENTER: string;
  TOP: string;
  ROUND: string;
  CLOSE: string;
}

/** The text's width at a size, in canvas pixels. */
export type MeasureText = (text: string, size: number) => number;

export interface BubbleLayout {
  lines: string[];
  textSize: number;
  lineHeight: number;
  /** The bubble's box. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** The say tail: its base along the bubble's bottom edge, and its tip. */
  tail: {baseLeft: number; baseRight: number; tipX: number; tipY: number};
}

export const MAX_TEXT_LENGTH = 150;
// Text sizes tried in turn; the first whose lines fit its count wins, and
// the smallest takes whatever is left.
const TEXT_SIZES: [size: number, maxLines: number][] = [
  [20, 2],
  [16, 4],
  [13, Infinity],
];
const LINE_HEIGHT = 1.25;
// The capitals' height as a share of the text size, about right for the
// page font: each line is centered on its capitals, so a line with no
// descenders sits as low in its box as one with.
const CAP_HEIGHT = 0.7;
// The text's room inside the bubble, as shares of the text size.
const PADDING_X = 0.7;
const PADDING_Y = 0.5;
// The widest the text runs before wrapping.
const MAX_TEXT_WIDTH = 240;
const MIN_WIDTH = 56;
export const RADIUS = 10;
export const STROKE = 2;
// The bubble keeps this far in from the view's edges, so its border is
// never cut off.
export const MARGIN = 4;
export const TAIL_HEIGHT = 12;
const TAIL_BASE = 14;
export const INK = '#222222';
const FILL = '#ffffff';
// The main page font; a fallback when the variable is not to be had.
const FONT_FALLBACK = "'Geist', 'Noto Sans', sans-serif";

/** The page's main font family, for the canvas. */
export function pageFont(): string {
  if (typeof getComputedStyle !== 'function' || !document.body) {
    return FONT_FALLBACK;
  }
  const family = getComputedStyle(document.body)
    .getPropertyValue('--font-family-main')
    .trim();
  return family || FONT_FALLBACK;
}

/** Breaks text into lines no wider than `maxWidth`, at spaces where it
    can, and inside a word that is itself too wide. */
export function wrapText(
  measure: MeasureText,
  text: string,
  size: number,
  maxWidth: number
): string[] {
  const fits = (s: string) => measure(s, size) <= maxWidth;
  const lines: string[] = [];
  let line = '';
  const place = (word: string) => {
    const joined = line ? `${line} ${word}` : word;
    if (fits(joined)) {
      line = joined;
      return;
    }
    if (line) {
      lines.push(line);
      line = '';
    }
    if (fits(word)) {
      line = word;
      return;
    }
    // Too wide alone: as many characters as fit, then the rest.
    let piece = '';
    for (const char of word) {
      if (piece && !fits(piece + char)) {
        lines.push(piece);
        piece = '';
      }
      piece += char;
    }
    line = piece;
  };
  text.split(/\s+/).filter(Boolean).forEach(place);
  if (line || lines.length === 0) {
    lines.push(line);
  }
  return lines;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * Where a bubble for `text` goes, spoken by a sprite whose top center is
 * (spriteX, spriteY): above the sprite, centered on it as far as the view
 * allows, the tail's tip at the sprite and its base leaning from the
 * bubble's center toward the tip.
 */
export function layoutSpeechBubble(
  measure: MeasureText,
  text: string,
  spriteX: number,
  spriteY: number,
  view = {width: APP_WIDTH, height: APP_HEIGHT}
): BubbleLayout {
  const shown = ellipsify(text, MAX_TEXT_LENGTH);
  let lines: string[] = [shown];
  let textSize = TEXT_SIZES[TEXT_SIZES.length - 1][0];
  for (const [size, maxLines] of TEXT_SIZES) {
    const wrapped = wrapText(measure, shown, size, MAX_TEXT_WIDTH);
    textSize = size;
    lines = wrapped;
    if (wrapped.length <= maxLines) {
      break;
    }
  }
  const lineHeight = Math.round(textSize * LINE_HEIGHT);
  const paddingX = Math.round(textSize * PADDING_X);
  const paddingY = Math.round(textSize * PADDING_Y);
  const textWidth = Math.max(...lines.map(line => measure(line, textSize)));
  const width = Math.max(MIN_WIDTH, Math.ceil(textWidth) + 2 * paddingX);
  const height = lines.length * lineHeight + 2 * paddingY;
  const x = clamp(spriteX - width / 2, MARGIN, view.width - MARGIN - width);
  const y = clamp(
    spriteY - TAIL_HEIGHT - height,
    MARGIN,
    view.height - MARGIN - height
  );
  const bottom = y + height;
  // The tail reaches the sprite, or only just past the bubble when the
  // sprite has come up into it.
  const tipY = Math.max(spriteY, bottom + 1);
  // Along the straight run of the bottom edge, inside the corners.
  const runLeft = x + RADIUS;
  const runRight = x + width - RADIUS;
  const tipX = clamp(spriteX, runLeft, runRight);
  // The base slides from under the tip toward the bubble's center: a tip
  // at the center gets a symmetric tail, one at the end of the run a tail
  // whose near edge stands straight, as a speaker off to that side reads.
  const lean = clamp((tipX - (x + width / 2)) / (width / 2 - RADIUS), -1, 1);
  let baseLeft = tipX - (TAIL_BASE * (1 + lean)) / 2;
  let baseRight = tipX + (TAIL_BASE * (1 - lean)) / 2;
  if (baseLeft < runLeft) {
    baseRight += runLeft - baseLeft;
    baseLeft = runLeft;
  } else if (baseRight > runRight) {
    baseLeft -= baseRight - runRight;
    baseRight = runRight;
  }
  return {
    lines,
    textSize,
    lineHeight,
    x,
    y,
    width,
    height,
    tail: {baseLeft, baseRight, tipX, tipY},
  };
}

// A quarter circle as a cubic curve.
const KAPPA = 0.5523;

// The bubble and its tail as one closed path, so the stroke runs unbroken
// where the tail meets the edge.
function sayPath(p5: BubbleCanvas, layout: BubbleLayout): void {
  const {x, y, width, height, tail} = layout;
  const r = RADIUS;
  const k = r * KAPPA;
  const right = x + width;
  const bottom = y + height;
  p5.beginShape();
  p5.vertex(x + r, y);
  p5.vertex(right - r, y);
  p5.bezierVertex(right - r + k, y, right, y + r - k, right, y + r);
  p5.vertex(right, bottom - r);
  p5.bezierVertex(
    right,
    bottom - r + k,
    right - r + k,
    bottom,
    right - r,
    bottom
  );
  p5.vertex(tail.baseRight, bottom);
  p5.vertex(tail.tipX, tail.tipY);
  p5.vertex(tail.baseLeft, bottom);
  p5.vertex(x + r, bottom);
  p5.bezierVertex(x + r - k, bottom, x, bottom - r + k, x, bottom - r);
  p5.vertex(x, y + r);
  p5.bezierVertex(x, y + r - k, x + r - k, y, x + r, y);
  p5.endShape(p5.CLOSE);
}

// A thought bubble: a rounder box and two circles trailing to the sprite.
function thinkShapes(p5: BubbleCanvas, layout: BubbleLayout): void {
  const {x, y, width, height, tail} = layout;
  p5.rect(x, y, width, height, RADIUS * 2);
  const centerX = x + width / 2;
  const topX = (tail.tipX + centerX) / 2;
  const bottomX = (tail.tipX + topX) / 2;
  const bottom = y + height;
  const reach = Math.max(1, tail.tipY - bottom);
  p5.ellipse(topX, bottom + reach * 0.35, Math.min(TAIL_HEIGHT, reach));
  p5.ellipse(bottomX, bottom + reach * 0.85, Math.min(TAIL_HEIGHT, reach) / 2);
}

/**
 * Draws a bubble for `text` over a sprite whose top center is (spriteX,
 * spriteY); `bubbleType` 'think' trails circles instead of a tail.
 */
export function drawSpeechBubble(
  p5: BubbleCanvas,
  text: unknown,
  spriteX: number,
  spriteY: number,
  bubbleType?: string
): BubbleLayout {
  const shown =
    typeof text === 'string'
      ? text
      : typeof text === 'number'
      ? String(text)
      : '';
  const font = pageFont();
  p5.push();
  p5.textFont(font);
  const measure: MeasureText = (s, size) => {
    p5.textSize(size);
    return p5.textWidth(s);
  };
  const layout = layoutSpeechBubble(measure, shown, spriteX, spriteY);
  p5.stroke(INK);
  p5.strokeWeight(STROKE);
  p5.strokeJoin(p5.ROUND);
  p5.fill(FILL);
  if (bubbleType === 'think') {
    thinkShapes(p5, layout);
  } else {
    sayPath(p5, layout);
  }
  p5.noStroke();
  p5.fill(INK);
  p5.textSize(layout.textSize);
  p5.textAlign(p5.CENTER, p5.BASELINE);
  const paddingY =
    (layout.height - layout.lines.length * layout.lineHeight) / 2;
  // Each line's capitals centered in its own line box.
  const baseline = (layout.lineHeight + CAP_HEIGHT * layout.textSize) / 2;
  layout.lines.forEach((line, i) =>
    p5.text(
      line,
      layout.x + layout.width / 2,
      layout.y + paddingY + baseline + i * layout.lineHeight
    )
  );
  p5.pop();
  return layout;
}
