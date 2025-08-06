import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {FolderId, ProjectFile} from '@codebridge/types';
import {validateFileName} from '@codebridge/utils';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {useCallback} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {createNewFileThunk} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
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
    async (fileName: string, contents: string, folderIdArg: unknown) => {
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

      // need to check against a list of files types we want to upload to s3
      // need to actually get project id somehow
      // if (file) {
      //   const url = `/v3/assets/3H-AyPf3huzbPZ9mTPK4qw/${fileName}`;
      //   await HttpClient.put(url, file);
      // }

      // this is what actually updates the project files (in Redux and triggering save to S3)
      // add createNewExternalFileThunk to the project files?
      dispatch(createNewFileThunk({fileName, folderId, contents}));
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_UPLOAD_FILE, appName, {
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
