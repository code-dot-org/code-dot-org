import {afterEach, vi} from 'vitest';

import {localization} from '@code-dot-org/core/plugins/localization';

import {getPageLocale} from '../lib/locale';

afterEach(() => {
  vi.restoreAllMocks();
});

it('maps LocalizeJS language codes to Rails I18n locales', () => {
  vi.spyOn(localization, 'isLocalizeJS').mockReturnValue(true);
  vi.spyOn(localization, 'locale', 'get').mockReturnValue('zh-Hans');

  expect(getPageLocale()).toBe('zh-CN');
});

it('falls back to en-US for an unknown LocalizeJS language code', () => {
  vi.spyOn(localization, 'isLocalizeJS').mockReturnValue(true);
  vi.spyOn(localization, 'locale', 'get').mockReturnValue('unknown');

  expect(getPageLocale()).toBe('en-US');
});
