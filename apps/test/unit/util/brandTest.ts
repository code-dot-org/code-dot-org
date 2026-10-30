import {
  CdoTheme,
  CodeaiTheme,
  CodeaiAuditTheme,
} from '@code-dot-org/component-library/themes';

import {getCurrentBrand, getMuiThemeForBrand} from '@cdo/apps/util/brand';

describe('brand utilities', () => {
  afterEach(() => {
    delete document.documentElement.dataset.brand;
  });

  describe('getCurrentBrand', () => {
    it('returns "codeai-next" when data-brand is absent', () => {
      expect(getCurrentBrand()).toBe('codeai-next');
    });

    it('returns "codeai" when data-brand is "codeai"', () => {
      document.documentElement.dataset.brand = 'codeai';
      expect(getCurrentBrand()).toBe('codeai');
    });

    it('returns "codeai-next" when data-brand is "codeai-next"', () => {
      document.documentElement.dataset.brand = 'codeai-next';
      expect(getCurrentBrand()).toBe('codeai-next');
    });

    it('returns "codeai-audit" when data-brand is "codeai-audit"', () => {
      document.documentElement.dataset.brand = 'codeai-audit';
      expect(getCurrentBrand()).toBe('codeai-audit');
    });

    it('returns "codeai-next" when data-brand has unknown value', () => {
      document.documentElement.dataset.brand = 'unknown';
      expect(getCurrentBrand()).toBe('codeai-next');
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

    it('returns CdoTheme for "codeai" brand', () => {
      expect(getMuiThemeForBrand('codeai')).toBe(CdoTheme);
    });

    it('returns CodeaiTheme for "codeai-next" brand', () => {
      expect(getMuiThemeForBrand('codeai-next')).toBe(CodeaiTheme);
    });

    it('returns CodeaiAuditTheme for "codeai-audit" brand', () => {
      expect(getMuiThemeForBrand('codeai-audit')).toBe(CodeaiAuditTheme);
    });

    it('uses getCurrentBrand when no argument is provided', () => {
      document.documentElement.dataset.brand = 'codeai-next';
      expect(getMuiThemeForBrand()).toBe(CodeaiTheme);
    });
  });
});
