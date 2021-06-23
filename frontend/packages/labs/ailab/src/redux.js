import {
  uniqLabelFeaturesSelected,
  prevNextButtons
} from "./helpers/navigationValidation.js";
import { reportPanelView } from "./helpers/metrics.js";
import {
  getAccuracyClassification,
  getAccuracyRegression,
  getResultsByGrade
} from "./helpers/accuracy.js";
import {
  isColumnNumerical,
  isColumnCategorical,
  isColumnReadOnly,
  getColumnDescription,
  hasTooManyUniqueOptions,
  getColumnDataToSave,
  isSelectable,
  isColumnDataValid
} from "./helpers/columnDetails.js";
import {
  getUniqueOptionsCurrentColumn,
  getUniqueOptionsLabelColumn,
  getExtremaCurrentColumn,
  getOptionFrequenciesCurrentColumn
} from "./selectors";
import { convertValueForDisplay } from "./helpers/valueConversion.js";
import { areArraysEqual } from "./helpers/utils.js";
import {
  ColumnTypes,
  MLTypes,
  RegressionTrainer,
  ClassificationTrainer,
  TestDataLocations,
  ResultsGrades
} from "./constants.js";

// Action types
const RESET_STATE = "RESET_STATE";
const SET_MODE = "SET_MODE";
const SET_SELECTED_NAME = "SET_SELECTED_NAME";
const SET_SELECTED_CSV = "SET_SELECTED_CSV";
const SET_SELECTED_JSON = "SET_SELECTED_JSON";
const SET_IMPORTED_DATA = "SET_IMPORTED_DATA";
const SET_IMPORTED_METADATA = "SET_IMPORTED_METADATA";
const SET_REMOVED_ROWS_COUNT = "SET_REMOVED_ROWS_COUNT";
const SET_COLUMNS_BY_DATA_TYPE = "SET_COLUMNS_BY_DATA_TYPE";
const ADD_SELECTED_FEATURE = "ADD_SELECTED_FEATURE";
const REMOVE_SELECTED_FEATURE = "REMOVE_SELECTED_FEATURE";
const SET_LABEL_COLUMN = "SET_LABEL_COLUMN";
const SET_FEATURE_NUMBER_KEY = "SET_FEATURE_NUMBER_KEY";
const SET_RESERVE_LOCATION = "SET_RESERVE_LOCATION";
const SET_ACCURACY_CHECK_EXAMPLES = "SET_ACCURACY_CHECK_EXAMPLES";
const SET_ACCURACY_CHECK_LABELS = "SET_ACCURACY_CHECK_LABELS";
const SET_ACCURACY_CHECK_PREDICTED_LABELS =
  "SET_ACCURACY_CHECK_PREDICTED_LABELS";
const SET_TRAINING_EXAMPLES = "SET_TRAINING_EXAMPLES";
const SET_TRAINING_LABELS = "SET_TRAINING_LABELS";
const SET_TEST_DATA = "SET_TEST_DATA";
const SET_PREDICTION = "SET_PREDICTION";
const SET_TRAINED_MODEL = "SET_TRAINED_MODEL";
const SET_TRAINED_MODEL_DETAIL = "SET_TRAINED_MODEL_DETAIL";
const SET_CURRENT_PANEL = "SET_CURRENT_PANEL";
const SET_CURRENT_COLUMN = "SET_CURRENT_COLUMN";
const SET_HIGHLIGHT_COLUMN = "SET_HIGHLIGHT_COLUMN";
const SET_HIGHLIGHT_DATASET = "SET_HIGHLIGHT_DATASET";
const SET_RESULTS_PHASE = "SET_RESULTS_PHASE";
const SET_RESULTS_HIGHLIGHT_ROW = "SET_RESULTS_HIGHLIGHT_ROW";
const SET_INSTRUCTIONS_KEY_CALLBACK = "SET_INSTRUCTIONS_KEY_CALLBACK";
const SET_SAVE_STATUS = "SET_SAVE_STATUS";
const SET_HISTORIC_RESULT = "SET_HISTORIC_RESULT";
const SET_SHOW_RESULTS_DETAILS = "SET_SHOW_RESULTS_DETAILS";
const SET_K_VALUE = "SET_K_VALUE";
const SET_INSTRUCTIONS_DISMISSED = "SET_INSTRUCTIONS_DISMISSED";
const SET_RESULTS_TAB = "SET_RESULTS_TAB";
const SET_FIREHOSE_METRICS_LOGGER = "SET_FIREHOSE_METRICS_LOGGER";

