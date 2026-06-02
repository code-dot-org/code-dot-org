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

    const validFileTypes = ['py', 'csv', 'txt'];
    const validFileTypesString = validFileTypes.join(', ');
    // Invalid file type returns error string.
    expect(
      validateFileName({
        fileName: 'test.js',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
        validFileTypes,
      })
    ).toEqual(
      `${codebridgeI18n.invalidFileType({
        fileType: 'js',
      })} ${codebridgeI18n.validFileTypesInfo({
        validFileTypes: validFileTypesString,
      })}`
    );

    // Name with multiple periods is invalid (ex. test.file.py).
    expect(
      validateFileName({
        fileName: 'test.file.py',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
        validFileTypes,
      })
    ).toEqual(codebridgeI18n.invalidNameError());

    // Valid file name/type has no return.
    expect(
      validateFileName({
        fileName: 'test.csv',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
        validFileTypes,
      })
    ).toBeUndefined();

    // When the extension comes from the dropdown (selectedFileType), the bare
    // base name must still be combined with it for the duplicate check.
    // testFile1.txt already exists in DEFAULT_FOLDER_ID.
    expect(
      validateFileName({
        fileName: 'testFile1',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
        validFileTypes,
        selectedFileType: 'txt',
      })
    ).toEqual(
      codebridgeI18n.duplicateFileError({fileName: 'testFile1.txt'})
    );

    // A duplicate support file is likewise detected via the recombined name.
    expect(
      validateFileName({
        fileName: 'support_file',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
        validFileTypes: ['vld'],
        selectedFileType: 'vld',
      })
    ).toEqual(
      codebridgeI18n.duplicateSupportFileError({fileName: 'support_file.vld'})
    );

    // A unique base name with a dropdown extension is still allowed.
    expect(
      validateFileName({
        fileName: 'brandNewFile',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
        validFileTypes,
        selectedFileType: 'txt',
      })
    ).toBeUndefined();

    // With the dropdown supplying the extension, a period in the base name is
    // invalid: "My.Class" + "java" would otherwise create "My.Class.java".
    expect(
      validateFileName({
        fileName: 'My.Class',
        folderId: DEFAULT_FOLDER_ID,
        projectFiles: testProject.files,
        validationFile,
        isStartMode: false,
        validFileTypes,
        selectedFileType: 'txt',
      })
    ).toEqual(codebridgeI18n.invalidNameError());
  });
});
