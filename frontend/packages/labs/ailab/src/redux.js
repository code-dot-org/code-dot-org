import {
  availableTrainers,
  getRegressionTrainers,
  getClassificationTrainers
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
  compatibleLabelAndTrainer
} from "./validate.js";

import { ColumnTypes } from "./constants.js";

// Action types
const RESET_STATE = "RESET_STATE";
const SET_IMPORTED_DATA = "SET_IMPORTED_DATA";
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
const SET_SHOW_PREDICT = "SET_SHOW_PREDICT";
const SET_TEST_DATA = "SET_TEST_DATA";
const SET_PREDICTION = "SET_PREDICTION";

// Action creators
export function setImportedData(data) {
  return { type: SET_IMPORTED_DATA, data };
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

export function setShowPredict(showPredict) {
  return { type: SET_SHOW_PREDICT, showPredict };
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

const initialState = {
  data: [],
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
  showPredict: false,
  testData: {},
  prediction: {}
};

// Reducer
export default function rootReducer(state = initialState, action) {
  if (action.type === SET_IMPORTED_DATA) {
    return {
      ...state,
      data: action.data
    };
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
  if (action.type === SET_SHOW_PREDICT) {
    return {
      ...state,
      showPredict: action.showPredict
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
      ...initialState
    };
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

export function getSelectedColumns(state) {
  return state.selectedFeatures
    .concat(state.labelColumn)
    .filter(column => column !== undefined && column !== "");
}

export function getSelectedCategoricalColumns(state) {
  let intersection = getCategoricalColumns(state).filter(
    x => state.selectedFeatures.includes(x) || x === state.labelColumn
  );
  return intersection;
}

export function getSelectedContinuousColumns(state) {
  let intersection = getContinuousColumns(state).filter(
    x => state.selectedFeatures.includes(x) || x === state.labelColumn
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

export function getConvertedPredictedLabel(state) {
  if (
    state.labelColumn &&
    !isEmpty(state.featureNumberKey) &&
    !isEmpty(state.prediction)
  ) {
    const label = getCategoricalColumns(state).includes(state.labelColumn)
      ? getKeyByValue(
          state.featureNumberKey[state.labelColumn],
          state.prediction.predictedLabel
        )
      : state.prediction.predictedLabel;
    return label;
  }
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

export function validationMessages(state) {
  const validationMessages = [];
  validationMessages.push({
    readyToTrain: datasetUploaded(state),
    errorString: "There is not enough data to train a model.",
    successString: `There are ${state.data.length} rows of data.`
  });
  validationMessages.push({
    readyToTrain: uniqueColumnNames(state),
    errorString:
      "Each column must have a name, and column names must be unique.",
    successString: "Each column has a unique name."
  });
  validationMessages.push({
    readyToTrain: noEmptyCells(state),
    errorString: "There can't be any empty cells.",
    successString: "Each cell has a value!"
  });
  validationMessages.push({
    readyToTrain: oneLabelSelected(state),
    errorString: "Please designate one column as the label column.",
    successString: "Label column has been selected."
  });
  validationMessages.push({
    readyToTrain: minOneFeatureSelected(state),
    errorString: "Please select at least one feature to train.",
    successString: "At least one feature is selected."
  });
  validationMessages.push({
    readyToTrain: uniqLabelFeaturesSelected(state),
    errorString:
      "A column can not be selected as a both a feature and a label.",
    successString: "Label and feature(s) columns are unique."
  });
  validationMessages.push({
    readyToTrain: selectedColumnsHaveDatatype(state),
    errorString:
      "Feature and label columns must contain only continuous or categorical data.",
    successString:
      "Selected features and label contain continuous or categorical data"
  });
  validationMessages.push({
    readyToTrain: continuousColumnsHaveOnlyNumbers(state),
    errorString: "Continuous columns should contain only numbers.",
    successString: "Continuous columns contain only numbers."
  });
  validationMessages.push({
    readyToTrain: trainerSelected(state),
    errorString: "Please select a training algorithm.",
    successString: "Training algorithm selected."
  });
  validationMessages.push({
    readyToTrain: compatibleLabelAndTrainer(state),
    errorString:
      "The label datatype must be compatiable with the training algorithm.",
    successString: "The label datatype and training algorithm are compatible."
  });
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
