import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {validateFolderName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import testProject from '../testProject.json';

describe('CodeBrige/FileBrowser/utils/validateFolderName', function () {
  it('can validateFolderName', function () {
    expect(
      validateFolderName({
        folderName: '',
        parentId: DEFAULT_FOLDER_ID,
        projectFolders: testProject.folders,
      })
    ).toEqual(undefined);

    expect(
      validateFolderName({
        folderName: '@',
        parentId: DEFAULT_FOLDER_ID,
        projectFolders: testProject.folders,
      })
    ).toEqual(codebridgeI18n.invalidNameError());

    expect(
      validateFolderName({
        folderName: 'testfolder1',
        parentId: DEFAULT_FOLDER_ID,
        projectFolders: testProject.folders,
      })
    ).toEqual(codebridgeI18n.folderExistsError());
  });
});
