import {afterEach, describe, expect, it, vi} from 'vitest';

import {localization} from '@code-dot-org/core/plugins/localization';

import I18n from '@/oceans/i18n';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('I18n.t', () => {
  it('translates the formatted English with the oceans label', () => {
    const translate = vi
      .spyOn(localization, 'translate')
      .mockImplementation(key => `[${key}]`);
    I18n.initI18n();

    expect(I18n.t('continue')).toBe('[Continue]');
    expect(translate).toHaveBeenCalledWith('Continue', ['oceans']);
  });

  it('falls back to English when LocalizeJS is absent', () => {
    I18n.initI18n();
    expect(I18n.t('continue')).toBe('Continue');
  });

  it('translates "Not {word}" as a unique phrase', () => {
    const translate = vi
      .spyOn(localization, 'translate')
      .mockImplementation(key => `No ${String(key).slice(4)}`);
    I18n.initI18n();

    expect(I18n.t('notWord', {word: 'azul'})).toBe('No azul');
    expect(translate).toHaveBeenCalledWith('Not oceans-word:azul', ['oceans']);
  });

  it('returns host overrides verbatim', () => {
    const translate = vi.spyOn(localization, 'translate');
    I18n.initI18n({continue: () => 'Continuar'});

    expect(I18n.t('continue')).toBe('Continuar');
    expect(translate).not.toHaveBeenCalled();
  });
});