// Action creators
export function setMode(mode) {
  return { type: SET_MODE, mode };
}

export function setSelectedName(name) {
  return { type: SET_SELECTED_NAME, name };
}

export function setSelectedCSV(csvfile) {
  return { type: SET_SELECTED_CSV, csvfile };
}

export function setSelectedJSON(jsonfile) {
  return { type: SET_SELECTED_JSON, jsonfile };
}

export function setImportedData(data, userUploadedData) {
  return { type: SET_IMPORTED_DATA, data, userUploadedData };
}

export function setImportedMetadata(metadata) {
  return { type: SET_IMPORTED_METADATA, metadata };
}

export function setRemovedRowsCount(removedRowsCount) {
  return { type: SET_REMOVED_ROWS_COUNT, removedRowsCount };
}

export const setColumnsByDataType = (column, dataType) => ({
  type: SET_COLUMNS_BY_DATA_TYPE,
  column,
  dataType
});

export function addSelectedFeature(selectedFeature) {
  return { type: ADD_SELECTED_FEATURE, selectedFeature };
}

export function removeSelectedFeature(selectedFeature) {
  return { type: REMOVE_SELECTED_FEATURE, selectedFeature };
}

export function setLabelColumn(labelColumn) {
  return { type: SET_LABEL_COLUMN, labelColumn };
}

/* featureNumberKey maps feature names to a hash of category options mapped to integers.
  {
    feature1: {
      option1 : 0,
      option2 : 1,
      option3: 2,
      ...
    },
    feature2: {
      option1 : 0,
      option2 : 1,
      ...
    }
  }
*/
export function setFeatureNumberKey(featureNumberKey) {
  return { type: SET_FEATURE_NUMBER_KEY, featureNumberKey };
}

export function setReserveLocation(reserveLocation) {
  return { type: SET_RESERVE_LOCATION, reserveLocation };
}

export function setAccuracyCheckExamples(accuracyCheckExamples) {
  return { type: SET_ACCURACY_CHECK_EXAMPLES, accuracyCheckExamples };
}

export function setAccuracyCheckLabels(accuracyCheckLabels) {
  return { type: SET_ACCURACY_CHECK_LABELS, accuracyCheckLabels };
}

export function setAccuracyCheckPredictedLabels(predictedLabels) {
  return { type: SET_ACCURACY_CHECK_PREDICTED_LABELS, predictedLabels };
}

export function setTrainingExamples(trainingExamples) {
  return { type: SET_TRAINING_EXAMPLES, trainingExamples };
}

export function setTrainingLabels(trainingLabels) {
  return { type: SET_TRAINING_LABELS, trainingLabels };
}

export function setTestData(testData) {
  return { type: SET_TEST_DATA, testData };
}

export function setPrediction(prediction) {
  return { type: SET_PREDICTION, prediction };
}

export function resetState() {
  return { type: RESET_STATE };
}

export function setTrainedModel(trainedModel) {
  return { type: SET_TRAINED_MODEL, trainedModel };
}

export function setTrainedModelDetail(field, value, isColumn) {
  return { type: SET_TRAINED_MODEL_DETAIL, field, value, isColumn };
}

export function setInstructionsKeyCallback(instructionsKeyCallback) {
  return { type: SET_INSTRUCTIONS_KEY_CALLBACK, instructionsKeyCallback };
}

export function setCurrentPanel(currentPanel) {
  return { type: SET_CURRENT_PANEL, currentPanel };
}

export function setCurrentColumn(currentColumn) {
  return { type: SET_CURRENT_COLUMN, currentColumn };
}

export function setHighlightColumn(highlightColumn) {
  return { type: SET_HIGHLIGHT_COLUMN, highlightColumn };
}

export function setHighlightDataset(highlightDataset) {
  return { type: SET_HIGHLIGHT_DATASET, highlightDataset };
}

export function setResultsPhase(phase) {
  return { type: SET_RESULTS_PHASE, phase };
}

