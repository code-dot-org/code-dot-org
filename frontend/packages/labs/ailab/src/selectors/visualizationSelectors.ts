import {createSelector} from 'reselect';

import {ColumnTypes} from '../constants';
import {
  getUniqueOptions,
  getLocalizedColumnName,
} from '../helpers/columnDetails';
import {areArraysEqual} from '../helpers/utils';
import {getLocalizedValue} from '../helpers/valueDetails';
import type {RootState} from '../redux';
import {
  getLabelColumn,
  getData,
  getColumnsByDataType,
  getDatasetId,
} from '../selectors';
import type {
  Coordinate,
  ScatterPlotData,
  MixedRelationshipPlotData,
  CrossTabResult,
  CrossTabData,
  DataRow,
} from '../types';

import {
  getCurrentColumn,
  currentColumnIsCategorical,
  currentColumnIsNumerical,
} from './currentColumnSelectors';

export const getScatterPlotData = createSelector(
  [
    getLabelColumn,
    (state: RootState) => labelColumnIsNumerical(state),
    getCurrentColumn,
    (state: RootState) => currentColumnIsNumerical(state),
    getData,
    getDatasetId,
  ],
  (
    labelColumn: string | undefined,
    labelColumnIsNumerical: boolean,
    currentColumn: string | undefined,
    currentColumnIsNumerical: boolean,
    data: DataRow[],
    datasetId: string | undefined,
  ): ScatterPlotData | null => {
    if (!labelColumn || !currentColumn) {
      return null;
    }

    if (!currentColumnIsNumerical || !labelColumnIsNumerical) {
      return null;
    }

    if (labelColumn === currentColumn) {
      return null;
    }

    // For each row, record the X (feature value) and Y (label value).
    const coordinates: Coordinate[] = [];
    for (const row of data) {
      coordinates.push({
        x: Number(row[currentColumn]),
        y: Number(row[labelColumn]),
      });
    }

    const label = getLocalizedColumnName(datasetId ?? '', labelColumn);
    const feature = getLocalizedColumnName(datasetId ?? '', currentColumn);

    return {
      label,
      feature,
      coordinates,
    };
  },
);

/* Returns an object with information for the CrossTab UI.
 *
 * Here is an example result:
 *
 *  {
 *    results: [
 *      {
 *        featureValues: ["1", "1"],
 *        labelCounts: { yes: 2, no: 1 },
 *        labelPercents: { yes: 67, no: 33 }
 *      },
 *      {
 *        featureValues: ["0", "0"],
 *        labelCounts: { yes: 25, no: 42 },
 *        labelPercents: { yes: 37, no: 63 }
 *      },
 *      {
 *        featureValues: ["1", "0"],
 *        labelCounts: { yes: 6, no: 5 },
 *        labelPercents: { yes: 55, no: 45 }
 *      },
 *      {
 *        featureValues: ["0", "1"],
 *        labelCounts: { no: 2, yes: 2 },
 *        labelPercents: { no: 50, yes: 50 }
 *      }
 *    ],
 *    uniqueLabelValues: ["yes", "no"],
 *    featureNames: ["caramel", "crispy"],
 *    labelName: "delicious?"
 *  }
 *
 */

export const getCrossTabData = createSelector(
  [
    getLabelColumn,
    (state: RootState) => labelColumnIsCategorical(state),
    getCurrentColumn,
    (state: RootState) => currentColumnIsCategorical(state),
    getData,
    (state: RootState) => getUniqueOptionsLabelColumn(state),
    getDatasetId,
  ],
  (
    labelColumn: string | undefined,
    labelColumnIsCategorical: boolean,
    currentColumn: string | undefined,
    currentColumnIsCategorical: boolean,
    data: DataRow[],
    uniqueOptionsLabelColumn: string[],
    datasetId: string | undefined,
  ): CrossTabData | null => {
    if (!labelColumn || !currentColumn) {
      return null;
    }

    if (!currentColumnIsCategorical || !labelColumnIsCategorical) {
      return null;
    }

    const results: CrossTabResult[] = [];

    // For each row of data, determine whether we have found a new or existing
    // combination of feature values.  If new, then add a new entry to our results
    // array.  Then record or increment the count for the corresponding label
    // value.

    for (const row of data) {
      const featureValues: (string | number)[] = [];
      featureValues.push(row[currentColumn]);

      let existingEntry = results.find(result => {
        return areArraysEqual(result.featureValues, featureValues);
      });

      if (!existingEntry) {
        existingEntry = {
          featureValues,
          labelCounts: {[row[labelColumn]]: 1},
        };
        results.push(existingEntry);
      } else {
        if (!existingEntry.labelCounts[row[labelColumn]]) {
          existingEntry.labelCounts[row[labelColumn]] = 1;
        } else {
          existingEntry.labelCounts[row[labelColumn]]++;
        }
      }
    }

    // Now that we have all the counts of label values, we can determine the
    // corresponding percentage values.

    for (const result of results) {
      let totalCount = 0;
      for (const labelCount of Object.values(result.labelCounts)) {
        totalCount += labelCount;
      }
      result.labelPercents = {};
      for (const key of Object.keys(result.labelCounts)) {
        result.labelPercents[key] = Math.round(
          (result.labelCounts[key] / totalCount) * 100,
        );
      }
    }

    // Take inventory of all unique label values we have seen, which allows us
    // to generate the header at the top of the CrossTab UI.
    const uniqueLabelValues = uniqueOptionsLabelColumn;

    const localizedLabelColumn = getLocalizedColumnName(
      datasetId ?? '',
      labelColumn,
    );
    const localizedCurrentColumn = getLocalizedColumnName(
      datasetId ?? '',
      currentColumn,
    );
    return {
      results,
      uniqueLabelValues,
      featureNames: [localizedCurrentColumn],
      labelName: localizedLabelColumn,
    };
  },
);

