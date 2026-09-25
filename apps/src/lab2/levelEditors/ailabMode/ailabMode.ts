/*
  Reading and writing the AI Lab level "mode" JSON string one key at a time.
  Keys and values this editor does not understand are carried through
  untouched, so saving never drops something a level already has.
*/

export type ModeObject = Record<string, unknown>;

export type BooleanModeKey =
  | 'hideSelectLabel'
  | 'hideSave'
  | 'hideInstructionsOverlay'
  | 'randomizeTestData'
  | 'hideColumnClicking';

export const BOOLEAN_MODE_KEYS: BooleanModeKey[] = [
  'hideSelectLabel',
  'hideSave',
  'hideColumnClicking',
  'hideInstructionsOverlay',
  'randomizeTestData',
];

export const KNOWN_MODE_KEYS = [
  'datasets',
  'trainer',
  'requireAccuracy',
  ...BOOLEAN_MODE_KEYS,
];

export const TRAINER_FAMILIES = ['knn', 'decisionTree'];

const MIN_ACCURACY = 0;
const MAX_ACCURACY = 100;

// Returns null when the string is not a JSON object and so cannot be edited by key.
export function parseMode(
  rawMode: string | null | undefined
): ModeObject | null {
  if (!rawMode || !rawMode.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(rawMode);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function serializeMode(mode: ModeObject): string {
  return Object.keys(mode).length ? JSON.stringify(mode, null, 2) : '';
}

// Passing undefined removes the key; replacing a key keeps its position.
export function setModeValue(
  mode: ModeObject,
  key: string,
  value: unknown
): ModeObject {
  const newMode = {...mode};
  if (value === undefined) {
    delete newMode[key];
  } else {
    newMode[key] = value;
  }
  return newMode;
}

export function getUnknownKeys(mode: ModeObject): string[] {
  return Object.keys(mode).filter(key => !KNOWN_MODE_KEYS.includes(key));
}

export function isValidModeValue(key: string, value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  if (key === 'datasets') {
    return (
      Array.isArray(value) && value.every(item => typeof item === 'string')
    );
  }
  if (key === 'trainer') {
    return typeof value === 'string' && TRAINER_FAMILIES.includes(value);
  }
  if (key === 'requireAccuracy') {
    return isValidAccuracy(value);
  }
  if ((BOOLEAN_MODE_KEYS as string[]).includes(key)) {
    return typeof value === 'boolean';
  }
  return false;
}

export function isValidAccuracy(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MIN_ACCURACY &&
    value <= MAX_ACCURACY
  );
}

// Adds or removes one dataset, keeping any IDs the editor does not recognize.
export function toggleDataset(
  mode: ModeObject,
  datasetId: string,
  selected: boolean
): ModeObject {
  const current = isValidModeValue('datasets', mode.datasets)
    ? (mode.datasets as string[] | undefined) ?? []
    : [];
  const withoutDataset = current.filter(id => id !== datasetId);
  const datasets = selected ? [...withoutDataset, datasetId] : withoutDataset;
  return setModeValue(mode, 'datasets', datasets.length ? datasets : undefined);
}