export function setResultsHighlightRow(highlightRow) {
  return { type: SET_RESULTS_HIGHLIGHT_ROW, highlightRow };
}

export function setSaveStatus(status) {
  return { type: SET_SAVE_STATUS, status };
}

export function setHistoricResult(label, features, accuracy) {
  return { type: SET_HISTORIC_RESULT, label, features, accuracy };
}

export function setShowResultsDetails(show) {
  return { type: SET_SHOW_RESULTS_DETAILS, show };
}

export function setKValue(kValue) {
  return { type: SET_K_VALUE, kValue };
}

export function setInstructionsDismissed() {
  return { type: SET_INSTRUCTIONS_DISMISSED };
}

export function setResultsTab(key) {
  return { type: SET_RESULTS_TAB, key };
}

export function setFirehoseMetricsLogger(firehoseMetricsLogger) {
  return { type: SET_FIREHOSE_METRICS_LOGGER, firehoseMetricsLogger };
}

const initialState = {
  name: undefined,
  csvfile: undefined,
  jsonfile: undefined,
  data: [],
  metadata: {},
  removedRowsCount: 0,
  highlightDataset: undefined,
  highlightColumn: undefined,
  columnsByDataType: {},
  selectedFeatures: [],
  labelColumn: undefined,
  featureNumberKey: {},
  trainingExamples: [],
  reserveLocation: TestDataLocations.END,
  accuracyCheckExamples: [],
  accuracyCheckLabels: [],
  accuracyCheckPredictedLabels: [],
  testData: {},
  prediction: undefined,
  trainedModel: undefined,
  trainedModelDetails: {},
  instructionCallback: undefined,
  currentPanel: "selectDataset",
  currentColumn: undefined,
  resultsPhase: undefined,
  // Possible values for saveStatus: "notStarted", "started", "success",
  // "piiProfanity", and "failure".
  saveStatus: "notStarted",
  columnRefs: {},
  historicResults: [],
  showResultsDetails: false,
  resultsHighlightRow: undefined,
  kValue: null,
  viewedPanels: [],
  instructionsOverlayActive: false,
  resultsTab: ResultsGrades.CORRECT,
  firehoseMetricsLogger: undefined
};

