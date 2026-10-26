import {createSelector} from 'reselect';

import {ColumnTypes} from './constants';
import {
  filterColumnsByType,
  getDecimalPlaces,
  getUniqueOptions,
  getExtrema,
  getColumnDescription,
  selectableColumns,
} from './helpers/columnDetails';
import {arrayIntersection} from './helpers/utils';
import type {RootState} from './redux';
import type {
  AilabProject,
  DataRow,
  Metadata,
  TrainedModelDetailsSave,
} from './types';

/*
  Stand-ins for a dataset that has not loaded, returned by identity. A fresh
  `[]` each call would defeat the reference equality the memoized selectors
  below are built on, and they would recompute on every unrelated change.
*/
const NO_ROWS: DataRow[] = Object.freeze([]) as unknown as DataRow[];
const NO_COLUMN_TYPES: Record<string, string> = Object.freeze({});
const NO_METADATA: Metadata = Object.freeze({card: Object.freeze({})});

export const getData = (state: RootState): DataRow[] =>
  state.dataset?.rows ?? NO_ROWS;
export const getColumnsByDataType = (
  state: RootState
): Record<string, string> =>
  state.dataset?.columnsByDataType ?? NO_COLUMN_TYPES;
// Reselect passes a selector's extra arguments to every input selector, so
// taking the project here gives it to everything derived below.
const getSelectedFeatures = (
  _state: RootState,
  project: AilabProject
): string[] => project.selectedFeatures;
export const getLabelColumn = (
  _state: RootState,
  project: AilabProject
): string | undefined => project.labelColumn;
export const getMetadata = (state: RootState): Metadata =>
  state.dataset?.metadata ?? NO_METADATA;
export const getDatasetId = (state: RootState): string | undefined =>
  state.dataset?.metadata.name;
export const getRemovedRowsCount = (state: RootState): number =>
  state.dataset?.removedRowsCount ?? 0;

export type DatasetStatus = 'none' | 'loading' | 'failed' | 'loaded';

/* Where the chosen dataset has got to, which is the only thing to gate on. */
export const getDatasetStatus = (state: RootState): DatasetStatus => {
  if (state.dataset) {
    return 'loaded';
  }
  if (state.invalidData) {
    return 'failed';
  }
  return state.csvfile ? 'loading' : 'none';
};
export const getTrainedModelDetails = (
  state: RootState
): TrainedModelDetailsSave => state.trainedModelDetails;

export const getCategoricalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType: Record<string, string>): string[] => {
    return filterColumnsByType(columnsByDataType, ColumnTypes.CATEGORICAL);
  }
);

export const getSelectedColumns = createSelector(
  [getSelectedFeatures, getLabelColumn],
  (selectedFeatures: string[], labelColumn: string | undefined): string[] => {
    const selectedColumns: string[] = labelColumn
      ? [...selectedFeatures, labelColumn]
      : [...selectedFeatures];
    return selectedColumns;
  }
);

export const getSelectedCategoricalColumns = createSelector(
  [getCategoricalColumns, getSelectedColumns],
  (categoricalColumns: string[], selectedColumns: string[]): string[] => {
    return arrayIntersection(categoricalColumns, selectedColumns);
  }
);

export const getSelectedCategoricalFeatures = createSelector(
  [getCategoricalColumns, getSelectedFeatures],
  (categoricalColumns: string[], selectedFeatures: string[]): string[] => {
    return arrayIntersection(categoricalColumns, selectedFeatures);
  }
);

export const getNumericalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType: Record<string, string>): string[] => {
    return filterColumnsByType(columnsByDataType, ColumnTypes.NUMERICAL);
  }
);

export const getSelectedNumericalColumns = createSelector(
  [getNumericalColumns, getSelectedColumns],
  (numericalColumns: string[], selectedColumns: string[]): string[] => {
    return arrayIntersection(numericalColumns, selectedColumns);
  }
);

export const getSelectedNumericalFeatures = createSelector(
  [getNumericalColumns, getSelectedFeatures],
  (numericalColumns: string[], selectedFeatures: string[]): string[] => {
    return arrayIntersection(numericalColumns, selectedFeatures);
  }
);

// A dataset can drop or rename the column a level names.
export const getIdColumn = createSelector(
  [
    getData,
    (state: RootState) => state.mode?.idColumn,
    (state: RootState) => state.metadata.defaultIdColumn,
  ],
  (
    data: DataRow[],
    levelIdColumn: string | null | undefined,
    defaultIdColumn: string | undefined
  ): string | undefined => {
    const idColumn =
      levelIdColumn === null ? undefined : levelIdColumn ?? defaultIdColumn;
    return idColumn !== undefined && Object.hasOwn(data[0] ?? {}, idColumn)
      ? idColumn
      : undefined;
  }
);

export const getTrainableColumns = createSelector(
  [getData, getColumnsByDataType],
  selectableColumns
);

export const getSelectableColumns = createSelector(
  [getTrainableColumns, getIdColumn],
  (columns: string[], idColumn: string | undefined): string[] =>
    columns.filter(column => column !== idColumn)
);

export const getFilterableColumns = createSelector(
  [getTrainableColumns, getCategoricalColumns],
  arrayIntersection
);

export const getUniqueOptionsByColumn = createSelector(
  [getSelectedCategoricalColumns, getData],
  (
    selectedCategoricalColumns: string[],
    data: DataRow[]
  ): Record<string, string[]> => {
    const uniqueOptionsByColumn: Record<string, string[]> = {};
    selectedCategoricalColumns.map(
      column =>
        (uniqueOptionsByColumn[column] = getUniqueOptions(data, column)
          .map(String)
          .sort())
    );
    return uniqueOptionsByColumn;
  }
);

export const getExtremaByColumn = createSelector(
  [getSelectedNumericalColumns, getData],
  (
    getSelectedNumericalColumns: string[],
    data: DataRow[]
  ): Record<string, {min: number; max: number}> => {
    const extremaByColumn: Record<string, {min: number; max: number}> = {};
    getSelectedNumericalColumns.map(
      column => (extremaByColumn[column] = getExtrema(data, column))
    );
    return extremaByColumn;
  }
);

export const getDecimalPlacesByColumn = createSelector(
  [getSelectedNumericalColumns, getData],
  (
    selectedNumericalColumns: string[],
    data: DataRow[]
  ): Record<string, number> =>
    Object.fromEntries(
      selectedNumericalColumns.map(column => [
        column,
        getDecimalPlaces(data, column),
      ])
    )
);

export const getSelectedColumnsDescriptions = createSelector(
  [getSelectedColumns, getMetadata, getTrainedModelDetails],
  (
    selectedColumns: string[],
    metadata: Metadata,
    trainedModelDetails: TrainedModelDetailsSave
  ): {id: string; description: string}[] => {
    return selectedColumns.map(column => {
      return {
        id: column,
        description:
          getColumnDescription(column, metadata, trainedModelDetails) ?? '',
      };
    });
  }
);
