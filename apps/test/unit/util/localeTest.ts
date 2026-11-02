import {
  JS_DEFAULT_LOCALE,
  getJsLocaleCandidates,
  toJsLocale,
} from '@cdo/apps/util/locale';

describe('locale', () => {
  describe('toJsLocale', () => {
    it('converts I18n locale to js locale', () => {
      expect(toJsLocale('en-IN')).toBe('en_in');
    });
  });

  describe('getJsLocaleCandidates', () => {
    it('returns locale, its fallback, and default locale', () => {
      expect(getJsLocaleCandidates('es_la')).toEqual([
        'es_la',
        'es_mx',
        'en_us',
      ]);
    });

    it('omits missing fallback', () => {
      expect(getJsLocaleCandidates('or_in')).toEqual(['or_in', 'en_us']);
    });

    it('omits duplicates', () => {
      expect(getJsLocaleCandidates(JS_DEFAULT_LOCALE)).toEqual([
        JS_DEFAULT_LOCALE,
      ]);
    });
  });
});
