import {type GeneratedFile, type ModelMessage, Output} from 'ai';
import z from 'zod/v3';

import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {ValueOf} from '@cdo/apps/types/utils';
import {moderateImage} from '@cdo/apps/util/moderateImage';
import {
  AiChatModelIds,
  SafeAndSupportedImageTypes,
} from '@cdo/generated-scripts/sharedConstants';

import {prepareGeneratedFile} from './fileHelpers';
import {getModel} from './modelHelpers';

const outputSchema = Output.object({
  schema: z.object({
    classification: z
      .enum(['OK', 'INAPPROPRIATE'])
      .describe('Safety classification for school appropriateness'),
  }),
});

interface SafetyConfig {
  modelId: ValueOf<typeof AiChatModelIds>;
  safetySystemPrompt: string;
}

const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
  modelId: AiChatModelIds.GEMINI_2_5_FLASH,
  safetySystemPrompt:
    'You are a content filter trying to keep a school teacher out of trouble. Determine if chat text is inappropriate for an American public middle school classroom. Examples of inappropriate content: profanity, swears, illegal behavior, insults, bullying, slurs, sex, violence, racism, sexism, threats, weapons, dirty slang, etc. If text is inappropriate, respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.',
};

const DEFAULT_IMAGE_SAFETY_CONFIG: SafetyConfig = {
  modelId: AiChatModelIds.GEMINI_2_5_FLASH,
  safetySystemPrompt:
    'You are a content filter trying to keep a school teacher out of trouble. Determine if the image is inappropriate for an American public middle school classroom. Examples of inappropriate content: profanity or explicit text, illegal behavior, insults, bullying, slurs, racism, sexism, hate symbols, sex, nudity, sexualized content, violence, gore, threats, weapons, dirty slang, drug use, alcohol use, tobacco or vaping, self-harm, other content that would be unsafe or disruptive in class\nIf the image is inappropriate, respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.',
};

const OUTPUT_IMAGE_LLM_SAFETY_JUDGE_ENABLED_DCDO_KEY =
  'aichat-output-image-llm-safety-judge-enabled';

function isValidAndPassingClassification(classification?: string): boolean {
  if (classification !== 'OK' && classification !== 'INAPPROPRIATE') {
    throw new Error('Invalid classification value: ' + classification);
  }
  return classification === 'OK';
}

export function isOutputImageLlmSafetyJudgeEnabled(): boolean {
  return (
    DCDO.get(OUTPUT_IMAGE_LLM_SAFETY_JUDGE_ENABLED_DCDO_KEY, true) !== false
  );
}

/**
 * Invokes an LLM to determine if the given text is safe.
 */
export async function isTextSafe(
  text: string,
  phase?: 'input_filter' | 'output_filter',
  customSafetyConfig?: Partial<SafetyConfig>
): Promise<boolean> {
  const safetyConfig = {
    ...DEFAULT_SAFETY_CONFIG,
    ...customSafetyConfig,
  };

  const response = await generateText(
    {
      prompt: `${safetyConfig.safetySystemPrompt}. Here is the text to classify: ${text}`,
      output: outputSchema,
      model: getModel(safetyConfig.modelId),
    },
    {phase: phase}
  );

  return isValidAndPassingClassification(response.output?.classification);
}

/**
 * Invokes an LLM to determine if the given image is safe.
 */
export async function isImageSafe(
  file: GeneratedFile,
  customSafetyConfig?: Partial<SafetyConfig>
): Promise<boolean> {
  const safetyConfig = {
    ...DEFAULT_IMAGE_SAFETY_CONFIG,
    ...customSafetyConfig,
  };

  const messages: ModelMessage[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: safetyConfig.safetySystemPrompt,
        },
        {
          type: 'file',
          data: file.base64,
          mediaType: file.mediaType,
        },
      ],
    },
  ];

  const response = await generateText(
    {
      messages,
      output: outputSchema,
      model: getModel(safetyConfig.modelId),
    },
    {phase: 'llm_safety_judge'}
  );

  return isValidAndPassingClassification(response.output?.classification);
}

export async function getImageModerationStatus(
  file: GeneratedFile,
  assetUrl?: string,
  appName = 'aichat'
): Promise<'safe' | 'flagged' | 'error'> {
  const {filename, fileBuffer, mediaType} = prepareGeneratedFile(
    file,
    SafeAndSupportedImageTypes
  );
  const image = new File([fileBuffer], filename, {type: mediaType});
  const moderationStatus = await moderateImage(
    image,
    appName,
    {
      moderateEvent: EVENTS.MODERATE_MODEL_OUTPUT_IMAGE_AZURE,
      flaggedEvent: EVENTS.FLAGGED_MODEL_OUTPUT_IMAGE_AZURE,
      assetUrl,
      feature: 'ai-gateway',
    },
    {Violence: 2}
  );
  return moderationStatus;
}

/**
 * The output-image safety stack shared by every image-generating lab: Azure
 * moderation always, plus the LLM judge when the caller's flag says so, run
 * concurrently. The caller maps the outcomes to its own statuses. Layer
 * choices belong in this options object, never in per-lab copies.
 *
 * TODO: moderation moves into the gateway worker; this helper and its call
 * sites retire then.
 */
export async function checkGeneratedImageSafety(
  file: GeneratedFile,
  options: {appName?: string; assetUrl?: string; runLlmJudge: boolean}
): Promise<{
  moderation: 'safe' | 'flagged' | 'error';
  judge: 'ok' | 'flagged' | 'error' | 'skipped';
}> {
  const checks: [
    ReturnType<typeof getImageModerationStatus>,
    ReturnType<typeof isImageSafe>?
  ] = [getImageModerationStatus(file, options.assetUrl, options.appName)];
  if (options.runLlmJudge) {
    checks.push(isImageSafe(file));
  }
  const [moderationResult, judgeResult] = await Promise.allSettled(checks);
  const moderation =
    moderationResult.status === 'fulfilled' ? moderationResult.value : 'error';
  let judge: 'ok' | 'flagged' | 'error' | 'skipped' = 'skipped';
  if (judgeResult !== undefined) {
    judge =
      judgeResult.status === 'fulfilled'
        ? judgeResult.value
          ? 'ok'
          : 'flagged'
        : 'error';
  }
  return {moderation, judge};
}
