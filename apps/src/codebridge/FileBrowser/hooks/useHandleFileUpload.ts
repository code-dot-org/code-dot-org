import {
  getNextFileId,
  useCodebridgeContext,
} from '@codebridge/codebridgeContext';
import {FolderId, ProjectFile} from '@codebridge/types';
import {checkForDuplicateFilename, validateFileName} from '@codebridge/utils';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

type handleFileUploadArgs = {
  folderId: FolderId;
  fileName: string;
  contents: string;
};

export const useHandleFileUpload = (files: Record<string, ProjectFile>) => {
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );

  const {newFile} = useCodebridgeContext();
  const dialogControl = useDialogControl();
  return useCallback(
    ({folderId, fileName, contents}: handleFileUploadArgs) => {
      // first of all, we just click on the document body to close our pop up
      // this is because we canceled the original click event inside of the FileUploader
      // of note - if additional clickhandlers were attached here, they won't be called.
      // So don't attach other handlers to this button.
      document.body.click();

      if (!validateFileName(fileName)) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: codebridgeI18n.invalidNameError(),
        });

        sendCodebridgeAnalyticsEvent(
          EVENTS.CODEBRIDGE_UPLOAD_INVALID_FILE_NAME,
          appName,
          {fileName}
        );
        return;
      }
      const duplicate = checkForDuplicateFilename(
        fileName,
        folderId,
        files,
        isStartMode,
        validationFile
      );
      if (duplicate) {
        dialogControl?.showDialog({
          type: DialogType.GenericAlert,
          title: duplicate,
        });
        return;
      }

      const fileId = getNextFileId(Object.values(files));

      newFile({
        fileId,
        fileName,
        folderId,
        contents,
      });
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_UPLOAD_FILE, appName, {
        fileName,
      });
    },
    [appName, dialogControl, files, newFile, isStartMode, validationFile]
  );
};
