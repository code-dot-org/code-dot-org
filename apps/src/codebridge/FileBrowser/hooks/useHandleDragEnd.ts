import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {
  validateFileName as globalValidateFileName,
  validateFolderName,
} from '@codebridge/utils';
import {DragOverEvent} from '@dnd-kit/core';
import {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {usePartialApply, PAFunctionArgs} from '@cdo/apps/lab2/hooks';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {DragType} from '../types';

/**
 * Handles the drag end event for the file browser, performing file/folder movement and validation.

 * @returns A function that handles the DragOverEvent from `@dnd-kit/core`.
 */
export const useHandleDragEnd = () => {
  const {source, moveFile, moveFolder} = useCodebridgeContext();

  const dialogControl = useDialogControl();
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const validateFileName = usePartialApply(globalValidateFileName, {
    isStartMode,
    validationFile,
    projectFiles: source.files,
  } satisfies PAFunctionArgs<typeof globalValidateFileName>);

  return useMemo(
    () => (e: DragOverEvent) => {
      if (e?.over && e?.active) {
        // first, if we're dragging something into the folder which currently contains it, just bow out.
        if (e.active.data.current?.parentId === e.over.id) {
          return;
        }
        if (e.active.data.current?.type === DragType.FOLDER) {
          const validationError = validateFolderName({
            folderName: source.folders[e.active.data.current.id].name,
            parentId: e.over.id as string,
            projectFolders: source.folders,
          });
          if (validationError) {
            dialogControl?.showDialog({
              type: DialogType.GenericAlert,
              title: validationError,
            });
          } else {
            moveFolder(e.active.data.current.id as string, e.over.id as string);
          }
        } else if (e.active.data.current?.type === DragType.FILE) {
          const validationError = validateFileName({
            fileName: source.files[e.active.data.current.id].name,
            folderId: e.over.id as string,
          });
          if (validationError) {
            dialogControl?.showDialog({
              type: DialogType.GenericAlert,
              title: validationError,
            });
          } else {
            moveFile(e.active.data.current.id as string, e.over.id as string);
          }
        }
      }
    },
    [
      dialogControl,
      moveFile,
      moveFolder,
      source.files,
      source.folders,
      validateFileName,
    ]
  );
};
