import {
  uniqLabelFeaturesSelected,
  prevNextButtons
} from "./helpers/navigationValidation.js";
import { reportPanelView } from "./helpers/metrics.js";
import {
  getSummaryStat,
  getResultsDataInDataTableForm
} from "./helpers/accuracy.js";
import {
  isColumnNumerical,
  isColumnCategorical,
  getColumnDataToSave,
} from "./helpers/columnDetails.js";
import { getDatasetDetails } from "./helpers/datasetDetails.js";
import {
  ColumnTypes,
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
      if (state.currentPanel === "dataDisplayFeatures") {
        state.instructionsKeyCallback("dataDisplayFeatures", null);
      }
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

export function isRegression(state) {
  return isColumnNumerical(state, state.labelColumn);
}

/* Functions for processing data about a trained model to save. */
export function getFeaturesToSave(state) {
  const features = state.selectedFeatures.map(feature =>
    getColumnDataToSave(state, feature)
  );
  return features;
}

export function getLabelToSave(state) {
  return getColumnDataToSave(state, state.labelColumn);
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
