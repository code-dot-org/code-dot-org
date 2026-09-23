// Adlib prompt combos for the image dialog: a sentence template with word
// choices per image type, an alternative to typing a prompt. The manifest is
// bundled from apps/static today; an S3-hosted copy is the plan, slotting in
// behind imageAdlibFor with the bundled file as the fetch-failure fallback.

import {
  AdlibsType,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import manifest from '@cdo/static/spritelab_lab2/imageAdlibManifest.json';

import {ModelCard} from '../traits/modelCard';

import {ImageType} from './types';

/** Which combo set a level offers; expanded is the freeplay set, treasure
    the collectible-flavored sprite set for the treasure level. A set whose
    blanks are feature-bound (cars) is tied to one imported model: its option
    ids are that model's feature values. */
export const IMAGE_ADLIB_SETS = [
  'simple',
  'expanded',
  'treasure',
  'cars',
  'plants',
  'recycling',
  'cookies',
  'recess',
] as const;

export type ImageAdlibSet = (typeof IMAGE_ADLIB_SETS)[number];

export function isImageAdlibSet(value: unknown): value is ImageAdlibSet {
  return IMAGE_ADLIB_SETS.includes(value as ImageAdlibSet);
}

const adlibs = (manifest as {adlibs: AdlibsType}).adlibs;

export function imageAdlibId(imageType: ImageType, set: ImageAdlibSet): string {
  return `${imageType}-${set}`;
}

export function imageAdlibFor(
  imageType: ImageType,
  set: ImageAdlibSet
): AdlibType | undefined {
  return adlibs[imageAdlibId(imageType, set)];
}

/**
 * A level's `adlibs` value meaning "the set for whichever model the student
 * imported", so one level serves every data set a class can choose from.
 */
export const MODEL_ADLIBS = 'model';

/**
 * The feature-bound set whose blanks are all features of this model; the
 * one binding the most wins. None when no set fits the model.
 */
export function adlibSetForModel(
  imageType: ImageType,
  card: ModelCard | undefined
): ImageAdlibSet | undefined {
  const ids = new Set(card?.fields.map(field => field.id.toLowerCase()));
  let best: ImageAdlibSet | undefined;
  let bestCount = 0;
  for (const set of IMAGE_ADLIB_SETS) {
    const features = imageAdlibFor(imageType, set)?.features || [];
    if (
      features.length > bestCount &&
      features.every(feature => ids.has(feature.toLowerCase()))
    ) {
      best = set;
      bestCount = features.length;
    }
  }
  return best;
}
