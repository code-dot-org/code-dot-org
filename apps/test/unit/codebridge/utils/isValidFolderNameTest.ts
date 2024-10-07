import {isValidFolderName} from '@codebridge/utils';

describe('CodeBrige/utils/isValidFolderName', function () {
  it('can determine isValidFolderName', function () {
    expect(isValidFolderName('test')).toBe(true);
    expect(isValidFolderName('test_underscore')).toBe(true); // can have underscores
    expect(isValidFolderName('test-underscore')).toBe(true); // can have hyphens
    expect(isValidFolderName('!')).toBe(false); // cannot have any special characters, but we can't test this exhaustively
  });
});
