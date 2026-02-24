import {isDuplicateFolderName} from '@codebridge/utils';

import {testProject} from '../test-files';

describe('isDuplicateFolderName', function () {
  it('can determine isDuplicateFolderName', function () {
    expect(
      isDuplicateFolderName({
        folderName: 'testfolder1',
        parentId: '0',
        projectFolders: testProject.folders,
      })
    ).toBe(true);

    expect(
      isDuplicateFolderName({
        folderName: 'testfolder_new',
        parentId: '0',
        projectFolders: testProject.folders,
      })
    ).toBe(false);

    expect(
      isDuplicateFolderName({
        folderName: 'testfolder2',
        parentId: '1',
        projectFolders: testProject.folders,
      })
    ).toBe(true);
  });
});
