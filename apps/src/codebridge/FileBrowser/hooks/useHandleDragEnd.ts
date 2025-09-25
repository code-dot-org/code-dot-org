import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {DragType} from '@codebridge/FileBrowser/types';
import {
  validateFileName as globalValidateFileName,
  validateFolderMove,
} from '@codebridge/utils';
import {DragOverEvent} from '@dnd-kit/core';
import {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {usePartialApply, PAFunctionArgs} from '@cdo/apps/lab2/hooks';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {
  moveFileThunk,
  moveFolderThunk,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Handles the drag end event for the file browser, performing file/folder movement and validation.

 * @returns A function that handles the DragOverEvent from `@dnd-kit/core`.
 */
export const useHandleDragEnd = () => {
  const {levelProperties} = useCodebridgeContext();
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source as MultiFileSource
  );
  const dispatch = useAppDispatch();

  const dialogControl = useDialogControl();
  const validationFile = levelProperties.validationFile;
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
          const folderId = e.active.data.current.id as string;
          const validationError = validateFolderMove(
            source.folders[folderId].name,
            e.over.id as string,
            source.folders,
            folderId
          );
          if (validationError) {
            dialogControl?.showDialog({
              type: DialogType.GenericAlert,
              title: validationError,
            });
          } else {
            dispatch(
              moveFolderThunk({
                folderId: e.active.data.current.id as string,
                parentId: e.over.id as string,
              })
            );
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
            dispatch(
              moveFileThunk({
                fileId: e.active.data.current.id as string,
                folderId: e.over.id as string,
              })
            );
          }
        }
      }
    },
    [dialogControl, dispatch, source.files, source.folders, validateFileName]
  );
};
