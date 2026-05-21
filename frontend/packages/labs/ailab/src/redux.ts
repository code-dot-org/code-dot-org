import {
  uniqLabelFeaturesSelected,
  prevNextButtons,
} from './helpers/navigationValidation';
import {reportPanelView} from './helpers/metrics';
import {
  getSummaryStat,
  getResultsDataInDataTableForm,
} from './helpers/accuracy';
import {isColumnNumerical, getColumnDataToSave} from './helpers/columnDetails';
import {getDatasetDetails} from './helpers/datasetDetails';
import {
  ColumnTypes,
  RegressionTrainer,
  ClassificationTrainer,
  TestDataLocations,
  ResultsGrades,
} from './constants';
import {
  DataRow,
  Metadata,
  Mode,
  TrainedModelDetailsSave,
  SaveResponseData,
  HistoricResult,
  ModelCardColumn,
  ModelDataToSave,
  PrevNextButtons,
} from './types';
import KNN from 'ml-knn';

// Action types
const RESET_STATE = 'RESET_STATE';
const SET_MODE = 'SET_MODE';
const SET_SELECTED_NAME = 'SET_SELECTED_NAME';
const SET_SELECTED_CSV = 'SET_SELECTED_CSV';
const SET_SELECTED_JSON = 'SET_SELECTED_JSON';
const SET_INVALID_DATA = 'SET_INVALID_DATA';
const SET_IMPORTED_DATA = 'SET_IMPORTED_DATA';
const SET_IMPORTED_METADATA = 'SET_IMPORTED_METADATA';
const SET_REMOVED_ROWS_COUNT = 'SET_REMOVED_ROWS_COUNT';
const SET_COLUMNS_BY_DATA_TYPE = 'SET_COLUMNS_BY_DATA_TYPE';
const ADD_SELECTED_FEATURE = 'ADD_SELECTED_FEATURE';
const REMOVE_SELECTED_FEATURE = 'REMOVE_SELECTED_FEATURE';
const SET_LABEL_COLUMN = 'SET_LABEL_COLUMN';
const SET_FEATURE_NUMBER_KEY = 'SET_FEATURE_NUMBER_KEY';
const SET_RESERVE_LOCATION = 'SET_RESERVE_LOCATION';
const SET_ACCURACY_CHECK_EXAMPLES = 'SET_ACCURACY_CHECK_EXAMPLES';
const SET_ACCURACY_CHECK_LABELS = 'SET_ACCURACY_CHECK_LABELS';
const SET_ACCURACY_CHECK_PREDICTED_LABELS =
  'SET_ACCURACY_CHECK_PREDICTED_LABELS';
const SET_TRAINING_EXAMPLES = 'SET_TRAINING_EXAMPLES';
const SET_TRAINING_LABELS = 'SET_TRAINING_LABELS';
const SET_TEST_DATA = 'SET_TEST_DATA';
const SET_PREDICTION = 'SET_PREDICTION';
const SET_TRAINED_MODEL = 'SET_TRAINED_MODEL';
const SET_TRAINED_MODEL_DETAIL = 'SET_TRAINED_MODEL_DETAIL';
const SET_CURRENT_PANEL = 'SET_CURRENT_PANEL';
const SET_CURRENT_COLUMN = 'SET_CURRENT_COLUMN';
const SET_HIGHLIGHT_COLUMN = 'SET_HIGHLIGHT_COLUMN';
const SET_HIGHLIGHT_DATASET = 'SET_HIGHLIGHT_DATASET';
const SET_RESULTS_PHASE = 'SET_RESULTS_PHASE';
const SET_RESULTS_HIGHLIGHT_ROW = 'SET_RESULTS_HIGHLIGHT_ROW';
const SET_INSTRUCTIONS_KEY_CALLBACK = 'SET_INSTRUCTIONS_KEY_CALLBACK';
const SET_SAVE_STATUS = 'SET_SAVE_STATUS';
const SET_HISTORIC_RESULT = 'SET_HISTORIC_RESULT';
const SET_SHOW_RESULTS_DETAILS = 'SET_SHOW_RESULTS_DETAILS';
const SET_K_VALUE = 'SET_K_VALUE';
const SET_INSTRUCTIONS_DISMISSED = 'SET_INSTRUCTIONS_DISMISSED';
const SET_RESULTS_TAB = 'SET_RESULTS_TAB';
const SET_FIREHOSE_METRICS_LOGGER = 'SET_FIREHOSE_METRICS_LOGGER';