function getJitter(index: number): number {
  return ((index % 5) - 2) * 0.04;
}

export const getMixedRelationshipPlotData = createSelector(
  [
    getLabelColumn,
    (state: RootState) => labelColumnIsNumerical(state),
    (state: RootState) => labelColumnIsCategorical(state),
    getCurrentColumn,
    (state: RootState) => currentColumnIsNumerical(state),
    (state: RootState) => currentColumnIsCategorical(state),
    getData,
    getDatasetId,
  ],
  (
    labelColumn: string | undefined,
    labelColumnIsNumerical: boolean,
    labelColumnIsCategorical: boolean,
    currentColumn: string | undefined,
    currentColumnIsNumerical: boolean,
    currentColumnIsCategorical: boolean,
    data: DataRow[],
    datasetId: string | undefined,
  ): MixedRelationshipPlotData | null => {
    if (!labelColumn || !currentColumn || labelColumn === currentColumn) {
      return null;
    }

    const currentIsNumericalAndLabelIsCategorical =
      currentColumnIsNumerical && labelColumnIsCategorical;
    const currentIsCategoricalAndLabelIsNumerical =
      currentColumnIsCategorical && labelColumnIsNumerical;

    if (
      !currentIsNumericalAndLabelIsCategorical &&
      !currentIsCategoricalAndLabelIsNumerical
    ) {
      return null;
    }

    const categoricalColumn = currentIsNumericalAndLabelIsCategorical
      ? labelColumn
      : currentColumn;
    const numericalColumn = currentIsNumericalAndLabelIsCategorical
      ? currentColumn
      : labelColumn;

    const categoryValues = getUniqueOptions(data, categoricalColumn).sort((a, b) =>
      String(a).localeCompare(String(b)),
    );
    if (categoryValues.length === 0) {
      return null;
    }

    const xCategories = categoryValues.map(value =>
      String(getLocalizedValue(value, datasetId ?? '')),
    );
    const categoryIndexByValue = new Map(
      categoryValues.map((value, index) => [String(value), index]),
    );
    const coordinates: Coordinate[] = [];

    data.forEach((row, rowIndex) => {
      const categoryIndex = categoryIndexByValue.get(
        String(row[categoricalColumn]),
      );
      const numericalValue = Number(row[numericalColumn]);

      if (categoryIndex !== undefined && !isNaN(numericalValue)) {
        coordinates.push({
          x: categoryIndex + getJitter(rowIndex),
          y: numericalValue,
        });
      }
    });

    return {
      label: getLocalizedColumnName(datasetId ?? '', labelColumn),
      feature: getLocalizedColumnName(datasetId ?? '', currentColumn),
      xAxisLabel: getLocalizedColumnName(datasetId ?? '', categoricalColumn),
      yAxisLabel: getLocalizedColumnName(datasetId ?? '', numericalColumn),
      xCategories,
      coordinates,
    };
  },
);

export const labelColumnIsNumerical = createSelector(
  [getLabelColumn, getColumnsByDataType],
  (
    labelColumn: string | undefined,
    columnsByDataType: Record<string, string>,
  ): boolean => {
    return columnsByDataType[labelColumn!] === ColumnTypes.NUMERICAL;
  },
);

export const labelColumnIsCategorical = createSelector(
  [getLabelColumn, getColumnsByDataType],
  (
    labelColumn: string | undefined,
    columnsByDataType: Record<string, string>,
  ): boolean => {
    return columnsByDataType[labelColumn!] === ColumnTypes.CATEGORICAL;
  },
);

export const getUniqueOptionsLabelColumn = createSelector(
  [getLabelColumn, getData],
  (labelColumn: string | undefined, data: DataRow[]): string[] => {
    return getUniqueOptions(data, labelColumn!).map(String).sort();
  },
);
