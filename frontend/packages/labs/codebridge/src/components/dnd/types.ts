// Drag-and-drop payloads for the file browser. Ported from the legacy
// apps/src/codebridge FileBrowser DnD (which uses @dnd-kit). A dragged item is a
// file or a folder; a drop target is a folder (or the root). `parentId` lets the
// drag-end handler skip a no-op drop into the item's current folder.
import type {FileId, FolderId} from '@code-dot-org/core/api';

// A const object rather than an `enum` (the package enables
// `erasableSyntaxOnly`, which forbids enums).
export const DragType = {
  FILE: 'file',
  FOLDER: 'folder',
} as const;
export type DragType = (typeof DragType)[keyof typeof DragType];

export interface DragData {
  id: FileId | FolderId;
  type: DragType;
  parentId: FolderId;
}

export interface DropData {
  id: FolderId;
}
