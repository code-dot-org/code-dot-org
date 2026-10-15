// Safety checks for image generation: the student's prompt and every
// generated picture must pass before a result reaches the student. Azure
// moderation always runs on pictures; this lab's two LLM judge calls
// (aichat's judges, same rubric and gateway — aichat gates its own use with
// its own flag) sit behind one kill switch here. Callers run the checks
// concurrently with generation, so a safe request pays almost nothing.

import * as Observability from '@code-dot-org/core/plugins/observability';
import {type GeneratedFile} from 'ai';

import {
  checkGeneratedImageSafety,
  isTextSafe,
} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import DCDO from '@cdo/apps/dcdo';

import type {RawImage} from './imageGeneration';

// Kill switch over both LLM judges (prompt and picture). Azure moderation
// is deliberately outside it: flipping this off restores generation when a
// judge misbehaves, without dropping the deterministic moderation floor.
const IMAGE_SAFETY_DCDO_KEY = 'spritelab-lab2-image-safety-enabled';

// Sentry metric names; the tests pin the strings independently.
const PROMPT_SAFETY_METRIC = 'spritelab-lab2.prompt_safety';
const IMAGE_SAFETY_METRIC = 'spritelab-lab2.image_safety';

export function isImageSafetyEnabled(): boolean {
  return DCDO.get(IMAGE_SAFETY_DCDO_KEY, true) !== false;
}

/** Thrown when the prompt or a generated picture fails a safety check. */
export class ImageSafetyError extends Error {
  constructor(public readonly phase: 'prompt' | 'image') {
    super(
      phase === 'prompt'
        ? 'The prompt failed the safety check'
        : 'A generated image failed the safety check'
    );
    this.name = 'ImageSafetyError';
  }
}

/**
 * Mark a verdict promise as handled, so a rejection landing while other
 * work is still in flight doesn't fire the browser's unhandledrejection.
 * The promise is returned unchanged and still throws when awaited.
 */
export function markHandled<T>(promise: Promise<T>): Promise<T> {
  promise.catch(() => {});
  return promise;
}

/**
 * Judge the student's prompt; throws ImageSafetyError when flagged. A judge
 * failure propagates, so generation fails closed rather than skipping the
 * check.
 */
export async function checkPromptSafety(text: string): Promise<void> {
  if (!isImageSafetyEnabled()) {
    Observability.metrics.count(PROMPT_SAFETY_METRIC, 1, {
      result: 'skipped',
    });
    return;
  }
  let safe: boolean;
  try {
    safe = await isTextSafe(text, 'input_filter');
  } catch (error) {
    Observability.metrics.count(PROMPT_SAFETY_METRIC, 1, {
      result: 'error',
    });
    throw error;
  }
  Observability.metrics.count(PROMPT_SAFETY_METRIC, 1, {
    result: safe ? 'ok' : 'flagged',
  });
  if (!safe) {
    throw new ImageSafetyError('prompt');
  }
}

/**
 * Check a generated picture: Azure moderation always, the LLM judge when
 * the kill switch is on. Throws ImageSafetyError when flagged; a check that
 * itself fails is an error (fail closed).
 */
export async function checkImageSafety(raw: RawImage): Promise<void> {
  const {moderation, judge} = await checkGeneratedImageSafety(
    {
      base64: raw.base64,
      mediaType: raw.mediaType,
      uint8Array: raw.uint8Array,
    } as GeneratedFile,
    {appName: 'spritelab', runLlmJudge: isImageSafetyEnabled()}
  );
  // Both verdicts on one count: the (moderation x judge) disagreement matrix
  // is the evidence for whether each layer earns its keep.
  Observability.metrics.count(IMAGE_SAFETY_METRIC, 1, {
    moderation,
    judge,
    mediaType: raw.mediaType,
  });
  if (moderation === 'flagged' || judge === 'flagged') {
    throw new ImageSafetyError('image');
  }
  if (moderation === 'error' || judge === 'error') {
    throw new Error('Image safety check failed');
  }
}
