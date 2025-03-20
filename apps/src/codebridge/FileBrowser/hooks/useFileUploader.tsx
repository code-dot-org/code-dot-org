import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {validateFileName as validateCodebridgeFileName} from '@codebridge/utils';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {useCallback} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {
  useFileUploader as useLab2FileUploader,
  analyticsEvents,
  FileUploaderProps,
} from '@cdo/apps/lab2/hooks';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

type UseFileUploaderArgs = Exclude<FileUploaderProps, 'sendAnalyticsEvent'>;

export const useFileUploader = (
  args: UseFileUploaderArgs,
  folderId: string
) => {
  const {source, levelProperties} = useCodebridgeContext();
  const {appName, validationFile} = levelProperties;
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

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
      return validateCodebridgeFileName({
        fileName,
        folderId,
        projectFiles: source.files,
        isStartMode,
        validationFile,
      });
    },
    [folderId, source.files, isStartMode, validationFile]
  );

  return useLab2FileUploader({
    sendAnalyticsEvent,
    validateFileName,
    ...args,
  });
};
