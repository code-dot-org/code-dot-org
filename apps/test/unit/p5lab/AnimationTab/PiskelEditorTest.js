import {UnconnectedPiskelEditor as PiskelEditor} from '@cdo/apps/p5lab/AnimationTab/PiskelEditor';

describe('PiskelEditor', () => {
  describe('setPiskelLocale_', () => {
    let warn;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warn.mockRestore();
    });

    function piskelWindow(localeCode, piskelLocales) {
      const editor = new PiskelEditor({localeCode});
      const win = {};
      editor.iframe = {contentWindow: win};
      editor.setPiskelLocale_();
      win.piskel_locales = piskelLocales;
      return win;
    }

    function piskelLocale(localeCode, piskelLocales) {
      return piskelWindow(localeCode, piskelLocales).piskel_locale;
    }

    it('warns once when Piskel has no strings for locale', () => {
      const win = piskelWindow('es_la', {en_us: {}, es_mx: {}});
      expect(win.piskel_locale).toBe('es_mx');
      expect(win.piskel_locale).toBe('es_mx');
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith('No Piskel strings for locale es_la');
    });

    it('does not warn when Piskel has strings for locale', () => {
      piskelLocale('es_mx', {en_us: {}, es_mx: {}});
      expect(warn).not.toHaveBeenCalled();
    });

    it('uses locale Piskel has strings for', () => {
      expect(piskelLocale('es_mx', {en_us: {}, es_mx: {}})).toBe('es_mx');
    });

    it('uses locale fallback when Piskel has no strings for locale', () => {
      expect(piskelLocale('es_la', {en_us: {}, es_mx: {}})).toBe('es_mx');
    });

    it('uses default locale when Piskel has no strings for locale or its fallback', () => {
      expect(piskelLocale('or_in', {en_us: {}, es_mx: {}})).toBe('en_us');
      expect(piskelLocale('es_la', {en_us: {}})).toBe('en_us');
    });

    it('uses default locale when locale is undefined', () => {
      expect(piskelLocale(undefined, {en_us: {}})).toBe('en_us');
    });
  });
});
