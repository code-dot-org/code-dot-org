import {createSelector} from 'reselect';
import {
  getUniqueOptions,
  getExtrema,
  Extrema,
  isColumnReadOnly,
  getColumnDescription,
  tooManyUniqueOptions,
  containsOnlyNumbers,
} from '../helpers/columnDetails';
import {
  getSelectedColumns,
  getData,
  getColumnsByDataType,
  getMetadata,
  getTrainedModelDetails,
} from '../selectors';
import {ColumnTypes} from '../constants';
import {RootState} from '../redux';
import {
  DataRow,
  Metadata,
  TrainedModelDetailsSave,
  CurrentColumnInspector,
  NumericalColumnDetails,
  CategoricalColumnDetails,
} from '../types';

export const getCurrentColumn = (state: RootState): string | undefined =>
  state.currentColumn;

export const getCurrentColumnDetails = createSelector(
  [
    getCurrentColumn,
    (state: RootState) => isCurrentColumnReadOnly(state),
    getColumnsByDataType,
    (state: RootState) => getCurrentColumnDescription(state),
    (state: RootState) => isCurrentColumnSelectable(state),
  ],
  (
    currentColumn: string | undefined,
    isReadOnly: boolean,
    columnsByDataType: Record<string, string>,
    description: string | undefined,
    isSelectable: boolean,
  ): CurrentColumnInspector | undefined => {
    if (currentColumn) {
      return {
        id: currentColumn,
        readOnly: isReadOnly,
        dataType: columnsByDataType[currentColumn],
        description: description ?? '',
        isSelectable: isSelectable,
      };
    }
  },
);

export const isCurrentColumnReadOnly = createSelector(
  [getCurrentColumn, getMetadata],
  (currentColumn: string | undefined, metadata: Metadata): boolean => {
    return isColumnReadOnly(metadata, currentColumn!);
  },
);

export const getCurrentColumnDescription = createSelector(
  [getCurrentColumn, getMetadata, getTrainedModelDetails],
  (
    currentColumn: string | undefined,
    metadata: Metadata,
    trainedModelDetails: TrainedModelDetailsSave,
  ): string | undefined => {
    return currentColumn
      ? (getColumnDescription(currentColumn, metadata, trainedModelDetails) ??
          undefined)
      : undefined;
  },
);

export const isCurrentColumnSelectable = createSelector(
  [
    (state: RootState) => isCurrentColumnSelected(state),
    (state: RootState) => isValidData(state),
  ],
  (selected: boolean, isValidData: boolean): boolean => {
    return !selected && isValidData;
  },
);

export const isCurrentColumnSelected = createSelector(
  [getSelectedColumns, getCurrentColumn],
  (selectedColumns: string[], currentColumn: string | undefined): boolean => {
    return !!currentColumn && selectedColumns.includes(currentColumn);
  },
);

export const isValidData = createSelector(
  [
    (state: RootState) => isValidNumericalData(state),
    (state: RootState) => isValidCategoricalData(state),
  ],
  (isValidNumericalData: boolean, isValidCategoricalData: boolean): boolean => {
    return isValidNumericalData || isValidCategoricalData;
  },
);

export const getNumericalColumnDetails = createSelector(
  [
    getCurrentColumn,
    (state: RootState) => currentColumnIsNumerical(state),
    (state: RootState) => getExtremaCurrentColumn(state),
    (state: RootState) => currentColumnContainsOnlyNumbers(state),
  ],
  (
    currentColumn: string | undefined,
    isNumerical: boolean,
    extrema: Extrema,
    containsOnlyNumbers: boolean,
  ): NumericalColumnDetails => {
    const numericalColumnDetails: Partial<NumericalColumnDetails> & {
      id?: string;
    } = {};
    numericalColumnDetails.id = currentColumn;
    numericalColumnDetails.containsOnlyNumbers = containsOnlyNumbers;
    if (isNumerical) {
      numericalColumnDetails.extrema = extrema;
    }
    return numericalColumnDetails as NumericalColumnDetails;
  },
);

export const currentColumnIsNumerical = createSelector(
  [getCurrentColumn, getColumnsByDataType],
  (
    currentColumn: string | undefined,
    columnsByDataType: Record<string, string>,
  ): boolean => {
    return columnsByDataType[currentColumn!] === ColumnTypes.NUMERICAL;
  },
);

export const getExtremaCurrentColumn = createSelector(
  [getCurrentColumn, getData],
  (currentColumn: string | undefined, data: DataRow[]): Extrema => {
    return getExtrema(data, currentColumn!);
  },
);

export const currentColumnContainsOnlyNumbers = createSelector(
  [getCurrentColumn, getData],
  (currentColumn: string | undefined, data: DataRow[]): boolean => {
    return containsOnlyNumbers(data, currentColumn!);
  },
);

export const isValidNumericalData = createSelector(
  [currentColumnIsNumerical, currentColumnContainsOnlyNumbers],
  (isNumerical: boolean, containsOnlyNumbers: boolean): boolean => {
    return isNumerical && containsOnlyNumbers;
  },
);

export const getCategoricalColumnDetails = createSelector(
  [
    getCurrentColumn,
    (state: RootState) => currentColumnIsCategorical(state),
    (state: RootState) => getUniqueOptionsCurrentColumn(state),
    (state: RootState) => getOptionFrequenciesCurrentColumn(state),
  ],
  (
    currentColumn: string | undefined,
    isCategorical: boolean,
    uniqueOptions: string[],
    uniqueOptionFrequencies: Record<string, number>,
  ): CategoricalColumnDetails => {
    const categeoricalColumnDetails: Partial<CategoricalColumnDetails> & {
      id?: string;
    } = {};
    categeoricalColumnDetails.id = currentColumn;
    if (isCategorical) {
      categeoricalColumnDetails.uniqueOptions = uniqueOptions;
      categeoricalColumnDetails.frequencies = uniqueOptionFrequencies;
    }
    return categeoricalColumnDetails as CategoricalColumnDetails;
  },
);

export const getUniqueOptionsCurrentColumn = createSelector(
  [getCurrentColumn, getData],
  (currentColumn: string | undefined, data: DataRow[]): string[] => {
    return getUniqueOptions(data, currentColumn!).map(String).sort();
  },
);

export const getOptionFrequenciesCurrentColumn = createSelector(
  [getCurrentColumn, getData],
  (
    currentColumn: string | undefined,
    data: DataRow[],
  ): Record<string, number> => {
    const optionFrequencies: Record<string, number> = {};
    for (const row of data) {
      if (optionFrequencies[row[currentColumn!]]) {
        optionFrequencies[row[currentColumn!]]++;
      } else {
        optionFrequencies[row[currentColumn!]] = 1;
      }
    }
    return optionFrequencies;
  },
);

export const currentColumnIsCategorical = createSelector(
  [getCurrentColumn, getColumnsByDataType],
  (
    currentColumn: string | undefined,
    columnsByDataType: Record<string, string>,
  ): boolean => {
    return columnsByDataType[currentColumn!] === ColumnTypes.CATEGORICAL;
  },
);

export const hasTooManyUniqueOptions = createSelector(
  [getUniqueOptionsCurrentColumn, currentColumnIsCategorical],
  (uniqueOptions: string[], isCategorical: boolean): boolean => {
    return isCategorical && tooManyUniqueOptions(uniqueOptions.length);
  },
);

export const isValidCategoricalData = createSelector(
  [currentColumnIsCategorical, getUniqueOptionsCurrentColumn],
  (isCategorical: boolean, uniqueOptions: string[]): boolean => {
    return isCategorical && !tooManyUniqueOptions(uniqueOptions.length);
  },
);
