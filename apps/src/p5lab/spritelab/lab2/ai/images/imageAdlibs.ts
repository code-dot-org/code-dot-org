// Adlib prompt combos for the image dialog: a sentence template with word
// choices per image type, an alternative to typing a prompt. The manifest is
// bundled from apps/static today; an S3-hosted copy is the plan, slotting in
// behind imageAdlibFor with the bundled file as the fetch-failure fallback.

import {
  AdlibsType,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';
import manifest from '@cdo/static/spritelab_lab2/imageAdlibManifest.json';

import {BODY_PLANS, BodyPlan, ImageSubject, ImageType} from './types';

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

// A creature option's bodyPlan in the manifest names the stance the
// character-set prompts are written for (characterSet.ts); a creature
// without one, and any typed prompt, is drawn upright.
const CREATURE_BODY_PLANS = new Map<string, BodyPlan>();
Object.values(adlibs).forEach(adlib => {
  (adlib.options.creature ?? []).forEach(option => {
    const plan = (option as {bodyPlan?: string}).bodyPlan;
    if (plan && BODY_PLANS.includes(plan as BodyPlan)) {
      CREATURE_BODY_PLANS.set(option.id, plan as BodyPlan);
    }
  });
});

/** The body plan of a character combo's creature choice. */
export function bodyPlanFor(creatureId: string | undefined): BodyPlan {
  return (creatureId && CREATURE_BODY_PLANS.get(creatureId)) || 'upright';
}

/** The manifest's bodyPlan values, for the test that they are all known. */
export function manifestBodyPlans(): string[] {
  return Object.values(adlibs).flatMap(adlib =>
    (adlib.options.creature ?? []).flatMap(option => {
      const plan = (option as {bodyPlan?: string}).bodyPlan;
      return plan ? [plan] : [];
    })
  );
}
