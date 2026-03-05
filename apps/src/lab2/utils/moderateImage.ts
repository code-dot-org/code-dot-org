import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {WEBLAB2_IMAGE_FILE_TYPES} from '@cdo/apps/weblab2/constants';

const LAB2_LABS_MODERATE_IMAGES = ['weblab2', 'aichat'];

export const moderateImage = async (
  file: File,
  ext: string,
  appName: string,
  isModelOutputImage?: boolean
): Promise<'ok' | 'flagged' | 'skipped'> => {
  if (
    !LAB2_LABS_MODERATE_IMAGES.includes(appName ?? '') ||
    !WEBLAB2_IMAGE_FILE_TYPES.includes(ext)
  ) {
    return 'skipped';
  }
  const metricsReporter = Lab2Registry.getInstance().getMetricsReporter();
  metricsReporter.incrementCounter('ModerateCustomImage.Attempt', [
    {name: 'UploaderType', value: 'Lab2FileUploader'},
  ]);
  const moderateImageStatsigEvent = isModelOutputImage
    ? EVENTS.MODERATE_MODEL_OUTPUT_IMAGE_AZURE
    : EVENTS.MODERATE_CUSTOM_IMAGE;
  analyticsReporter.sendEvent(moderateImageStatsigEvent, {
    UploaderType: 'Lab2 File Uploader',
    ProjectType: appName,
  });
  try {
    const response = await HttpClient.post(`/v3/images/moderate`, file, true, {
      'Content-Type': file.type || 'application/octet-stream',
    });
    if (!response.ok) {
      metricsReporter.logError('Error with image moderation: HTTP error');
      metricsReporter.incrementCounter('ModerateCustomImage.Error', [
        {name: 'UploaderType', value: 'Lab2FileUploader'},
      ]);
      return 'skipped';
    }
    const json = await response.json();
    metricsReporter.incrementCounter('ModerateCustomImage.Success', [
      {name: 'UploaderType', value: 'Lab2FileUploader'},
    ]);
    if (json?.rating === 'everyone' || json?.rating === 'unknown') {
      return 'ok';
    }
    metricsReporter.incrementCounter('ModerateCustomImage.Flagged', [
      {name: 'UploaderType', value: 'Lab2FileUploader'},
    ]);
    const flaggedImageStatsigEvent = isModelOutputImage
      ? EVENTS.FLAGGED_MODEL_OUTPUT_IMAGE_AZURE
      : EVENTS.FLAGGED_CUSTOM_IMAGE;
    analyticsReporter.sendEvent(flaggedImageStatsigEvent, {
      UploaderType: 'Lab2 File Uploader',
      ProjectType: appName,
    });
    return 'flagged';
  } catch (error) {
    metricsReporter.logError('Error with image moderation: ' + error);
    metricsReporter.incrementCounter('ModerateCustomImage.Error', [
      {name: 'UploaderType', value: 'Lab2FileUploader'},
    ]);
    return 'skipped';
  }
};
