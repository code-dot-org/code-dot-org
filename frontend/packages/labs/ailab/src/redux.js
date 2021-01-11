import {
  availableTrainers,
  getRegressionTrainers,
  getClassificationTrainers,
  getMLType
} from "./train.js";

import {
  datasetUploaded,
  uniqueColumnNames,
  noEmptyCells,
  emptyCellFinder,
  minOneFeatureSelected,
  oneLabelSelected,
  uniqLabelFeaturesSelected,
  selectedColumnsHaveDatatype,
  continuousColumnsHaveOnlyNumbers,
  trainerSelected,
  compatibleLabelAndTrainer,
  namedModel
} from "./validate.js";

import { ColumnTypes, MLTypes } from "./constants.js";

// Action types
const RESET_STATE = "RESET_STATE";
const SET_MODE = "SET_MODE";
const SET_SELECTED_CSV = "SET_SELECTED_CSV";
const SET_SELECTED_JSON = "SET_SELECTED_JSON";
const SET_IMPORTED_DATA = "SET_IMPORTED_DATA";
const SET_IMPORTED_METADATA = "SET_IMPORTED_METADATA";
const SET_SELECTED_TRAINER = "SET_SELECTED_TRAINER";
const SET_COLUMNS_BY_DATA_TYPE = "SET_COLUMNS_BY_DATA_TYPE";
const SET_SELECTED_FEATURES = "SET_SELECTED_FEATURES";
const SET_LABEL_COLUMN = "SET_LABEL_COLUMN";
const SET_FEATURE_NUMBER_KEY = "SET_FEATURE_NUMBER_KEY";
const SET_PERCENT_DATA_TO_RESERVE = "SET_PERCENT_DATA_TO_RESERVE";
const SET_ACCURACY_CHECK_EXAMPLES = "SET_ACCURACY_CHECK_EXAMPLES";
const SET_ACCURACY_CHECK_LABELS = "SET_ACCURACY_CHECK_LABELS";
const SET_ACCURACY_CHECK_PREDICTED_LABELS =
  "SET_ACCURACY_CHECK_PREDICTED_LABELS";
const SET_TRAINING_EXAMPLES = "SET_TRAINING_EXAMPLES";
const SET_TRAINING_LABELS = "SET_TRAINING_LABELS";
const SET_TEST_DATA = "SET_TEST_DATA";
const SET_PREDICTION = "SET_PREDICTION";
const SET_MODEL_SIZE = "SET_MODEL_SIZE";
const SET_TRAINED_MODEL = "SET_TRAINED_MODEL";
const SET_TRAINED_MODEL_DETAILS = "SET_TRAINED_MODEL_DETAILS";
const SET_CURRENT_PANEL = "SET_CURRENT_PANEL";
const SET_CURRENT_COLUMN = "SET_CURRENT_COLUMN";

// Action creators
export function setMode(mode) {
  return { type: SET_MODE, mode };
}

export function setSelectedCSV(csvfile) {
  return { type: SET_SELECTED_CSV, csvfile };
}

export function setSelectedJSON(jsonfile) {
  return { type: SET_SELECTED_JSON, jsonfile };
}

export function setImportedData(data) {
  return { type: SET_IMPORTED_DATA, data };
}

export function setImportedMetadata(metadata) {
  return { type: SET_IMPORTED_METADATA, metadata };
}

export function setSelectedTrainer(selectedTrainer) {
  return { type: SET_SELECTED_TRAINER, selectedTrainer };
}

export const setColumnsByDataType = (column, dataType) => ({
  type: SET_COLUMNS_BY_DATA_TYPE,
  column,
  dataType
});

