// The font, which is a table and therefore a thing that can be wrong quietly.
//
// A glyph with a typo in it draws a letter that is not the letter, and nothing
// downstream notices — the strip is still a strip. So these check the shape of
// the table rather than the shape of any one letter: right size, no stray
// bits, and a width that matches what is actually drawn.

import {describe, expect, it} from 'vitest';

import {GLYPH_HEIGHT, GLYPH_WIDTH, KNOWN, textPixels, textWidth} from '../font';

describe('the demo font', () => {
  it('knows the letters, digits and space a demo may ask for', () => {
    for (const character of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ') {
      expect(KNOWN.has(character), character).toBe(true);
    }
  });

  it('draws nothing at all for a character it does not know', () => {
    // A gap rather than a box: a demo asking for one is missing a letter, and
    // a box would look like a rule drawing a box.
    expect([...textPixels('~', 2)]).toEqual([]);
  });

  it('folds case, so a demo may write what it means', () => {
    expect([...textPixels('score', 1)]).toEqual([...textPixels('SCORE', 1)]);
  });

  it('draws every letter inside the cell it advances by', () => {
    // The one way a bitmap table goes wrong silently: a row with a sixth bit
    // set draws into the next letter, and the word still looks like a word.
    for (const character of KNOWN) {
      for (const [x, y] of textPixels(character, 1)) {
        expect(x, character).toBeLessThan(GLYPH_WIDTH);
        expect(y, character).toBeLessThan(GLYPH_HEIGHT);
      }
    }
  });

  it('measures what it draws', () => {
    // `textWidth` centres the string, so a width that disagreed with the
    // drawing would put every label a few pixels off its actor.
    //
    // W is the letter to ask with: its rightmost column is lit, so the last
    // pixel it draws IS the string's right edge — the trailing gap between
    // letters is not part of the string, which is what the `- 1` in
    // `textWidth` is for.
    const widest = Math.max(...[...textPixels('WWW', 2)].map(([x]) => x));

    expect(textWidth('WWW', 2)).toBe(widest + 1);
    expect(textWidth('', 2)).toBe(0);
  });
});
