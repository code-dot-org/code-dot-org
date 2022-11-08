import { createSelector } from 'reselect';
import {getLabelColumn, getData, getColumnsByDataType, getDatasetId} from "../selectors.js";
import {
  getCurrentColumn,
  currentColumnIsCategorical,
  currentColumnIsNumerical
} from './currentColumnSelectors.js';
import { getUniqueOptions, getLocalizedColumnName } from "../helpers/columnDetails.js";
import { areArraysEqual } from "../helpers/utils.js";
import { ColumnTypes } from "../constants.js";

export const getScatterPlotData = createSelector(
  [
    getLabelColumn,
    (state, props) => labelColumnIsNumerical(state, props),
    getCurrentColumn,
    currentColumnIsNumerical,
    getData,
    getDatasetId
  ],
  (
    labelColumn,
    labelColumnIsNumerical,
    currentColumn,
    currentColumnIsNumerical,
    data,
    datasetId
  ) => {
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
    const coordinates = [];
    for (let row of data) {
      coordinates.push({ x: row[currentColumn], y: row[labelColumn] });
    }

    const label = getLocalizedColumnName(datasetId, labelColumn);
    const feature = getLocalizedColumnName(datasetId, currentColumn);

    return {
      label,
      feature,
      coordinates
    };
  }
)

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
    (state, props) => labelColumnIsCategorical(state, props),
    getCurrentColumn,
    currentColumnIsCategorical,
    getData,
    (state, props) => getUniqueOptionsLabelColumn(state, props)
  ],
  (
    labelColumn,
    labelColumnIsCategorical,
    currentColumn,
    currentColumnIsCategorical,
    data,
    uniqueOptionsLabelColumn
  ) => {
    if (!labelColumn || !currentColumn) {
      return null;
    }

    if (!currentColumnIsCategorical || !labelColumnIsCategorical) {
      return null;
    }

    var results = [];

    // For each row of data, determine whether we have found a new or existing
    // combination of feature values.  If new, then add a new entry to our results
    // array.  Then record or increment the count for the corresponding label
    // value.

    for (let row of data) {
      var featureValues = [];
      featureValues.push(row[currentColumn]);

      var existingEntry = results.find(result => {
        return areArraysEqual(result.featureValues, featureValues);
      });

      if (!existingEntry) {
        existingEntry = {
          featureValues,
          labelCounts: { [row[labelColumn]]: 1 }
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

    for (let result of results) {
      let totalCount = 0;
      for (let labelCount of Object.values(result.labelCounts)) {
        totalCount += labelCount;
      }
      result.labelPercents = {};
      for (let key of Object.keys(result.labelCounts)) {
        result.labelPercents[key] = Math.round(
          (result.labelCounts[key] / totalCount) * 100
        );
      }
    }

    // Take inventory of all unique label values we have seen, which allows us
    // to generate the header at the top of the CrossTab UI.
    const uniqueLabelValues =  uniqueOptionsLabelColumn;

    return {
      results,
      uniqueLabelValues,
      featureNames: [currentColumn],
      labelName: labelColumn
    };
  }
)

export const labelColumnIsNumerical = createSelector(
  [getLabelColumn, getColumnsByDataType],
  (labelColumn, columnsByDataType) => {
    return columnsByDataType[labelColumn] === ColumnTypes.NUMERICAL;
  }
)

export const labelColumnIsCategorical = createSelector(
  [getLabelColumn, getColumnsByDataType],
  (labelColumn, columnsByDataType) => {
    return columnsByDataType[labelColumn] === ColumnTypes.CATEGORICAL;
  }
)

export const getUniqueOptionsLabelColumn = createSelector(
  [getLabelColumn, getData],
  (labelColumn, data) => {
    return getUniqueOptions(data, labelColumn).sort()
  }
)