export function setSelectedFeatures(selectedFeatures) {
  return { type: SET_SELECTED_FEATURES, selectedFeatures };
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

export function setPercentDataToReserve(percentDataToReserve) {
  return { type: SET_PERCENT_DATA_TO_RESERVE, percentDataToReserve };
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

export function setModelSize(modelSize) {
  return { type: SET_MODEL_SIZE, modelSize };
}

export function setTrainedModel(trainedModel) {
  return { type: SET_TRAINED_MODEL, trainedModel };
}

export function setTrainedModelDetails(trainedModelDetails) {
  return { type: SET_TRAINED_MODEL_DETAILS, trainedModelDetails };
}

export function setCurrentPanel(currentPanel) {
  return { type: SET_CURRENT_PANEL, currentPanel };
}

export function setCurrentColumn(currentColumn) {
  return { type: SET_CURRENT_COLUMN, currentColumn };
}

const initialState = {
  csvfile: undefined,
  jsonfile: undefined,
  data: [],
  metadata: undefined,
  selectedTrainer: undefined,
  columnsByDataType: {},
  selectedFeatures: [],
  labelColumn: undefined,
  featureNumberKey: {},
  trainingExamples: [],
  trainingLabels: [],
  percentDataToReserve: 10,
  accuracyCheckExamples: [],
  accuracyCheckLabels: [],
  accuracyCheckPredictedLabels: [],
  testData: {},
  prediction: {},
  modelSize: undefined,
  trainedModel: undefined,
  trainedModelDetails: {},
  currentPanel: "selectDataset",
  currentColumn: undefined
};

// Reducer
export default function rootReducer(state = initialState, action) {
  if (action.type === SET_MODE) {
    return {
      ...state,
      mode: action.mode
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
  if (action.type === SET_SELECTED_TRAINER) {
    return {
      ...state,
      selectedTrainer: action.selectedTrainer
    };
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
  if (action.type === SET_SELECTED_FEATURES) {
    return {
      ...state,
      selectedFeatures: action.selectedFeatures
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
  if (action.type === SET_PERCENT_DATA_TO_RESERVE) {
    return {
      ...state,
      percentDataToReserve: action.percentDataToReserve
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
      testData: action.testData
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
      mode: state.mode
    };
  }
  if (action.type === SET_MODEL_SIZE) {
    return {
      ...state,
      currentPanel: "results",
      modelSize: action.modelSize
    };
  }
  if (action.type === SET_TRAINED_MODEL) {
    return {
      ...state,
      trainedModel: action.trainedModel
    };
  }
  if (action.type === SET_TRAINED_MODEL_DETAILS) {
    return {
      ...state,
      trainedModelDetails: action.trainedModelDetails
    };
  }
  if (action.type === SET_CURRENT_PANEL) {
    return {
      ...state,
      currentPanel: action.currentPanel
    };
  }
  if (action.type === SET_CURRENT_COLUMN) {
    if (state.currentColumn === action.currentColumn) {
      return {
        ...state,
        currentColumn: undefined
      };
    } else {
      return {
        ...state,
        currentColumn: action.currentColumn
      };
    }
  }
  return state;
}

export function getFeatures(state) {
  return state.data.length > 0 ? Object.keys(state.data[0]) : [];
}

function filterColumnsByType(state, columnType) {
  return Object.keys(state.columnsByDataType).filter(
    column => state.columnsByDataType[column] === columnType
  );
}

export function getCategoricalColumns(state) {
  return filterColumnsByType(state, ColumnTypes.CATEGORICAL);
}

function isColumnReadOnly(state, column) {
  const metadataColumnType =
    state.metadata &&
    state.metadata.fields &&
    state.metadata.fields.find(field => {
      return field.id === column;
    }).type;

  return metadataColumnType && state.mode && state.mode.hideSpecifyColumns;
}

export function getSelectedColumns(state) {
  return state.selectedFeatures
    .concat(state.labelColumn)
    .filter(column => column !== undefined && column !== "")
    .map(columnId => {
      return { id: columnId, readOnly: isColumnReadOnly(state, columnId) };
    });
}

export function getCurrentColumnData(state) {
  if (!state.currentColumn) {
    return null;
  }

  return {
    id: state.currentColumn,
    readOnly: isColumnReadOnly(state, state.currentColumn),
    dataType: state.columnsByDataType[state.currentColumn],
    uniqueOptions: getUniqueOptions(state, state.currentColumn),
    range: getRange(state, state.currentColumn),
    frequencies: getOptionFrequencies(state, state.currentColumn)
  };
}

export function getSelectedCategoricalColumns(state) {
  let intersection = getCategoricalColumns(state).filter(
    x => state.selectedFeatures.includes(x) || x === state.labelColumn
  );
  return intersection;
}

export function getSelectedCategoricalFeatures(state) {
  let intersection = getCategoricalColumns(state).filter(x =>
    state.selectedFeatures.includes(x)
  );
  return intersection;
}

export function getSelectedContinuousColumns(state) {
  let intersection = getContinuousColumns(state).filter(
    x => state.selectedFeatures.includes(x) || x === state.labelColumn
  );
  return intersection;
}

export function getSelectedContinuousFeatures(state) {
  let intersection = getContinuousColumns(state).filter(x =>
    state.selectedFeatures.includes(x)
  );
  return intersection;
}

export function getContinuousColumns(state) {
  return filterColumnsByType(state, ColumnTypes.CONTINUOUS);
}

export function getSelectableFeatures(state) {
  return getFeatures(state).filter(column => column !== state.labelColumn);
}

export function getSelectableLabels(state) {
  return getFeatures(state).filter(x => !state.selectedFeatures.includes(x));
}

export function getUniqueOptions(state, column) {
  return Array.from(new Set(state.data.map(row => row[column]))).filter(
    option => option !== undefined && option !== ""
  );
}

export function getOptionFrequencies(state, column) {
  let optionFrequencies = {};
  for (let row of state.data) {
    if (optionFrequencies[row[column]]) {
      optionFrequencies[row[column]]++;
    } else {
      optionFrequencies[row[column]] = 1;
    }
  }
  return optionFrequencies;
}

export function getOptionFrequenciesByColumn(state) {
  let optionFrequenciesByColumn = {};
  getSelectedCategoricalColumns(state).map(
    column =>
      (optionFrequenciesByColumn[column] = getOptionFrequencies(state, column))
  );
  return optionFrequenciesByColumn;
}

export function getUniqueOptionsByColumn(state) {
  let uniqueOptionsByColumn = {};
  getSelectedCategoricalColumns(state).map(
    column => (uniqueOptionsByColumn[column] = getUniqueOptions(state, column))
  );
  return uniqueOptionsByColumn;
}

export function getRangesByColumn(state) {
  let rangesByColumn = {};
  getSelectedContinuousColumns(state).map(
    column => (rangesByColumn[column] = getRange(state, column))
  );
  return rangesByColumn;
}

export function getRange(state, column) {
  let range = {};
  range.max = Math.max(...state.data.map(row => parseFloat(row[column])));
  range.min = Math.min(...state.data.map(row => parseFloat(row[column])));
  return range;
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function isEmpty(object) {
  return Object.keys(object).length === 0;
}

export function getConvertedLabel(state, rawLabel) {
  if (state.labelColumn && !isEmpty(state.featureNumberKey)) {
    const convertedLabel = getCategoricalColumns(state).includes(
      state.labelColumn
    )
      ? getKeyByValue(state.featureNumberKey[state.labelColumn], rawLabel)
      : rawLabel;
    return convertedLabel;
  }
}

export function getConvertedPredictedLabel(state) {
  return getConvertedLabel(state, state.prediction.predictedLabel);
}

export function getConvertedLabels(state, rawLabels) {
  return rawLabels.map(label => getConvertedLabel(state, label));
}

export function getCompatibleTrainers(state) {
  let compatibleTrainers;
  switch (true) {
    case state.columnsByDataType[state.labelColumn] === ColumnTypes.CATEGORICAL:
      compatibleTrainers = getClassificationTrainers();
      break;
    case state.columnsByDataType[state.labelColumn] === ColumnTypes.CONTINUOUS:
      compatibleTrainers = getRegressionTrainers();
      break;
    default:
      compatibleTrainers = availableTrainers;
  }
  return compatibleTrainers;
}

function getSum(total, num) {
  return total + num;
}

function getAverageDiff(state) {
  let diffs = [];
  const numPredictedLabels = state.accuracyCheckPredictedLabels.length;
  for (let i = 0; i < numPredictedLabels; i++) {
    diffs.push(
      Math.abs(
        state.accuracyCheckLabels[i] - state.accuracyCheckPredictedLabels[i]
      )
    );
  }
  return (diffs.reduce(getSum, 0) / numPredictedLabels).toFixed(2);
}

export function getAccuracy(state) {
  let numCorrect = 0;
  const numPredictedLabels = state.accuracyCheckPredictedLabels.length;
  for (let i = 0; i < numPredictedLabels; i++) {
    if (
      state.accuracyCheckLabels[i].toString() ===
      state.accuracyCheckPredictedLabels[i].toString()
    ) {
      numCorrect++;
    }
  }
  return ((numCorrect / numPredictedLabels) * 100).toFixed(2);
}

export function getSummaryStat(state) {
  let summaryStat = {};
  const mlType = getMLType(state.selectedTrainer);
  if (mlType === MLTypes.REGRESSION) {
    summaryStat.type = MLTypes.REGRESSION;
    summaryStat.stat = getAverageDiff(state);
  }
  if (mlType === MLTypes.CLASSIFICATION) {
    summaryStat.type = MLTypes.CLASSIFICATION;
    summaryStat.stat = getAccuracy(state);
  }
  return summaryStat;
}

export function validationMessages(state) {
  const validationMessages = {};
  validationMessages["notEnoughData"] = {
    panel: "dataDisplay",
    readyToTrain: datasetUploaded(state),
    errorString: "There is not enough data to train a model.",
    successString: `There are ${state.data.length} rows of data.`
  };
  validationMessages["columnNames"] = {
    panel: "dataDisplay",
    readyToTrain: uniqueColumnNames(state),
    errorString:
      "Each column must have a name, and column names must be unique.",
    successString: "Each column has a unique name."
  };
  validationMessages["emptyCells"] = {
    panel: "dataDisplay",
    readyToTrain: noEmptyCells(state),
    errorString: "There can't be any empty cells.",
    successString: "Each cell has a value!"
  };
  validationMessages["selectLabel"] = {
    panel: "selectFeatures",
    readyToTrain: oneLabelSelected(state),
    errorString: "Please designate one column as the label column.",
    successString: "Label column has been selected."
  };
  validationMessages["selectFeatures"] = {
    panel: "selectFeatures",
    readyToTrain: minOneFeatureSelected(state),
    errorString: "Please select at least one feature to train.",
    successString: "At least one feature is selected."
  };
  validationMessages["columnUsage"] = {
    panel: "selectFeatures",
    readyToTrain: uniqLabelFeaturesSelected(state),
    errorString:
      "A column can not be selected as a both a feature and a label.",
    successString: "Label and feature(s) columns are unique."
  };
  validationMessages["columnData"] = {
    panel: "selectFeatures",
    readyToTrain: selectedColumnsHaveDatatype(state),
    errorString:
      "Feature and label columns must contain only continuous or categorical data.",
    successString:
      "Selected features and label contain continuous or categorical data"
  };
  validationMessages["continuousNumbers"] = {
    panel: "selectFeatures",
    readyToTrain: continuousColumnsHaveOnlyNumbers(state),
    errorString: "Continuous columns should contain only numbers.",
    successString: "Continuous columns contain only numbers."
  };
  validationMessages["training"] = {
    panel: "selectTrainer",
    readyToTrain: trainerSelected(state),
    errorString: "Please select a training algorithm.",
    successString: "Training algorithm selected."
  };
  validationMessages["compatibleLabel"] = {
    panel: "selectTrainer",
    readyToTrain: compatibleLabelAndTrainer(state),
    errorString:
      "The label datatype must be compatible with the training algorithm.",
    successString: "The label datatype and training algorithm are compatible."
  };
  validationMessages["nameModel"] = {
    panel: "saveModel",
    readyToTrain: namedModel(state),
    errorString: "Please name your model.",
    successString: "Your model is named."
  };
  return validationMessages;
}

export function isDataUploaded(state) {
  return state.data.length > 0;
}

export function readyToTrain(state) {
  return uniqLabelFeaturesSelected(state) && compatibleLabelAndTrainer(state);
}

export function getEmptyCellDetails(state) {
  const emptyCellLocations = emptyCellFinder(state).map(cellDetails => {
    return `Column: ${cellDetails.column} Row: ${cellDetails.row}`;
  });
  return emptyCellLocations;
}

export function getTrainedModelDataToSave(state) {
  const dataToSave = {};
  dataToSave.name = state.trainedModelDetails.name;
  dataToSave.description = state.trainedModelDetails.description;
  dataToSave.selectedTrainer = state.selectedTrainer;
  dataToSave.selectedFeatures = state.selectedFeatures;
  dataToSave.featureNumberKey = state.featureNumberKey;
  dataToSave.labelColumn = state.labelColumn;
  dataToSave.summaryStat = getSummaryStat(state);
  dataToSave.trainedModel = state.trainedModel;

  return dataToSave;
}

export function getShowSelectLabels(state) {
  return (
    !(state.mode && state.mode.hideSelectLabel) &&
    getSelectableLabels(state).length > 0
  );
}

export function getSpecifiedDatasets(state) {
  return state.mode && state.mode.datasets;
}

export function getShowChooseReserve(state) {
  return !(state.mode && state.mode.hideChooseReserve);
}

const panelList = [
  { id: "selectDataset", label: "Import" },
  { id: "dataDisplay", label: "Data" },
  { id: "selectTrainer", label: "Trainer" },
  { id: "trainModel", label: "Train" },
  { id: "results", label: "Results" },
  { id: "predict", label: "Predict" },
  { id: "saveModel", label: "Save" }
];

function isPanelVisible(state, panelId) {
  const mode = state.mode;

  if (panelId === "selectDataset") {
    if (mode && mode.datasets && mode.datasets.length === 1) {
      return false;
    }
  }

  if (panelId === "saveModel") {
    if (mode && mode.hideSave) {
      return false;
    }
  }

  if (panelId === "selectTrainer") {
    if (mode && mode.hideSelectTrainer) {
      return false;
    }
  }
  return true;
}

function isPanelEnabled(state, panelId) {
  if (panelId === "dataDisplay") {
    if (state.data.length === 0) {
      return false;
    }
  }

  if (panelId === "columnInspector") {
    if (getSelectedColumns(state).length === 0) {
      return false;
    }
  }

  if (panelId === "selectFeatures") {
    if (!isDataUploaded(state)) {
      return false;
    }
  }

  if (panelId === "trainModel") {
    if (!readyToTrain(state)) {
      return false;
    }
  }

  if (panelId === "results") {
    if (
      state.percentDataToReserve === 0 ||
      state.accuracyCheckExamples.length === 0
    ) {
      return false;
    }
  }

  // Also see if the previous panel was visible, recursively.
  const panelIndex = panelList.findIndex(element => element.id === panelId);
  if (panelIndex > 0) {
    return isPanelEnabled(state, panelList[panelIndex - 1].id);
  }

  return true;
}

export function getPanels(state) {
  return panelList
    .filter(panel => {
      return isPanelVisible(state, panel.id);
    })
    .map(panel => {
      return { ...panel, enabled: isPanelEnabled(state, panel.id) };
    });
}

/*
  { id: "selectDataset", label: "Import" },
  { id: "dataDisplay", label: "Data" },
  { id: "selectTrainer", label: "Trainer" },
  { id: "trainModel", label: "Train" },
  { id: "results", label: "Results" },
  { id: "predict", label: "Predict" },
  { id: "saveModel", label: "Save" }
*/

// Given the current panel, return the appropriate previous & next buttons.
export function getPanelButtons(state) {
  let prev, next;

  if (state.currentPanel == "selectDataset") {
    prev = null;
    next = isPanelEnabled(state, "dataDisplay")
      ? { panel: "dataDisplay", text: "Data" }
      : null;
  } else if (state.currentPanel == "dataDisplay") {
    prev = isPanelEnabled(state, "selectDataset")
      ? { panel: "selectDataset", text: "Import" }
      : null;
    next = isPanelEnabled(state, "selectTrainer")
      ? { panel: "selectTrainer", text: "Trainer" }
      : null;
  } else if (state.currentPanel == "selectTrainer") {
    prev = { panel: "dataDisplay", text: "Data" };
    next = isPanelEnabled(state, "trainModel")
      ? { panel: "trainModel", text: "Train" }
      : null;
  } else if (state.currentPanel == "results") {
    prev = {panel: "dataDisplay", text: "Data"};
    next = null;
  }

  return { prev, next };
}
