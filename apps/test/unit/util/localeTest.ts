import {
  JS_DEFAULT_LOCALE,
  getJsLocaleFallbacks,
  toJsLocale,
} from '@cdo/apps/util/locale';

describe('locale', () => {
  describe('toJsLocale', () => {
    it('converts I18n locale to js locale', () => {
      expect(toJsLocale('en-IN')).toBe('en_in');
    });
  });

  describe('getJsLocaleFallbacks', () => {
    it('returns locale, its fallback, and default locale', () => {
      expect(getJsLocaleFallbacks('es_la')).toEqual([
        'es_la',
        'es_mx',
        'en_us',
      ]);
    });

    it('omits missing fallback', () => {
      expect(getJsLocaleFallbacks('or_in')).toEqual(['or_in', 'en_us']);
    });

    it('omits duplicates', () => {
      expect(getJsLocaleFallbacks(JS_DEFAULT_LOCALE)).toEqual([
        JS_DEFAULT_LOCALE,
      ]);
    });
  });
});
