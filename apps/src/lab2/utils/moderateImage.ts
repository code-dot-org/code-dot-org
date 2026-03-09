import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils/analyticsReporterHelper';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
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
  const uploaderType = isModelOutputImage ? 'n/a' : 'Lab2FileUploader';
  metricsReporter.incrementCounter('ModerateCustomImage.Attempt', [
    {name: 'UploaderType', value: uploaderType},
  ]);
  const moderateImageStatsigEvent = isModelOutputImage
    ? EVENTS.MODERATE_MODEL_OUTPUT_IMAGE_AZURE
    : EVENTS.MODERATE_CUSTOM_IMAGE;
  sendLab2AnalyticsEvent(
    moderateImageStatsigEvent,
    !isModelOutputImage ? {UploaderType: 'Lab2 File Uploader'} : {}
  );
  try {
    const response = await HttpClient.post(`/v3/images/moderate`, file, true, {
      'Content-Type': file.type || 'application/octet-stream',
    });
    if (!response.ok) {
      metricsReporter.logError('Error with image moderation: HTTP error');
      metricsReporter.incrementCounter('ModerateCustomImage.Error', [
        {name: 'UploaderType', value: uploaderType},
      ]);
      return 'skipped';
    }
    const json = await response.json();
    metricsReporter.incrementCounter('ModerateCustomImage.Success', [
      {name: 'UploaderType', value: uploaderType},
    ]);
    if (json?.rating === 'everyone' || json?.rating === 'unknown') {
      return 'ok';
    }
    metricsReporter.incrementCounter('ModerateCustomImage.Flagged', [
      {name: 'UploaderType', value: uploaderType},
    ]);
    const flaggedImageStatsigEvent = isModelOutputImage
      ? EVENTS.FLAGGED_MODEL_OUTPUT_IMAGE_AZURE
      : EVENTS.FLAGGED_CUSTOM_IMAGE;
    sendLab2AnalyticsEvent(
      flaggedImageStatsigEvent,
      !isModelOutputImage ? {UploaderType: 'Lab2 File Uploader'} : {}
    );
    return 'flagged';
  } catch (error) {
    metricsReporter.logError('Error with image moderation: ' + error);
    metricsReporter.incrementCounter('ModerateCustomImage.Error', [
      {name: 'UploaderType', value: uploaderType},
    ]);
    return 'skipped';
  }
};
