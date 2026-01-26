import {useState} from 'react';

import {setIsBlockedAbuse} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

type FlaggedImageData = {
  file: File;
  fileType: string;
  uploadFunction: () => Promise<void>;
};

export const useFlaggedImage = () => {
  const dispatch = useAppDispatch();
  const channelId = useAppSelector(state => state.lab.channel?.id);

  const [flaggedImageData, setFlaggedImageData] =
    useState<FlaggedImageData | null>(null);

  const onImageFlagged = (
    file: File,
    fileType: string,
    uploadFunction: () => Promise<void>
  ) => {
    setFlaggedImageData({file, fileType, uploadFunction});
  };

  const handleAcceptFlaggedImage = async (appName: string) => {
    if (!flaggedImageData) return;

    try {
      await flaggedImageData.uploadFunction();
      setFlaggedImageData(null);
      const body = JSON.stringify({type: 'flag'});
      if (channelId) {
        try {
          await HttpClient.post(
            `/v3/channels/${channelId}/abuse/image`,
            body,
            true,
            {'Content-Type': 'application/json; charset=UTF-8'}
          );
          dispatch(setIsBlockedAbuse(true));
          analyticsReporter.sendEvent(
            EVENTS.ACCEPT_FLAGGED_CUSTOM_IMAGE,
            {
              UploaderType: 'Lab2 File Uploader',
              ProjectType: appName,
            },
            PLATFORMS.STATSIG
          );
        } catch (error) {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .logError(
              'Error flagging channel due to flagged image',
              error as Error
            );
        }
      }
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Error uploading flagged image asset', error as Error);
      setFlaggedImageData(null);
    }
  };

  const handleCancelFlaggedImage = (appName: string) => {
    analyticsReporter.sendEvent(
      EVENTS.CANCEL_FLAGGED_CUSTOM_IMAGE,
      {
        UploaderType: 'Lab2 File Uploader',
        ProjectType: appName,
      },
      PLATFORMS.STATSIG
    );
    setFlaggedImageData(null);
  };

  return {
    flaggedImageData,
    onImageFlagged,
    handleAcceptFlaggedImage,
    handleCancelFlaggedImage,
  };
};
