import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {DragType} from '@codebridge/FileBrowser/types';
import {getFolderChildren} from '@codebridge/utils';
import {
  KeyboardCode,
  KeyboardCoordinateGetter,
  CollisionDetection,
  rectIntersection,
  Collision,
  Active,
  ClientRect,
} from '@dnd-kit/core';
import {RectMap} from '@dnd-kit/core/dist/store';
import {sortableKeyboardCoordinates} from '@dnd-kit/sortable';

import {ProjectFolder} from '@cdo/apps/lab2/types';

export const FOLDER_DROP_OFFSET = 16;

// Custom keyboard coordinate getter for the file browser.
// When we are moving an item via the keyboard, we move it to the next available folder
// up/down in the browser, rather than just a flat number of pixels.
// If we are moving a folder, we skip any folders that are children of the current folder.
export const fileBrowserKeyboardCoordinateGetter: (
  folders: Record<string, ProjectFolder>
) => KeyboardCoordinateGetter = folders => (event, args) => {
  const moveCodes: string[] = [
    KeyboardCode.Up,
    KeyboardCode.Down,
    KeyboardCode.Tab,
  ];
  if (!moveCodes.includes(event.code)) {
    return;
  }
  event.preventDefault();

  const {context} = args;
  const {droppableRects, over, active} = context;
  let orderedRects = Array.from(droppableRects.keys());
  const currentId = active?.data.current?.id;
  const dragType = active?.data.current?.type;

  if (dragType === DragType.FOLDER) {
    // We can't move a folder into a folder that is a child of itself
    const allChildren = getFolderChildren(
      currentId as string,
      Object.values(folders)
    );
    orderedRects = orderedRects.filter(
      id => !allChildren.includes(id as string)
    );
  }

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
  // Find the next index based on the key pressed. We cycle around if they reach
  // the beginning or end of the list.
  if (
    event.code === KeyboardCode.Down ||
    (event.code === KeyboardCode.Tab && !event.shiftKey)
  ) {
    nextIndex = (currentIndex + 1) % orderedRects.length;
  } else if (
    event.code === KeyboardCode.Up ||
    (event.code === KeyboardCode.Tab && event.shiftKey)
  ) {
    nextIndex = (currentIndex - 1 + orderedRects.length) % orderedRects.length;
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
    // droppable area, because the root folder is the entire file browser. We subtract the
    // offset to be a bit above the bottom of the droppable area.
    if (newRectId === DEFAULT_FOLDER_ID) {
      y = newRect.bottom - FOLDER_DROP_OFFSET;
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
// we are below multiple folders, we will pick the lowest one (which is the one
// the item being dropped is closest to).
// The default rectangleCollision algorithm picks the intersection between rectangles,
// and we can overlap with multiple folders due to nesting. We take the initial list of collisions,
// sort it accordingly, and return the highest priority folder.
// If we are dropping a folder, we also filter out any folders that are children of the current folder.
// Documentation: https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
export const fileBrowserCollisionDetector: (
  folders: Record<string, ProjectFolder>
) => CollisionDetection = folders => args => {
  const rectangleCollisions = rectIntersection(args);

  const {droppableRects, collisionRect, active} = args;
  return getHighestPriorityCollision(
    folders,
    rectangleCollisions,
    active,
    droppableRects,
    collisionRect
  );
};

// Exported for testing
export const getHighestPriorityCollision = (
  folders: Record<string, ProjectFolder>,
  rectangleCollisions: Collision[],
  active: Active,
  droppableRects: RectMap,
  collisionRect: ClientRect
) => {
  const dragType = active.data.current?.type;
  const activeId = active.data.current?.id;
  if (dragType === DragType.FOLDER) {
    // Filter out any attempts to move into a folder that is a child of this folder.
    const allChildren = getFolderChildren(
      activeId as string,
      Object.values(folders)
    );
    rectangleCollisions = rectangleCollisions.filter(
      collision => !allChildren.includes(collision.id as string)
    );
  }

  if (rectangleCollisions.length === 0) {
    // If there are no collisions, drop into the default folder.
    return [{id: DEFAULT_FOLDER_ID}];
  }

  if (rectangleCollisions.length <= 1) {
    return rectangleCollisions;
  }

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

// Extend sortableKeyboardCoordinates to support tab and shift+tab to move items.
export const sortableKeyboardCoordinatesWithTab: KeyboardCoordinateGetter = (
  event,
  args
) => {
  if (event.code === KeyboardCode.Tab && event.shiftKey) {
    event.preventDefault();
    const newEvent = new KeyboardEvent('keydown', {
      code: KeyboardCode.Left,
    });
    // Shift tab is equivalent to left arrow
    return sortableKeyboardCoordinates(newEvent, args);
  } else if (event.code === KeyboardCode.Tab) {
    // Tab is equivalent to right arrow
    event.preventDefault();
    const newEvent = new KeyboardEvent('keydown', {
      code: KeyboardCode.Right,
    });
    return sortableKeyboardCoordinates(newEvent, args);
  } else {
    // Otherwise, call the original function
    return sortableKeyboardCoordinates(event, args);
  }
};

export const dragAndDropKeyboardCodes = {
  // Start dragging on 'm', so 'enter' and 'space' can be used to open/close a file/folder.
  // TODO: expose a menu to users of our keyboard options, until then this is a hidden feature.
  start: ['KeyM'],
  cancel: ['Escape'],
  end: ['KeyM', 'Enter', 'Space'],
};
