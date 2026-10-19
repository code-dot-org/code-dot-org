/*
  Settling which columns a project ends up with, from the three sources that
  disagree: what the student chose, what the level's mode presets, and what the
  loaded dataset actually offers.
*/

import type {AilabProject, DataRow, PresetColumns} from '../types';

/* Which columns a level's mode fixes, leaving the student no way to change. */
export interface ColumnLocks {
  label: boolean;
  features: boolean;
}

export function sortByColumnOrder(
  features: string[],
  data: DataRow[]
): string[] {
  const columns = Object.keys(data[0] ?? {});
  return [...features].sort((a, b) => columns.indexOf(a) - columns.indexOf(b));
}

/*
  A locked column always wins, since the student has no way to change it. An
  unlocked one never replaces a choice already in the project.
*/
export function applyPresetColumns(
  project: AilabProject,
  presetColumns: PresetColumns,
  locks: ColumnLocks,
  data: DataRow[]
): AilabProject {
  let labelColumn = project.labelColumn;
  if (
    presetColumns.labelColumn !== undefined &&
    (locks.label || project.labelColumn === undefined)
  ) {
    labelColumn = presetColumns.labelColumn;
  }

  let features = project.selectedFeatures;
  if (
    presetColumns.selectedFeatures &&
    (locks.features || project.selectedFeatures.length === 0)
  ) {
    features = presetColumns.selectedFeatures;
  }

  return withColumns(project, labelColumn, features, data);
}

/*
  Drops columns this dataset doesn't offer, so a project saved against an
  earlier version of it still opens.
*/
export function keepSelectableColumns(
  project: AilabProject,
  selectableColumns: string[],
  data: DataRow[]
): AilabProject {
  const isSelectable = (column: string) => selectableColumns.includes(column);
  const {labelColumn, selectedFeatures} = project;

  return withColumns(
    project,
    labelColumn !== undefined && isSelectable(labelColumn)
      ? labelColumn
      : undefined,
    selectedFeatures.filter(isSelectable),
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
