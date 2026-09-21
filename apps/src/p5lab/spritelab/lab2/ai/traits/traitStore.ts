/**
 * Where a sprite's feature values come from, and in which order.
 *
 * A costume is a project asset (Sources.animations), so a value put there
 * stays available after a scene change. A sprite lives in one scene only.
 * The lookup thus goes to the sprite first and then to its costume, which
 * lets a student give one sprite different values without a second place to
 * keep data.
 */

import {ModelCard} from './modelCard';

export type TraitValue = string | number;
export type TraitValues = {[key: string]: TraitValue};

export interface TraitSource {
  /** Values that the set-trait block put on this sprite only. */
  spriteTraits?: TraitValues;
  /** Values authored on the costume that the sprite wears now. */
  costumeTraits?: TraitValues;
}

function isEmpty(value: TraitValue | undefined): boolean {
  return value === undefined || value === null || value === '';
}

export function resolveTrait(
  source: TraitSource,
  key: string
): TraitValue | undefined {
  const own = source.spriteTraits?.[key];
  if (!isEmpty(own)) {
    return own;
  }
  const costume = source.costumeTraits?.[key];
  return isEmpty(costume) ? undefined : costume;
}

export interface TestData {
  testData: TraitValues;
  /** Field ids, not keys: this list is shown to the student. */
  missing: string[];
}

/**
 * A partial feature set must not reach MLTrainers.predict. predict maps each
 * missing value through featureNumberKey, gets undefined, and parseInt makes
 * it NaN, so ml-knn measures a distance against NaN and still returns a
 * class. The result looks like a prediction and means nothing.
 */
export function buildTestData(card: ModelCard, source: TraitSource): TestData {
  const testData: TraitValues = {};
  const missing: string[] = [];
  for (const field of card.fields) {
    const value = resolveTrait(source, field.key);
    if (value === undefined) {
      missing.push(field.id);
      continue;
    }
    testData[field.key] = value;
  }
  return {testData, missing};
}

interface AnimationListLike {
  orderedKeys?: string[];
  propsByKey?: {[key: string]: {name?: string; traits?: TraitValues}};
}

/**
 * Traits by costume name, which is what a running sprite reports through
 * getAnimationLabel. The animation list is keyed by uuid instead, so the
 * runtime needs this one-time flip.
 */
export function traitsByCostumeName(list: AnimationListLike | undefined): {
  [costumeName: string]: TraitValues;
} {
  const byName: {[costumeName: string]: TraitValues} = {};
  for (const key of list?.orderedKeys || []) {
    const props = list?.propsByKey?.[key];
    if (props?.name && props.traits) {
      byName[props.name] = props.traits;
    }
  }
  return byName;
}

/**
 * Values a costume keeps for a model it was not authored against. The editor
 * shows a field per model feature, so a re-import must not drop what the
 * student typed for the model they used before.
 */
export function mergeCostumeTraits(
  existing: TraitValues | undefined,
  edits: TraitValues
): TraitValues {
  const merged: TraitValues = {...(existing || {})};
  for (const [key, value] of Object.entries(edits)) {
    if (isEmpty(value)) {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  }
  return merged;
}
