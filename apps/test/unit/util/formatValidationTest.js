import {
  isEmail,
  isZipCode,
  isInt,
  isPercent,
} from '@cdo/apps/util/formatValidation';

describe('formatValidation', () => {
  describe('isEmail', () => {
    it('Accepts valid email addresses', () => {
      ['name@code.org', 'name+tag@code.org'].forEach(email => {
        // Expected isEmail("${email}") to return true
        expect(isEmail(email)).toBe(true);
      });
    });

    it('Rejects invalid email addresses', () => {
      ['invalid', 'invalid@code', 'invalid@ code.org'].forEach(email => {
        // Expected isEmail("${email}") to return false
        expect(isEmail(email)).toBe(false);
      });
    });
  });

  describe('isZipCode', () => {
    it('Accepts valid zip codes', () => {
      ['12345', '12345-6789', '12345 6789'].forEach(zipCode => {
        // Expected isZipCode("${zipCode}") to return true
        expect(isZipCode(zipCode)).toBe(true);
      });
    });

    it('Rejects invalid zip codes', () => {
      ['', '123', '12345-', '12345-1', 'ABCDE'].forEach(zipCode => {
        // Expected isZipCode("${zipCode}") to return false
        expect(isZipCode(zipCode)).toBe(false);
      });
    });
  });

  describe('isInt', () => {
    it('Accepts valid numbers as integers', () => {
      ['1', '100', '-100', '1,000,000'].forEach(integer => {
        // Expected isInt("${integer}") to return true
        expect(isInt(integer)).toBe(true);
      });
    });

    it('Rejects invalid numbers', () => {
      ['cat', '123ABC', '123.55', '1_000_000'].forEach(integer => {
        // Expected isInt("${integer}") to return false
        expect(isInt(integer)).toBe(false);
      });
    });
  });

  describe('isPercent', () => {
    it('Accepts valid percentages', () => {
      ['0', '5', '100', '55.5', '55.55%'].forEach(percent => {
        // Expected isPercent("${percent}") to return true
        expect(isPercent(percent)).toBe(true);
      });
    });

    it('Rejects invalid percentages', () => {
      ['-1', '100.5', '100.5%', 'cat', ''].forEach(percent => {
        // Expected isPercent("${percent}") to return true
        expect(isPercent(percent)).toBe(false);
      });
    });
  });
});
