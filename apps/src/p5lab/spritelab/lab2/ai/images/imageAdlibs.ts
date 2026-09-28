// Adlib prompt combos for the image dialog: a sentence template with word
// choices per image type, an alternative to typing a prompt. The manifest is
// bundled from apps/static today; an S3-hosted copy is the plan, slotting in
// behind imageAdlibFor with the bundled file as the fetch-failure fallback.

import {
  AdlibsType,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import manifest from '@cdo/static/spritelab_lab2/imageAdlibManifest.json';

import {BodyPlan, ImageSubject, ImageType} from './types';

/** Which combo set a level offers; expanded is the freeplay set, treasure
    the collectible-flavored object set for the treasure level. */
export const IMAGE_ADLIB_SETS = ['simple', 'expanded', 'treasure'] as const;

export type ImageAdlibSet = (typeof IMAGE_ADLIB_SETS)[number];

export function isImageAdlibSet(value: unknown): value is ImageAdlibSet {
  return IMAGE_ADLIB_SETS.includes(value as ImageAdlibSet);
}

const adlibs = (manifest as {adlibs: AdlibsType}).adlibs;

/** The manifest key for a combo: an object sprite has its own words. */
export function imageAdlibId(
  imageType: ImageType,
  set: ImageAdlibSet,
  subject?: ImageSubject
): string {
  const kind =
    imageType === 'sprite' && subject === 'object' ? 'object' : imageType;
  return `${kind}-${set}`;
}

export function imageAdlibFor(
  imageType: ImageType,
  set: ImageAdlibSet,
  subject?: ImageSubject
): AdlibType | undefined {
  return adlibs[imageAdlibId(imageType, set, subject)];
}

// The creature words that are not person-shaped, by the manifest's choice
// ids. Every other creature, and any typed prompt, is drawn upright.
export const CREATURE_BODY_PLANS: {[creatureId: string]: BodyPlan} = {
  cat: 'quadruped',
  dragon: 'quadruped',
  dinosaur: 'quadruped',
  penguin: 'bird',
};

/** The body plan of a character combo's creature choice. */
export function bodyPlanFor(creatureId: string | undefined): BodyPlan {
  return (creatureId && CREATURE_BODY_PLANS[creatureId]) || 'upright';
}
