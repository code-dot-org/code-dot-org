/*
  AI Lab's main.json: a student's project as the engine stores it.
*/

import {
  defaultProject,
  type AilabProject,
  type HistoricResult,
  type Hyperparameters,
} from '@cdo/apps/ailab/engine';
import {ProjectSources} from '@cdo/apps/lab2/types';

export type AilabProjectSources = ProjectSources & {source: AilabProject};

// Must stay referentially stable: useSources reloads when it changes.
export const AILAB_DEFAULT_SOURCES: AilabProjectSources = {
  source: defaultProject,
};

/*
  The trainers ask a saved value which family it belongs to with `in`, which
  throws on anything that is not an object.
*/
const hyperparameters = (value: unknown): Hyperparameters | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const {k, maxDepth} = value as Partial<{k: number; maxDepth: number}>;
  if (typeof k === 'number') {
    return {k};
  }
  return typeof maxDepth === 'number' ? {maxDepth} : undefined;
};

const columnNames = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(name => typeof name === 'string') : [];

const isHistoricResult = (value: unknown): value is HistoricResult => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const result = value as Partial<HistoricResult>;
  return (
    typeof result.label === 'string' &&
    Array.isArray(result.features) &&
    result.features.every(feature => typeof feature === 'string') &&
    typeof result.accuracy === 'string' &&
    typeof result.correct === 'number' &&
    typeof result.total === 'number'
  );
};

const rowIndices = (value: unknown): number[] | undefined =>
  Array.isArray(value) && value.every(index => Number.isInteger(index))
    ? (value as number[])
    : undefined;

/*
  A saved source as an AilabProject, dropping anything that isn't the shape the
  engine expects.
*/
export function sourceToProject(
  source: ProjectSources['source']
): AilabProject {
  if (typeof source !== 'object' || source === null) {
    return defaultProject;
  }
  const saved = source as Partial<AilabProject>;

  return {
    labelColumn:
      typeof saved.labelColumn === 'string' ? saved.labelColumn : undefined,
    selectedFeatures: columnNames(saved.selectedFeatures),
    hyperparameters: hyperparameters(saved.hyperparameters),
    accuracyCheckRowIndices: rowIndices(saved.accuracyCheckRowIndices),
    historicResults: Array.isArray(saved.historicResults)
      ? saved.historicResults.filter(isHistoricResult)
      : [],
  };
}