// Reducer
export default function rootReducer(state = initialState, action) {
  if (action.type === SET_MODE) {
    return {
      ...state,
      mode: action.mode
    };
  }
  if (action.type === SET_SELECTED_NAME) {
    return {
      ...state,
      name: action.name
    };
  }
  if (action.type === SET_SELECTED_CSV) {
    return {
      ...state,
      csvfile: action.csvfile
    };
  }
  if (action.type === SET_SELECTED_JSON) {
    return {
      ...state,
      jsonfile: action.jsonfile
    };
  }
  if (action.type === SET_IMPORTED_DATA) {
    if (state.currentPanel === "selectDataset") {
      state.instructionsKeyCallback(
        action.userUploadedData ? "uploadedDataset" : "selectedDataset",
        null
      );
    }

    return {
      ...state,
      data: action.data
    };
  }
  if (action.type === SET_IMPORTED_METADATA) {
    var newState = {
      ...state,
      metadata: action.metadata
    };

    if (
      state.mode &&
      state.mode.datasets &&
      state.mode.datasets.length > 1 &&
      state.mode.hideSelectLabel
    ) {
      newState.labelColumn = action.metadata.defaultLabelColumn;
    }

    return newState;
  }
  if (action.type === SET_COLUMNS_BY_DATA_TYPE) {
    return {
      ...state,
      columnsByDataType: {
        ...state.columnsByDataType,
        [action.column]: action.dataType
      }
    };
  }
  if (action.type === SET_REMOVED_ROWS_COUNT) {
    return {
      ...state,
      removedRowsCount: action.removedRowsCount
    };
  }
  if (action.type === ADD_SELECTED_FEATURE) {
    if (!state.selectedFeatures.includes(action.selectedFeature)) {
      return {
        ...state,
        selectedFeatures: [...state.selectedFeatures, action.selectedFeature]
      };
    }
  }
  if (action.type === REMOVE_SELECTED_FEATURE) {
    return {
      ...state,
      selectedFeatures: state.selectedFeatures.filter(
        item => item !== action.selectedFeature
      )
    };
  }
  if (action.type === SET_LABEL_COLUMN) {
    return {
      ...state,
      labelColumn: action.labelColumn
    };
  }
  if (action.type === SET_FEATURE_NUMBER_KEY) {
    return {
      ...state,
      featureNumberKey: action.featureNumberKey
    };
  }
  if (action.type === SET_TRAINING_EXAMPLES) {
    return {
      ...state,
      trainingExamples: action.trainingExamples
    };
  }
  if (action.type === SET_TRAINING_LABELS) {
    return {
      ...state,
      trainingLabels: action.trainingLabels
    };
  }
  if (action.type === SET_RESERVE_LOCATION) {
    return {
      ...state,
      reserveLocation: action.reserveLocation
    };
  }
  if (action.type === SET_ACCURACY_CHECK_EXAMPLES) {
    return {
      ...state,
      accuracyCheckExamples: action.accuracyCheckExamples
    };
  }
  if (action.type === SET_ACCURACY_CHECK_LABELS) {
    return {
      ...state,
      accuracyCheckLabels: action.accuracyCheckLabels
    };
  }
  if (action.type === SET_ACCURACY_CHECK_PREDICTED_LABELS) {
    return {
      ...state,
      accuracyCheckPredictedLabels: action.predictedLabels
    };
  }
  if (action.type === SET_TEST_DATA) {
    return {
      ...state,
      testData: action.testData,
      prediction: undefined
    };
  }
  if (action.type === SET_PREDICTION) {
    return {
      ...state,
      prediction: action.prediction
    };
  }
  if (action.type === RESET_STATE) {
    return {
      ...initialState,
      instructionsKeyCallback: state.instructionsKeyCallback,
      mode: state.mode,
      reserveLocation: state.reserveLocation,
      firehoseMetricsLogger: state.firehoseMetricsLogger
    };
  }
  if (action.type === SET_TRAINED_MODEL) {
    return {
      ...state,
      trainedModel: action.trainedModel
    };
  }
  if (action.type === SET_TRAINED_MODEL_DETAIL) {
    let trainedModelDetails = state.trainedModelDetails;

    if (action.isColumn) {
      if (!trainedModelDetails.columns) {
        trainedModelDetails.columns = [];
      }

      const column = trainedModelDetails.columns.find(column => {
        return column.id === action.field;
      });

      if (column) {
        column.description = action.value;
      } else {
        trainedModelDetails.columns.push({
          id: action.field,
          description: action.value
        });
      }
    } else {
      trainedModelDetails[action.field] = action.value;
    }

    return {
      ...state,
      ...trainedModelDetails
    };
  }
  if (action.type === SET_INSTRUCTIONS_KEY_CALLBACK) {
    return {
      ...state,
      instructionsKeyCallback: action.instructionsKeyCallback
    };
  }
  if (action.type === SET_CURRENT_PANEL) {
    reportPanelView(action.currentPanel);
    let showedOverlay = false;
    if (state.instructionsKeyCallback) {
      const options = {};
      if (
        !(state.mode && state.mode.hideInstructionsOverlay) &&
        !state.viewedPanels.includes(action.currentPanel)
      ) {
        options.showOverlay = true;
        state.viewedPanels.push(action.currentPanel);
        showedOverlay = true;
      }
      state.instructionsKeyCallback(action.currentPanel, options);
    }

    if (action.currentPanel === "dataDisplayLabel") {
      return {
        ...state,
        currentPanel: action.currentPanel,
        instructionsOverlayActive: showedOverlay,
        currentColumn: undefined,
        selectedFeatures: []
      };
    }

    if (action.currentPanel === "results") {
      return {
        ...state,
        currentPanel: action.currentPanel,
        instructionsOverlayActive: showedOverlay,
        testData: {},
        prediction: undefined,
        resultsTab: ResultsGrades.CORRECT,
        showResultsDetails: false
      };
    }

    return {
      ...state,
      currentPanel: action.currentPanel,
      instructionsOverlayActive: showedOverlay,
      currentColumn: undefined
    };
  }
  if (action.type === SET_HIGHLIGHT_COLUMN) {
    if (!getShowColumnClicking(state)) {
      // If no column clicking, do nothing.
      return state;
    }
    if (
      state.currentPanel === "dataDisplayFeatures" &&
      action.highlightColumn === state.labelColumn
    ) {
      // If doing feature selection, and the label column is clicked, do nothing.
      return state;
    }
    return {
      ...state,
      highlightColumn: action.highlightColumn
    };
  }
  if (action.type === SET_HIGHLIGHT_DATASET) {
    return {
      ...state,
      highlightDataset: action.highlightDataset
    };
  }
  if (action.type === SET_CURRENT_COLUMN) {
    if (!getShowColumnClicking(state)) {
      // If no column clicking, do nothing.
      return state;
    }
    if (
      state.currentPanel === "dataDisplayFeatures" &&
      action.currentColumn === state.labelColumn
    ) {
      // If doing feature selection, and the label column is clicked, do nothing.
      return state;
    } else if (state.currentColumn === action.currentColumn) {
      // If column is selected, then deselect.
      state.instructionsKeyCallback("dataDisplayFeatures", null);
      return {
        ...state,
        currentColumn: undefined
      };
    } else {
      if (state.currentPanel === "dataDisplayFeatures") {
        if (
          state.columnsByDataType[action.currentColumn] ===
          ColumnTypes.NUMERICAL
        ) {
          state.instructionsKeyCallback("selectedFeatureNumerical", null);
        } else if (
          state.columnsByDataType[action.currentColumn] ===
          ColumnTypes.CATEGORICAL
        ) {
          state.instructionsKeyCallback("selectedFeatureCategorical", null);
        }
      }

      // Select the column.
      return {
        ...state,
        currentColumn: action.currentColumn
      };
    }
  }
  if (action.type === SET_RESULTS_PHASE) {
    return {
      ...state,
      resultsPhase: action.phase
    };
  }
  if (action.type === SET_RESULTS_HIGHLIGHT_ROW) {
    return {
      ...state,
      resultsHighlightRow: action.highlightRow
    };
  }
  if (action.type === SET_SAVE_STATUS) {
    return {
      ...state,
      saveStatus: action.status
    };
  }
  if (action.type === SET_HISTORIC_RESULT) {
    return {
      ...state,
      historicResults: [
        {
          label: action.label,
          features: action.features,
          accuracy: action.accuracy
        },
        ...state.historicResults
      ]
    };
  }
  if (action.type === SET_SHOW_RESULTS_DETAILS) {
    state.instructionsKeyCallback(
      action.show ? "resultsDetails" : "results",
      null
    );
    return {
      ...state,
      showResultsDetails: action.show
    };
  }
  if (action.type === SET_K_VALUE) {
    return {
      ...state,
      kValue: action.kValue
    };
  }
  if (action.type === SET_INSTRUCTIONS_DISMISSED) {
    return {
      ...state,
      instructionsOverlayActive: false
    };
  }
  if (action.type === SET_RESULTS_TAB) {
    return {
      ...state,
      resultsTab: action.key
    };
  }
  if (action.type === SET_FIREHOSE_METRICS_LOGGER) {
    return {
      ...state,
      firehoseMetricsLogger: action.firehoseMetricsLogger
    };
  }
  return state;
}

