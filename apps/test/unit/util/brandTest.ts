import {CdoTheme, CodeaiTheme} from '@code-dot-org/component-library/themes';

import DCDO from '@cdo/apps/dcdo';
import {getCurrentBrand, getMuiThemeForBrand} from '@cdo/apps/util/brand';

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));

jest.mock('@cdo/apps/code-studio/utils', () => ({
  environmentSpecificCookieName: (name: string) => name,
}));

describe('brand utilities', () => {
  const mockDCDO = DCDO as unknown as {get: jest.Mock};

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      configurable: true,
      value: '',
    });
  });

  describe('getCurrentBrand', () => {
    it('returns "code" when brand-router-enabled is off', () => {
      mockDCDO.get.mockReturnValue(false);
      document.cookie = 'brand=codeai';

      expect(getCurrentBrand()).toBe('code');
    });

    it('returns "code" when no brand cookie is set', () => {
      mockDCDO.get.mockReturnValue(true);
      document.cookie = '';

      expect(getCurrentBrand()).toBe('code');
    });

    it('returns "codeai" when brand cookie is codeai and flag is on', () => {
      mockDCDO.get.mockReturnValue(true);
      document.cookie = 'brand=codeai';

      expect(getCurrentBrand()).toBe('codeai');
    });

    it('returns "code" when brand cookie has unknown value', () => {
      mockDCDO.get.mockReturnValue(true);
      document.cookie = 'brand=unknown';

      expect(getCurrentBrand()).toBe('code');
    });

    it('returns "code" when brand cookie is "code"', () => {
      mockDCDO.get.mockReturnValue(true);
      document.cookie = 'brand=code';

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
      mockDCDO.get.mockReturnValue(true);
      document.cookie = 'brand=codeai';

      expect(getMuiThemeForBrand()).toBe(CodeaiTheme);
    });
  });
});
