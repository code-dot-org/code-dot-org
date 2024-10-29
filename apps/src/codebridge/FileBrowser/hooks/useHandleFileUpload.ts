import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {FolderId, ProjectFile} from '@codebridge/types';
import {validateFileName} from '@codebridge/utils';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {useCallback} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const useHandleFileUpload = (
  projectFiles: Record<string, ProjectFile>
) => {
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );

  const {newFile} = useCodebridgeContext();
  const dialogControl = useDialogControl();
  return useCallback(
    (fileName: string, contents: string, folderIdArg: unknown) => {
      const folderId = folderIdArg as FolderId;

      const validationError = validateFileName({
        fileName,
        folderId,
        projectFiles,
        isStartMode,
        validationFile,
      });

      if (validationError) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: validationError,
        });
        sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_UPLOAD_FAILED, appName, {
          fileName,
          error: validationError,
        });
        return;
      }

      newFile({
        fileName,
        folderId,
        contents,
        validationFileId: validationFile?.id,
      });
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_UPLOAD_FILE, appName, {
        fileName,
      });
    },
    [appName, dialogControl, projectFiles, newFile, isStartMode, validationFile]
  );
};
