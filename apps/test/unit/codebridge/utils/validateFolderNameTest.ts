import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {validateFolderName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {testProject} from '../test-files';

describe('validateFolderName', function () {
  it('can validateFolderName', function () {
    expect(
      validateFolderName({
        folderName: 'valid_folder_name',
        parentId: DEFAULT_FOLDER_ID,
        projectFolders: testProject.folders,
      })
    ).toEqual(undefined);

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

    const duplicateFolderName = 'testfolder1';

    expect(
      validateFolderName({
        folderName: duplicateFolderName,
        parentId: DEFAULT_FOLDER_ID,
        projectFolders: testProject.folders,
      })
    ).toEqual(
      codebridgeI18n.duplicateFolderError({folderName: duplicateFolderName})
    );
  });
});
