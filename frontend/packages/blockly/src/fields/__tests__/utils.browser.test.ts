import {describe, expect, it} from 'vitest';

import {measureTextWidth} from '../utils';

/*
 * measureTextWidth delegates to Blockly's canvas-backed text measurement, which
 * jsdom cannot do, so it runs in a real browser. constants is passed as null to
 * exercise the font-weight/family fallbacks.
 */

describe('measureTextWidth', () => {
  it('measures empty text as zero and wider strings as wider', () => {
    const empty = measureTextWidth('', 13, null);
    const narrow = measureTextWidth('i', 13, null);
    const wide = measureTextWidth('wwwwwwwwww', 13, null);

    expect(empty).toBe(0);
    expect(narrow).toBeGreaterThan(0);
    expect(wide).toBeGreaterThan(narrow);
  });
});
