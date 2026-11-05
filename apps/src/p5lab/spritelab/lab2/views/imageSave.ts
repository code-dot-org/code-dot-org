// Writing a made or edited picture into the project's animation list.

import {AnyAction, Dispatch} from 'redux';

import {
  addAnimation,
  isNameUnique,
  SET_INITIAL_ANIMATION_LIST,
  setAnimationName,
} from '@cdo/apps/p5lab/redux/animationList';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {RuntimeAnimationProps} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {getStore} from '@cdo/apps/redux';
import {createUuid} from '@cdo/apps/utils';

// The animation fields a save may write: any of them but the name, which
// is set by the create path. An explicit `undefined` clears a field, since
// the spread keeps the key.
export type AnimationPatch = Partial<Omit<RuntimeAnimationProps, 'name'>>;

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

/**
 * Point an existing animation at new pixels and refresh its thumbnails.
 * Uses the raw list-replace action because the classic edit action clears
 * sourceUrl, which is what Lab2 saves. Returns the file URL the change
 * replaced.
 */
export function repointAnimation(
  dispatch: Dispatch,
  key: string,
  changes: AnimationPatch
): string | undefined {
  const current = getStore().getState().animationList;
  const updated = {
    orderedKeys: current.orderedKeys,
    propsByKey: {
      ...current.propsByKey,
      [key]: {
        ...current.propsByKey[key],
        ...changes,
        loadedFromSource: true,
        saved: false,
      },
    },
  };
  // No trim here: the views that list images trim on every list change,
  // and a second trim would scan the image again.
  dispatch({type: SET_INITIAL_ANIMATION_LIST, animationList: updated});
  return current.propsByKey[key]?.sourceUrl;
}