export interface RootState {
  name: string | undefined;
  csvfile: string | undefined;
  jsonfile: string | undefined;
  invalidData: string | undefined;
  data: DataRow[];
  metadata: Metadata;
  removedRowsCount: number;
  highlightDataset: string | undefined;
  highlightColumn: string | undefined;
  columnsByDataType: Record<string, string>;
  selectedFeatures: string[];
  labelColumn: string | undefined;
  featureNumberKey: Record<string, Record<string, number>>;
  trainingExamples: number[][];
  trainingLabels: (number | string)[];
  reserveLocation: string;
  accuracyCheckExamples: number[][];
  accuracyCheckLabels: (number | string)[];
  accuracyCheckPredictedLabels: (number | string)[];
  testData: Record<string, string | number>;
  prediction: number | string | undefined;
  trainedModel: KNN | undefined;
  trainedModelDetails: TrainedModelDetailsSave;
  instructionsKeyCallback:
    | ((key: string, options: {showOverlay?: boolean} | null) => void)
    | undefined;
  currentPanel: string;
  currentColumn: string | undefined;
  resultsPhase: number | undefined;
  saveStatus: string;
  saveResponseData: SaveResponseData | undefined;
  columnRefs: Record<string, HTMLElement>;
  historicResults: HistoricResult[];
  showResultsDetails: boolean;
  resultsHighlightRow: number | undefined;
  kValue: number | null;
  viewedPanels: string[];
  instructionsOverlayActive: boolean;
  resultsTab: string;
  firehoseMetricsLogger:
    | ((eventName: string, details: Record<string, unknown>) => void)
    | undefined;
  mode?: Mode;
}

interface ReduxAction {
  type: string;
  [key: string]: any;
}

// Action creators
export function setMode(mode: Mode): ReduxAction {
  return {type: SET_MODE, mode};
}

export function setSelectedName(name: string): ReduxAction {
  return {type: SET_SELECTED_NAME, name};
}

export function setSelectedCSV(csvfile: string): ReduxAction {
  return {type: SET_SELECTED_CSV, csvfile};
}

export function setSelectedJSON(jsonfile: string): ReduxAction {
  return {type: SET_SELECTED_JSON, jsonfile};
}

export function setInvalidData(invalidData: string): ReduxAction {
  return {type: SET_INVALID_DATA, invalidData};
}

export function setImportedData(
  data: DataRow[],
  userUploadedData: boolean,
): ReduxAction {
  return {type: SET_IMPORTED_DATA, data, userUploadedData};
}

export function setImportedMetadata(metadata: Metadata): ReduxAction {
  return {type: SET_IMPORTED_METADATA, metadata};
}

export function setRemovedRowsCount(removedRowsCount: number): ReduxAction {
  return {type: SET_REMOVED_ROWS_COUNT, removedRowsCount};
}

export const setColumnsByDataType = (
  column: string,
  dataType: string,
): ReduxAction => ({
  type: SET_COLUMNS_BY_DATA_TYPE,
  column,
  dataType,
});

export function addSelectedFeature(selectedFeature: string): ReduxAction {
  return {type: ADD_SELECTED_FEATURE, selectedFeature};
}

export function removeSelectedFeature(selectedFeature: string): ReduxAction {
  return {type: REMOVE_SELECTED_FEATURE, selectedFeature};
}

