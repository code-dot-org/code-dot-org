import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils/analyticsReporterHelper';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import HttpClient from '@cdo/apps/util/HttpClient';
import {WEBLAB2_IMAGE_FILE_TYPES} from '@cdo/apps/weblab2/constants';

const LAB2_LABS_MODERATE_IMAGES = ['weblab2', 'aichat'];

interface AnalyticsData {
  appName: string;
  uploaderType?: 'Lab2FileUploader' | 'n/a';
  moderateEvent?: string;
  flaggedEvent?: string;
}

export const moderateImage = async (
  file: File,
  ext: string,
  {
    appName,
    uploaderType = 'n/a',
    moderateEvent = EVENTS.MODERATE_CUSTOM_IMAGE,
    flaggedEvent = EVENTS.FLAGGED_CUSTOM_IMAGE,
  }: AnalyticsData
): Promise<'ok' | 'flagged' | 'skipped'> => {
  if (
    !LAB2_LABS_MODERATE_IMAGES.includes(appName ?? '') ||
    !WEBLAB2_IMAGE_FILE_TYPES.includes(ext)
  ) {
    return 'skipped';
  }
  const metricsReporter = Lab2Registry.getInstance().getMetricsReporter();
  const dimensions = [{name: 'UploaderType', value: uploaderType}];
  metricsReporter.incrementCounter('ModerateCustomImage.Attempt', dimensions);
  sendLab2AnalyticsEvent(moderateEvent, {UploaderType: uploaderType});
  try {
    const response = await HttpClient.post(`/v3/images/moderate`, file, true, {
      'Content-Type': file.type || 'application/octet-stream',
    });
    const json = await response.json();
    metricsReporter.incrementCounter('ModerateCustomImage.Success', dimensions);
    if (json?.rating === 'everyone' || json?.rating === 'unknown') {
      return 'ok';
    }
    metricsReporter.incrementCounter('ModerateCustomImage.Flagged', dimensions);
    sendLab2AnalyticsEvent(flaggedEvent, {UploaderType: uploaderType});
    return 'flagged';
  } catch (error) {
    metricsReporter.logError('Error with image moderation: ' + error);
    metricsReporter.incrementCounter('ModerateCustomImage.Error', dimensions);
    return 'skipped';
  }
};
