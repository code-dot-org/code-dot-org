import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {validateFileName as validateCodebridgeFileName} from '@codebridge/utils';
import {useCallback} from 'react';

import {
  useFileUploader as useLab2FileUploader,
  analyticsEvents,
  FileUploaderProps,
} from '@cdo/apps/lab2/hooks';
import {
  getIsStartMode,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils/analyticsReporterHelper';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

type UseFileUploaderArgs = Omit<
  FileUploaderProps,
  'sendAnalyticsEvent' | 'uploadExternalFile'
> & {
  validFileTypes?: string[];
};

export const useFileUploader = (
  args: UseFileUploaderArgs,
  folderId: string
) => {
  const {levelProperties, onImageFlagged} = useCodebridgeContext();
  const {validationFile, name} = levelProperties;
  const isStartMode = getIsStartMode();
  const isEditingExemplar = getAppOptionsEditingExemplar();
  const files = useAppSelector(
    state => (state.lab2Project.projectSources?.source as MultiFileSource).files
  );
  const channelId =
    useAppSelector(state => state.lab.channel && state.lab.channel.id) || '';

  // Skip moderating images that are added by levelbuilders in start mode.
  const onImageFlaggedWithOverride = isStartMode ? undefined : onImageFlagged;

  const uploadExternalFile = useCallback(
    async (file: File) => {
      const uuid = createUuid();
      const fileType = file.name.split('.').pop();

      if (isStartMode || isEditingExemplar) {
        const bodyData = new FormData();
        bodyData.append('files[]', file);

        const url = `/level_starter_assets/${name}/uuid/${uuid}.${fileType}`;
        await HttpClient.post(url, bodyData, true);
        return url;
      } else {
        const url = `/v3/assets/${channelId}/${uuid}.${fileType}`;
        await HttpClient.put(url, file);
        return url;
      }
    },
    [channelId, isStartMode, isEditingExemplar, name]
  );

  const sendAnalyticsEvent = useCallback(
    (eventName: string, payload: Record<string, string>) => {
      switch (eventName) {
        case analyticsEvents.UPLOAD_FAILED: {
          sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_UPLOAD_UNACCEPTED_FILE, {
            ...payload,
            fileType: payload.fileName.split('.').pop()?.toLowerCase() || '',
          });
          return;
        }
        case analyticsEvents.UPLOAD_UNACCEPTED_FILE: {
          sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_UPLOAD_FAILED, {
            ...payload,
            fileType: payload.fileName.split('.').pop()?.toLowerCase() || '',
          });
        }
      }
    },
    []
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
    uploadExternalFile,
    onImageFlagged: onImageFlaggedWithOverride,
    ...lab2FileUploaderArgs,
  });
};
