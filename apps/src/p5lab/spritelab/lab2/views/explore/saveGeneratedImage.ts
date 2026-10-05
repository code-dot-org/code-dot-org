// Keep a picture the student made: upload it and add it to the project's
// images as a new animation with the level's role.

import {Dispatch} from 'redux';

import {dataURIToSourceSize} from '@cdo/apps/imageUtils';
import {isNameUnique} from '@cdo/apps/p5lab/redux/animationList';
import {
  bytesToDataURI,
  dataURIToBytes,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/encoding';
import {
  GeneratedImageResult,
  UploadImageFunction,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {MODEL_OUTPUT_PX} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/modelHelpers';
import {ImageType} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {categoriesForType} from '@cdo/apps/p5lab/spritelab/lab2/imageGallery';
import {nextImageName} from '@cdo/apps/p5lab/spritelab/lab2/imageReferences';
import {getStore} from '@cdo/apps/redux';

import {
  AnimationPatch,
  createNamedAnimation,
  framesPatch,
  uploadOrEmbed,
} from '../imageSave';

interface SaveOptions {
  uploadImage?: UploadImageFunction;
  imageType: ImageType;
  /** Recorded on the image, so a later level can find it by role. */
  imageRole?: string;
}

/** Add one animation under the next free name for its type; the name it
    got. */
function addNamedImage(
  dispatch: Dispatch,
  imageType: ImageType,
  props: AnimationPatch
): string {
  const name = nextImageName(
    imageType,
    candidate =>
      !isNameUnique(candidate, getStore().getState().animationList.propsByKey)
  );
  createNamedAnimation(dispatch, name, props);
  return name;
}

const measuredSize = async (dataURI: string) =>
  (await dataURIToSourceSize(dataURI).catch(() => null)) ?? {
    x: MODEL_OUTPUT_PX,
    y: MODEL_OUTPUT_PX,
  };

/** The name the saved image got. */
export async function saveGeneratedImage(
  dispatch: Dispatch,
  result: GeneratedImageResult,
  {uploadImage, imageType, imageRole}: SaveOptions
): Promise<string> {
  const dataURI = bytesToDataURI(result.uint8Array, result.mediaType);
  const sourceUrl = await uploadOrEmbed(
    uploadImage,
    result.filename,
    result.uint8Array,
    result.mediaType,
    dataURI
  );
  return addNamedImage(dispatch, imageType, {
    sourceUrl,
    frameSize: await measuredSize(dataURI),
    ...framesPatch(result.frames),
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
  const sourceUrl = await uploadOrEmbed(
    uploadImage,
    `painted_${Date.now()}.png`,
    dataURIToBytes(dataURI),
    'image/png',
    dataURI
  );
  return addNamedImage(dispatch, imageType, {
    sourceUrl,
    frameSize: await measuredSize(dataURI),
    ...framesPatch(undefined),
    categories: categoriesForType(imageType),
    ...(imageRole && {role: imageRole}),
    pixelGridSize,
    trimmed: false,
  });
}
