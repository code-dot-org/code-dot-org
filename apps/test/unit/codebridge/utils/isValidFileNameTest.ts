import {isValidFileName} from '@codebridge/utils';

describe('CodeBrige/utils/isValidFileName', function () {
  it('can determine isValidFileName', function () {
    expect(isValidFileName('test')).toBe(false); // files must have extensions
    expect(isValidFileName('test.')).toBe(false); // files must have extensions
    expect(isValidFileName('test.txt')).toBe(true); // files must have extensions
    expect(isValidFileName('test.txt.txt')).toBe(false); // files cannot have dots
    expect(isValidFileName('test_underscore.txt')).toBe(true); // can have underscores
    expect(isValidFileName('test-underscore.txt')).toBe(true); // can have hyphens
    expect(isValidFileName('!')).toBe(false); // cannot have any special characters, but we can't test this exhaustively
  });
});
