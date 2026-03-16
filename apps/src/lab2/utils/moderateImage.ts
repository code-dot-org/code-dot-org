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

// Azure Content Moderator requires both dimensions to be at least this size.
const MIN_MODERATION_DIMENSION = 128;

interface AnalyticsData {
  uploaderType?: 'Lab2FileUploader' | 'AnimationPicker' | 'n/a';
  moderateEvent?: string;
  flaggedEvent?: string;
}

/**
 * Returns a scaled-up PNG copy of the file if either dimension is below
 * MIN_MODERATION_DIMENSION, otherwise returns the original file unchanged.
 * The copy is only used for the moderation API call — callers still upload
 * the original file.
 */
const scaleFileForModeration = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const {width, height} = img;
        if (
          width >= MIN_MODERATION_DIMENSION &&
          height >= MIN_MODERATION_DIMENSION
        ) {
          resolve(file);
          return;
        }
        const scale = Math.max(
          MIN_MODERATION_DIMENSION / width,
          MIN_MODERATION_DIMENSION / height
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(width * scale);
        canvas.height = Math.ceil(height * scale);
        canvas
          .getContext('2d')!
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Canvas toBlob returned null'));
            return;
          }
          resolve(
            new File([blob], 'moderation-scaled.png', {type: 'image/png'})
          );
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
    const fileToModerate = await scaleFileForModeration(file);
    const response = await HttpClient.post(
      `/v3/images/moderate`,
      fileToModerate,
      true,
      {'Content-Type': fileToModerate.type || 'application/octet-stream'}
    );
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
