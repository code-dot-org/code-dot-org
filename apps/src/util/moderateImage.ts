import {extension as mimeToExtension} from 'mime-types';

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
  'game_design',
];

const ALLOWED_IMAGE_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

// Azure AI Content Safety requires both dimensions to be at least this size.
const MIN_MODERATION_DIMENSION = 50;

// Severity level blocked by category for AI Content Safety.
// If any category's severity level is greater than or equal to the severity level blocked value,
// the image is flagged. If all categories' severity levels are less than the severity level blocked value,
// the image is 'ok'
// The severity value increases with the severity of the input content:
// 0 (safe), 2 (low), 4 (medium), 6 (high)
const CATEGORY_SEVERITY_LEVEL_BLOCKED: Record<string, number> = {
  Hate: 2,
  SelfHarm: 2,
  Sexual: 2,
  Violence: 2,
};

interface AnalyticsData {
  uploaderType?: 'Lab2FileUploader' | 'AnimationPicker' | 'n/a';
  moderateEvent?: string;
  flaggedEvent?: string;
  assetUrl?: string;
}

/**
 * Returns a scaled-up PNG copy of the file if either dimension is below
 * the required minimum size, otherwise returns the original file unchanged.
 * The copy is only used for the moderation API call — callers still upload
 * the original file.
 * TODO: scale the file to min size on the backend.
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
        const ctx = canvas.getContext('2d')!;
        if (!ctx) {
          reject(
            new Error(
              'Unable to get 2D canvas context for image moderation scaling'
            )
          );
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
  appName: string,
  {
    uploaderType = 'n/a',
    moderateEvent = EVENTS.MODERATE_CUSTOM_IMAGE,
    flaggedEvent = EVENTS.FLAGGED_CUSTOM_IMAGE,
    assetUrl,
  }: AnalyticsData
): Promise<'ok' | 'flagged' | 'skipped'> => {
  const fileExtension = mimeToExtension(file.type) || '';
  if (
    !LABS_WITH_IMAGE_MODERATION.includes(appName ?? '') ||
    !ALLOWED_IMAGE_FILE_EXTENSIONS.includes(fileExtension)
  ) {
    return 'skipped';
  }
  const dimensions = [
    {name: 'UploaderType', value: uploaderType},
    {name: 'AppName', value: appName},
  ];
  MetricsReporter.incrementCounter('ModerateCustomImage.Attempt', dimensions);
  analyticsReporter.sendEvent(moderateEvent, {
    UploaderType: uploaderType,
    appName,
    levelPath: window.location.pathname,
  });
  try {
    const fileToModerate = await scaleFileForModeration(file);
    const endpoint = '/v3/images/moderate';
    const response = await HttpClient.post(endpoint, fileToModerate, true, {
      'Content-Type': fileToModerate.type || 'application/octet-stream',
    });
    const json = await response.json();
    MetricsReporter.incrementCounter('ModerateCustomImage.Success', dimensions);

    if (json === null) {
      return 'skipped';
    }
    const categories = json?.categoriesAnalysis;
    if (
      categories?.every(
        (category: {severity: number; category: string}) =>
          category?.severity <
          CATEGORY_SEVERITY_LEVEL_BLOCKED[category?.category]
      )
    ) {
      return 'ok';
    }

    MetricsReporter.incrementCounter('ModerateCustomImage.Flagged', dimensions);
    analyticsReporter.sendEvent(flaggedEvent, {
      UploaderType: uploaderType,
      appName,
      levelPath: window.location.pathname,
      moderationService: 'AI Content Safety',
      moderationResult: JSON.stringify(json),
      assetUrl: assetUrl ? `${window.location.origin}${assetUrl}` : undefined,
    });
    return 'flagged';
  } catch (error) {
    MetricsReporter.logError('Error with image moderation: ' + error);
    MetricsReporter.incrementCounter('ModerateCustomImage.Error', dimensions);
    return 'skipped';
  }
};
