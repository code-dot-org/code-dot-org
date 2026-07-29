// The file browser's drag-end handler: moves the dragged file/folder into the
// drop-target folder. Ported from apps/src/codebridge's `useHandleDragEnd`,
// driven by {@link useFileOperations} (moveFile/moveFolder) instead of the
// legacy redux thunks. The collision detector already forbids dropping a folder
// into itself or a descendant, so the only case left to validate is a file whose
// name would collide in the target folder — which we refuse with an alert.
import type {DragEndEvent} from '@dnd-kit/core';
import {useMemo} from 'react';

import type {FileId, FolderId} from '@code-dot-org/core/api';

import {DragType, type DragData} from '../components/dnd/types';
import {validateFileMove} from '../config';

import {useFileOperations} from './useFileOperations';
import {usePrompts} from './usePrompts';

export const useHandleDragEnd = () => {
  const ops = useFileOperations();
  const {alert} = usePrompts();

  return useMemo(
    () =>
      ({active, over}: DragEndEvent) => {
        if (!over || !active.data.current) {
          return;
        }
        const data = active.data.current as DragData;
        const target = over.id as FolderId;
        // Dropped back into its current folder — nothing to do.
        if (data.parentId === target) {
          return;
        }

        if (data.type === DragType.FOLDER) {
          ops.moveFolder(data.id as FolderId, target);
          return;
        }

        const file = ops.source.files[data.id as FileId];
        const error =
          file && validateFileMove(ops.source, target, file.name, file.id);
        if (error) {
          void alert({title: 'Cannot move file', message: error});
          return;
        }
        ops.moveFile(data.id as FileId, target);
      },
    [ops, alert],
  );
};
