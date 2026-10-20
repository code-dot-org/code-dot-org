/*
  Helpers for managing which columns a project uses for its label and features.
*/

import type {AilabProject, DataRow, PresetColumns} from '../types';

export function sortByColumnOrder(
  features: string[],
  data: DataRow[]
): string[] {
  const columns = Object.keys(data[0] ?? {});
  return [...features].sort((a, b) => columns.indexOf(a) - columns.indexOf(b));
}

/*
  Applies preset columns to a project, respecting locked label and feature columns.
  Unlocked columns can be overwritten by the students' saved project.
*/
export function applyPresetColumns(
  project: AilabProject,
  presetColumns: PresetColumns,
  lockedLabel: boolean,
  lockedFeatures: boolean,
  data: DataRow[]
): AilabProject {
  let labelColumn = project.labelColumn;
  if (
    presetColumns.labelColumn !== undefined &&
    (lockedLabel || project.labelColumn === undefined)
  ) {
    labelColumn = presetColumns.labelColumn;
  }

  let features = project.selectedFeatures;
  if (
    presetColumns.selectedFeatures &&
    (lockedFeatures || project.selectedFeatures.length === 0)
  ) {
    features = presetColumns.selectedFeatures;
  }

  return withColumns(project, labelColumn, features, data);
}

/*
  Drops columns this dataset doesn't offer, so a project saved against an
  earlier version of it still opens.

  Dropping a column also discards the saved training run, which describes a
  model over the columns as they were. Keeping it would let that model be
  rebuilt over the surviving columns and reported under the old run's accuracy.
  The historic results stay: each names the columns it was trained on.
*/
export function keepSelectableColumns(
  project: AilabProject,
  selectableColumns: string[],
  data: DataRow[]
): AilabProject {
  const isSelectable = (column: string) => selectableColumns.includes(column);
  const {labelColumn, selectedFeatures} = project;
  const keptFeatures = selectedFeatures.filter(isSelectable);
  const keptLabel =
    labelColumn !== undefined && isSelectable(labelColumn)
      ? labelColumn
      : undefined;

  const dropped =
    keptLabel !== labelColumn ||
    keptFeatures.length !== selectedFeatures.length;

  return withColumns(
    {
      ...project,
      hyperparameters: dropped ? undefined : project.hyperparameters,
      accuracyCheckRowIndices: dropped
        ? undefined
        : project.accuracyCheckRowIndices,
    },
    keptLabel,
    keptFeatures,
    data
  );
}

function withColumns(
  project: AilabProject,
  labelColumn: string | undefined,
  features: string[],
  data: DataRow[]
): AilabProject {
  return {
    ...project,
    labelColumn,
    // A column can't be both the thing predicted and a thing predicted from.
    selectedFeatures: sortByColumnOrder(
      features.filter(feature => feature !== labelColumn),
      data
    ),
  };
}
