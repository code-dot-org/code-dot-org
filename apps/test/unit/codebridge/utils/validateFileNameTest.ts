import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {validateFileName} from '@codebridge/utils';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

import {testProject, validationFile} from '../test-files';

describe('validateFileName', function () {
  it('can validateFileName', function () {
    expect(
      validateFileName({
        fileName: '',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
      })
    ).toEqual(undefined);

    expect(
      validateFileName({
        fileName: 'name_without_extension',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
      })
    ).toEqual(codebridgeI18n.noFileExtensionError());

    expect(
      validateFileName({
        fileName: 'name_with_invalid_characters!.txt',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
      })
    ).toEqual(codebridgeI18n.invalidNameError());

    expect(
      validateFileName({
        fileName: 'valid_file.txt',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
      })
    ).toEqual(undefined);

    const duplicateFileName = 'testFile1.txt';

    expect(
      validateFileName({
        fileName: duplicateFileName,
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
      })
    ).toEqual(codebridgeI18n.duplicateFileError({fileName: duplicateFileName}));

    const duplicateValidationFileName = 'validation_file.vld';
    expect(
      validateFileName({
        fileName: duplicateValidationFileName,
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
      })
    ).toEqual(
      codebridgeI18n.duplicateSupportFileError({
        fileName: duplicateValidationFileName,
      })
    );

    expect(
      validateFileName({
        fileName: duplicateValidationFileName,
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: true,
      })
    ).toEqual(
      codebridgeI18n.duplicateSupportFileError({
        fileName: duplicateValidationFileName,
      })
    );

    const duplicateSupportFileName = 'support_file.vld';
    expect(
      validateFileName({
        fileName: duplicateSupportFileName,
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
      })
    ).toEqual(
      codebridgeI18n.duplicateSupportFileError({
        fileName: duplicateSupportFileName,
      })
    );
  });
});
