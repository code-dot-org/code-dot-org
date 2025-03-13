import {Brand, getBrandFromHostname} from '../brand';

describe('Brand Unit Tests', () => {
  describe('getBrandFromHostname', () => {
    it('should return HoC', () => {
      expect(getBrandFromHostname('localhost.hourofcode.com:3001')).toBe(
        Brand.HOUR_OF_CODE,
      );
      expect(getBrandFromHostname('hourofcode.com:3001')).toBe(
        Brand.HOUR_OF_CODE,
      );
    });

    it('should return Code.org', () => {
      expect(getBrandFromHostname('localhost:3001')).toBe(Brand.CODE_DOT_ORG);
      expect(getBrandFromHostname('code.org')).toBe(Brand.CODE_DOT_ORG);
      expect(getBrandFromHostname('staging.code.org')).toBe(Brand.CODE_DOT_ORG);
      expect(getBrandFromHostname('test.code.org')).toBe(Brand.CODE_DOT_ORG);
      expect(getBrandFromHostname('anything.dev-code.org')).toBe(
        Brand.CODE_DOT_ORG,
      );
      expect(getBrandFromHostname(null)).toBe(Brand.CODE_DOT_ORG);
    });
  });
});
