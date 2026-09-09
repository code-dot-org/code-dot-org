// Safety checks for image generation: the student's prompt and every
// generated picture must pass the classroom-safety LLM judge before a result
// reaches the student. The judges are aichat's (same rubric, same gateway);
// this module adapts them to the image pipeline's types and adds a kill
// switch. Callers run the checks concurrently with generation, so a safe
// request pays almost nothing.

import {type GeneratedFile} from 'ai';

import {
  isImageSafe,
  isTextSafe,
} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import DCDO from '@cdo/apps/dcdo';

import type {RawImage} from './imageGeneration';

// Kill switch, default on: flip to false to stop both judges if they ever
// misbehave (mirrors aichat's flag pattern).
const IMAGE_SAFETY_DCDO_KEY = 'spritelab-lab2-image-safety-enabled';

export function isImageSafetyEnabled(): boolean {
  return DCDO.get(IMAGE_SAFETY_DCDO_KEY, true) !== false;
}

/** Thrown when the prompt or a generated picture fails the safety judge. */
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
 * Judge the student's prompt; throws ImageSafetyError when flagged. A judge
 * failure propagates, so generation fails closed rather than skipping the
 * check.
 */
export async function checkPromptSafety(text: string): Promise<void> {
  if (!isImageSafetyEnabled()) {
    return;
  }
  if (!(await isTextSafe(text, 'input_filter'))) {
    throw new ImageSafetyError('prompt');
  }
}

// btoa can't take a Uint8Array and String.fromCharCode overflows the argument
// list on megabyte images, so build the binary string in chunks.
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** Judge a generated picture; throws ImageSafetyError when flagged. */
export async function checkImageSafety(raw: RawImage): Promise<void> {
  if (!isImageSafetyEnabled()) {
    return;
  }
  const file = {
    base64: bytesToBase64(raw.uint8Array),
    mediaType: raw.mediaType,
    uint8Array: raw.uint8Array,
  } as GeneratedFile;
  if (!(await isImageSafe(file))) {
    throw new ImageSafetyError('image');
  }
}
