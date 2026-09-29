// File-browser drag-and-drop helpers, ported from apps/src/codebridge
// utils/dragAndDropUtils. Two pieces of @dnd-kit customization the file tree
// needs, because folders nest and overlap:
//   - a collision detector that, among the folders the pointer is over, picks
//     the innermost (lowest) one, and forbids dropping a folder into itself or a
//     descendant, falling back to the root when over nothing;
//   - a keyboard coordinate getter that steps a keyboard drag between folders
//     (skipping the dragged folder's descendants) rather than by raw pixels.
// (`getFolderChildren` in the legacy is this package's `findSubFolders`.)
import {
  type CollisionDetection,
  KeyboardCode,
  type KeyboardCoordinateGetter,
  rectIntersection,
} from '@dnd-kit/core';

import type {ProjectFolder} from '@code-dot-org/core/api';

import {DragType} from '../components/dnd/types';
import {DEFAULT_FOLDER_ID} from '../constants';

import {findSubFolders} from './multiFileSource';

/** Drop y-offset inside a folder's rect (keyboard drag); see the getter below. */
export const FOLDER_DROP_OFFSET = 16;

/** Keyboard keys that start / cancel / complete a drag (matches the legacy). */
export const dragAndDropKeyboardCodes = {
  // Start on 'm' so Enter/Space still open a file / toggle a folder.
  start: ['KeyM'],
  cancel: ['Escape'],
  end: ['KeyM', 'Enter', 'Space'],
};

export const fileBrowserCollisionDetector =
  (folders: Record<string, ProjectFolder>): CollisionDetection =>
  args => {
    const {droppableRects, collisionRect, active} = args;
    let collisions = rectIntersection(args);
    const activeId = active.data.current?.id as string;

    if (active.data.current?.type === DragType.FOLDER) {
      // Can't move a folder into itself or one of its own descendants.
      const descendants = findSubFolders(activeId, Object.values(folders));
      collisions = collisions.filter(
        collision =>
          collision.id !== activeId &&
          !descendants.includes(collision.id as string),
      );
    }

    if (collisions.length === 0) {
      return [{id: DEFAULT_FOLDER_ID}]; // over nothing → the root
    }
    if (collisions.length <= 1) {
      return collisions;
    }

    // Prefer the innermost folder: among those the drag is below the top of,
    // the lowest one. The root always sorts last (it contains everything).
    collisions.sort((a, b) => {
      if (a.id === DEFAULT_FOLDER_ID) {
        return 1;
      }
      if (b.id === DEFAULT_FOLDER_ID) {
        return -1;
      }
      const aRect = droppableRects.get(a.id);
      const bRect = droppableRects.get(b.id);
      if (!collisionRect || !aRect || !bRect) {
        return 0;
      }
      if (aRect.top <= collisionRect.top && bRect.top <= collisionRect.top) {
        return bRect.top - aRect.top;
      }
      if (aRect.top <= collisionRect.top) {
        return -1;
      }
      if (bRect.top <= collisionRect.top) {
        return 1;
      }
      return aRect.top - bRect.top;
    });
    return [collisions[0]];
  };

export const fileBrowserKeyboardCoordinateGetter =
  (folders: Record<string, ProjectFolder>): KeyboardCoordinateGetter =>
  (event, {context: {droppableRects, over, active}}) => {
    const moveCodes = [KeyboardCode.Up, KeyboardCode.Down, KeyboardCode.Tab];
    if (!moveCodes.includes(event.code as KeyboardCode)) {
      return;
    }
    event.preventDefault();

    let ids = Array.from(droppableRects.keys());
    const activeId = active?.data.current?.id as string | undefined;
    if (active?.data.current?.type === DragType.FOLDER && activeId) {
      const descendants = findSubFolders(activeId, Object.values(folders));
      ids = ids.filter(id => !descendants.includes(id as string));
    }

    // Order by rect top, root last.
    ids.sort((a, b) => {
      if (a === DEFAULT_FOLDER_ID) {
        return 1;
      }
      if (b === DEFAULT_FOLDER_ID) {
        return -1;
      }
      return (
        (droppableRects.get(a)?.top ?? 0) - (droppableRects.get(b)?.top ?? 0)
      );
    });

    const currentIndex = ids.indexOf(over?.id as string);
    const forward =
      event.code === KeyboardCode.Down ||
      (event.code === KeyboardCode.Tab && !event.shiftKey);
    const nextIndex = forward
      ? (currentIndex + 1) % ids.length
      : (currentIndex - 1 + ids.length) % ids.length;
    if (nextIndex === currentIndex) {
      return;
    }

    const nextId = ids[nextIndex];
    const rect = droppableRects.get(nextId);
    if (!rect) {
      return;
    }
    // Aim just inside the folder's top; for the root (the whole browser) aim
    // just inside its bottom instead.
    return {
      x: rect.left,
      y:
        nextId === DEFAULT_FOLDER_ID
          ? rect.bottom - FOLDER_DROP_OFFSET
          : rect.top + FOLDER_DROP_OFFSET,
    };
  };
