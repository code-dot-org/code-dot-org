/*
  Reading and writing the Lab 2 AI Lab level "dynamic_instructions" JSON
  string, which maps an instructions key to the text shown for it. The editor
  keeps only keys Lab 2 AI Lab can show; anything else is dropped when the
  level is next saved.
*/
import type {InstructionsKey} from '@code-dot-org/ailab';

import {parseMode, serializeMode, setModeValue} from '../ailabMode/ailabMode';

export type DynamicInstructions = Partial<Record<InstructionsKey, string>>;

export interface DynamicInstructionsField {
  key: InstructionsKey;
  label: string;
}

// The choose-dataset keys are absent: Lab 2 levels load their one dataset directly.
export const SCREEN_FIELDS: DynamicInstructionsField[] = [
  {key: 'dataDisplayLabel', label: 'Choose label screen'},
  {key: 'dataDisplayFeatures', label: 'Choose features screen'},
  {key: 'trainModel', label: 'Train model screen'},
  {key: 'generateResults', label: 'Test model screen'},
  {key: 'results', label: 'Results screen'},
  {key: 'saveModel', label: 'Save model screen'},
  {key: 'modelSummary', label: 'Model summary screen'},
];

export const ACTION_FIELDS: DynamicInstructionsField[] = [
  {
    key: 'selectedFeatureNumerical',
    label: 'After selecting a numerical column',
  },
  {
    key: 'selectedFeatureCategorical',
    label: 'After selecting a categorical column',
  },
  {key: 'resultsDetails', label: 'While viewing result details'},
];

const LAB2_KEYS: string[] = [...SCREEN_FIELDS, ...ACTION_FIELDS].map(
  field => field.key
);

// Returns null when the string is not a JSON object.
export function parseDynamicInstructions(
  rawDynamicInstructions: string | null | undefined
): Record<string, unknown> | null {
  return parseMode(rawDynamicInstructions);
}

export function serializeDynamicInstructions(
  dynamicInstructions: DynamicInstructions
): string {
  return serializeMode(dynamicInstructions);
}

// An empty value removes the key, so Lab 2 falls back to the default text.
export function setInstructionsText(
  dynamicInstructions: DynamicInstructions,
  key: InstructionsKey,
  text: string
): DynamicInstructions {
  return setModeValue(
    dynamicInstructions,
    key,
    text.trim() === '' ? undefined : text
  ) as DynamicInstructions;
}

// Drops unknown keys and non-string values, describing each; empty strings mean "use the default" and go silently.
export function cleanDynamicInstructions(
  dynamicInstructions: Record<string, unknown>
): {dynamicInstructions: DynamicInstructions; removed: string[]} {
  const cleaned: Record<string, string> = {};
  const removed: string[] = [];
  Object.entries(dynamicInstructions).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim() === '') {
      return;
    }
    if (LAB2_KEYS.includes(key) && typeof value === 'string') {
      cleaned[key] = value;
    } else {
      removed.push(`${key}: ${JSON.stringify(value)}`);
    }
  });
  return {dynamicInstructions: cleaned, removed};
}
