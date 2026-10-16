/*
  Reading and writing the Lab 2 AI Lab level "mode" JSON string. The editor
  keeps only the keys and values Lab 2 AI Lab understands; anything else is
  dropped when the level is next saved.
*/
import {setJsonObjectValue} from '../jsonUtils';

export type ModeObject = Record<string, unknown>;

// hideInstructionsOverlay is absent: Lab 2 never shows the overlay.
export type BooleanModeKey =
  | 'hideSelectLabel'
  | 'lockFeatures'
  | 'pretrained'
  | 'hideDatasetView'
  | 'hideTestingView'
  | 'hideSave'
  | 'reserveLastRows'
  | 'hideColumnClicking';

export const BOOLEAN_MODE_KEYS: BooleanModeKey[] = [
  'hideSelectLabel',
  'lockFeatures',
  'pretrained',
  'hideDatasetView',
  'hideTestingView',
  'hideSave',
  'hideColumnClicking',
  'reserveLastRows',
];

export const TRAINER_FAMILIES = ['knn', 'decisionTree'];
export const DEFAULT_TRAINER = 'knn';

export const MIN_ACCURACY = 0;
export const MAX_ACCURACY = 100;

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
  if (key === 'label') {
    return typeof value === 'string' && value !== '';
  }
  if (key === 'features') {
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every(feature => typeof feature === 'string' && feature !== '') &&
      new Set(value).size === value.length
    );
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

export function setDataset(mode: ModeObject, datasetId: string): ModeObject {
  const newMode = setJsonObjectValue(mode, 'datasets', [datasetId]);
  delete newMode.label;
  delete newMode.features;
  return newMode;
}

// Without a dataset, students choose one or upload a CSV, so there are no columns to set.
const SET_BY_DATASET = [
  'label',
  'features',
  'hideSelectLabel',
  'lockFeatures',
  'pretrained',
  'hideDatasetView',
];

export function needsDataset(mode: ModeObject, key: string): boolean {
  return getSelectedDataset(mode) === undefined && SET_BY_DATASET.includes(key);
}

export function clearDataset(mode: ModeObject): ModeObject {
  const newMode = {...mode};
  delete newMode.datasets;
  SET_BY_DATASET.forEach(key => delete newMode[key]);
  return newMode;
}

export function getFeatures(mode: ModeObject): string[] {
  return (mode.features as string[] | undefined) ?? [];
}

export function getStartingLabel(
  mode: ModeObject,
  defaultLabel: string | undefined
): string | undefined {
  return (
    (mode.label as string | undefined) ??
    (mode.hideSelectLabel === true ? defaultLabel : undefined)
  );
}

export function setFeatures(mode: ModeObject, features: string[]): ModeObject {
  return setJsonObjectValue(
    mode,
    'features',
    features.length ? features : undefined
  );
}

export function withoutLabelInFeatures(
  mode: ModeObject,
  defaultLabel: string | undefined
): ModeObject {
  const startingLabel = getStartingLabel(mode, defaultLabel);
  return setFeatures(
    mode,
    getFeatures(mode).filter(feature => feature !== startingLabel)
  );
}

// What pretraining sets each key to; undefined removes it.
const SET_BY_PRETRAINED: ModeObject = {
  hideSelectLabel: true,
  lockFeatures: true,
  reserveLastRows: true,
  requireAccuracy: undefined,
  hideTestingView: undefined,
};

export function isSetByPretrained(mode: ModeObject, key: string): boolean {
  return mode.pretrained === true && key in SET_BY_PRETRAINED;
}

export function setPretrained(
  mode: ModeObject,
  pretrained: boolean,
  defaultLabel?: string
): ModeObject {
  const newMode = setJsonObjectValue(
    mode,
    'pretrained',
    pretrained ? true : undefined
  );
  if (pretrained) {
    Object.assign(newMode, SET_BY_PRETRAINED);
    newMode.label = getStartingLabel(newMode, defaultLabel);
  } else {
    delete newMode.hideDatasetView;
  }
  return newMode;
}

const SET_BY_HIDDEN_TESTING: ModeObject = {
  requireAccuracy: undefined,
  hideSave: undefined,
};

export function isSetByHiddenTesting(mode: ModeObject, key: string): boolean {
  return mode.hideTestingView === true && key in SET_BY_HIDDEN_TESTING;
}

export function setHideTestingView(
  mode: ModeObject,
  hideTestingView: boolean
): ModeObject {
  const newMode = setJsonObjectValue(
    mode,
    'hideTestingView',
    hideTestingView ? true : undefined
  );
  if (hideTestingView) {
    Object.assign(newMode, SET_BY_HIDDEN_TESTING);
  }
  return newMode;
}

export function restoreFromPretrained(
  mode: ModeObject,
  beforePretrained: ModeObject = {}
): ModeObject {
  const restored = Object.keys(SET_BY_PRETRAINED).reduce(
    (newMode, key) => setJsonObjectValue(newMode, key, beforePretrained[key]),
    setPretrained(mode, false)
  );
  return setHideTestingView(restored, restored.hideTestingView === true);
}

export function isMissingPretrainedColumns(
  mode: ModeObject,
  selectable: string[] | undefined
): boolean {
  // Before the columns load, only a column's presence can be checked.
  const isSelectable = (column: unknown) =>
    column !== undefined &&
    (!selectable || selectable.includes(column as string));
  const features = getFeatures(mode).filter(feature => feature !== mode.label);
  return (
    mode.pretrained === true &&
    !(
      isSelectable(mode.label) &&
      features.length > 0 &&
      features.every(isSelectable)
    )
  );
}

// Names the default trainer explicitly, so a saved Lab 2 level always records one.
export function withDefaultTrainer(mode: ModeObject): ModeObject {
  return mode.trainer === undefined
    ? setJsonObjectValue(mode, 'trainer', DEFAULT_TRAINER)
    : mode;
}
