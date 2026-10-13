// Writing a made or edited picture into the project's animation list,
// shared by the image dialog and the explore scene.

import {AnyAction, Dispatch} from 'redux';

import {
  addAnimation,
  isNameUnique,
  setAnimationName,
} from '@cdo/apps/p5lab/redux/animationList';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {ImageGenerationMetadata} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {AnimationPoses} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import {PixelEditorSaveMeta} from '@cdo/apps/pixelEditor/PixelEditor';
import {getStore} from '@cdo/apps/redux';
import {createUuid} from '@cdo/apps/utils';

// The animation fields the save paths write. An explicit `undefined`
// clears the field (the spread keeps the key).
export interface AnimationPatch {
  sourceUrl?: string;
  dataURI?: string;
  frameSize?: {x: number; y: number};
  sourceSize?: {x: number; y: number};
  frameCount?: number;
  frameDelay?: number;
  looping?: boolean;
  poses?: AnimationPoses;
  categories?: string[];
  role?: string;
  pixelGridSize?: number;
  /** Set wherever an animation's pixels are replaced; a stale true would
      skip a needed trim. */
  trimmed?: boolean;
  generation?: ImageGenerationMetadata;
  recentColors?: PixelEditorSaveMeta['recentColors'];
}

// A plain single-frame picture's playback fields; also what a brand-new
// animation starts as.
export const SINGLE_FRAME_PROPS = {frameCount: 1, frameDelay: 2, looping: true};

/**
 * The patch a result's frame grid dictates: a character strip's layout, or a
 * plain picture's single frame, which must overwrite any strip the image
 * used to be (explicit undefined clears poses).
 */
export function framesPatch(
  frames: GeneratedImageResult['frames']
): AnimationPatch {
  return frames
    ? {
        frameSize: frames.frameSize,
        sourceSize: {
          x: frames.frameSize.x * frames.frameCount,
          y: frames.frameSize.y,
        },
        frameCount: frames.frameCount,
        frameDelay: frames.frameDelay,
        looping: frames.looping,
        poses: frames.poses,
      }
    : {...SINGLE_FRAME_PROPS, poses: undefined};
}

/**
 * Create an animation under a name callers have already validated as free,
 * and return its key. The classic addAnimation thunk always renames to
 * name_N; the plain name is set back afterwards.
 */
export function createNamedAnimation(
  dispatch: Dispatch,
  name: string,
  props: AnimationPatch
): string {
  const key = createUuid();
  dispatch(
    // addAnimation is an untyped JS thunk; cast for dispatch.
    addAnimation(key, {
      name,
      ...SINGLE_FRAME_PROPS,
      ...props,
    }) as unknown as AnyAction
  );
  if (isNameUnique(name, getStore().getState().animationList.propsByKey)) {
    dispatch(setAnimationName(key, name) as unknown as AnyAction);
  }
  return key;
}

/** The uploaded URL, or the data URI itself when there is no uploader or
    the upload fails; a data URI source persists in the project sources. */
export async function uploadOrEmbed(
  uploadImage: UploadImageFunction | undefined,
  filename: string,
  bytes: Uint8Array,
  mediaType: string,
  dataURI: string
): Promise<string> {
  if (!uploadImage) {
    return dataURI;
  }
  try {
    return await uploadImage(filename, bytes, mediaType);
  } catch {
    return dataURI;
  }
}
