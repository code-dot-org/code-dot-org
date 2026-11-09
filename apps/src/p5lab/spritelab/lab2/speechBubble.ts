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

/** The part of the world on screen, in world coordinates. */
export interface BubbleView {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The text's lines, size and the box they need; the same for every
    bubble that says the same thing. */
export interface TextLayout {
  lines: string[];
  textSize: number;
  lineHeight: number;
  paddingY: number;
  width: number;
  height: number;
}

export interface BubbleLayout extends TextLayout {
  /** The bubble's box. */
  x: number;
  y: number;
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
// The tail's tip stands this far from the speaker's center, on the side the
// tail leans away from.
export const TAIL_LEAD = 5;
export const INK = '#222222';
const FILL = '#ffffff';
// The main page font; a fallback when the variable is not to be had.
const FONT_FALLBACK = "'Geist', 'Noto Sans', sans-serif";
const WORLD_VIEW: BubbleView = {
  x: 0,
  y: 0,
  width: APP_WIDTH,
  height: APP_HEIGHT,
};
// Text layouts by text, so a bubble is wrapped and measured once, not on
// every frame it shows.
const TEXT_LAYOUTS = new Map<string, TextLayout>();
const TEXT_LAYOUTS_KEPT = 64;

// Reading the variable forces a style recalculation, so it is read once it
// is there.
let pageFontRead: string | null = null;

/** The page's main font family, for the canvas. */
export function pageFont(): string {
  if (pageFontRead) {
    return pageFontRead;
  }
  if (typeof getComputedStyle !== 'function' || !document.body) {
    return FONT_FALLBACK;
  }
  const family = getComputedStyle(document.body)
    .getPropertyValue('--font-family-main')
    .trim();
  if (family) {
    pageFontRead = family;
  }
  return family || FONT_FALLBACK;
}

// What a too-wide word breaks between: whole glyph clusters where the
// browser can tell them apart, so a joined emoji or an accented letter is
// not cut in two; code points elsewhere.
function graphemes(word: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return [...new Intl.Segmenter().segment(word)].map(part => part.segment);
  }
  return [...word];
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
    for (const char of graphemes(word)) {
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

// The first size whose line count fits; the last size takes any count.
function fitText(
  measure: MeasureText,
  text: string
): {textSize: number; lines: string[]} {
  for (const [size, maxLines] of TEXT_SIZES.slice(0, -1)) {
    const lines = wrapText(measure, text, size, MAX_TEXT_WIDTH);
    if (lines.length <= maxLines) {
      return {textSize: size, lines};
    }
  }
  const [size] = TEXT_SIZES[TEXT_SIZES.length - 1];
  return {textSize: size, lines: wrapText(measure, text, size, MAX_TEXT_WIDTH)};
}

/** The lines `text` wraps to and the box around them. */
export function layoutBubbleText(
  measure: MeasureText,
  text: string
): TextLayout {
  const kept = TEXT_LAYOUTS.get(text);
  if (kept) {
    return kept;
  }
  const {textSize, lines} = fitText(measure, ellipsify(text, MAX_TEXT_LENGTH));
  const lineHeight = Math.round(textSize * LINE_HEIGHT);
  const paddingX = Math.round(textSize * PADDING_X);
  const paddingY = Math.round(textSize * PADDING_Y);
  const textWidth = Math.max(...lines.map(line => measure(line, textSize)));
  const layout = {
    lines,
    textSize,
    lineHeight,
    paddingY,
    width: Math.max(MIN_WIDTH, Math.ceil(textWidth) + 2 * paddingX),
    height: lines.length * lineHeight + 2 * paddingY,
  };
  if (TEXT_LAYOUTS.size >= TEXT_LAYOUTS_KEPT) {
    TEXT_LAYOUTS.delete(TEXT_LAYOUTS.keys().next().value as string);
  }
  TEXT_LAYOUTS.set(text, layout);
  return layout;
}

/**
 * Where a bubble for `text` goes, spoken by a sprite whose top center is
 * (spriteX, spriteY): above the sprite, centered on it as far as the view
 * allows, the tail's tip at the sprite and its base leaning from the
 * bubble's center toward the tip. Whole pixels, so the stroke is crisp.
 */
export function layoutSpeechBubble(
  measure: MeasureText,
  text: string,
  spriteX: number,
  spriteY: number,
  view: BubbleView = WORLD_VIEW
): BubbleLayout {
  const textLayout = layoutBubbleText(measure, text);
  const {width, height} = textLayout;
  const centered = spriteX - width / 2;
  const rightmost = view.x + view.width - MARGIN - width;
  const x = Math.round(clamp(centered, view.x + MARGIN, rightmost));
  // Bumped against the view's right edge, the bubble sits left of the
  // speaker, and the tail takes its mirror shape.
  const pushedLeft = centered > rightmost;
  const y = Math.round(
    clamp(
      spriteY - TAIL_HEIGHT - height,
      view.y + MARGIN,
      view.y + view.height - MARGIN - height
    )
  );
  const bottom = y + height;
  // The tail reaches the sprite, or only just past the bubble when the
  // sprite has come up into it, and no further than the view's bottom edge
  // when the sprite has gone below it.
  const tipY = Math.round(
    clamp(
      spriteY,
      bottom + 1,
      Math.max(bottom + 1, view.y + view.height - MARGIN)
    )
  );
  // Along the straight run of the bottom edge, inside the corners.
  const runLeft = x + RADIUS;
  const runRight = x + width - RADIUS;
  // The tail's near edge stands straight down from the base to the tip and
  // its far edge leans: the left edge straight and the base right of the
  // tip, as a speaker at the left of a bubble reads, or the mirror of that
  // when the bubble has been pushed left of the speaker. The tip slides
  // along the run with the speaker.
  const tipX = Math.round(
    clamp(spriteX + (pushedLeft ? -TAIL_LEAD : TAIL_LEAD), runLeft, runRight)
  );
  let baseLeft = pushedLeft ? tipX - TAIL_BASE : tipX;
  let baseRight = pushedLeft ? tipX : tipX + TAIL_BASE;
  if (baseLeft < runLeft) {
    baseRight += runLeft - baseLeft;
    baseLeft = runLeft;
  } else if (baseRight > runRight) {
    baseLeft -= baseRight - runRight;
    baseRight = runRight;
  }
  return {...textLayout, x, y, tail: {baseLeft, baseRight, tipX, tipY}};
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
  const size = Math.min(TAIL_HEIGHT, reach);
  // The top circle hangs from the edge, never up into the box.
  p5.ellipse(topX, bottom + Math.max(reach * 0.35, size / 2), size);
  p5.ellipse(bottomX, bottom + reach * 0.85, size / 2);
}

/**
 * Draws a bubble for `text` over a sprite whose top center is (spriteX,
 * spriteY), kept inside `view`; `bubbleType` 'think' trails circles instead
 * of a tail.
 */
export function drawSpeechBubble(
  p5: BubbleCanvas,
  text: unknown,
  spriteX: number,
  spriteY: number,
  bubbleType?: string,
  view?: BubbleView
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
  const layout = layoutSpeechBubble(measure, shown, spriteX, spriteY, view);
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
  // Each line's capitals centered in its own line box.
  const baseline = (layout.lineHeight + CAP_HEIGHT * layout.textSize) / 2;
  layout.lines.forEach((line, i) =>
    p5.text(
      line,
      layout.x + layout.width / 2,
      layout.y + layout.paddingY + baseline + i * layout.lineHeight
    )
  );
  p5.pop();
  return layout;
}
