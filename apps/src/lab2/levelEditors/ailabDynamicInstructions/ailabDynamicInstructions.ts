/*
  Reads and writes the Lab 2 AI Lab level "dynamic_instructions" JSON
  string, which maps an instructions key to the text shown for it. The editor
  keeps only keys Lab 2 AI Lab can show; anything else is dropped when the
  level is next saved.
*/
import {INSTRUCTIONS_KEYS, type InstructionsKey} from '@code-dot-org/ailab';

import {setJsonObjectValue} from '../jsonUtils';

export type DynamicInstructions = Partial<Record<InstructionsKey, string>>;

export interface DynamicInstructionsField {
  key: InstructionsKey;
  label: string;
}

// Lab 2 levels load their one dataset directly, so the dataset keys never
// show; the save screens are about to be hidden.
const UNEDITABLE_KEYS = [
  'selectDataset',
  'uploadedDataset',
  'selectedDataset',
  'saveModel',
  'modelSummary',
] as const;

type Lab2Key = Exclude<InstructionsKey, (typeof UNEDITABLE_KEYS)[number]>;

const FIELD_LABELS: Record<Lab2Key, string> = {
  datasetView: 'Dataset screen',
  results: 'Results screen',
};

function isLab2Key(key: string): key is Lab2Key {
  return Object.hasOwn(FIELD_LABELS, key);
}

export const FIELDS: DynamicInstructionsField[] = INSTRUCTIONS_KEYS.filter(
  isLab2Key
).map(key => ({key, label: FIELD_LABELS[key]}));

// An empty value removes the key, so Lab 2 falls back to the default text.
export function setInstructionsText(
  dynamicInstructions: DynamicInstructions,
  key: InstructionsKey,
  text: string
): DynamicInstructions {
  return setJsonObjectValue(
    dynamicInstructions,
    key,
    text.trim() === '' ? undefined : text
  );
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
