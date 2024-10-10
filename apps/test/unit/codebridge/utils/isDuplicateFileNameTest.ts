import {isDuplicateFileName, DuplicateFileError} from '@codebridge/utils';

import {supportFile, validationFile, testProject} from '../test-files';

/*

type IsDuplicateFileNameArgs = {
  fileName: string;
  folderId: string;
  projectFiles: Record<string, ProjectFile>;
  isStartMode: boolean;
  validationFile?: ProjectFile;
};*/

/*(
export const isDuplicateFileName = ({
  fileName,
  folderId,
  projectFiles,
  isStartMode,
  validationFile,
}: IsDuplicateFileNameArgs) => {
  // The validation file is in the project files in start mode.
  if (!isStartMode && validationFile?.name === fileName) {
    return DuplicateFileError.DUPLICATE_SUPPORT_FILE;
  } else {
    const existingFile = Object.values(projectFiles).find(
      f => f.name === fileName && f.folderId === folderId
    );
    if (existingFile) {
      if (
        existingFile.type === ProjectFileType.SUPPORT ||
        existingFile.type === ProjectFileType.VALIDATION
      ) {
        return DuplicateFileError.DUPLICATE_SUPPORT_FILE;
      } else {
        return DuplicateFileError.DUPLICATE_FILE;
      }
    }
  }

  return false;
};
) */

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
        fileName: 'testFile1.txt',
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
