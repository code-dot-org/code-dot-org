import {describe, expect, it} from 'vitest';

// @ts-expect-error apps' theme module has no types.
import * as apps from '../../../../../../apps/src/blockly/themes/cdoAccessibleStyles.js';
import type {Theme} from '../../types';
import {
  defaultTheme,
  highContrastTheme,
  highContrastDarkTheme,
  isDarkTheme,
  protanopiaTheme,
  themeOptions,
  themes,
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

describe('themes.md: fonts', () => {
  it('THM-8: uses the default font size for the default theme', () => {
    expect(defaultTheme.instance.fontStyle?.size).toBe(DEFAULT_FONT_SIZE);
  });

  it('THM-8: bumps the font size for high contrast (light and dark)', () => {
    expect(highContrastTheme.instance.fontStyle?.size).toBe(
      HIGH_CONTRAST_FONT_SIZE,
    );
    expect(highContrastDarkTheme.instance.fontStyle?.size).toBe(
      HIGH_CONTRAST_FONT_SIZE,
    );
  });

  it('THM-8: keeps the default font family and weight in high contrast', () => {
    expect(highContrastTheme.instance.fontStyle?.family).toBe(
      defaultTheme.instance.fontStyle?.family,
    );
    expect(highContrastTheme.instance.fontStyle?.weight).toBe(
      defaultTheme.instance.fontStyle?.weight,
    );
  });

  it('THM-8: leaves the other accessible themes at the default font size', () => {
    // protanopia/deuteranopia/tritanopia derive from Blockly's Classic base,
    // not the high-contrast base, so they intentionally do not get the bump.
    expect(protanopiaTheme.instance.fontStyle?.size).toBe(DEFAULT_FONT_SIZE);
  });
});

const REQUIRED_STYLES = [
  'default',
  'setup_blocks',
  'event_blocks',
  'loop_blocks',
  'logic_blocks',
  'procedure_blocks',
  'variable_blocks',
  'math_blocks',
  'text_blocks',
  'colour_blocks',
  'sprite_blocks',
  'world_blocks',
  'behavior_blocks',
  'location_blocks',
  'lab_blocks',
  'comment_blocks',
  'ai_blocks',
];

describe('themes.md: the set', () => {
  it('THM-1, THM-2: the theme names', () => {
    expect(Object.keys(themes)).toEqual([
      'default',
      'default-dark',
      'high-contrast',
      'high-contrast-dark',
      'protanopia',
      'protanopia-dark',
      'deuteranopia',
      'deuteranopia-dark',
      'tritanopia',
      'tritanopia-dark',
    ]);
    for (const [name, theme] of Object.entries(themes)) {
      expect(theme.definition.name).toBe(name);
      expect(theme.instance.name).toBe(name);
    }
  });

  it('THM-1: every theme has a label of its own', () => {
    const labels = Object.values(themes).map(theme => theme.definition.option);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('THM-3, THM-4, THM-5: each offered theme has a dark variant, and only the variants are dark', () => {
    expect(themeOptions.map(option => option.value)).toEqual([
      'default',
      'high-contrast',
      'protanopia',
      'deuteranopia',
      'tritanopia',
    ]);
    for (const {value, text} of themeOptions) {
      expect(text).toBe(themes[value].definition.option);
      expect(isDarkTheme(themes[value].instance)).toBe(false);
      expect(isDarkTheme(themes[`${value}-dark`].instance)).toBe(true);
    }
  });

  it('THM-6: every theme names every required style', () => {
    for (const theme of Object.values(themes) as Theme[]) {
      expect(Object.keys(theme.definition.blockStyles)).toEqual(
        expect.arrayContaining(REQUIRED_STYLES),
      );
    }
  });

  it('THM-9: the dark variants share the dark component colours', () => {
    for (const {value} of themeOptions) {
      expect(themes[`${value}-dark`].definition.componentStyles).toEqual(
        themes['default-dark'].definition.componentStyles,
      );
    }
  });

  it("THM-11: the colour-blindness palettes are apps'", () => {
    const palettes = apps as Record<
      string,
      Record<string, {colourPrimary: string}>
    >;
    for (const name of ['protanopia', 'deuteranopia', 'tritanopia']) {
      const theirs = palettes[`${name}BlockStyles`];
      const ours = themes[name].definition.blockStyles as unknown as Record<
        string,
        {colourPrimary: string}
      >;
      for (const [style, {colourPrimary}] of Object.entries(theirs)) {
        expect(ours[style].colourPrimary.toLowerCase()).toBe(
          colourPrimary.toLowerCase(),
        );
      }
      expect(themes[`${name}-dark`].definition.blockStyles).toEqual(
        themes[name].definition.blockStyles,
      );
    }
  });
});
