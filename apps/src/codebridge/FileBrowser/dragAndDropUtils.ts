import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {
  KeyboardCode,
  KeyboardCoordinateGetter,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';

const FOLDER_DROP_OFFSET = 16;

// Custom keyboard coordinate getter for the file browser.
// When we are moving an item via the keyboard, we move it to the next available folder
// up/down in the browser, rather than just a flat number of pixels.
export const fileBrowserKeyboardCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  args
) => {
  if (event.code !== KeyboardCode.Up && event.code !== KeyboardCode.Down) {
    return;
  }
  event.preventDefault();

  const {context} = args;
  const {droppableRects, over} = context;
  const orderedRects = Array.from(droppableRects.keys());
  // Sort the available droppable rectangles by their top coordinate, except
  // for the root folder (DEFAULT_FOLDER_ID), which should always be last, as it
  // is the folder that contains all the other folders.
  orderedRects.sort((a, b) => {
    // Default folder is always last in the list.
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
  // Find the next index based on the key pressed.
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

// Custom collision detection algorithm for the file browser.
// We want to drop into the folder that the file is below the top of, but if
// we are below multiple folders, we will pick the lower of the two (which is the one
// the item being dropped is closest to).
// The default rectangleCollision algorithm picks the intersection between rectangles,
// and we can overlap with multiple folders due to nesting. We take the initial list of collisions,
// sort it accordingly, and return the highest priority folder.
// Documentation: https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
export const fileBrowserCollisionDetector: CollisionDetection = args => {
  const rectangleCollisions = rectIntersection(args);
  if (rectangleCollisions.length <= 1) {
    return rectangleCollisions;
  }
  // The collisionRect is the file/folder being dragged.
  const {droppableRects, collisionRect} = args;
  rectangleCollisions.sort((a, b) => {
    // DEFAULT_FOLDER_ID should always be last in the list, because it is the root folder
    // and contains all other folders.
    if (a.id === DEFAULT_FOLDER_ID) {
      return 1;
    } else if (b.id === DEFAULT_FOLDER_ID) {
      return -1;
    }
    const aRect = droppableRects.get(a.id);
    const bRect = droppableRects.get(b.id);
    // Safety check for Typescript, but this should never happen.
    if (!collisionRect || !aRect || !bRect) {
      return 0;
    }
    // If collisionRect is below both rects, pick the one that is lower.
    // This is likely the case of nested folders.
    if (aRect.top <= collisionRect.top && bRect.top <= collisionRect.top) {
      return bRect.top - aRect.top;
    } else if (
      aRect.top <= collisionRect.top &&
      bRect.top > collisionRect.top
    ) {
      // If collisionRect is only below the top of aRect, aRect is higher priority.
      return -1;
    } else if (bRect.top <= collisionRect.top) {
      // If only bRect is above collisionRect, bRect is higher priority.
      return 1;
    } else {
      // collisionRect is above both rects--pick the higher one (this should not happen).
      return aRect.top - bRect.top;
    }
  });

  return [rectangleCollisions[0]];
};
