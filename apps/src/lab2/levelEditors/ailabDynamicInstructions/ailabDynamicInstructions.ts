/*
  Reading and writing the Lab 2 AI Lab level "dynamic_instructions" JSON
  string, which maps an instructions key to the text shown for it. The editor
  keeps only keys Lab 2 AI Lab can show; anything else is dropped when the
  level is next saved.
*/
import {
  CONTENT_PANELS,
  INSTRUCTIONS_KEYS,
  type InstructionsKey,
} from '@code-dot-org/ailab';

import {parseMode, serializeMode, setModeValue} from '../ailabMode/ailabMode';

export type DynamicInstructions = Partial<Record<InstructionsKey, string>>;

export interface DynamicInstructionsField {
  key: InstructionsKey;
  label: string;
}

// Lab 2 levels load their one dataset directly, so these never show.
const UNREACHABLE_KEYS = [
  'selectDataset',
  'uploadedDataset',
  'selectedDataset',
] as const;

type Lab2Key = Exclude<InstructionsKey, (typeof UNREACHABLE_KEYS)[number]>;

// A new key in the ailab package fails typecheck here until it gets a label.
const FIELD_LABELS: Record<Lab2Key, string> = {
  dataDisplayLabel: 'Choose label screen',
  dataDisplayFeatures: 'Choose features screen',
  trainModel: 'Train model screen',
  generateResults: 'Test model screen',
  results: 'Results screen',
  saveModel: 'Save model screen',
  modelSummary: 'Model summary screen',
  selectedFeatureNumerical: 'After selecting a numerical column',
  selectedFeatureCategorical: 'After selecting a categorical column',
  resultsDetails: 'While viewing result details',
};

function isLab2Key(key: string): key is Lab2Key {
  return key in FIELD_LABELS;
}

function toFields(keys: readonly string[]): DynamicInstructionsField[] {
  return keys.filter(isLab2Key).map(key => ({key, label: FIELD_LABELS[key]}));
}

const CONTENT_PANEL_KEYS: readonly string[] = CONTENT_PANELS;

export const SCREEN_FIELDS = toFields(CONTENT_PANELS);

export const ACTION_FIELDS = toFields(
  INSTRUCTIONS_KEYS.filter(key => !CONTENT_PANEL_KEYS.includes(key))
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
    if (isLab2Key(key) && typeof value === 'string') {
      cleaned[key] = value;
    } else {
      removed.push(`${key}: ${JSON.stringify(value)}`);
    }
  });
  return {dynamicInstructions: cleaned, removed};
}
