// Adlib prompt combos for the image dialog: a sentence template with word
// choices per image type, an alternative to typing a prompt. The manifest is
// bundled from apps/static today; an S3-hosted copy is the plan, slotting in
// behind imageAdlibFor with the bundled file as the fetch-failure fallback.

import {type AdlibsType, type AdlibType} from '@code-dot-org/lab/components';

import manifest from './imageAdlibManifest.json';
import {
  BODY_PLANS,
  type BodyPlan,
  type ImageSubject,
  type ImageType,
} from './types';

const adlibs = (manifest as {adlibs: AdlibsType}).adlibs;

/** Which combo set a level offers, the part of a manifest key after the
    image kind: simple, expanded (free play), treasure (the treasure level's
    object words), and whatever the manifest adds. */
export type ImageAdlibSet = string;

export const IMAGE_ADLIB_SETS: readonly ImageAdlibSet[] = [
  ...new Set(Object.keys(adlibs).map(key => key.replace(/^[^-]+-/, ''))),
];

export function isImageAdlibSet(value: unknown): value is ImageAdlibSet {
  return typeof value === 'string' && IMAGE_ADLIB_SETS.includes(value);
}

/** The manifest key for a combo: an object sprite has its own words. */
export function imageAdlibId(
  imageType: ImageType,
  set: ImageAdlibSet,
  subject?: ImageSubject,
): string {
  const kind =
    imageType === 'sprite' && subject === 'object' ? 'object' : imageType;
  return `${kind}-${set}`;
}

export function imageAdlibFor(
  imageType: ImageType,
  set: ImageAdlibSet,
  subject?: ImageSubject,
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
    }),
  );
}
