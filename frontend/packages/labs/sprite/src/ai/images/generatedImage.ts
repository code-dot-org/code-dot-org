// What one image generation hands back, without the request that makes it.

import type {AnimationPoses} from '../../characterAnimations';

import type {ImageGenerationMetadata} from './types';

export interface GeneratedImageResult {
  filename: string;
  uint8Array: Uint8Array;
  mediaType: string;
  /** Set when pixel-style output was normalized: physical px per art pixel. */
  pixelGridSize?: number;
  /** The image is already cropped to content: load-time trimming skips it. */
  trimmed?: boolean;
  /** How this image was made, to record on its animation. */
  generation: ImageGenerationMetadata;
  /**
   * Set on a sprite sheet: its frame grid (cells row by row, wrapping at the
   * image width) and playback; `poses` names the ranges of a character set.
   */
  frames?: GeneratedFrames;
}

export interface GeneratedFrames {
  frameSize: {x: number; y: number};
  frameCount: number;
  frameDelay: number;
  looping: boolean;
  poses?: AnimationPoses;
}

// The part of the AI SDK's GeneratedFile that rawImageToBlob reads.
export interface RawImage {
  uint8Array: Uint8Array;
  mediaType: string;
}

export function rawImageToBlob(raw: RawImage): Blob {
  return new Blob([new Uint8Array(raw.uint8Array).buffer as ArrayBuffer], {
    type: raw.mediaType,
  });
}
