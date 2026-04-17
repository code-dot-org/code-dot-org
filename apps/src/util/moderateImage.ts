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

const ALLOWED_IMAGE_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

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

export const moderateImage = async (
  file: File,
  appName: string,
  {
    uploaderType = 'n/a',
    moderateEvent = EVENTS.MODERATE_CUSTOM_IMAGE,
    flaggedEvent = EVENTS.FLAGGED_CUSTOM_IMAGE,
    assetUrl,
  }: AnalyticsData
): Promise<'safe' | 'flagged' | 'error'> => {
  const fileExtension = mimeToExtension(file.type) || '';
  if (
    !LABS_WITH_IMAGE_MODERATION.includes(appName ?? '') ||
    !ALLOWED_IMAGE_FILE_EXTENSIONS.includes(fileExtension)
  ) {
    return 'error';
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
    const response = await HttpClient.post('/v3/images/moderate', file, true, {
      'Content-Type': file.type || 'application/octet-stream',
    });
    const json = await response.json();
    if (json === null) {
      return 'error';
    }

    MetricsReporter.incrementCounter('ModerateCustomImage.Success', dimensions);

    const categories = json?.categoriesAnalysis;
    if (
      categories?.every(
        (category: {severity: number; category: string}) =>
          category?.severity <
          CATEGORY_SEVERITY_LEVEL_BLOCKED[category?.category]
      )
    ) {
      return 'safe';
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
    return 'error';
  }
};