export function getSpecifiedDatasets(state) {
  return state.mode && state.mode.datasets;
}

/* Functions for determining UI element availability and interactivity. */

function getShowColumnClicking(state) {
  return !(state.mode && state.mode.hideColumnClicking);
}

export function getPredictAvailable(state) {
  return (
    Object.keys(state.testData).filter(
      value => state.testData[value] && state.testData[value] !== ""
    ).length === state.selectedFeatures.length
  );
}

export function getPanelButtons(state) {
  return prevNextButtons(state);
}

export function readyToTrain(state) {
  return uniqLabelFeaturesSelected(state);
}

/* Functions for filtering and selecting columns by type.  */

export function filterColumnsByType(columnsByDataType, columnType) {
  return Object.keys(columnsByDataType).filter(
    column => columnsByDataType[column] === columnType
  );
}

function getCategoricalColumns(state) {
  return filterColumnsByType(state.columnsByDataType, ColumnTypes.CATEGORICAL);
}

export function getSelectedCategoricalColumns(state) {
  let intersection = getCategoricalColumns(state).filter(
    x => state.selectedFeatures.includes(x) || x === state.labelColumn
  );
  return intersection;
}

function getSelectedColumns(state) {
  return state.selectedFeatures
    .concat(state.labelColumn)
    .filter(column => column !== undefined && column !== "")
    .map(columnId => {
      return { id: columnId, readOnly: isColumnReadOnly(state, columnId) };
    });
}

