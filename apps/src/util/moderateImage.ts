import {extension as mimeToExtension} from 'mime-types';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import experiments from '@cdo/apps/util/experiments';
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
const MIN_MODERATION_DIMENSION_CONTENT_MODERATOR = 128;
// Azure AI Content Safety requires both dimensions to be at least this size.
const MIN_MODERATION_DIMENSION_AI_CONTENT_SAFETY = 50;

interface AnalyticsData {
  uploaderType?: 'Lab2FileUploader' | 'AnimationPicker' | 'n/a';
  moderateEvent?: string;
  flaggedEvent?: string;
}

/**
 * Returns a scaled-up PNG copy of the file if either dimension is below
 * the required minimum size for the selected service, otherwise returns the original file unchanged.
 * The copy is only used for the moderation API call — callers still upload
 * the original file.
 * TODO: Once we migrate to the new moderation API, we'll scale the file to min size on the backend.
 */
const scaleFileForModeration = (
  file: File,
  useAiContentSafety: boolean
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const minModerationDimension = useAiContentSafety
      ? MIN_MODERATION_DIMENSION_AI_CONTENT_SAFETY
      : MIN_MODERATION_DIMENSION_CONTENT_MODERATOR;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const {width, height} = img;
        if (
          width >= minModerationDimension &&
          height >= minModerationDimension
        ) {
          resolve(file);
          return;
        }
        const scale = Math.max(
          minModerationDimension / width,
          minModerationDimension / height
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
    const useAiContentSafety = experiments.isEnabledAllowingQueryString(
      experiments.AI_CONTENT_SAFETY
    );
    const fileToModerate = await scaleFileForModeration(
      file,
      useAiContentSafety
    );
    const endpoint = useAiContentSafety
      ? '/v3/images/moderate-ai-content-safety'
      : '/v3/images/moderate';
    const response = await HttpClient.post(endpoint, fileToModerate, true, {
      'Content-Type': fileToModerate.type || 'application/octet-stream',
    });
    const json = await response.json();
    MetricsReporter.incrementCounter('ModerateCustomImage.Success', dimensions);
    if (useAiContentSafety) {
      // Azure AI Content Safety
      if (json === null) {
        return 'skipped';
      }
      // Severity level blocked by category.
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
    } else {
      // Azure Content Moderator
      if (json?.rating === 'everyone' || json?.rating === 'unknown') {
        return 'ok';
      }
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
