// Keep a picture the student made: upload it and add it to the project's
// images as a new animation with the level's role. Mirrors what
// GenerateImagePane does on accept and on a paint save, kept apart while the
// explore layout is on trial; fold the two together when it settles.

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

/** Upload the bytes when there is somewhere to; else the data URI itself is
    the source, which persists in project sources. */
async function sourceUrlFor(
  uploadImage: UploadImageFunction | undefined,
  filename: string,
  bytes: Uint8Array,
  dataURI: string
): Promise<string> {
  if (!uploadImage) {
    return dataURI;
  }
  try {
    return await uploadImage(filename, bytes, 'image/png');
  } catch {
    return dataURI;
  }
}

/** Add one new animation under the next free name for its type; the name
    it got. addAnimation is an untyped JS thunk that renames to name_N, so
    the plain name is set back when it is free. */
function addNamedImage(
  dispatch: Dispatch,
  imageType: ImageType,
  props: Record<string, unknown>
): string {
  const name = nextImageName(
    imageType,
    candidate =>
      !isNameUnique(candidate, getStore().getState().animationList.propsByKey)
  );
  const key = createUuid();
  dispatch(addAnimation(key, {name, ...props}) as unknown as AnyAction);
  if (isNameUnique(name, getStore().getState().animationList.propsByKey)) {
    dispatch(setAnimationName(key, name) as unknown as AnyAction);
  }
  return name;
}

/** The name the saved image got. */
export async function saveGeneratedImage(
  dispatch: Dispatch,
  result: GeneratedImageResult,
  {uploadImage, imageType, imageRole}: SaveOptions
): Promise<string> {
  const dataURI = bytesToDataURI(result.uint8Array, result.mediaType);
  const sourceUrl = await sourceUrlFor(
    uploadImage,
    result.filename,
    result.uint8Array,
    dataURI
  );
  const frameSize = (await dataURIToSourceSize(dataURI).catch(() => null)) ?? {
    x: MODEL_OUTPUT_PX,
    y: MODEL_OUTPUT_PX,
  };
  const frames = result.frames;
  return addNamedImage(dispatch, imageType, {
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
  });
}

/** Keep a picture painted by hand, as the editor handed it back (a PNG data
    URI, full canvas); the name it got. */
export async function savePaintedImage(
  dispatch: Dispatch,
  dataURI: string,
  pixelGridSize: number | undefined,
  {uploadImage, imageType, imageRole}: SaveOptions
): Promise<string> {
  const bytes = Uint8Array.from(atob(dataURI.split(',')[1]), c =>
    c.charCodeAt(0)
  );
  const sourceUrl = await sourceUrlFor(
    uploadImage,
    `painted_${Date.now()}.png`,
    bytes,
    dataURI
  );
  const frameSize = (await dataURIToSourceSize(dataURI).catch(() => null)) ?? {
    x: MODEL_OUTPUT_PX,
    y: MODEL_OUTPUT_PX,
  };
  return addNamedImage(dispatch, imageType, {
    ...SINGLE_FRAME,
    sourceUrl,
    frameSize,
    categories: categoriesForType(imageType),
    ...(imageRole && {role: imageRole}),
    pixelGridSize,
    trimmed: false,
  });
}
