import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {FolderId, ProjectFile} from '@codebridge/types';
import {validateFileName} from '@codebridge/utils';
import {useCallback} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {
  createNewFileThunk,
  createNewExternalFileThunk,
} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils/analyticsReporterHelper';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

export const useHandleFileUpload = (
  projectFiles: Record<string, ProjectFile>
) => {
  const {levelProperties} = useCodebridgeContext();
  const {appName, validationFile} = levelProperties;
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const dispatch = useAppDispatch();

  const dialogControl = useDialogControl();
  return useCallback(
    (
      fileName: string,
      contents: string,
      url?: string,
      folderIdArg?: unknown,
      flagged?: boolean
    ) => {
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
        sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_UPLOAD_FAILED, appName, {
          fileName,
          error: validationError,
        });
        return;
      }

      if (url) {
        dispatch(
          createNewExternalFileThunk({fileName, folderId, url, flagged})
        );
      } else {
        dispatch(createNewFileThunk({fileName, folderId, contents}));
      }
      sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_UPLOAD_FILE, appName, {
        fileName,
      });
    },
    [
      projectFiles,
      isStartMode,
      validationFile,
      dispatch,
      appName,
      dialogControl,
    ]
  );
};
