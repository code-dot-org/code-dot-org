/*
  Reads and writes the Lab 2 AI Lab level "dynamic_instructions" JSON
  string, which maps an instructions key to the text shown for it. The editor
  keeps only keys Lab 2 AI Lab can show; anything else is dropped when the
  level is next saved.
*/
import {LAB2_INSTRUCTIONS, type InstructionsKey} from '@code-dot-org/ailab';

import {setJsonObjectValue} from '../jsonUtils';

export type DynamicInstructions = Partial<Record<InstructionsKey, string>>;

export interface DynamicInstructionsField {
  key: InstructionsKey;
  label: string;
}

export const FIELDS: DynamicInstructionsField[] = LAB2_INSTRUCTIONS.map(
  ({key, label}) => ({key, label})
);

function isLab2Key(key: string): key is InstructionsKey {
  return FIELDS.some(field => field.key === key);
}

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
