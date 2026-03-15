import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';

const LABS_WITH_IMAGE_MODERATION = [
  'weblab2',
  'aichat',
  'gamelab',
  'spritelab',
  'poetry',
];

const ALLOWED_IMAGE_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

interface AnalyticsData {
  uploaderType?: 'Lab2FileUploader' | 'AnimationPicker' | 'n/a';
  moderateEvent?: string;
  flaggedEvent?: string;
}

export const moderateImage = async (
  file: File,
  ext: string,
  appName: string,
  {
    uploaderType = 'n/a',
    moderateEvent = EVENTS.MODERATE_CUSTOM_IMAGE,
    flaggedEvent = EVENTS.FLAGGED_CUSTOM_IMAGE,
  }: AnalyticsData
): Promise<'ok' | 'flagged' | 'skipped'> => {
  if (
    !LABS_WITH_IMAGE_MODERATION.includes(appName ?? '') ||
    !ALLOWED_IMAGE_FILE_EXTENSIONS.includes(ext)
  ) {
    return 'skipped';
  }
  const dimensions = [{name: 'UploaderType', value: uploaderType}];
  MetricsReporter.incrementCounter('ModerateCustomImage.Attempt', dimensions);
  analyticsReporter.sendEvent(moderateEvent, {
    UploaderType: uploaderType,
    appName,
    levelPath: window.location.pathname,
  });
  try {
    const response = await HttpClient.post(`/v3/images/moderate`, file, true, {
      'Content-Type': file.type || 'application/octet-stream',
    });
    const json = await response.json();
    MetricsReporter.incrementCounter('ModerateCustomImage.Success', dimensions);
    if (json?.rating === 'everyone' || json?.rating === 'unknown') {
      return 'ok';
    }
    MetricsReporter.incrementCounter('ModerateCustomImage.Flagged', dimensions);
    analyticsReporter.sendEvent(flaggedEvent, {
      UploaderType: uploaderType,
      appName,
      levelPath: window.location.pathname,
    });
    return 'flagged';
  } catch (error) {
    MetricsReporter.logError('Error with image moderation: ' + error);
    MetricsReporter.incrementCounter('ModerateCustomImage.Error', dimensions);
    return 'skipped';
  }
};
