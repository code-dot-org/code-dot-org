/*
  Reading and writing the Lab 2 AI Lab level "mode" JSON string one key at a
  time. Keys and values this editor does not understand are carried through
  untouched, so saving never drops something a level already has.
*/

export type ModeObject = Record<string, unknown>;

// hideInstructionsOverlay is absent: Lab 2 never shows the overlay.
export type BooleanModeKey =
  | 'hideSelectLabel'
  | 'hideSave'
  | 'randomizeTestData'
  | 'hideColumnClicking';

export const BOOLEAN_MODE_KEYS: BooleanModeKey[] = [
  'hideSelectLabel',
  'hideSave',
  'hideColumnClicking',
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

export function getSelectedDataset(
  mode: ModeObject,
  knownDatasetIds: string[]
): string | undefined {
  const datasets = mode.datasets;
  return Array.isArray(datasets) &&
    datasets.length === 1 &&
    knownDatasetIds.includes(datasets[0])
    ? datasets[0]
    : undefined;
}

// Returns why the mode does not name exactly one known dataset, or null if it does.
export function getDatasetProblem(
  mode: ModeObject,
  knownDatasetIds: string[]
): string | null {
  if (getSelectedDataset(mode, knownDatasetIds)) {
    return null;
  }
  const datasets = mode.datasets;
  if (datasets === undefined) {
    return 'Choose a dataset. The level cannot be saved without one.';
  }
  if (Array.isArray(datasets) && datasets.length > 1) {
    return `This level lists several datasets (${datasets.join(
      ', '
    )}). Choose one; the others will be removed.`;
  }
  return `The saved value ${JSON.stringify(
    datasets
  )} is not a known dataset. Choose a dataset.`;
}

// Returns why a Lab 2 level cannot be saved with this mode, or null if it can.
export function getModeSaveError(
  rawMode: string,
  knownDatasetIds: string[]
): string | null {
  const mode = parseMode(rawMode);
  if (!mode) {
    return 'Mode must be a valid JSON object.';
  }
  return getDatasetProblem(mode, knownDatasetIds);
}
