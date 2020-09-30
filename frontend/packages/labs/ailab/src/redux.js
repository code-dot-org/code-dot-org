// Action types

const SET_IMPORTED_DATA = "SET_IMPORTED_DATA";
const SET_METADATA_BY_COLUMN = "SET_METADATA_BY_COLUMN";
const SET_SELECTED_FEATURES = "SET_SELECTED_FEATURES";
const SET_LABEL_COLUMN = "SET_LABEL_COLUMN";
const SET_SHOW_PREDICT = "SET_SHOW_PREDICT";
const SET_TEST_DATA = "SET_TEST_DATA";
const SET_PREDICTION = "SET_PREDICTION";

// Action creators

export function setImportedData(data) {
  return { type: SET_IMPORTED_DATA, data };
}

export const setMetaDataByColumn = (column, metadataField, value) => ({
  type: SET_METADATA_BY_COLUMN,
  column,
  metadataField,
  value
});

export function setSelectedFeatures(selectedFeatures) {
  return { type: SET_SELECTED_FEATURES, selectedFeatures };
}

export function setLabelColumn(labelColumn) {
  return { type: SET_LABEL_COLUMN, labelColumn };
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

const initialState = {
  data: [],
  metaDataByColumn: {},
  selectedFeatures: [],
  labelColumn: undefined,
  showPredict: false,
  testData: {},
  prediction: undefined
};

// Reducer

export default function rootReducer(state = initialState, action) {
  if (action.type === SET_IMPORTED_DATA) {
    return {
      ...state,
      data: action.data
    };
  }
  if (action.type === SET_METADATA_BY_COLUMN) {
    const prevMetaData = state.metaDataByColumn[action.column]
      ? state.metaDataByColumn[action.column][action.metadataField]
      : {};
    return {
      ...state,
      metaDataByColumn: {
        ...state.metaDataByColumn,
        [action.column]: {
          ...state.metaDataByColumn[action.column],
          [action.metadataField]: action.value
        }
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
  return state;
}

export function getFeatures(state) {
  return state.data.length > 0 ? Object.keys(state.data[0]) : [];
}
