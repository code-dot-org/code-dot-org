/**
 * @vitest-environment jsdom
 */

import {vi} from 'vitest';

import type {LocalizeJS} from '../Localize';
import {Localization} from '../Localization';

const mockedLocalizeJS = (currentLocale: string) => ({
  getLanguage: vi.fn(() => {
    return currentLocale;
  }),
  getAvailableLanguages: vi.fn(callback => {
    callback(null, [
      {
        name: 'English',
        code: 'en',
      },
      {
        name: 'Spanish',
        code: 'es',
      },
      {
        name: 'Spanish (LATAM)',
        code: 'es-LA',
      },
      {
        name: 'French',
        code: 'fr',
      },
      {
        name: 'Portuguese (Brasil)',
        code: 'pt-BR',
      },
      {
        name: 'Persian',
        code: 'fa',
      },
    ]);
  }),
  setLanguage: vi.fn(() => {}),
  // We will mock up a 'translation' that reverses the string
  translate: vi.fn(key => {
    if (key instanceof HTMLElement) {
      key = key.textContent;
    }

    if (typeof key === 'string') {
      return key.split('').reverse().join('');
    }

    return key;
  }),
});

function mockLocalizeJS(currentLocale: string): Promise<LocalizeJS> {
  return new Promise(resolve => {
    resolve(mockedLocalizeJS(currentLocale) as unknown as LocalizeJS);
  });
}

async function setupLocalizeJS(
  currentLocale: string = 'rd',
): Promise<Localization> {
  const localizePromise = mockLocalizeJS(currentLocale);
  Object.defineProperty(global, 'window', {
    value: {LocalizeLoader: localizePromise},
    writable: true,
    configurable: true,
  });
  const localization = new Localization();
  await localization.waitUntilLoaded();
  return localization;
}

describe('localization', () => {
  describe('get locale', () => {
    it("should return 'en' by default", () => {
      expect(new Localization().locale).toBe('en');
    });

    it('should determine the locale from LocalizeJS', async () => {
      const localization = await setupLocalizeJS();
      expect(localization.locale).toBe('rd');
    });
  });

  describe('get locales', () => {
    it('should return just one the English information by default', () => {
      expect(new Localization().locales).toHaveLength(1);
      expect(new Localization().locales?.[0]?.text).toBe('English');
    });

    it('should return values reflective of LocalizeJS.getAvailableLanguages when loaded', async () => {
      const localization = await setupLocalizeJS();
      expect(localization.locales).toHaveLength(6);
      expect(localization.locales.map(info => info.value)).toContain('pt-BR');
    });
  });

  describe('set locale', () => {
    it('should do nothing if LocalizeJS is not loaded', () => {
      new Localization().locale = 'xx';
    });

    it('should pass the code to LocalizeJS via setLanguage', async () => {
      const localization = await setupLocalizeJS();
      const Localize = await global.window.LocalizeLoader;
      localization.locale = 'pt-BR';
      expect(Localize?.setLanguage).toHaveBeenCalledWith('pt-BR');
      expect(Localize?.setLanguage).toHaveBeenCalledOnce();
    });
  });

  describe('get rtl', () => {
    it('should return true when the current locale code is of a RTL language', async () => {
      const localization = await setupLocalizeJS('fa');
      expect(localization.rtl).toBe(true);
    });

    it('should return false when the current locale code is of a LTR language', async () => {
      const localization = await setupLocalizeJS('fr');
      expect(localization.rtl).toBe(false);
    });
  });

  describe('isRTL', () => {
    it('should return true when given a locale code of a RTL language', () => {
      expect(new Localization().isRTL('fa')).toBe(true);
    });

    it('should return false when given a locale code of a LTR language', () => {
      expect(new Localization().isRTL('en')).toBe(false);
    });
  });

  describe('isLocalizeJS', () => {
    it('should return false when LocalizeJS did not load', () => {
      expect(new Localization().isLocalizeJS()).toBe(false);
    });

    it('should return true when LocalizeJS did load', async () => {
      const localization = await setupLocalizeJS();
      expect(localization.isLocalizeJS()).toBe(true);
    });
  });

  describe('translatable', () => {
    it('should just chain the input to the translate function', async () => {
      const localization = await setupLocalizeJS();
      const spy = vi.spyOn(localization, 'translate');
      const response = localization.translatable('foo');
      expect(spy).toHaveBeenCalledWith('foo', []);
      expect(response).toBe('foo');
    });

    it('should pass along labels to the translate function', async () => {
      const localization = await setupLocalizeJS();
      const spy = vi.spyOn(localization, 'translate');
      const response = localization.translatable('foo', ['bar']);
      expect(spy).toHaveBeenCalledWith('foo', ['bar']);
      expect(response).toBe('foo');
    });
  });

  describe('translate', () => {
    it('should do nothing but return the source string if LocalizeJS is not loaded', () => {
      expect(new Localization().translate('foo')).toBe('foo');
    });

    it('should call out to LocalizeJS.translate when loaded', async () => {
      const localization = await setupLocalizeJS();
      const Localize = await global.window.LocalizeLoader;
      const response = localization.translate('foo');
      expect(Localize?.translate).toHaveBeenCalledWith('foo');
      // Our mock translation just reverses the string
      expect(response).toBe('oof');
    });

    it('should call out to LocalizeJS.translate with a mocked up HTML when labels are given', async () => {
      const localization = await setupLocalizeJS();
      const Localize = await global.window.LocalizeLoader;
      const response = localization.translate('foo', ['bar']);

      const firstCallFirstArg = vi.mocked(Localize!.translate).mock
        .calls[0][0] as HTMLElement;
      expect(firstCallFirstArg instanceof HTMLElement).toBe(true);
      expect(firstCallFirstArg.getAttribute('data-localize')).toBe('bar');

      // Our mock translation just reverses the string
      expect(response).toBe('oof');
    });

    it('should call out to LocalizeJS.translate with a mocked up HTML when multiple labels are given', async () => {
      const localization = await setupLocalizeJS();
      const Localize = await global.window.LocalizeLoader;
      const response = localization.translate('foo', ['bar', 'baz']);

      const firstCallFirstArg = vi.mocked(Localize!.translate).mock
        .calls[0][0] as HTMLElement;
      expect(firstCallFirstArg instanceof HTMLElement).toBe(true);
      expect(firstCallFirstArg.getAttribute('data-localize')).toBe('bar baz');

      // Our mock translation just reverses the string
      expect(response).toBe('oof');
    });

    it('should call out to LocalizeJS.translate for each value in a passed in hash', async () => {
      const localization = await setupLocalizeJS();
      const Localize = await global.window.LocalizeLoader;
      const response = localization.translate({
        foo: 'foo',
        for: 'for',
        foz: 'foz',
      });
      expect(Localize?.translate).toHaveBeenCalledWith('foo');
      expect(Localize?.translate).toHaveBeenCalledWith('for');
      expect(Localize?.translate).toHaveBeenCalledWith('foz');
      // Our mock translation just reverses the string
      expect(response).toStrictEqual({
        foo: 'oof',
        for: 'rof',
        foz: 'zof',
      });
    });
  });
});
