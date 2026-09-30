// The safety checks every lab that shows AI output runs, from apps' aichat
// safetyHelpers: an LLM judge for text, one for images, and Azure moderation
// for images. The judges go through the AI gateway, moderation through
// dashboard. Apps put both image judges behind DCDO switches, which default
// on; frontend has no DCDO, so here they are always on.

import {
  DashboardApiClient,
  imageModerationVerdict,
} from '@code-dot-org/core/api';
import type {GatewayPhase} from '@code-dot-org/core/api';
import {
  AiChatModelIds,
  SafeAndSupportedImageTypes,
} from '@code-dot-org/shared-constants';

const CLASSIFICATION_OUTPUT = {
  type: 'object',
  schema: {
    type: 'object',
    properties: {
      classification: {
        type: 'string',
        enum: ['OK', 'INAPPROPRIATE'],
        description: 'Safety classification for school appropriateness',
      },
    },
    required: ['classification'],
    additionalProperties: false,
    $schema: 'http://json-schema.org/draft-07/schema#',
  },
};

export interface SafetyConfig {
  modelId: string;
  safetySystemPrompt: string;
}

const TEXT_SAFETY_CONFIG: SafetyConfig = {
  modelId: AiChatModelIds.GEMINI_2_5_FLASH,
  safetySystemPrompt:
    'You are a content filter trying to keep a school teacher out of trouble. Determine if chat text is inappropriate for an American public middle school classroom. Examples of inappropriate content: profanity, swears, illegal behavior, insults, bullying, slurs, sex, violence, racism, sexism, threats, weapons, dirty slang, etc. If text is inappropriate, respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.',
};

const IMAGE_SAFETY_CONFIG: SafetyConfig = {
  modelId: AiChatModelIds.GEMINI_2_5_FLASH,
  safetySystemPrompt:
    'You are a content filter trying to keep a school teacher out of trouble. Determine if the image is inappropriate for an American public middle school classroom. Examples of inappropriate content: profanity or explicit text, illegal behavior, insults, bullying, slurs, racism, sexism, hate symbols, sex, nudity, sexualized content, violence, gore, threats, weapons, dirty slang, drug use, alcohol use, tobacco or vaping, self-harm, other content that would be unsafe or disruptive in class\nIf the image is inappropriate, respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.',
};

/** An image a model returned. */
export interface GeneratedImageFile {
  base64: string;
  mediaType: string;
  uint8Array: Uint8Array;
}

function passes(output: unknown): boolean {
  const classification = (output as {classification?: unknown} | undefined)
    ?.classification;
  if (classification !== 'OK' && classification !== 'INAPPROPRIATE') {
    throw new Error('Invalid classification value: ' + String(classification));
  }
  return classification === 'OK';
}

/** Asks an LLM judge whether `text` suits a middle school classroom. */
export async function isTextSafe(
  text: string,
  phase?: Extract<GatewayPhase, 'input_filter' | 'output_filter'>,
  config?: Partial<SafetyConfig>,
): Promise<boolean> {
  const {modelId, safetySystemPrompt} = {...TEXT_SAFETY_CONFIG, ...config};
  const {output} = await DashboardApiClient.aiGateway.generateText(
    {
      model: modelId,
      prompt: `${safetySystemPrompt}. Here is the text to classify: ${text}`,
      output: CLASSIFICATION_OUTPUT,
    },
    {phase},
  );
  return passes(output);
}

/** Asks an LLM judge whether an image suits a middle school classroom. */
export async function isImageSafe(
  file: GeneratedImageFile,
  config?: Partial<SafetyConfig>,
): Promise<boolean> {
  const {modelId, safetySystemPrompt} = {...IMAGE_SAFETY_CONFIG, ...config};
  const {output} = await DashboardApiClient.aiGateway.generateText(
    {
      model: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {type: 'text', text: safetySystemPrompt},
            {type: 'file', data: file.base64, mediaType: file.mediaType},
          ],
        },
      ],
      output: CLASSIFICATION_OUTPUT,
    },
    {phase: 'llm_safety_judge'},
  );
  return passes(output);
}

/**
 * Azure moderation's verdict on a generated image, with violence blocked
 * from severity 2 as aichat has it; 'error' when it cannot say.
 */
export async function getImageModerationStatus(
  file: GeneratedImageFile,
): Promise<'safe' | 'flagged' | 'error'> {
  if (
    !(SafeAndSupportedImageTypes as readonly string[]).includes(file.mediaType)
  ) {
    return 'error';
  }
  try {
    const result = await DashboardApiClient.images.moderate({
      image: new Blob([file.uint8Array as BlobPart], {type: file.mediaType}),
    });
    return imageModerationVerdict(result, {Violence: 2});
  } catch {
    return 'error';
  }
}

/**
 * Moderation always, and the LLM judge when the caller asks, at once. The
 * caller maps the outcomes to its own statuses.
 */
export async function checkGeneratedImageSafety(
  file: GeneratedImageFile,
  options: {runLlmJudge: boolean},
): Promise<{
  moderation: 'safe' | 'flagged' | 'error';
  judge: 'ok' | 'flagged' | 'error' | 'skipped';
}> {
  const [moderationResult, judgeResult] = await Promise.allSettled([
    getImageModerationStatus(file),
    ...(options.runLlmJudge ? [isImageSafe(file)] : []),
  ]);
  const moderation =
    moderationResult.status === 'fulfilled'
      ? (moderationResult.value as 'safe' | 'flagged' | 'error')
      : 'error';
  const judge =
    judgeResult === undefined
      ? 'skipped'
      : judgeResult.status === 'rejected'
        ? 'error'
        : judgeResult.value
          ? 'ok'
          : 'flagged';
  return {moderation, judge};
}
