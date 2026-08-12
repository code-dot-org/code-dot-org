import * as Observability from '@code-dot-org/core/plugins/observability';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {SafeAndSupportedImageTypes} from '@cdo/generated-scripts/sharedConstants';

const LABS_WITH_IMAGE_MODERATION = [
  'weblab2',
  'aichat',
  'gamelab',
  'spritelab',
  'poetry',
  'game_design',
  'sketchlab',
  'applab',
];

const MODERATION_SPAN_OP = 'image.moderate';
const FILE_MODERATION_SPAN_NAME = 'image-moderation.moderateImage';
const URL_MODERATION_SPAN_NAME = 'image-moderation.moderateImageUrl';

export type CategoryName = 'Hate' | 'SelfHarm' | 'Sexual' | 'Violence';
export type SeverityThresholds = Partial<Record<CategoryName, number>>;
export type CategoryAnalysis = {
  category: CategoryName;
  severity: 0 | 2 | 4 | 6;
};
// The parsed body of a /v3/images/moderate response (Azure AI Content Safety),
// or null when the moderation service is unavailable.
export type ImageModerationResult = {
  categoriesAnalysis?: CategoryAnalysis[];
} | null;

// Severity level blocked by category for AI Content Safety.
// If any category's severity level is greater than or equal to the severity level blocked value,
// the image is flagged. If all categories' severity levels are less than the severity level blocked value,
// the image is 'ok'
// The severity value increases with the severity of the input content:
// 0 (safe), 2 (low), 4 (medium), 6 (high)
const CATEGORY_SEVERITY_LEVEL_BLOCKED: Record<CategoryName, number> = {
  Hate: 2,
  SelfHarm: 2,
  Sexual: 2,
  Violence: 4,
};

// Applies the per-category severity thresholds to a parsed Azure response and
// returns the flag/allow decision. Single source of truth shared by
// moderateImage() and the image-safety eval. Matches the historical inline
// check: 'safe' only when every reported category is below its blocked
// severity; a missing/non-array categoriesAnalysis is treated as 'flagged'.
export const getImageModerationVerdict = (
  result: ImageModerationResult,
  overrideSeverityThresholds?: SeverityThresholds
): 'safe' | 'flagged' => {
  const categorySeverityLevelBlocked: Record<CategoryName, number> = {
    ...CATEGORY_SEVERITY_LEVEL_BLOCKED,
    ...overrideSeverityThresholds,
  };
  const categories = result?.categoriesAnalysis;
  const safe = categories?.every(
    category =>
      category?.severity < categorySeverityLevelBlocked[category?.category]
  );
  return safe ? 'safe' : 'flagged';
};

interface AnalyticsData {
  uploaderType?:
    | 'Lab2FileUploader'
    | 'AnimationPicker'
    | 'SketchLab'
    | 'ImageURLInput'
    | 'n/a';
  moderateEvent?: string;
  flaggedEvent?: string;
  assetUrl?: string;
  feature?: 'ai-gateway' | 'image-moderation';
}

interface ModerationConfig {
  request: () => Promise<Response>;
  formatAssetUrl: (assetUrl?: string) => string | undefined;
  span: {
    name: string;
    attributes: Record<string, string | number | boolean>;
  };
}

const buildDimensions = (uploaderType: string, appName: string) => [
  {name: 'UploaderType', value: uploaderType},
  {name: 'AppName', value: appName},
];

const sendModerationEvent = (
  uploaderType: string,
  appName: string,
  moderateEvent: string
) => {
  analyticsReporter.sendEvent(moderateEvent, {
    UploaderType: uploaderType,
    appName,
    levelPath: window.location.pathname,
  });
};

