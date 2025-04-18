import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {
  KeyboardCode,
  KeyboardCoordinateGetter,
  CollisionDetection,
  rectIntersection,
} from '@dnd-kit/core';

const FOLDER_DROP_OFFSET = 12;

export const fileBrowserKeyboardCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  args
) => {
  const {context} = args;
  const {droppableRects, droppableContainers, over} = context;
  console.log({droppableRects, droppableContainers});
  if (event.code !== KeyboardCode.Up && event.code !== KeyboardCode.Down) {
    return;
  }
  event.preventDefault();
  const orderedRects = Array.from(droppableRects.keys());
  orderedRects.sort((a, b) => {
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

export const fileBrowserCollisionDetector: CollisionDetection = args => {
  const rectangleCollisions = rectIntersection(args);
  if (rectangleCollisions.length <= 1) {
    return rectangleCollisions;
  }
  const {droppableRects, collisionRect} = args;
  rectangleCollisions.sort((a, b) => {
    // DEFAULT_FOLDER_ID should always be last in the list, because it is the root folder
    // and contains all other folders.
    if (a.id === DEFAULT_FOLDER_ID) {
      return 1;
    } else if (b.id === DEFAULT_FOLDER_ID) {
      return -1;
    }
    const activeRect = collisionRect;
    const aRect = droppableRects.get(a.id);
    const bRect = droppableRects.get(b.id);
    console.log(`comparing a: ${a.id} b: ${b.id}`);
    // idk why this would happen
    if (!activeRect || !aRect || !bRect) {
      return 0;
    }
    // If active is below  rects, pick the one that is lower
    if (aRect.top <= activeRect.top && bRect.top <= activeRect.top) {
      return bRect.top - aRect.top;
    } else if (aRect.top <= activeRect.top && bRect.top > activeRect.top) {
      // If active is only below the top of aRect, bRect is higher priority
      return -1;
    } else if (bRect.top <= activeRect.top) {
      // If only bRect is above active, bRect is higher priority
      return 1;
    } else {
      // active is above both rects--pick the higher one
      return aRect.top - bRect.top;
    }
  });

  return [rectangleCollisions[0]];
};
