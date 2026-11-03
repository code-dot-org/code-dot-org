import {describe, expect, it} from 'vitest';

import {
  defaultTheme,
  highContrastTheme,
  highContrastDarkTheme,
  protanopiaTheme,
} from '../index';

/*
 * The high-contrast themes use a larger font for legibility. That size comes
 * from the base @blockly/theme-highcontrast theme (16), and is preserved only
 * because our high-contrast definitions omit `size` from their own fontStyle —
 * Blockly's defineTheme merges the base fontStyle first, so a spread-in default
 * `size: 11` would otherwise override it. These tests guard that bump.
 */

const DEFAULT_FONT_SIZE = 11;
const HIGH_CONTRAST_FONT_SIZE = 16;

describe('themes', () => {
  it('uses the default font size for the default theme', () => {
    expect(defaultTheme.instance.fontStyle?.size).toBe(DEFAULT_FONT_SIZE);
  });

  it('bumps the font size for high contrast (light and dark)', () => {
    expect(highContrastTheme.instance.fontStyle?.size).toBe(
      HIGH_CONTRAST_FONT_SIZE,
    );
    expect(highContrastDarkTheme.instance.fontStyle?.size).toBe(
      HIGH_CONTRAST_FONT_SIZE,
    );
  });

  it('keeps the default font family and weight in high contrast', () => {
    expect(highContrastTheme.instance.fontStyle?.family).toBe(
      defaultTheme.instance.fontStyle?.family,
    );
    expect(highContrastTheme.instance.fontStyle?.weight).toBe(
      defaultTheme.instance.fontStyle?.weight,
    );
  });

  it('leaves the other accessible themes at the default font size', () => {
    // protanopia/deuteranopia/tritanopia derive from Blockly's Classic base,
    // not the high-contrast base, so they intentionally do not get the bump.
    expect(protanopiaTheme.instance.fontStyle?.size).toBe(DEFAULT_FONT_SIZE);
  });
});