export function setLabelColumn(labelColumn: string): ReduxAction {
  return {type: SET_LABEL_COLUMN, labelColumn};
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
export function setFeatureNumberKey(
  featureNumberKey: Record<string, Record<string, number>>,
): ReduxAction {
  return {type: SET_FEATURE_NUMBER_KEY, featureNumberKey};
}

export function setReserveLocation(reserveLocation: string): ReduxAction {
  return {type: SET_RESERVE_LOCATION, reserveLocation};
}

export function setAccuracyCheckExamples(
  accuracyCheckExamples: number[][],
): ReduxAction {
  return {type: SET_ACCURACY_CHECK_EXAMPLES, accuracyCheckExamples};
}

export function setAccuracyCheckLabels(
  accuracyCheckLabels: (number | string)[],
): ReduxAction {
  return {type: SET_ACCURACY_CHECK_LABELS, accuracyCheckLabels};
}

export function setAccuracyCheckPredictedLabels(
  predictedLabels: (number | string)[],
): ReduxAction {
  return {type: SET_ACCURACY_CHECK_PREDICTED_LABELS, predictedLabels};
}

export function setTrainingExamples(trainingExamples: number[][]): ReduxAction {
  return {type: SET_TRAINING_EXAMPLES, trainingExamples};
}

export function setTrainingLabels(
  trainingLabels: (number | string)[],
): ReduxAction {
  return {type: SET_TRAINING_LABELS, trainingLabels};
}

export function setTestData(
  feature: string,
  value: string | number,
): ReduxAction {
  return {type: SET_TEST_DATA, feature, value};
}

export function setPrediction(prediction: number | string): ReduxAction {
  return {type: SET_PREDICTION, prediction};
}

export function resetState(): ReduxAction {
  return {type: RESET_STATE};
}

export function setTrainedModel(trainedModel: KNN): ReduxAction {
  return {type: SET_TRAINED_MODEL, trainedModel};
}

export function setTrainedModelDetail(
  field: string,
  value: string,
  isColumn: boolean,
): ReduxAction {
  return {type: SET_TRAINED_MODEL_DETAIL, field, value, isColumn};
}

export function setInstructionsKeyCallback(
  instructionsKeyCallback: (
    key: string,
    options: {showOverlay?: boolean} | null,
  ) => void,
): ReduxAction {
  return {type: SET_INSTRUCTIONS_KEY_CALLBACK, instructionsKeyCallback};
}

export function setCurrentPanel(currentPanel: string): ReduxAction {
  return {type: SET_CURRENT_PANEL, currentPanel};
}

export function setCurrentColumn(currentColumn: string): ReduxAction {
  return {type: SET_CURRENT_COLUMN, currentColumn};
}

export function setHighlightColumn(highlightColumn: string): ReduxAction {
  return {type: SET_HIGHLIGHT_COLUMN, highlightColumn};
}

export function setHighlightDataset(highlightDataset: string): ReduxAction {
  return {type: SET_HIGHLIGHT_DATASET, highlightDataset};
}

export function setResultsPhase(phase: number): ReduxAction {
  return {type: SET_RESULTS_PHASE, phase};
}

export function setResultsHighlightRow(highlightRow: number): ReduxAction {
  return {type: SET_RESULTS_HIGHLIGHT_ROW, highlightRow};
}

export function setSaveStatus(
  status: string,
  data?: SaveResponseData,
): ReduxAction {
  return {type: SET_SAVE_STATUS, status, data};
}

export function setHistoricResult(
  label: string,
  features: string[],
  accuracy: string,
): ReduxAction {
  return {type: SET_HISTORIC_RESULT, label, features, accuracy};
}

export function setShowResultsDetails(show: boolean): ReduxAction {
  return {type: SET_SHOW_RESULTS_DETAILS, show};
}

export function setKValue(kValue: number): ReduxAction {
  return {type: SET_K_VALUE, kValue};
}

export function setInstructionsDismissed(): ReduxAction {
  return {type: SET_INSTRUCTIONS_DISMISSED};
}

export function setResultsTab(key: string): ReduxAction {
  return {type: SET_RESULTS_TAB, key};
}

export function setFirehoseMetricsLogger(
  firehoseMetricsLogger: (
    eventName: string,
    details: Record<string, unknown>,
  ) => void,
): ReduxAction {
  return {type: SET_FIREHOSE_METRICS_LOGGER, firehoseMetricsLogger};
}

const initialState: RootState = {
  name: undefined,
  csvfile: undefined,
  jsonfile: undefined,
  // Possible values for invalidData: "tooFewRows", and "tooFewColumns".
  invalidData: undefined,
  data: [],
  metadata: {
    card: {},
  },
  removedRowsCount: 0,
  highlightDataset: undefined,
  highlightColumn: undefined,
  columnsByDataType: {},
  selectedFeatures: [],
  labelColumn: undefined,
  featureNumberKey: {},
  trainingExamples: [],
  trainingLabels: [],
  reserveLocation: TestDataLocations.END,
  accuracyCheckExamples: [],
  accuracyCheckLabels: [],
  accuracyCheckPredictedLabels: [],
  testData: {},
  prediction: undefined,
  trainedModel: undefined,
  trainedModelDetails: {},
  instructionsKeyCallback: undefined,
  currentPanel: 'selectDataset',
  currentColumn: undefined,
  resultsPhase: undefined,
  // Possible values for saveStatus: "notStarted", "started", "success",
  // "piiProfanity", and "failure".
  saveStatus: 'notStarted',
  // Additional data for a failed save response.  Currently contains
  // details when server-side "share filtering" prevents a save.
  saveResponseData: undefined,
  columnRefs: {},
  historicResults: [],
  showResultsDetails: false,
  resultsHighlightRow: undefined,
  kValue: null,
  viewedPanels: [],
  instructionsOverlayActive: false,
  resultsTab: ResultsGrades.CORRECT,
  firehoseMetricsLogger: undefined,
};

// Reducer
export default function rootReducer(
  state: RootState = initialState,
  action: ReduxAction,
): RootState {
  if (action.type === SET_MODE) {
    return {
      ...state,
      mode: action.mode,
    };
  }
  if (action.type === SET_SELECTED_NAME) {
    return {
      ...state,
      name: action.name,
    };
  }
  if (action.type === SET_SELECTED_CSV) {
    return {
      ...state,
      csvfile: action.csvfile,
    };
  }
  if (action.type === SET_SELECTED_JSON) {
    return {
      ...state,
      jsonfile: action.jsonfile,
    };
  }
  if (action.type === SET_INVALID_DATA) {
    return {
      ...state,
      invalidData: action.invalidData,
    };
  }
  if (action.type === SET_IMPORTED_DATA) {
    if (state.currentPanel === 'selectDataset') {
      state.instructionsKeyCallback!(
        action.userUploadedData ? 'uploadedDataset' : 'selectedDataset',
        null,
      );
    }

    return {
      ...state,
      data: action.data,
    };
  }
  if (action.type === SET_IMPORTED_METADATA) {
    const newState = {
      ...state,
      metadata: action.metadata,
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
        [action.column]: action.dataType,
      },
    };
  }
  if (action.type === SET_REMOVED_ROWS_COUNT) {
    return {
      ...state,
      removedRowsCount: action.removedRowsCount,
    };
  }
  if (action.type === ADD_SELECTED_FEATURE) {
    if (!state.selectedFeatures.includes(action.selectedFeature)) {
      return {
        ...state,
        selectedFeatures: [...state.selectedFeatures, action.selectedFeature],
      };
    }
  }
  if (action.type === REMOVE_SELECTED_FEATURE) {
    return {
      ...state,
      selectedFeatures: state.selectedFeatures.filter(
        item => item !== action.selectedFeature,
      ),
    };
  }
  if (action.type === SET_LABEL_COLUMN) {
    return {
      ...state,
      labelColumn: action.labelColumn,
    };
  }
  if (action.type === SET_FEATURE_NUMBER_KEY) {
    return {
      ...state,
      featureNumberKey: action.featureNumberKey,
    };
  }
  if (action.type === SET_TRAINING_EXAMPLES) {
    return {
      ...state,
      trainingExamples: action.trainingExamples,
    };
  }
  if (action.type === SET_TRAINING_LABELS) {
    return {
      ...state,
      trainingLabels: action.trainingLabels,
    };
  }
  if (action.type === SET_RESERVE_LOCATION) {
    return {
      ...state,
      reserveLocation: action.reserveLocation,
    };
  }
  if (action.type === SET_ACCURACY_CHECK_EXAMPLES) {
    return {
      ...state,
      accuracyCheckExamples: action.accuracyCheckExamples,
    };
  }
  if (action.type === SET_ACCURACY_CHECK_LABELS) {
    return {
      ...state,
      accuracyCheckLabels: action.accuracyCheckLabels,
    };
  }
  if (action.type === SET_ACCURACY_CHECK_PREDICTED_LABELS) {
    return {
      ...state,
      accuracyCheckPredictedLabels: action.predictedLabels,
    };
  }
  if (action.type === SET_TEST_DATA) {
    return {
      ...state,
      testData: {...state.testData, [action.feature]: action.value},
      prediction: undefined,
    };
  }
  if (action.type === SET_PREDICTION) {
    return {
      ...state,
      prediction: action.prediction,
    };
  }
  if (action.type === RESET_STATE) {
    return {
      ...initialState,
      instructionsKeyCallback: state.instructionsKeyCallback,
      mode: state.mode,
      reserveLocation: state.reserveLocation,
      firehoseMetricsLogger: state.firehoseMetricsLogger,
    };
  }
  if (action.type === SET_TRAINED_MODEL) {
    return {
      ...state,
      trainedModel: action.trainedModel,
    };
  }
  if (action.type === SET_TRAINED_MODEL_DETAIL) {
    const trainedModelDetails = {...state.trainedModelDetails};

    if (action.isColumn) {
      if (!trainedModelDetails.columns) {
        trainedModelDetails.columns = [];
      }

      const column = trainedModelDetails.columns.find(
        (column: {id: string; description: string}) => {
          return column.id === action.field;
        },
      );

      if (column) {
        column.description = action.value;
      } else {
        trainedModelDetails.columns.push({
          id: action.field,
          description: action.value,
        });
      }
    } else {
      trainedModelDetails[action.field] = action.value;
    }

    return {
      ...state,
      trainedModelDetails,
    };
  }
  if (action.type === SET_INSTRUCTIONS_KEY_CALLBACK) {
    return {
      ...state,
      instructionsKeyCallback: action.instructionsKeyCallback,
    };
  }
  if (action.type === SET_CURRENT_PANEL) {
    reportPanelView(action.currentPanel);
    let showedOverlay = false;
    if (state.instructionsKeyCallback) {
      const options: {showOverlay?: boolean} = {};
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

    if (action.currentPanel === 'dataDisplayLabel') {
      return {
        ...state,
        currentPanel: action.currentPanel,
        instructionsOverlayActive: showedOverlay,
        currentColumn: undefined,
        selectedFeatures: [],
      };
    }

    if (action.currentPanel === 'results') {
      return {
        ...state,
        currentPanel: action.currentPanel,
        instructionsOverlayActive: showedOverlay,
        testData: {},
        prediction: undefined,
        resultsTab: ResultsGrades.CORRECT,
        showResultsDetails: false,
      };
    }

    return {
      ...state,
      currentPanel: action.currentPanel,
      instructionsOverlayActive: showedOverlay,
      currentColumn: undefined,
    };
  }
  if (action.type === SET_HIGHLIGHT_COLUMN) {
    if (!getShowColumnClicking(state)) {
      // If no column clicking, do nothing.
      return state;
    }
    if (
      state.currentPanel === 'dataDisplayFeatures' &&
      action.highlightColumn === state.labelColumn
    ) {
      // If doing feature selection, and the label column is clicked, do nothing.
      return state;
    }
    return {
      ...state,
      highlightColumn: action.highlightColumn,
    };
  }
  if (action.type === SET_HIGHLIGHT_DATASET) {
    return {
      ...state,
      highlightDataset: action.highlightDataset,
    };
  }
  if (action.type === SET_CURRENT_COLUMN) {
    if (!getShowColumnClicking(state)) {
      // If no column clicking, do nothing.
      return state;
    }
    if (
      state.currentPanel === 'dataDisplayFeatures' &&
      action.currentColumn === state.labelColumn
    ) {
      // If doing feature selection, and the label column is clicked, do nothing.
      return state;
    } else if (state.currentColumn === action.currentColumn) {
      // If column is selected, then deselect.
      if (state.currentPanel === 'dataDisplayFeatures') {
        state.instructionsKeyCallback!('dataDisplayFeatures', null);
      }
      return {
        ...state,
        currentColumn: undefined,
      };
    } else {
      if (state.currentPanel === 'dataDisplayFeatures') {
        if (
          state.columnsByDataType[action.currentColumn] ===
          ColumnTypes.NUMERICAL
        ) {
          state.instructionsKeyCallback!('selectedFeatureNumerical', null);
        } else if (
          state.columnsByDataType[action.currentColumn] ===
          ColumnTypes.CATEGORICAL
        ) {
          state.instructionsKeyCallback!('selectedFeatureCategorical', null);
        }
      }

      // Select the column.
      return {
        ...state,
        currentColumn: action.currentColumn,
      };
    }
  }
  if (action.type === SET_RESULTS_PHASE) {
    return {
      ...state,
      resultsPhase: action.phase,
    };
  }
  if (action.type === SET_RESULTS_HIGHLIGHT_ROW) {
    return {
      ...state,
      resultsHighlightRow: action.highlightRow,
    };
  }
  if (action.type === SET_SAVE_STATUS) {
    return {
      ...state,
      saveStatus: action.status,
      saveResponseData: action.data,
    };
  }
  if (action.type === SET_HISTORIC_RESULT) {
    return {
      ...state,
      historicResults: [
        {
          label: action.label,
          features: action.features,
          accuracy: action.accuracy,
        },
        ...state.historicResults,
      ],
    };
  }
  if (action.type === SET_SHOW_RESULTS_DETAILS) {
    state.instructionsKeyCallback!(
      action.show ? 'resultsDetails' : 'results',
      null,
    );
    return {
      ...state,
      showResultsDetails: action.show,
    };
  }
  if (action.type === SET_K_VALUE) {
    return {
      ...state,
      kValue: action.kValue,
    };
  }
  if (action.type === SET_INSTRUCTIONS_DISMISSED) {
    return {
      ...state,
      instructionsOverlayActive: false,
    };
  }
  if (action.type === SET_RESULTS_TAB) {
    return {
      ...state,
      resultsTab: action.key,
    };
  }
  if (action.type === SET_FIREHOSE_METRICS_LOGGER) {
    return {
      ...state,
      firehoseMetricsLogger: action.firehoseMetricsLogger,
    };
  }
  return state;
}

export function getSpecifiedDatasets(state: RootState): string[] | undefined {
  return state.mode && state.mode.datasets;
}

/* Functions for determining UI element availability and interactivity. */

function getShowColumnClicking(state: RootState): boolean {
  return !(state.mode && state.mode.hideColumnClicking);
}

export function getPredictAvailable(state: RootState): boolean {
  return (
    Object.keys(state.testData).filter(
      value => state.testData[value] && state.testData[value] !== '',
    ).length === state.selectedFeatures.length
  );
}

export function getPanelButtons(state: RootState): PrevNextButtons {
  return prevNextButtons(state);
}

export function readyToTrain(state: RootState): boolean {
  return uniqLabelFeaturesSelected(state);
}

/* Functions for processing data to display. */

export function getTableData(
  state: RootState,
  useResultsData: boolean,
): DataRow[] {
  if (useResultsData) {
    return getResultsDataInDataTableForm(state);
  } else {
    return state.data;
  }
}

export function isRegression(state: RootState): boolean {
  return isColumnNumerical(state, state.labelColumn!);
}

/* Functions for processing data about a trained model to save. */
export function getFeaturesToSave(state: RootState): ModelCardColumn[] {
  const features = state.selectedFeatures.map(feature =>
    getColumnDataToSave(state, feature),
  );
  return features;
}

export function getLabelToSave(state: RootState): ModelCardColumn {
  return getColumnDataToSave(state, state.labelColumn!);
}

export function getTrainedModelDataToSave(state: RootState): ModelDataToSave {
  const dataToSave: ModelDataToSave = {
    name: state.trainedModelDetails.name,
    datasetDetails: getDatasetDetails(state),
    potentialUses: state.trainedModelDetails.potentialUses,
    potentialMisuses: state.trainedModelDetails.potentialMisuses,
    selectedTrainer: isRegression(state)
      ? RegressionTrainer
      : ClassificationTrainer,
    featureNumberKey: state.featureNumberKey,
    label: getColumnDataToSave(state, state.labelColumn!),
    features: getFeaturesToSave(state),
    summaryStat: getSummaryStat(state),
    trainedModel: state.trainedModel ? state.trainedModel.toJSON() : null,
    kValue: state.kValue,
  };

  return dataToSave;
}
