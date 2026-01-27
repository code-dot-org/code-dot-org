import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {WEBLAB2_IMAGE_FILE_TYPES} from '@cdo/apps/weblab2/constants';

export const moderateImage = async (
  file: File,
  ext: string,
  appName?: string
): Promise<'ok' | 'flagged' | 'skipped'> => {
  if (
    appName !== 'weblab2' ||
    ext.toLowerCase() === 'gif' || // Our current moderation API does not support GIFs, so we skip them.
    !WEBLAB2_IMAGE_FILE_TYPES.includes(ext)
  ) {
    return 'skipped';
  }
  const metricsReporter = Lab2Registry.getInstance().getMetricsReporter();
  const appNameForMetrics = appName || 'unknown';
  metricsReporter.incrementCounter('ModerateCustomImage.Attempt', [
    {name: 'AppName', value: appNameForMetrics},
    {name: 'UploaderType', value: 'Lab2FileUploader'},
  ]);
  analyticsReporter.sendEvent(
    EVENTS.MODERATE_CUSTOM_IMAGE,
    {
      UploaderType: 'Lab2 File Uploader',
      ProjectType: appName,
    },
    PLATFORMS.STATSIG
  );
  try {
    const response = await HttpClient.post(`/v3/images/moderate`, file, true, {
      'Content-Type': file.type || 'application/octet-stream',
    });
    if (!response.ok) {
      metricsReporter.logError('Error with image moderation: HTTP error');
      metricsReporter.incrementCounter('ModerateCustomImage.Error', [
        {name: 'AppName', value: appNameForMetrics},
        {name: 'UploaderType', value: 'Lab2FileUploader'},
      ]);
      return 'skipped';
    }
    const json = await response.json();
    metricsReporter.incrementCounter('ModerateCustomImage.Success', [
      {name: 'AppName', value: appNameForMetrics},
      {name: 'UploaderType', value: 'Lab2FileUploader'},
    ]);
    if (json?.rating === 'everyone' || json?.rating === 'unknown') {
      return 'ok';
    }
    metricsReporter.incrementCounter('ModerateCustomImage.Flagged', [
      {name: 'AppName', value: appNameForMetrics},
      {name: 'UploaderType', value: 'Lab2FileUploader'},
    ]);
    analyticsReporter.sendEvent(
      EVENTS.FLAGGED_CUSTOM_IMAGE,
      {
        UploaderType: 'Lab2 File Uploader',
        ProjectType: appName,
      },
      PLATFORMS.STATSIG
    );
    return 'flagged';
  } catch (error) {
    metricsReporter.logError('Error with image moderation: ' + error);
    metricsReporter.incrementCounter('ModerateCustomImage.Error', [
      {name: 'AppName', value: appNameForMetrics},
      {name: 'UploaderType', value: 'Lab2FileUploader'},
    ]);
    return 'skipped';
  }
};
