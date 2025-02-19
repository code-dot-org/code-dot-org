import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {
  useFileUploader as useLab2FileUploader,
  analyticsEvents,
  FileUploaderProps,
} from '@cdo/apps/lab2/hooks';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../../codebridgeContext';
import {isDuplicateFileName} from '../../utils';

type UseFileUploaderArgs = Exclude<FileUploaderProps, 'sendAnalyticsEvent'>;

export const useFileUploader = (
  args: UseFileUploaderArgs,
  folderId: string
) => {
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const {source} = useCodebridgeContext();
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );

  const sendAnalyticsEvent = useCallback(
    (eventName: string, payload: Record<string, string>) => {
      switch (eventName) {
        case analyticsEvents.UPLOAD_FAILED: {
          sendCodebridgeAnalyticsEvent(
            EVENTS.CODEBRIDGE_UPLOAD_UNACCEPTED_FILE,
            appName,
            payload
          );
          return;
        }
        case analyticsEvents.UPLOAD_UNACCEPTED_FILE: {
          sendCodebridgeAnalyticsEvent(
            EVENTS.CODEBRIDGE_UPLOAD_FAILED,
            appName,
            payload
          );
        }
      }
    },
    [appName]
  );

  const validateFileName = useCallback(
    (fileName: string) => {
      if (
        isDuplicateFileName({
          fileName,
          folderId,
          projectFiles: source.files,
          isStartMode,
          validationFile,
        })
      ) {
        return codebridgeI18n.duplicateFileError({fileName});
      }
      return undefined;
    },
    [folderId, source.files, isStartMode, validationFile]
  );

  return useLab2FileUploader({
    sendAnalyticsEvent,
    validateFileName,
    ...args,
  });
};
