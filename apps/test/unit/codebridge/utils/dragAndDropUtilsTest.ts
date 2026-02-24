import {Collision, KeyboardCode} from '@dnd-kit/core';

import {
  fileBrowserKeyboardCoordinateGetter,
  FOLDER_DROP_OFFSET,
  getHighestPriorityCollision,
} from '@cdo/apps/codebridge/utils/dragAndDropUtils';

import {
  folders,
  folderKeyboardArgs,
  getKeyboardEvent,
  fileKeyboardArgs,
  folderActive,
  sampleDroppableRects,
  fileActive,
} from '../FileBrowser/dragAndDropSampleData';

describe('dragAndDropUtils', () => {
  describe('Keyboard coordinate getter', () => {
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

  describe('Collision detector', () => {
    it('returns the correct collision for a folder with children', () => {
      // In this example, folder 1's children are in the collision list, but we should
      // return folder 0 (default), because we do not move a folder into its own children.
      const collision = getHighestPriorityCollision(
        folders,
        [{id: '2'}, {id: '3'}, {id: '0'}] as Collision[],
        folderActive,
        sampleDroppableRects,
        {top: 10, left: 0, right: 100, bottom: 60, width: 100, height: 50}
      );

      expect(collision).toEqual([
        {
          id: '0',
        },
      ]);
    });

    it('returns the correct collision for a file', () => {
      const collision = getHighestPriorityCollision(
        folders,
        [{id: '1'}, {id: '2'}, {id: '0'}] as Collision[],
        fileActive,
        sampleDroppableRects,
        {top: 15, left: 0, right: 100, bottom: 25, width: 100, height: 10}
      );
      // This file should go to folder 2, because it is below folder 1 and 2's top coordinates but
      // 2 is lower than 1.
      expect(collision).toEqual([
        {
          id: '2',
        },
      ]);
    });
  });
});
