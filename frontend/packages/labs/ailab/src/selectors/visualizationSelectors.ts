import {createSelector} from 'reselect';

import {ColumnTypes, ResultsGrades} from '../constants';
import {getAccuracyGrades} from '../helpers/accuracy';
import {
  getUniqueOptions,
  getLocalizedColumnName,
} from '../helpers/columnDetails';
import {
  buildDisplayTree,
  type DisplayTreeNode,
  type SerializedTree,
} from '../helpers/displayTree';
import {
  countDisplayTreeRows,
  groupDisplayTreeRows,
  NO_NODE_ROWS,
  NO_ROWS,
  traceDisplayTree,
  type DisplayTreeCountsLookup,
  type DisplayTreeRowsLookup,
  type DisplayTreeTrace,
} from '../helpers/displayTreeTrace';
import {areArraysEqual} from '../helpers/utils';
import type {RootState} from '../redux';
import {
  getLabelColumn,
  getData,
  getColumnsByDataType,
  getDatasetId,
} from '../selectors';
import {getTrainerFamily} from '../trainers/ids';
import type {
  AilabProject,
  Coordinate,
  ScatterPlotData,
  CrossTabResult,
  CrossTabData,
  DataRow,
  TrainedModel,
} from '../types';

import {
  getCurrentColumn,
  currentColumnIsCategorical,
  currentColumnIsNumerical,
} from './currentColumnSelectors';

export const getScatterPlotData = createSelector(
  [
    getLabelColumn,
    (state: RootState, project: AilabProject) =>
      labelColumnIsNumerical(state, project),
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
    (state: RootState, project: AilabProject) =>
      labelColumnIsCategorical(state, project),
    getCurrentColumn,
    (state: RootState) => currentColumnIsCategorical(state),
    getData,
    (state: RootState, project: AilabProject) =>
      getUniqueOptionsLabelColumn(state, project),
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

export const getDisplayTree = createSelector(
  [
    (_state: RootState, _project: AilabProject, trainedModel?: TrainedModel) =>
      trainedModel,
    getTrainerFamily,
    (_state: RootState, project: AilabProject) => project.selectedFeatures,
    (state: RootState) => state.featureNumberKey,
    getLabelColumn,
  ],
  (
    trainedModel,
    trainerFamily,
    features: string[],
    featureNumberKey: Record<string, Record<string, number>>,
    labelColumn: string | undefined,
  ): DisplayTreeNode | undefined => {
    if (!trainedModel || !labelColumn || trainerFamily !== 'decisionTree') {
      return undefined;
    }
    return buildDisplayTree(trainedModel.toJSON() as SerializedTree, {
      features,
      featureNumberKey,
      labelColumn,
    });
  },
);

export const getPredictionTrace = createSelector(
  [
    getDisplayTree,
    (_state: RootState, _project: AilabProject, trainedModel?: TrainedModel) =>
      trainedModel,
    (state: RootState) => state.prediction,
    (state: RootState) => state.predictionInputs,
    (state: RootState) => state.predictionTestData,
  ],
  (
    tree: DisplayTreeNode | undefined,
    trainedModel,
    prediction: number | string | undefined,
    inputs: number[],
    testData: DataRow,
  ): DisplayTreeTrace | undefined => {
    if (!tree || !trainedModel || prediction === undefined) {
      return undefined;
    }
    const {root} = trainedModel.toJSON() as SerializedTree;
    return traceDisplayTree(tree, root!, inputs, testData);
  },
);

export function getPredictionStep(
  state: RootState,
  project: AilabProject,
  trainedModel?: TrainedModel,
): number {
  const pathLength =
    getPredictionTrace(state, project, trainedModel)?.path.length ?? 0;
  return state.predictionStep ?? pathLength - 1;
}

export const getDisplayTreeCounts = createSelector(
  [
    getDisplayTree,
    (_state: RootState, _project: AilabProject, trainedModel?: TrainedModel) =>
      trainedModel,
    (state: RootState) => state.accuracyCheckExamples,
    getAccuracyGrades,
  ],
  (
    tree: DisplayTreeNode | undefined,
    trainedModel,
    examples: number[][],
    grades: string[],
  ): DisplayTreeCountsLookup => {
    if (!tree) {
      return () => NO_ROWS;
    }
    const {root} = trainedModel!.toJSON() as SerializedTree;
    const counts = countDisplayTreeRows(tree, root!, examples, grades);
    return nodeId => counts.get(nodeId) ?? NO_ROWS;
  },
);

export const getDisplayTreeRows = createSelector(
  [
    getDisplayTree,
    (_state: RootState, _project: AilabProject, trainedModel?: TrainedModel) =>
      trainedModel,
    (_state: RootState, project: AilabProject) =>
      project.accuracyCheckRowIndices,
    (state: RootState) => state.data.length,
    (state: RootState) => state.trainingExamples,
    (state: RootState) => state.accuracyCheckExamples,
    getAccuracyGrades,
  ],
  (
    tree: DisplayTreeNode | undefined,
    trainedModel,
    accuracyCheckRowIndices: number[] | undefined,
    rowCount: number,
    trainingExamples: number[][],
    accuracyCheckExamples: number[][],
    grades: string[],
  ): DisplayTreeRowsLookup => {
    if (!tree || !accuracyCheckRowIndices) {
      return () => NO_NODE_ROWS;
    }
    // The split train.ts makes: dataset order, reserved rows to the test set.
    const reserved = new Set(accuracyCheckRowIndices);
    const testRows: number[] = [];
    const trainedRows: number[] = [];
    for (let row = 0; row < rowCount; row++) {
      (reserved.has(row) ? testRows : trainedRows).push(row);
    }

    const {root} = trainedModel!.toJSON() as SerializedTree;
    const testGroups = groupDisplayTreeRows(tree, root!, accuracyCheckExamples);
    const trainedGroups = groupDisplayTreeRows(tree, root!, trainingExamples);
    const testRowsWithGrade = (nodeId: string, grade: string) =>
      (testGroups.get(nodeId) ?? [])
        .filter(index => grades[index] === grade)
        .map(index => testRows[index]);
    return nodeId => ({
      correct: testRowsWithGrade(nodeId, ResultsGrades.CORRECT),
      incorrect: testRowsWithGrade(nodeId, ResultsGrades.INCORRECT),
      trained: (trainedGroups.get(nodeId) ?? []).map(
        index => trainedRows[index],
      ),
    });
  },
);
