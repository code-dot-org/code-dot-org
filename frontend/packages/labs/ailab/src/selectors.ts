import {createSelector} from 'reselect';
import {ColumnTypes} from './constants';
import {
  filterColumnsByType,
  getUniqueOptions,
  getExtrema,
  getColumnDescription,
} from './helpers/columnDetails';
import {arrayIntersection} from './helpers/utils';
import {RootState} from './redux';
import {DataRow, Metadata, TrainedModelDetailsSave} from './types';

export const getData = (state: RootState): DataRow[] => state.data;
export const getColumnsByDataType = (
  state: RootState,
): Record<string, string> => state.columnsByDataType;
const getSelectedFeatures = (state: RootState): string[] =>
  state.selectedFeatures;
export const getLabelColumn = (state: RootState): string | undefined =>
  state.labelColumn;
export const getMetadata = (state: RootState): Metadata => state.metadata;
export const getDatasetId = (state: RootState): string | undefined =>
  state.metadata && state.metadata.name;
export const getTrainedModelDetails = (
  state: RootState,
): TrainedModelDetailsSave => state.trainedModelDetails;

export const getCategoricalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType: Record<string, string>): string[] => {
    return filterColumnsByType(columnsByDataType, ColumnTypes.CATEGORICAL);
  },
);

export const getSelectedColumns = createSelector(
  [getSelectedFeatures, getLabelColumn],
  (selectedFeatures: string[], labelColumn: string | undefined): string[] => {
    const selectedColumns: string[] = labelColumn
      ? [...selectedFeatures, labelColumn]
      : [...selectedFeatures];
    return selectedColumns;
  },
);

export const getSelectedCategoricalColumns = createSelector(
  [getCategoricalColumns, getSelectedColumns],
  (categoricalColumns: string[], selectedColumns: string[]): string[] => {
    return arrayIntersection(categoricalColumns, selectedColumns);
  },
);

export const getSelectedCategoricalFeatures = createSelector(
  [getCategoricalColumns, getSelectedFeatures],
  (categoricalColumns: string[], selectedFeatures: string[]): string[] => {
    return arrayIntersection(categoricalColumns, selectedFeatures);
  },
);

export const getNumericalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType: Record<string, string>): string[] => {
    return filterColumnsByType(columnsByDataType, ColumnTypes.NUMERICAL);
  },
);

export const getSelectedNumericalColumns = createSelector(
  [getNumericalColumns, getSelectedColumns],
  (numericalColumns: string[], selectedColumns: string[]): string[] => {
    return arrayIntersection(numericalColumns, selectedColumns);
  },
);

export const getSelectedNumericalFeatures = createSelector(
  [getNumericalColumns, getSelectedFeatures],
  (numericalColumns: string[], selectedFeatures: string[]): string[] => {
    return arrayIntersection(numericalColumns, selectedFeatures);
  },
);

export const getUniqueOptionsByColumn = createSelector(
  [getSelectedCategoricalColumns, getData],
  (
    selectedCategoricalColumns: string[],
    data: DataRow[],
  ): Record<string, string[]> => {
    const uniqueOptionsByColumn: Record<string, string[]> = {};
    selectedCategoricalColumns.map(
      column =>
        (uniqueOptionsByColumn[column] = getUniqueOptions(data, column)
          .map(String)
          .sort()),
    );
    return uniqueOptionsByColumn;
  },
);

export const getExtremaByColumn = createSelector(
  [getSelectedNumericalColumns, getData],
  (
    getSelectedNumericalColumns: string[],
    data: DataRow[],
  ): Record<string, {min: number; max: number}> => {
    const extremaByColumn: Record<string, {min: number; max: number}> = {};
    getSelectedNumericalColumns.map(
      column => (extremaByColumn[column] = getExtrema(data, column)),
    );
    return extremaByColumn;
  },
);

export const getSelectedColumnsDescriptions = createSelector(
  [getSelectedColumns, getMetadata, getTrainedModelDetails],
  (
    selectedColumns: string[],
    metadata: Metadata,
    trainedModelDetails: TrainedModelDetailsSave,
  ): {id: string; description: string}[] => {
    return selectedColumns.map(column => {
      return {
        id: column,
        description:
          getColumnDescription(column, metadata, trainedModelDetails) ?? '',
      };
    });
  },
);
