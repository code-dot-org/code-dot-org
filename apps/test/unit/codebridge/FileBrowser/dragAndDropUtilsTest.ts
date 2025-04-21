import {KeyboardCode} from '@dnd-kit/core';

import {
  fileBrowserKeyboardCoordinateGetter,
  FOLDER_DROP_OFFSET,
} from '@cdo/apps/codebridge/FileBrowser/dragAndDropUtils';

import {
  folders,
  folderKeyboardArgs,
  getKeyboardEvent,
  fileKeyboardArgs,
} from './dragAndDropSampleData';

describe('dragAndDropUtils', () => {
  describe('keyboard coordinate getter', () => {
    it('Folder skips its child folders', () => {
      const result = fileBrowserKeyboardCoordinateGetter(folders)(
        getKeyboardEvent(KeyboardCode.Down),
        folderKeyboardArgs
      );
      // We expect the next coordinate to be the below top of folder 4 by
      // FOLDER_DROP_OFFSET
      expect(result).toEqual({
        x: 0,
        y: 50 + FOLDER_DROP_OFFSET,
      });
    });

    it('File goes to correct folder', () => {
      // In the sample data, the file is in folder 2, which is a sub-folder of folder 1.
      // If it goes down, it should go to folder 3, which is a sibling of folder 2.
      // If it goes up, it should go to folder 1.
      const coordinateGetter = fileBrowserKeyboardCoordinateGetter(folders);
      const downResult = coordinateGetter(
        getKeyboardEvent(KeyboardCode.Down),
        fileKeyboardArgs
      );
      // Folder 3's top is 30 and left is 10
      expect(downResult).toEqual({
        x: 10,
        y: 30 + FOLDER_DROP_OFFSET,
      });
      const upResult = coordinateGetter(
        getKeyboardEvent(KeyboardCode.Up),
        fileKeyboardArgs
      );
      // Folder 1's top is 0 and left is 0
      expect(upResult).toEqual({
        x: 0,
        y: 0 + FOLDER_DROP_OFFSET,
      });
    });
  });
});
