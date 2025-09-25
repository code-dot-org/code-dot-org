import cookies from 'js-cookie';

import {Localization} from '@cdo/apps/localization';
import {RTLLocales} from '@cdo/apps/localization/Localization';
import type {
  LocalizeJS,
  LocalizeLanguageInfo,
  LocalizeCallbackData,
} from '@cdo/apps/localization/Localize';
import experiments from '@cdo/apps/util/experiments';
import * as getScriptDataModule from '@cdo/apps/util/getScriptData';
import {DefaultLocale} from '@cdo/generated-scripts/sharedConstants';

// Ensure we destroy the localizejs loader promise in the global space
afterEach(() => {
  delete window.LocalizeLoader;
});

// A mock of the LocalizeJS interface
const localizeMock: () => LocalizeJS = () =>
  ({
    on: (_: string, __: (data: LocalizeCallbackData) => void) => {},
    getAvailableLanguages: (
      callback: (
        _: string | undefined,
        languages: LocalizeLanguageInfo[]
      ) => void
    ) => callback(undefined, []),
    setLanguage: (key: string) => {},
  } as unknown as LocalizeJS);

// A mock of the language_ cookie
const mockLanguageCookie = (locale?: string) => {
  jest
    .spyOn(cookies, 'get')
    .mockClear()
    .mockImplementation(((key?: string) => {
      if (typeof key === 'string') {
        if (key === 'language_') {
          return locale;
        }

        return undefined;
      }

      return {
        language_: locale,
      };
    }) as typeof cookies.get);
};

// Creates the mock of the localizejs experiment and the localize loader (with the mock)
const initLocalize = async () => {
  const localize = localizeMock();
  jest
    .spyOn(experiments, 'isEnabledAllowingQueryString')
    .mockClear()
    .mockImplementation((key: string) => key === experiments.LOCALIZEJS);
  window.LocalizeLoader = new Promise(resolve => resolve(localize));
  return localize;
};

