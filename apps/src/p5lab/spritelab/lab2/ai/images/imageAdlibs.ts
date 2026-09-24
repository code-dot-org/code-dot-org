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
 * The feature-bound set that shares the most features with this model. A
 * student may train on only some of a data set's columns, so a partial match
 * still counts. None when no set shares a feature.
 */
export function adlibSetForModel(
  imageType: ImageType,
  card: ModelCard | undefined
): ImageAdlibSet | undefined {
  const ids = modelFeatureIds(card);
  let best: ImageAdlibSet | undefined;
  let bestCount = 0;
  for (const set of IMAGE_ADLIB_SETS) {
    const features = imageAdlibFor(imageType, set)?.features || [];
    const count = features.filter(f => ids.has(f.toLowerCase())).length;
    if (count > bestCount) {
      best = set;
      bestCount = count;
    }
  }
  return best;
}

function modelFeatureIds(card: ModelCard | undefined): Set<string> {
  return new Set(card?.fields.map(field => field.id.toLowerCase()));
}

function joinBlanks(keys: string[]): string {
  const blanks = keys.map(key => `{${key}}`);
  if (blanks.length <= 2) {
    return blanks.join(' and ');
  }
  return `${blanks.slice(0, -1).join(', ')}, and ${blanks[blanks.length - 1]}`;
}

/**
 * The adlib without the blanks for features this model was not trained on:
 * no costume value can fill them. Feature-bound templates end in their
 * blanks, so the words before the first blank are kept and the rest is
 * rebuilt. An unchanged adlib is returned as is, so its template still
 * matches the translated strings.
 */
export function adlibForModel(
  adlib: AdlibType | undefined,
  card: ModelCard | undefined
): AdlibType | undefined {
  const features = adlib?.features || [];
  if (!adlib || !card || !features.length) {
    return adlib;
  }
  const ids = modelFeatureIds(card);
  const kept = features.filter(f => ids.has(f.toLowerCase()));
  if (!kept.length || kept.length === features.length) {
    return adlib;
  }
  const head = adlib.template.slice(0, adlib.template.indexOf('{'));
  return {
    ...adlib,
    template: head + joinBlanks(kept),
    features: kept,
    options: Object.fromEntries(
      Object.entries(adlib.options).filter(
        ([key]) => !features.includes(key) || kept.includes(key)
      )
    ),
  };
}
