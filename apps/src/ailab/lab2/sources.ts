/*
  AI Lab's main.json: a student's project as the engine keeps it. The engine
  owns the shape; this module is where an untrusted copy of it from the server
  is made safe to open.
*/

import {initialProject, type AilabProject} from '@cdo/apps/ailab/engine';
import {ProjectSources} from '@cdo/apps/lab2/types';

export type AilabProjectSources = ProjectSources & {source: AilabProject};

// Must stay referentially stable: useSources reloads when it changes.
export const AILAB_DEFAULT_SOURCES: AilabProjectSources = {
  source: initialProject,
};

const columnNames = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(name => typeof name === 'string') : [];

const rowIndices = (value: unknown): number[] | undefined =>
  Array.isArray(value) && value.every(index => Number.isInteger(index))
    ? (value as number[])
    : undefined;

/*
  A saved source as an AilabProject, dropping anything that isn't the shape the
  engine expects. Nothing validates main.json on the way in, so a project saved
  by an older version of the lab, or edited by hand, arrives here unchecked.
*/
// TODO: do we need this
export function sourceToProject(
  source: ProjectSources['source']
): AilabProject {
  if (typeof source !== 'object' || source === null) {
    return initialProject;
  }
  const saved = source as Partial<AilabProject>;

  return {
    labelColumn:
      typeof saved.labelColumn === 'string' ? saved.labelColumn : undefined,
    selectedFeatures: columnNames(saved.selectedFeatures),
    hyperparameters: saved.hyperparameters,
    accuracyCheckRowIndices: rowIndices(saved.accuracyCheckRowIndices),
    historicResults: Array.isArray(saved.historicResults)
      ? saved.historicResults
      : [],
  };
}
