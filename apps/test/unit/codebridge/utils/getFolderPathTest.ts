import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFolderPath} from '@codebridge/utils/getFolderPath';

import {testProject} from '../test-files/';

describe('getFolderPath', () => {
  it('should return an empty string for a non-existent folder', () => {
    expect(getFolderPath('1492', testProject.folders)).toEqual('');
  });
  it('should getFolderPath on existing folders', () => {
    expect(getFolderPath(DEFAULT_FOLDER_ID, testProject.folders)).toEqual('/');
    expect(getFolderPath('1', testProject.folders)).toEqual('/testfolder1');
    expect(getFolderPath('2', testProject.folders)).toEqual(
      '/testfolder1/testfolder2'
    );
    expect(getFolderPath('3', testProject.folders)).toEqual('/testfolder2');
    expect(getFolderPath('4', testProject.folders)).toEqual(
      '/testfolder1/testfolder2/testfolder4'
    );
    expect(getFolderPath('5', testProject.folders)).toEqual(
      '/testfolder1/testfolder2/testfolder4/testfolder5'
    );
  });
});
