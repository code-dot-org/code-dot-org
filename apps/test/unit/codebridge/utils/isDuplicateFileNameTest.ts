import {isDuplicateFileName, DuplicateFileError} from '@codebridge/utils';

import {validationFile, testProject} from '../test-files';

describe('isDuplicateFileName', function () {
  it('can determine isDuplicateFileName not startMode, no validationFile', function () {
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

  it('can determine isDuplicateFileName startMode, no validationFile', function () {
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

  it('can determine isDuplicateFileName not startMode, w/validationFile', function () {
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

  it('can determine isDuplicateFileName startMode, w/validationFile', function () {
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

  it('can determine isDuplicateFileName not startMode, w/supportFile', function () {
    expect(
      isDuplicateFileName({
        fileName: 'support_file.vld',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'support_file.vld',
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
        isStartMode: false,
      })
    ).toBe(false);
  });

  it('can determine isDuplicateFileName startMode, w/supportFile', function () {
    expect(
      isDuplicateFileName({
        fileName: 'support_file.vld',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: true,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'support_file.vld',
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

  it('can determine isDuplicateFileName not startMode, w/ system support file', function () {
    console.log(testProject.files);
    expect(
      isDuplicateFileName({
        fileName: 'system_support_file.vld',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'system_support_file.vld',
        folderId: '1',
        projectFiles: testProject.files,
        isStartMode: false,
      })
    ).toBe(false);

    expect(
      isDuplicateFileName({
        fileName: 'newFile.txt',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: false,
      })
    ).toBe(false);
  });

  it('can determine isDuplicateFileName startMode, w/ system support file', function () {
    expect(
      isDuplicateFileName({
        fileName: 'system_support_file.vld',
        folderId: '0',
        projectFiles: testProject.files,
        isStartMode: true,
      })
    ).toBe(DuplicateFileError.DUPLICATE_SUPPORT_FILE);

    expect(
      isDuplicateFileName({
        fileName: 'system_support_file.vld',
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
});
