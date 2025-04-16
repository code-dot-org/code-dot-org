import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {KeyboardCode, KeyboardCoordinateGetter} from '@dnd-kit/core';

const FOLDER_DROP_OFFSET = 8;

const FileBrowserKeyboardCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  args
) => {
  const {context} = args;
  const {droppableRects, over} = context;
  if (event.code !== KeyboardCode.Up && event.code !== KeyboardCode.Down) {
    return;
  }
  event.preventDefault();
  const orderedRects = Array.from(droppableRects.keys());
  orderedRects.sort((a, b) => {
    // DEFAULT_FOLDER_ID should always be last in the list, because it is the root folder
    // and contains all other folders.
    if (a === DEFAULT_FOLDER_ID) {
      return 1;
    } else if (b === DEFAULT_FOLDER_ID) {
      return -1;
    }
    // Otherwise, sort based on the top coordinate.
    const aTop = droppableRects.get(a)?.top || 0;
    const bTop = droppableRects.get(b)?.top || 0;
    return aTop - bTop;
  });
  const currentIndex = orderedRects.indexOf(over?.id as string);
  let nextIndex = currentIndex;
  if (event.code === KeyboardCode.Down) {
    nextIndex = Math.min(currentIndex + 1, orderedRects.length - 1);
  } else if (event.code === KeyboardCode.Up) {
    nextIndex = Math.max(currentIndex - 1, 0);
  }

  if (nextIndex === currentIndex) {
    // No need to move if we are not changing the index (we are likely at the
    // top or bottom of the browser).
    return;
  }
  const newRectId = orderedRects[nextIndex];
  const newRect = droppableRects.get(orderedRects[nextIndex]);
  if (newRect) {
    const x = newRect.left;
    // Normally, the y coordinate is the top of the droppable area, plus an offset.
    let y = newRect.top + FOLDER_DROP_OFFSET;
    // If we are dropping into the root folder, we want to drop at the bottom of the
    // droppable area, because the root folder is the entire file browser.
    if (newRectId === DEFAULT_FOLDER_ID) {
      y = newRect.bottom;
    }
    const newCoordinates = {
      x,
      y,
    };

    return newCoordinates;
  }
};

export default FileBrowserKeyboardCoordinateGetter;
