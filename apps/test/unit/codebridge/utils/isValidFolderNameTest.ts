import {isValidFolderName} from '@codebridge/utils';

describe('CodeBrige/utils/isValidFolderName', function () {
  it('can determine isValidFolderName', function () {
    expect(isValidFolderName('test')).toEqual(true);
    expect(isValidFolderName('test_underscore')).toEqual(true); // can have underscores
    expect(isValidFolderName('test-underscore')).toEqual(true); // can have hyphens
    expect(isValidFolderName('!')).toEqual(false); // cannot have any special characters, but we can't test this exhaustively
  });
});
