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

export const getData = (state: RootState): DataRow[] => state.data;
export const getColumnsByDataType = (
  state: RootState
): Record<string, string> => state.columnsByDataType;
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
export const getMetadata = (state: RootState): Metadata => state.metadata;
export const getDatasetId = (state: RootState): string | undefined =>
  state.metadata && state.metadata.name;
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
    return idColumn !== undefined && data.length > 0 && idColumn in data[0]
      ? idColumn
      : undefined;
  }
);

export const getSelectableColumns = createSelector(
  [getData, getColumnsByDataType, getIdColumn],
  (
    data: DataRow[],
    columnsByDataType: Record<string, string>,
    idColumn: string | undefined
  ): string[] =>
    selectableColumns(data, columnsByDataType).filter(
      column => column !== idColumn
    )
);

export const getFilterableColumns = createSelector(
  [getSelectableColumns, getCategoricalColumns],
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
