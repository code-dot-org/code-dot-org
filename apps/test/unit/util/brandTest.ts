import {CdoTheme, CodeaiTheme} from '@code-dot-org/component-library/themes';

import {getCurrentBrand, getMuiThemeForBrand} from '@cdo/apps/util/brand';

describe('brand utilities', () => {
  afterEach(() => {
    delete document.documentElement.dataset.brand;
  });

  describe('getCurrentBrand', () => {
    it('returns "code" when data-brand is absent', () => {
      expect(getCurrentBrand()).toBe('code');
    });

    it('returns "codeai" when data-brand is "codeai"', () => {
      document.documentElement.dataset.brand = 'codeai';
      expect(getCurrentBrand()).toBe('codeai');
    });

    it('returns "code" when data-brand has unknown value', () => {
      document.documentElement.dataset.brand = 'unknown';
      expect(getCurrentBrand()).toBe('code');
    });

    it('returns "code" when data-brand is "code"', () => {
      document.documentElement.dataset.brand = 'code';
      expect(getCurrentBrand()).toBe('code');
    });
  });

  describe('getMuiThemeForBrand', () => {
    it('returns CdoTheme for "code" brand', () => {
      expect(getMuiThemeForBrand('code')).toBe(CdoTheme);
    });

    it('returns CodeaiTheme for "codeai" brand', () => {
      expect(getMuiThemeForBrand('codeai')).toBe(CodeaiTheme);
    });

    it('uses getCurrentBrand when no argument is provided', () => {
      document.documentElement.dataset.brand = 'codeai';
      expect(getMuiThemeForBrand()).toBe(CodeaiTheme);
    });
  });
});
