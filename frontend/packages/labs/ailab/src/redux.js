import { MLTypes, availableTrainers } from "./train.js";
// Action types

const RESET_STATE = "RESET_STATE";
const SET_IMPORTED_DATA = "SET_IMPORTED_DATA";
const SET_SELECTED_TRAINER = "SET_SELECTED_TRAINER";
const SET_COLUMNS_BY_DATA_TYPE = "SET_COLUMNS_BY_DATA_TYPE";
const SET_SELECTED_FEATURES = "SET_SELECTED_FEATURES";
const SET_LABEL_COLUMN = "SET_LABEL_COLUMN";
const SET_FEATURE_NUMBER_KEY = "SET_FEATURE_NUMBER_KEY";
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

export function getSelectedCategoricalColumns(state) {
  let intersection = getCategoricalColumns(state).filter(x =>
    state.selectedFeatures.includes(x)
  );
  return intersection;
}

export function getSelectedContinuousColumns(state) {
  let intersection = getContinuousColumns(state).filter(x =>
    state.selectedFeatures.includes(x)
  );
  return intersection;
}

export function getContinuousColumns(state) {
  return filterColumnsByType(state, ColumnTypes.CONTINUOUS);
}

export function getSelectableFeatures(state) {
  return getContinuousColumns(state)
    .concat(getCategoricalColumns(state))
    .filter(column => column !== state.labelColumn);
}

export function getSelectableLabels(state) {
  const eligibleColumns = getContinuousColumns(state).concat(
    getCategoricalColumns(state)
  );
  let labelsRestrictedByTrainer;
  switch (true) {
    case availableTrainers[state.selectedTrainer] &&
      availableTrainers[state.selectedTrainer].mlType ===
        MLTypes.CLASSIFICATION &&
      availableTrainers[state.selectedTrainer].binary:
      labelsRestrictedByTrainer = getCategoricalColumns(state).filter(
        column => getUniqueOptions(state, column).length === 2
      );
      break;
    case availableTrainers[state.selectedTrainer] &&
      availableTrainers[state.selectedTrainer].mlType ===
        MLTypes.CLASSIFICATION:
      labelsRestrictedByTrainer = getCategoricalColumns(state);
      break;
    case availableTrainers[state.selectedTrainer] &&
      availableTrainers[state.selectedTrainer].mlType === MLTypes.REGRESSION:
      labelsRestrictedByTrainer = getContinuousColumns(state);
      break;
    default:
      labelsRestrictedByTrainer = eligibleColumns;
  }
  const selectableLabels = labelsRestrictedByTrainer.filter(
    x => !state.selectedFeatures.includes(x)
  );
  return selectableLabels;
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

export const ColumnTypes = {
  CATEGORICAL: "categorical",
  CONTINUOUS: "continuous",
  OTHER: "other"
};
