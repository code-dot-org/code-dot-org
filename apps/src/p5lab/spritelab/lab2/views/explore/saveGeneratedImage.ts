// Keep a generated image: upload it and add it to the project's images as
// a new animation with the level's role. Mirrors what GenerateImagePane does
// on accept, kept apart while the explore layout is on trial; fold the two
// together when it settles.

import {AnyAction, Dispatch} from 'redux';

import {dataURIToSourceSize} from '@cdo/apps/imageUtils';
import {
  addAnimation,
  isNameUnique,
  setAnimationName,
} from '@cdo/apps/p5lab/redux/animationList';
import {getStore} from '@cdo/apps/redux';
import {createUuid} from '@cdo/apps/utils';

import {bytesToDataURI} from '../../ai/images/encoding';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '../../ai/images/imageGeneration';
import {MODEL_OUTPUT_PX} from '../../ai/images/modelHelpers';
import {ImageType} from '../../ai/images/types';
import {categoriesForType} from '../../imageGallery';
import {nextImageName} from '../../imageReferences';

const SINGLE_FRAME = {frameCount: 1, frameDelay: 2, looping: true};

interface SaveOptions {
  uploadImage?: UploadImageFunction;
  imageType: ImageType;
  /** Recorded on the image, so a later level can find it by role. */
  imageRole?: string;
}

/** The name the saved image got. */
export async function saveGeneratedImage(
  dispatch: Dispatch,
  result: GeneratedImageResult,
  {uploadImage, imageType, imageRole}: SaveOptions
): Promise<string> {
  const dataURI = bytesToDataURI(result.uint8Array, result.mediaType);
  let sourceUrl = dataURI;
  if (uploadImage) {
    try {
      sourceUrl = await uploadImage(
        result.filename,
        result.uint8Array,
        result.mediaType
      );
    } catch {
      // The embedded data URI still works; the project just grows.
    }
  }
  const frameSize = (await dataURIToSourceSize(dataURI).catch(() => null)) ?? {
    x: MODEL_OUTPUT_PX,
    y: MODEL_OUTPUT_PX,
  };
  const frames = result.frames;
  const name = nextImageName(
    imageType,
    candidate =>
      !isNameUnique(candidate, getStore().getState().animationList.propsByKey)
  );
  const key = createUuid();
  // addAnimation is an untyped JS thunk that renames to name_N; the plain
  // name is set back when it is free.
  dispatch(
    addAnimation(key, {
      name,
      ...SINGLE_FRAME,
      sourceUrl,
      frameSize,
      ...(frames
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
        : {}),
      categories: categoriesForType(imageType),
      ...(imageRole && {role: imageRole}),
      pixelGridSize: result.pixelGridSize,
      trimmed: !!result.trimmed,
      generation: result.generation,
    }) as unknown as AnyAction
  );
  if (isNameUnique(name, getStore().getState().animationList.propsByKey)) {
    dispatch(setAnimationName(key, name) as unknown as AnyAction);
  }
  return name;
}
