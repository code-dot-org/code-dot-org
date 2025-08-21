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
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

type UseFileUploaderArgs = Omit<
  FileUploaderProps,
  'sendAnalyticsEvent' | 'channelId'
> & {
  validFileTypes?: string[];
};

export const useFileUploader = (
  args: UseFileUploaderArgs,
  folderId: string
) => {
  const {levelProperties, onImageFlagged} = useCodebridgeContext();
  const {appName, validationFile} = levelProperties;
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const files = useAppSelector(
    state => (state.lab2Project.projectSources?.source as MultiFileSource).files
  );
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';

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

  const {validFileTypes, ...lab2FileUploaderArgs} = args;
  const validateFileName = useCallback(
    (fileName: string) => {
      return validateCodebridgeFileName({
        fileName,
        folderId,
        projectFiles: files,
        isStartMode,
        validationFile,
        validFileTypes,
      });
    },
    [folderId, files, isStartMode, validationFile, validFileTypes]
  );

  return useLab2FileUploader({
    sendAnalyticsEvent,
    validateFileName,
    channelId,
    onImageFlagged,
    ...lab2FileUploaderArgs,
  });
};
