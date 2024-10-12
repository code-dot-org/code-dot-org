import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {getFolderLineage} from '@codebridge/utils/getFolderLineage';

import {testProject} from '../test-files/';

const projectFolders = Object.values(testProject.folders);

describe('getFolderLineage', () => {
  it('should return an empty string for a non-existent folder', () => {
    expect(getFolderLineage('1492', projectFolders)).toEqual([]);
  });
  it('should getFolderLineage on existing folders', () => {
    expect(getFolderLineage(DEFAULT_FOLDER_ID, projectFolders)).toEqual(['0']);
    expect(getFolderLineage('1', projectFolders)).toEqual(['0', '1']);
    expect(getFolderLineage('2', projectFolders)).toEqual(['0', '1', '2']);
    expect(getFolderLineage('3', projectFolders)).toEqual(['0', '3']);
    expect(getFolderLineage('4', projectFolders)).toEqual(['0', '1', '2', '4']);
    expect(getFolderLineage('5', projectFolders)).toEqual([
      '0',
      '1',
      '2',
      '4',
      '5',
    ]);
  });
});
