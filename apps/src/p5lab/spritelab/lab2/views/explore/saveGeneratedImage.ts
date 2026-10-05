// Keep a picture the student made: upload it and add it to the project's
// images as a new animation with the level's role. A copy of
// GenerateImagePane's accept and paint saves, to fold back together.

import {AnyAction, Dispatch} from 'redux';

import {dataURIToSourceSize} from '@cdo/apps/imageUtils';
import {
  addAnimation,
  isNameUnique,
  setAnimationName,
} from '@cdo/apps/p5lab/redux/animationList';
import {bytesToDataURI} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {MODEL_OUTPUT_PX} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {ImageType} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {categoriesForType} from '@cdo/apps/p5lab/spritelab/lab2/imageGallery';
import {nextImageName} from '@cdo/apps/p5lab/spritelab/lab2/imageReferences';
import {getStore} from '@cdo/apps/redux';
import {createUuid} from '@cdo/apps/utils';

const SINGLE_FRAME = {frameCount: 1, frameDelay: 2, looping: true};

interface SaveOptions {
  uploadImage?: UploadImageFunction;
  imageType: ImageType;
  /** Recorded on the image, so a later level can find it by role. */
  imageRole?: string;
}

/** The uploaded URL, or the data URI itself when there is no uploader. */
async function sourceUrlFor(
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

/** Add one animation under the next free name for its type; the name it
    got. addAnimation renames to name_N, so the plain name is set back when
    it is free. */
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
    result.mediaType,
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

/** Keep a hand-painted picture (a PNG data URI, full canvas); the name it
    got. */
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
    'image/png',
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