/* Functions for getting specific details about a batch of columns.  */

export function getSelectedColumnDescriptions(state) {
  return getSelectedColumns(state).map(column => {
    return {
      id: column.id,
      description: getColumnDescription(state, column.id)
    };
  });
}

/* Functions for retriving aggregate details about a currently selected column. */

export function getCurrentColumnData(state) {
  if (!state.currentColumn) {
    return null;
  }

  return {
    id: state.currentColumn,
    readOnly: isColumnReadOnly(state, state.currentColumn),
    dataType: state.columnsByDataType[state.currentColumn],
    uniqueOptions: getUniqueOptionsCurrentColumn(state),
    extrema: getExtremaCurrentColumn(state),
    frequencies: getOptionFrequenciesCurrentColumn(state),
    description: getColumnDescription(state, state.currentColumn),
    hasTooManyUniqueOptions: hasTooManyUniqueOptions(
      state,
      state.currentColumn
    ),
    isColumnDataValid: isColumnDataValid(state, state.currentColumn),
    isSelectable: isSelectable(state, state.currentColumn)
  };
}

/* Functions for processing column data for visualizations. */

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

export function getCrossTabData(state) {
  if (!state.labelColumn || !state.currentColumn) {
    return null;
  }

  if (
    !isColumnCategorical(state, state.labelColumn) ||
    !isColumnCategorical(state, state.currentColumn)
  ) {
    return null;
  }

  var results = [];

  // For each row of data, determine whether we have found a new or existing
  // combination of feature values.  If new, then add a new entry to our results
  // array.  Then record or increment the count for the corresponding label
  // value.

  for (let row of state.data) {
    var featureValues = [];
    featureValues.push(row[state.currentColumn]);

    var existingEntry = results.find(result => {
      return areArraysEqual(result.featureValues, featureValues);
    });

    if (!existingEntry) {
      existingEntry = {
        featureValues,
        labelCounts: { [row[state.labelColumn]]: 1 }
      };
      results.push(existingEntry);
    } else {
      if (!existingEntry.labelCounts[row[state.labelColumn]]) {
        existingEntry.labelCounts[row[state.labelColumn]] = 1;
      } else {
        existingEntry.labelCounts[row[state.labelColumn]]++;
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

  // Take inventory of all unique label values we have seen, which allows us to
  // generate the header at the top of the CrossTab UI.

  const uniqueLabelValues =  getUniqueOptionsLabelColumn(state);

  return {
    results,
    uniqueLabelValues,
    featureNames: [state.currentColumn],
    labelName: state.labelColumn
  };
}

export function getScatterPlotData(state) {
  if (!state.labelColumn || !state.currentColumn) {
    return null;
  }

  if (
    !isColumnNumerical(state, state.labelColumn) ||
    !isColumnNumerical(state, state.currentColumn)
  ) {
    return null;
  }

  if (state.labelColumn === state.currentColumn) {
    return null;
  }

  // For each row, record the X (feature value) and Y (label value).
  const data = [];
  for (let row of state.data) {
    data.push({ x: row[state.currentColumn], y: row[state.labelColumn] });
  }

  const label = state.labelColumn;
  const feature = state.currentColumn;

  return {
    label,
    feature,
    data
  };
}

/* Functions for processing data to display for results. */

export function getTableData(state, useResultsData) {
  if (useResultsData) {
    return getResultsDataInDataTableForm(state);
  } else {
    return state.data;
  }
}

export function getConvertedAccuracyCheckExamples(state) {
  const convertedAccuracyCheckExamples = [];
  var example;
  for (example of state.accuracyCheckExamples) {
    let convertedAccuracyCheckExample = [];
    for (var i = 0; i < state.selectedFeatures.length; i++) {
      convertedAccuracyCheckExample.push(
        convertValueForDisplay(
          state,
          example[i],
          state.selectedFeatures[i]
        )
      );
    }
    convertedAccuracyCheckExamples.push(convertedAccuracyCheckExample);
  }
  return convertedAccuracyCheckExamples;
}

export function getConvertedPredictedLabel(state) {
  return convertValueForDisplay(
    state,
    state.prediction,
    state.labelColumn
  );
}

export function getConvertedLabels(state, rawLabels = []) {
  return rawLabels.map(label =>
    convertValueForDisplay(state, label, state.labelColumn)
  );
}

export function isRegression(state) {
  return isColumnNumerical(state, state.labelColumn);
}

export function getPercentCorrect(state) {
  const percentCorrect = isRegression(state)
    ? getAccuracyRegression(state).percentCorrect
    : getAccuracyClassification(state).percentCorrect;
  return percentCorrect;
}

export function getCorrectResults(state) {
  return getResultsByGrade(state, ResultsGrades.CORRECT);
}

export function getIncorrectResults(state) {
  return getResultsByGrade(state, ResultsGrades.INCORRECT);
}

export function getAllResults(state) {
  return getResultsByGrade(state, ResultsGrades.ALL);
}

// Return results data so that it looks like regular data provided to the
// DataTable.
export function getResultsDataInDataTableForm(state) {
  const resultsByGrades = getAllResults(state);

  if (!resultsByGrades || resultsByGrades.examples.length === 0) {
    return null;
  }

  // None of the existing uses of this function should need more than 10
  // items.  Increase the value here if they do.
  const numItems = Math.min(10, resultsByGrades.examples.length);

  const results = [];
  for (var i = 0; i < numItems; i++) {
    results[i] = {};

    state.selectedFeatures.map((feature, index) => {
      results[i][feature] = resultsByGrades.examples[i][index];
    })

    results[i][state.labelColumn] = resultsByGrades.predictedLabels[i];
  }

  return results;
}

/* Functions for processing data about a trained model to save. */

export function isUserUploadedDataset(state) {
  // The csvfile for internally curated datasets are strings; those uploaded by
  // users are objects. Use data type as a proxy to know which case we're in.
  return typeof state.csvfile === "object" && state.csvfile !== null;
}

export function getDataDescription(state) {
  // If this a dataset from the internal collection that already has a description, use that.
  if (
    state.metadata &&
    state.metadata.card &&
    state.metadata.card.description
  ) {
    return state.metadata.card.description;
  } else if (
    state.trainedModelDetails &&
    state.trainedModelDetails.datasetDescription
  ) {
    return state.trainedModelDetails.datasetDescription;
  } else {
    return undefined;
  }
}

export function getDatasetDetails(state) {
  const datasetDetails = {};
  datasetDetails.name = state.metadata.name;
  datasetDetails.description = getDataDescription(state);
  datasetDetails.numRows = state.data.length;
  datasetDetails.isUserUploaded = isUserUploadedDataset(state);
  return datasetDetails;
}

export function getFeaturesToSave(state) {
  const features = state.selectedFeatures.map(feature =>
    getColumnDataToSave(state, feature)
  );
  return features;
}

export function getLabelToSave(state) {
  return getColumnDataToSave(state, state.labelColumn);
}

function getSummaryStat(state) {
  let summaryStat = {};
  summaryStat.type = isRegression(state)
    ? MLTypes.REGRESSION
    : MLTypes.CLASSIFICATION;
  summaryStat.stat = getPercentCorrect(state);
  return summaryStat;
}

export function getTrainedModelDataToSave(state) {
  const dataToSave = {};
  dataToSave.name = state.trainedModelDetails.name;
  dataToSave.datasetDetails = getDatasetDetails(state);
  dataToSave.potentialUses = state.trainedModelDetails.potentialUses;
  dataToSave.potentialMisuses = state.trainedModelDetails.potentialMisuses;
  dataToSave.selectedTrainer = isRegression(state)
    ? RegressionTrainer
    : ClassificationTrainer;
  dataToSave.featureNumberKey = state.featureNumberKey;
  dataToSave.label = getColumnDataToSave(state, state.labelColumn);
  dataToSave.features = getFeaturesToSave(state);
  dataToSave.summaryStat = getSummaryStat(state);
  dataToSave.trainedModel = state.trainedModel
    ? state.trainedModel.toJSON()
    : null;
  dataToSave.kValue = state.kValue;

  return dataToSave;
}
