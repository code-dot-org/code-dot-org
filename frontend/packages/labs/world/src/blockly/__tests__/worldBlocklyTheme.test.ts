import {describe, expect, it} from 'vitest';

import {blocklyThemeName} from '../worldBlocklyTheme';

describe('blocklyThemeName', () => {
  it('returns the base theme in light mode', () => {
    expect(blocklyThemeName('default', false)).toBe('default');
    expect(blocklyThemeName('high-contrast', false)).toBe('high-contrast');
  });

  it('returns the dark variant in dark mode', () => {
    expect(blocklyThemeName('default', true)).toBe('default-dark');
    expect(blocklyThemeName('high-contrast', true)).toBe('high-contrast-dark');
    expect(blocklyThemeName('tritanopia', true)).toBe('tritanopia-dark');
  });

  it('falls back to the default theme for an unknown base', () => {
    expect(blocklyThemeName('nonesuch', false)).toBe('default');
    expect(blocklyThemeName('nonesuch', true)).toBe('default');
  });
});