describe('Localization', () => {
  describe('get locale', () => {
    it('should call into Localize.getLanguage when available', async () => {
      const localize = await initLocalize();
      localize.getLanguage = jest.fn().mockReturnValue('localize-language');
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      expect(localization.locale).toBe('localize-language');
      expect(localize.getLanguage).toHaveBeenCalledTimes(1);
    });

    it('should return the value from the language cookie when Localize is not used', () => {
      mockLanguageCookie('stored-cookie');
      expect(new Localization().locale).toBe('stored-cookie');
    });

    it('should return DefaultLocale if there is no other locale source available', () => {
      mockLanguageCookie(); // Ensures that there are no set cookies
      expect(new Localization().locale).toBe(DefaultLocale);
    });
  });

  describe('set locale', () => {
    it('should call into Localize.setLanguage when available', async () => {
      const localize = await initLocalize();
      localize.setLanguage = jest.fn();
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      localization.locale = 'new-language';
      expect(localize.setLanguage).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if Localize is not used', () => {
      new Localization().locale = 'new-language';
    });
  });

  describe('get rtl', () => {
    it('should return true for a locale that is deemed right-to-left', () => {
      mockLanguageCookie(RTLLocales[0]);
      expect(new Localization().rtl).toBe(true);
    });

    it('should return false for a locale that is deemed left-to-right', () => {
      mockLanguageCookie('en-US');
      expect(new Localization().rtl).toBe(false);
    });
  });

  describe('isRTL', () => {
    it('should return true for a locale that is deemed right-to-left', () => {
      expect(new Localization().isRTL(RTLLocales[0])).toBe(true);
    });

    it('should return false for a locale that is deemed left-to-right', () => {
      expect(new Localization().isRTL('en-US')).toBe(false);
    });
  });

  describe('locales', () => {
    it('should just use the locales via Localize getAvailableLanguages when available', async () => {
      const options = [
        {
          value: 'foo',
          text: 'Foo - Localize',
          rtl: false,
        },
        {
          value: RTLLocales[0],
          text: 'RTL Locale - Localize',
          rtl: true,
        },
        {
          value: 'en-US',
          text: 'English - Localize',
          rtl: false,
        },
      ];

      const localize = await initLocalize();
      localize.getAvailableLanguages = jest
        .fn()
        .mockImplementation(
          (
            callback: (
              _: string | undefined,
              languages: LocalizeLanguageInfo[]
            ) => void
          ) =>
            callback(
              undefined,
              options.map(item => ({code: item.value, name: item.text}))
            )
        );

      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      expect(localization.locales).toEqual(options);
    });

    it('should return the locales listed in the script data, if it exists', () => {
      const getScriptDataMock = jest.spyOn(getScriptDataModule, 'default');

      getScriptDataMock.mockClear().mockImplementation((key: string) => ({
        localeOptions: [
          {value: 'foo', text: 'Foo'},
          {value: RTLLocales[0], text: 'RTL Locale'},
          {value: 'en-US', text: 'English'},
        ],
      }));
      const localization = new Localization();
      expect(localization.locales).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          rtl: false,
        },
        {
          value: RTLLocales[0],
          text: 'RTL Locale',
          rtl: true,
        },
        {
          value: 'en-US',
          text: 'English',
          rtl: false,
        },
      ]);

      getScriptDataMock.mockRestore();
    });

    it('should return the locales pulled from the normal legacy language dropdown if it exists', () => {
      const getScriptDataMock = jest.spyOn(getScriptDataModule, 'default');
      getScriptDataMock.mockClear().mockImplementation((_: string) => {
        throw new Error('');
      });
      const options = [
        {
          value: 'foo',
          text: 'Foo - dropdown',
          rtl: false,
        },
        {
          value: RTLLocales[0],
          text: 'RTL Locale - dropdown',
          rtl: true,
        },
        {
          value: 'en-US',
          text: 'English - dropdown',
          rtl: false,
        },
      ];

      const select = document.createElement('select');
      select.setAttribute('id', 'locale');

      for (const item of options) {
        const el = document.createElement('option');
        el.textContent = item.text;
        el.setAttribute('value', item.value);
        select.appendChild(el);
      }

      document.body.appendChild(select);

      const localization = new Localization();
      expect(localization.locales).toEqual(options);

      select.remove();
      getScriptDataMock.mockRestore();
    });

    it('should return an empty list if there are no available locale sources', () => {
      const getScriptDataMock = jest.spyOn(getScriptDataModule, 'default');
      getScriptDataMock.mockClear().mockImplementation((_: string) => {
        throw new Error('');
      });
      const localization = new Localization();
      expect(localization.locales).toEqual([]);
      getScriptDataMock.mockRestore();
    });
  });

  describe('translatable', () => {
    it('should call into Localize.translate when available', async () => {
      const localize = await initLocalize();
      localize.translate = jest
        .fn()
        .mockImplementation((key: string) => `translated-${key}`);
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      expect(localization.translatable('foo')).toBe('foo');
      expect(localize.translate).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when Localize is not available', async () => {
      const localization = new Localization();
      expect(localization.translatable('foo')).toBe('foo');
    });
  });

  describe('translate', () => {
    it('should call into Localize.translate when available and pass it the given string', async () => {
      const localize = await initLocalize();
      localize.translate = jest
        .fn()
        .mockImplementation((key: string) => `translated-${key}`);
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      expect(localization.translate('foo')).toBe('translated-foo');
      expect(localize.translate).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when Localize is not available and when given a string', async () => {
      const localization = new Localization();
      expect(localization.translate('foo')).toBe('foo');
    });

    it('should call into Localize.translate when available and pass it the given element', async () => {
      const localize = await initLocalize();
      localize.translate = jest.fn().mockImplementation((key: HTMLElement) => {
        key.textContent = `translated-${key.textContent}`;
        return key;
      });
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      const translatableElement = document.createElement('div');
      translatableElement.textContent = 'foo';
      expect(localization.translate(translatableElement).textContent).toBe(
        'translated-foo'
      );
      expect(localize.translate).toHaveBeenLastCalledWith(
        expect.any(HTMLElement)
      );
      expect(localize.translate).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when Localize is not available and when given an element', async () => {
      const localization = new Localization();
      const translatableElement = document.createElement('div');
      translatableElement.textContent = 'foo';
      expect(localization.translate(translatableElement).textContent).toBe(
        'foo'
      );
    });

    it('should call into Localize.translate for all strings in the given array', async () => {
      const localize = await initLocalize();
      localize.translate = jest
        .fn()
        .mockImplementation((key: string) => `translated-${key}`);
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      expect(localization.translate(['foo', 'bar'])).toEqual([
        'translated-foo',
        'translated-bar',
      ]);
      expect(localize.translate).toHaveBeenCalledTimes(2);
    });

    it('should do nothing when Localize is not available and when given an array of strings', async () => {
      const localization = new Localization();
      expect(localization.translate(['foo', 'bar'])).toEqual(['foo', 'bar']);
    });

    it('should call into Localize.translate for all strings in the given dictionary', async () => {
      const localize = await initLocalize();
      localize.translate = jest
        .fn()
        .mockImplementation((key: string) => `translated-${key}`);
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      expect(
        localization.translate({
          FOO: 'foo',
          BAR: 'bar',
        })
      ).toEqual({
        FOO: 'translated-foo',
        BAR: 'translated-bar',
      });
      expect(localize.translate).toHaveBeenCalledTimes(2);
    });

    it('should do nothing when Localize is not available and when given an array of strings', async () => {
      const localization = new Localization();
      expect(
        localization.translate({
          FOO: 'foo',
          BAR: 'bar',
        })
      ).toEqual({
        FOO: 'foo',
        BAR: 'bar',
      });
    });

    it('should call into Localize.translate as an element when available and pass it the given string and labels', async () => {
      const localize = await initLocalize();
      localize.translate = jest
        .fn()
        .mockImplementation((key: string | HTMLElement) => {
          if (typeof key === 'string') {
            return `translated-${key}`;
          }

          key.textContent = `translated-${key.textContent}`;

          // Throw the `data-localize` into the return so we can detect it
          key.textContent = `${key.textContent}-${key.getAttribute(
            'data-localize'
          )}`;
          return key;
        });
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      expect(localization.translate('foo', ['my-label'])).toBe(
        'translated-foo-my-label'
      );
      expect(localize.translate).toHaveBeenLastCalledWith(
        expect.any(HTMLElement)
      );
      expect(localize.translate).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when Localize is not available and when given a string with a label', async () => {
      const localization = new Localization();
      expect(localization.translate('foo', ['my-label'])).toBe('foo');
    });

    it('should call into Localize.translate as an element when available and pass it the given element and labels', async () => {
      const localize = await initLocalize();
      localize.translate = jest
        .fn()
        .mockImplementation((key: string | HTMLElement) => {
          if (typeof key === 'string') {
            return `translated-${key}`;
          }

          key.textContent = `translated-${key.textContent}`;

          // Throw the `data-localize` into the return so we can detect it
          key.textContent = `${key.textContent}-${key.getAttribute(
            'data-localize'
          )}`;
          return key;
        });
      await window.LocalizeLoader;
      const localization = new Localization();
      await localization.waitUntilLoaded();
      const translatableElement = document.createElement('div');
      translatableElement.textContent = 'foo';
      expect(
        localization.translate(translatableElement, ['my-label']).textContent
      ).toBe('translated-foo-my-label');
      expect(localize.translate).toHaveBeenLastCalledWith(
        expect.any(HTMLElement)
      );
      expect(localize.translate).toHaveBeenCalledTimes(1);
    });
  });
});
