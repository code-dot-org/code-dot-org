import {describe, expect, it} from 'vitest';

import {checkSlugCollision, mintSlug} from '../slug.js';

describe('mintSlug', () => {
  it('converts snake_case to kebab-case', () => {
    expect(mintSlug('pick_your_blocks')).toBe('pick-your-blocks');
  });

  it('lowercases and strips punctuation', () => {
    expect(mintSlug('Check Understanding!')).toBe('check-understanding');
  });

  it('collapses repeated separators', () => {
    expect(mintSlug('a__b--c')).toBe('a-b-c');
  });

  it('trims leading and trailing separators', () => {
    expect(mintSlug('_leading_and_trailing_')).toBe('leading-and-trailing');
  });

  it('falls back to "widget" for an all-punctuation name', () => {
    expect(mintSlug('!!!')).toBe('widget');
  });
});

describe('checkSlugCollision', () => {
  it('accepts a slug with no existing match', () => {
    const result = checkSlugCollision('pick-your-blocks', ['other-widget']);
    expect(result).toEqual({ok: true, slug: 'pick-your-blocks'});
  });

  it('refuses a collision and suggests a numbered alternative', () => {
    const result = checkSlugCollision('pick-your-blocks', ['pick-your-blocks']);
    expect(result).toEqual({
      ok: false,
      reason: 'a widget named "pick-your-blocks" already exists in the catalog',
      suggestion: 'pick-your-blocks-2',
    });
  });

  it('skips already-taken numbered suggestions', () => {
    const result = checkSlugCollision('widget', [
      'widget',
      'widget-2',
      'widget-3',
    ]);
    expect(result).toEqual({
      ok: false,
      reason: 'a widget named "widget" already exists in the catalog',
      suggestion: 'widget-4',
    });
  });
});
