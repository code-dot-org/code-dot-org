import {isDuplicateFileName, DuplicateFileError} from '@codebridge/utils';

import {supportFile, validationFile, testProject} from '../test-files';

describe('isDuplicateFolderName', function () {
  it('can determine isDuplicateFolderName not startMode, no validationFile', function () {
    expect(
      isDuplicateFileName({
        fileName: 'testFile1.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
      })
    ).toBe(DuplicateFileError.DUPLICATE_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'testFile2.txt',
        folderId: '1',
        projectFiles: testProject.files,
        isStartMode: false,
      })
    ).toBe(DuplicateFileError.DUPLICATE_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'newFile.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
      })
    ).toBe(false);
  });

  it('can determine isDuplicateFolderName startMode, no validationFile', function () {
    expect(
      isDuplicateFileName({
        fileName: 'testFile1.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: true,
      })
    ).toBe(DuplicateFileError.DUPLICATE_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'testFileNEW.txt',
        folderId: '1',
        projectFiles: testProject.files,
        isStartMode: true,
      })
    ).toBe(false);

    expect(
      isDuplicateFileName({
        fileName: 'newFile.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: true,
      })
    ).toBe(false);
  });

  it('can determine isDuplicateFolderName not startMode, w/validationFile', function () {
    expect(
      isDuplicateFileName({
        fileName: 'validation_file.vld',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
        validationFile,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'validation_file.vld',
        folderId: '1',
        projectFiles: testProject.files,
        isStartMode: false,
        validationFile,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'newFile.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
        validationFile,
      })
    ).toBe(false);
  });

  it('can determine isDuplicateFolderName startMode, w/validationFile', function () {
    expect(
      isDuplicateFileName({
        fileName: 'validation_file.vld',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: true,
        validationFile,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'validation_file.vld',
        folderId: '1',
        projectFiles: testProject.files,
        isStartMode: true,
        validationFile,
      })
    ).toBe(false);

    expect(
      isDuplicateFileName({
        fileName: 'newFile.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: true,
        validationFile,
      })
    ).toBe(false);
  });

  it('can determine isDuplicateFolderName not startMode, w/supportFile', function () {
    expect(
      isDuplicateFileName({
        fileName: 'support_file.vld',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
        validationFile: supportFile,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'support_file.vld',
        folderId: '1',
        projectFiles: testProject.files,
        isStartMode: false,
        validationFile: supportFile,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'newFile.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
        validationFile: supportFile,
      })
    ).toBe(false);
  });

  it('can determine isDuplicateFolderName startMode, w/supportFile', function () {
    expect(
      isDuplicateFileName({
        fileName: 'support_file.vld',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: true,
        validationFile: supportFile,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'support_file.vld',
        folderId: '1',
        projectFiles: testProject.files,
        isStartMode: true,
        validationFile: supportFile,
      })
    ).toBe(false);

    expect(
      isDuplicateFileName({
        fileName: 'newFile.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: true,
        validationFile: supportFile,
      })
    ).toBe(false);
  });
});
