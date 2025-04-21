import {KeyboardCode, SensorContext, UniqueIdentifier} from '@dnd-kit/core';
import {Coordinates} from '@dnd-kit/utilities';

import {fileBrowserKeyboardCoordinateGetter} from '@cdo/apps/codebridge/FileBrowser/dragAndDropUtils';
import {DragType} from '@cdo/apps/codebridge/FileBrowser/types';

// Sample file structure:
// root folder is 100px tall
// Folder 1 is 50px tall
//    Folder 2 is inside folder 1, and is 25px tall
//    Folder 3 is a sibling of folder 2, and is 10px tall
// Folder 4 is 25px tall, and is a sibling of folder 1
const sampleDroppableRects = new Map([
  [
    '0',
    {
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
    },
  ],
  [
    '1',
    {
      width: 100,
      height: 50,
      top: 0,
      left: 0,
      right: 100,
      bottom: 50,
    },
  ],
  [
    '2',
    {
      width: 90,
      height: 25,
      top: 10,
      left: 10,
      right: 100,
      bottom: 35,
    },
  ],
  [
    '3',
    {
      width: 90,
      height: 10,
      top: 30,
      left: 10,
      right: 100,
      bottom: 40,
    },
  ],
  [
    '4',
    {
      width: 100,
      height: 50,
      top: 50,
      left: 0,
      right: 100,
      bottom: 100,
    },
  ],
]);
const keyboardArgs: {
  active: UniqueIdentifier;
  currentCoordinates: Coordinates;
  context: SensorContext;
} = {
  active: '1-1',
  currentCoordinates: {
    x: 0,
    y: 0,
  },
  context: {
    activatorEvent: null,
    active: {
      id: '1-1',
      data: {current: {id: '1', type: DragType.FOLDER, parentId: '0'}},
      rect: {current: {initial: null, translated: null}},
    },
    activeNode: null,
    collisionRect: null,
    collisions: null,
    draggableNodes: new Map(),
    draggingNode: null,
    draggingNodeRect: null,
    droppableRects: sampleDroppableRects,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    droppableContainers: new Map() as any,
    over: {
      id: '1',
      rect: {width: 100, height: 50, top: 0, left: 0, right: 100, bottom: 50},
      disabled: false,
      data: {
        current: undefined,
      },
    },
    scrollableAncestors: [],
    scrollAdjustedTranslate: null,
  },
};

const folders = {
  '1': {
    id: '1',
    name: 'Folder 1',
    parentId: '0',
  },
  '2': {
    id: '2',
    name: 'Folder 2',
    parentId: '1',
  },
  '3': {
    id: '3',
    name: 'Folder 3',
    parentId: '1',
  },
  '4': {
    id: '4',
    name: 'Folder 4',
    parentId: '0',
  },
};

describe('dragAndDropUtils', () => {
  describe('Folder keyboard coordinate getter', () => {
    it('skips its child folders', () => {
      const result = fileBrowserKeyboardCoordinateGetter(folders)(
        {code: KeyboardCode.Down, preventDefault: () => {}} as KeyboardEvent,
        keyboardArgs
      );
      // We expect the next coordinate to be the below top of folder 4 by
      // FOLDER_DROP_OFFSET
      expect(result).toEqual({
        x: 0,
        y: 66,
      });
    });
  });
});