const runModeration = async (
  appName: string,
  {
    uploaderType = 'n/a',
    moderateEvent = EVENTS.MODERATE_CUSTOM_IMAGE,
    flaggedEvent = EVENTS.FLAGGED_CUSTOM_IMAGE,
    assetUrl,
    feature = 'image-moderation',
  }: AnalyticsData,
  overrideSeverityThresholds: SeverityThresholds | undefined,
  moderationConfig: ModerationConfig
): Promise<'safe' | 'flagged' | 'error'> => {
  const dimensions = buildDimensions(uploaderType, appName);
  MetricsReporter.incrementCounter('ModerateCustomImage.Attempt', dimensions);
  sendModerationEvent(uploaderType, appName, moderateEvent);

  const checkImage = async (): Promise<'safe' | 'flagged' | 'error'> => {
    try {
      const response = await moderationConfig.request();
      const json = await response.json();
      if (json === null) {
        return 'error';
      }

      MetricsReporter.incrementCounter(
        'ModerateCustomImage.Success',
        dimensions
      );

      if (
        getImageModerationVerdict(json, overrideSeverityThresholds) === 'safe'
      ) {
        return 'safe';
      }

      MetricsReporter.incrementCounter(
        'ModerateCustomImage.Flagged',
        dimensions
      );
      analyticsReporter.sendEvent(flaggedEvent, {
        UploaderType: uploaderType,
        appName,
        levelPath: window.location.pathname,
        moderationService: 'AI Content Safety',
        moderationResult: JSON.stringify(json),
        assetUrl: moderationConfig.formatAssetUrl(assetUrl),
      });
      return 'flagged';
    } catch (error) {
      MetricsReporter.logError('Error with image moderation: ' + error);
      MetricsReporter.incrementCounter('ModerateCustomImage.Error', dimensions);
      return 'error';
    }
  };

  return Observability.startSpan(
    {
      name: moderationConfig.span.name,
      op: MODERATION_SPAN_OP,
      attributes: {
        feature,
        'image.app_name': appName,
        'image.uploader_type': uploaderType,
        ...moderationConfig.span.attributes,
      },
    },
    checkImage
  );
};

export const moderateImage = async (
  file: File,
  appName: string,
  {
    uploaderType = 'n/a',
    moderateEvent = EVENTS.MODERATE_CUSTOM_IMAGE,
    flaggedEvent = EVENTS.FLAGGED_CUSTOM_IMAGE,
    assetUrl,
    feature,
  }: AnalyticsData,
  overrideSeverityThresholds?: SeverityThresholds
): Promise<'safe' | 'flagged' | 'error'> => {
  const imageType = file.type || '';
  if (
    !LABS_WITH_IMAGE_MODERATION.includes(appName ?? '') ||
    !(SafeAndSupportedImageTypes as readonly string[]).includes(imageType)
  ) {
    return 'error';
  }
  return runModeration(
    appName,
    {uploaderType, moderateEvent, flaggedEvent, assetUrl, feature},
    overrideSeverityThresholds,
    {
      request: () =>
        HttpClient.post('/v3/images/moderate', file, true, {
          'Content-Type': file.type || 'application/octet-stream',
        }),
      formatAssetUrl: url =>
        url ? `${window.location.origin}${url}` : undefined,
      span: {
        name: FILE_MODERATION_SPAN_NAME,
        attributes: {
          'image.source': 'file',
          'image.type': imageType,
          'image.size_bytes': file.size,
        },
      },
    }
  );
};

export const moderateImageUrl = async (
  imageUrl: string,
  appName: string,
  {
    uploaderType = 'n/a',
    moderateEvent = EVENTS.MODERATE_CUSTOM_IMAGE,
    flaggedEvent = EVENTS.FLAGGED_CUSTOM_IMAGE,
    assetUrl,
    feature,
  }: AnalyticsData,
  overrideSeverityThresholds?: SeverityThresholds
): Promise<'safe' | 'flagged' | 'error'> => {
  if (!LABS_WITH_IMAGE_MODERATION.includes(appName ?? '')) {
    return 'error';
  }
  return runModeration(
    appName,
    {uploaderType, moderateEvent, flaggedEvent, assetUrl, feature},
    overrideSeverityThresholds,
    {
      request: () =>
        HttpClient.post(
          '/v3/images/moderate_url',
          JSON.stringify({url: imageUrl}),
          true,
          {'Content-Type': 'application/json; charset=UTF-8'}
        ),
      formatAssetUrl: url => url || undefined,
      span: {
        name: URL_MODERATION_SPAN_NAME,
        attributes: {'image.source': 'url'},
      },
    }
  );
};
