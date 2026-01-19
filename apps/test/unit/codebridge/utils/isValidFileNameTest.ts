import {isValidFileName} from '@codebridge/utils';

describe('isValidFileName', function () {
  describe('without dropdown (extension typed in text field)', function () {
    it('allows names without extensions', function () {
      expect(isValidFileName('test')).toBe(true);
    });

    it('allows names with extensions', function () {
      expect(isValidFileName('test.txt')).toBe(true);
    });

    it('rejects names with only a trailing period', function () {
      expect(isValidFileName('test.')).toBe(false);
    });

    it('rejects names with multiple extensions', function () {
      expect(isValidFileName('test.txt.txt')).toBe(false);
    });

    it('allows underscores and hyphens', function () {
      expect(isValidFileName('test_underscore.txt')).toBe(true);
      expect(isValidFileName('test-hyphen.txt')).toBe(true);
    });

    it('rejects special characters', function () {
      expect(isValidFileName('!')).toBe(false);
    });
  });

  describe('with dropdown (extension set by dropdown)', function () {
    it('allows names without periods', function () {
      expect(isValidFileName('test', true)).toBe(true);
    });

    it('rejects names with periods', function () {
      expect(isValidFileName('test.txt', true)).toBe(false);
    });

    it('allows underscores and hyphens', function () {
      expect(isValidFileName('test_underscore', true)).toBe(true);
      expect(isValidFileName('test-hyphen', true)).toBe(true);
    });

    it('rejects special characters', function () {
      expect(isValidFileName('!', true)).toBe(false);
    });
  });
});
