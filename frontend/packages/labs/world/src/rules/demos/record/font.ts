// A five-by-seven font, because a rectangle cannot stand in for a word.
//
// Every other demo says what its rule does by moving a box. Writing's rule puts
// TEXT on an actor, and a box that changes size is not a demonstration of text
// — it is a demonstration of a box. So the strip writer learns letters
// (specs/RULE_DEMOS.md).
//
// Five by seven is the smallest grid that keeps every glyph distinct at this
// size, and it is the shape of the fonts that shipped on the machines these
// demos are drawn to look like. Scaled by whole pixels only: half a pixel of a
// letter is a smudge, and there is no anti-aliasing here to hide it in.
//
// UPPER CASE, DIGITS AND A LITTLE PUNCTUATION, and no more. Lower case doubles
// the table for glyphs no demo has wanted, and descenders would need an eighth
// row for the two letters that use it. A character with no glyph draws as
// nothing rather than as a box, so a demo that asks for one is missing a
// letter rather than showing a mistake — and `KNOWN` is exported so a test can
// say which characters a demo may use.

/**
 * Each glyph as seven rows of five bits, high bit leftmost.
 *
 * Written as binary literals so the shape of a letter is the shape of its
 * source, which is the only way a table this size stays readable — and is how
 * every bitmap font since the 1970s has been written down.
 */
const GLYPHS: Record<string, readonly number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  ':': [0, 0b00100, 0b00100, 0, 0b00100, 0b00100, 0],
  '.': [0, 0, 0, 0, 0, 0b00100, 0b00100],
  '-': [0, 0, 0, 0b01110, 0, 0, 0],
  '!': [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0, 0b00100],
};

export const GLYPH_WIDTH = 5;
export const GLYPH_HEIGHT = 7;
/** One blank column between letters, so words do not run together. */
export const GLYPH_ADVANCE = GLYPH_WIDTH + 1;

/** Every character this font can draw. */
export const KNOWN = new Set(Object.keys(GLYPHS));

/** How wide `text` is drawn, in pixels, at `scale`. */
export function textWidth(text: string, scale: number): number {
  return text.length === 0 ? 0 : (text.length * GLYPH_ADVANCE - 1) * scale;
}

/**
 * Which pixels a string lights, as `[x, y]` offsets from its top-left.
 *
 * A generator of points rather than a blit, so the caller owns the clipping
 * and the colour — the strip writer already does both for boxes, and text
 * that clipped differently from a box would be a second set of edge cases.
 */
export function* textPixels(
  text: string,
  scale: number,
): Generator<readonly [number, number]> {
  for (let index = 0; index < text.length; index++) {
    const glyph = GLYPHS[text[index].toUpperCase()];
    if (!glyph) {
      continue;
    }
    const originX = index * GLYPH_ADVANCE * scale;
    for (let row = 0; row < GLYPH_HEIGHT; row++) {
      for (let column = 0; column < GLYPH_WIDTH; column++) {
        if (!(glyph[row] & (1 << (GLYPH_WIDTH - 1 - column)))) {
          continue;
        }
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            yield [originX + column * scale + x, row * scale + y] as const;
          }
        }
      }
    }
  }
}
