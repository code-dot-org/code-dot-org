/*
  Reading and writing the Lab 2 AI Lab level "mode" JSON string. The editor
  keeps only the keys and values Lab 2 AI Lab understands; anything else is
  dropped when the level is next saved.
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

export const TRAINER_FAMILIES = ['knn', 'decisionTree'];
export const DEFAULT_TRAINER = 'knn';

const MIN_ACCURACY = 0;
const MAX_ACCURACY = 100;

// Returns null when the string is not a JSON object.
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

export function isValidAccuracy(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= MIN_ACCURACY &&
    value <= MAX_ACCURACY
  );
}

function isValidModeValue(
  key: string,
  value: unknown,
  knownDatasetIds: string[]
): boolean {
  if (key === 'datasets') {
    return (
      Array.isArray(value) &&
      value.length === 1 &&
      knownDatasetIds.includes(value[0])
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

// Drops unknown keys and invalid values, returning a description of each one dropped.
export function cleanMode(
  mode: ModeObject,
  knownDatasetIds: string[]
): {mode: ModeObject; removed: string[]} {
  const cleaned: ModeObject = {};
  const removed: string[] = [];
  Object.entries(mode).forEach(([key, value]) => {
    if (isValidModeValue(key, value, knownDatasetIds)) {
      cleaned[key] = value;
    } else {
      removed.push(`${key}: ${JSON.stringify(value)}`);
    }
  });
  return {mode: cleaned, removed};
}

export function getSelectedDataset(mode: ModeObject): string | undefined {
  return Array.isArray(mode.datasets) ? mode.datasets[0] : undefined;
}

// Names the default trainer explicitly, so a saved Lab 2 level always records one.
export function withDefaultTrainer(mode: ModeObject): ModeObject {
  return mode.trainer === undefined
    ? setModeValue(mode, 'trainer', DEFAULT_TRAINER)
    : mode;
}
