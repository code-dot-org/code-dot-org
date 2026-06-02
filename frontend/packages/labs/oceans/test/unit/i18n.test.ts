import {beforeEach, describe, expect, it} from 'vitest';

import I18n from '../../src/oceans/i18n';

describe('initI18n', () => {
  beforeEach(() => {
    I18n.initI18n();
  });

  it('returns English for a key when no strings are supplied', () => {
    expect(I18n.t('fishvtrash-training-init2')).toContain('meet A.I.');
  });

  it('returns the supplied string when a key is present', () => {
    I18n.initI18n({'fishvtrash-training-init2': 'Rencontrons l’IA'}, 'fr');
    expect(I18n.t('fishvtrash-training-init2')).toBe('Rencontrons l’IA');
  });

  it('falls back to English for keys absent from the supplied strings', () => {
    I18n.initI18n({'fishvtrash-training-init2': 'translation'}, 'fr');
    // init1 was not overridden — must use the English default
    expect(I18n.t('fishvtrash-training-init1')).toContain('Garbage');
  });

  it('resolves ICU plural key fishshort-pond-init1 with a non-English locale', () => {
    // French: singular for 0 and 1, plural otherwise — different from English (plural for 0).
    I18n.initI18n({}, 'fr');
    expect(() =>
      I18n.t('fishshort-pond-init1', {n: 0, word: 'test'}),
    ).not.toThrow();
    expect(I18n.t('fishshort-pond-init1', {n: 0, word: 'test'})).toContain(
      'this',
    );
    expect(I18n.t('fishshort-pond-init1', {n: 2, word: 'test'})).toContain(
      'these',
    );
  });

  it('resolves ICU plural key fishlong-pond-init1 with a non-English locale', () => {
    I18n.initI18n({}, 'de');
    expect(() =>
      I18n.t('fishlong-pond-init1', {n: 1, word: 'test'}),
    ).not.toThrow();
  });

  it('compiles pre-compiled preCompiled overrides on top of raw strings', () => {
    const compiled = () => 'overridden by pre-compiled';
    I18n.initI18n({'fishvtrash-training-init2': 'raw string'}, 'en', {
      'fishvtrash-training-init2': compiled,
    });
    expect(I18n.t('fishvtrash-training-init2')).toBe(
      'overridden by pre-compiled',
    );
  });
});
