import {
  createSlice,
  type PayloadAction,
  type ThunkAction,
  type AnyAction,
} from '@reduxjs/toolkit';

import {ColumnTypes, TestDataLocations, ResultsGrades} from './constants';
import {
  getSummaryStat,
  getResultsDataInDataTableForm,
} from './helpers/accuracy';
import {getColumnDataToSave} from './helpers/columnDetails';
import {getDatasetDetails} from './helpers/datasetDetails';
import {
  uniqLabelFeaturesSelected,
  prevNextButtons,
} from './helpers/navigationValidation';
import {getTrainerId} from './trainers/ids';
import type {
  DataRow,
  Metadata,
  Mode,
  TrainedModelDetailsSave,
  SaveResponseData,
  HistoricResult,
  ModelCardColumn,
  ModelDataToSave,
  PrevNextButtons,
  InstructionsKey,
  SaveResponse,
  SaveTrainedModel,
  Panel,
  TrainedModel,
} from './types';

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
  trainedModel: TrainedModel | undefined;
  trainedModelDetails: TrainedModelDetailsSave;
  currentPanel: Panel;
  currentColumn: string | undefined;
  resultsPhase: number | undefined;
  saveStatus: string;
  saveResponseData: SaveResponseData | undefined;
  historicResults: HistoricResult[];
  showResultsDetails: boolean;
  resultsHighlightRow: number | undefined;
  kValue: number | null;
  viewedPanels: string[];
  instructionsOverlayActive: boolean;
  instructionsEnabled: boolean;
  instructionsKey: InstructionsKey | null;
  showOverlay: boolean;
  resultsTab: string;
  mode?: Mode;
}

export const initialState: RootState = {
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
  currentPanel: 'selectDataset',
  currentColumn: undefined,
  resultsPhase: undefined,
  // Possible values for saveStatus: "notStarted", "started", "success",
  // "piiProfanity", and "failure".
  saveStatus: 'notStarted',
  // Additional data for a failed save response.  Currently contains
  // details when server-side "share filtering" prevents a save.
  saveResponseData: undefined,
  historicResults: [],
  showResultsDetails: false,
  resultsHighlightRow: undefined,
  kValue: null,
  viewedPanels: [],
  instructionsOverlayActive: false,
  instructionsEnabled: false,
  instructionsKey: null,
  showOverlay: false,
  resultsTab: ResultsGrades.CORRECT,
};

const ailabSlice = createSlice({
  name: 'ailab',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<Mode | undefined>) {
      state.mode = action.payload;
    },
    setSelectedName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setSelectedCSV(state, action: PayloadAction<string>) {
      state.csvfile = action.payload;
    },
    setSelectedJSON(state, action: PayloadAction<string>) {
      state.jsonfile = action.payload;
    },
    setInvalidData(state, action: PayloadAction<string>) {
      state.invalidData = action.payload;
    },
    setImportedData: {
      reducer(
        state,
        action: PayloadAction<{data: DataRow[]; userUploadedData: boolean}>,
      ) {
        const {data, userUploadedData} = action.payload;
        if (state.currentPanel === 'selectDataset') {
          state.instructionsKey = userUploadedData
            ? 'uploadedDataset'
            : 'selectedDataset';
          state.showOverlay = false;
        }
        state.data = data;
      },
      prepare(data: DataRow[], userUploadedData: boolean) {
        return {payload: {data, userUploadedData}};
      },
    },
    setImportedMetadata(state, action: PayloadAction<Metadata>) {
      state.metadata = action.payload;
      if (
        state.mode &&
        state.mode.datasets &&
        state.mode.datasets.length > 1 &&
        state.mode.hideSelectLabel
      ) {
        state.labelColumn = action.payload.defaultLabelColumn;
      }
    },
    setRemovedRowsCount(state, action: PayloadAction<number>) {
      state.removedRowsCount = action.payload;
    },
    setColumnsByDataType: {
      reducer(
        state,
        action: PayloadAction<{column: string; dataType: string}>,
      ) {
        state.columnsByDataType[action.payload.column] =
          action.payload.dataType;
      },
      prepare(column: string, dataType: string) {
        return {payload: {column, dataType}};
      },
    },
    addSelectedFeature(state, action: PayloadAction<string>) {
      if (!state.selectedFeatures.includes(action.payload)) {
        state.selectedFeatures.push(action.payload);
      }
    },
    removeSelectedFeature(state, action: PayloadAction<string>) {
      state.selectedFeatures = state.selectedFeatures.filter(
        item => item !== action.payload,
      );
    },
    setLabelColumn(state, action: PayloadAction<string>) {
      state.labelColumn = action.payload;
    },
    /* featureNumberKey maps feature names to a hash of category options mapped
      to integers.
      {
        feature1: {option1: 0, option2: 1, ...},
        feature2: {option1: 0, option2: 1, ...}
      }
    */
    setFeatureNumberKey(
      state,
      action: PayloadAction<Record<string, Record<string, number>>>,
    ) {
      state.featureNumberKey = action.payload;
    },
    setReserveLocation(state, action: PayloadAction<string>) {
      state.reserveLocation = action.payload;
    },
    setAccuracyCheckExamples(state, action: PayloadAction<number[][]>) {
      state.accuracyCheckExamples = action.payload;
    },
    setAccuracyCheckLabels(state, action: PayloadAction<(number | string)[]>) {
      state.accuracyCheckLabels = action.payload;
    },
    setAccuracyCheckPredictedLabels(
      state,
      action: PayloadAction<(number | string)[]>,
    ) {
      state.accuracyCheckPredictedLabels = action.payload;
    },
    setTrainingExamples(state, action: PayloadAction<number[][]>) {
      state.trainingExamples = action.payload;
    },
    setTrainingLabels(state, action: PayloadAction<(number | string)[]>) {
      state.trainingLabels = action.payload;
    },
    setTestData: {
      reducer(
        state,
        action: PayloadAction<{feature: string; value: string | number}>,
      ) {
        state.testData[action.payload.feature] = action.payload.value;
        state.prediction = undefined;
      },
      prepare(feature: string, value: string | number) {
        return {payload: {feature, value}};
      },
    },
    setPrediction(state, action: PayloadAction<number | string>) {
      state.prediction = action.payload;
    },
    resetState(state) {
      return {
        ...initialState,
        mode: state.mode,
        reserveLocation: state.reserveLocation,
        instructionsEnabled: state.instructionsEnabled,
      };
    },
    setTrainedModel(state, action: PayloadAction<TrainedModel>) {
      state.trainedModel = action.payload;
    },
    setTrainedModelDetail: {
      reducer(
        state,
        action: PayloadAction<{
          field: string;
          value: string;
          isColumn: boolean;
        }>,
      ) {
        const {field, value, isColumn} = action.payload;
        const details = state.trainedModelDetails;
        if (isColumn) {
          if (!details.columns) {
            details.columns = [];
          }
          const column = details.columns.find(c => c.id === field);
          if (column) {
            column.description = value;
          } else {
            details.columns.push({id: field, description: value});
          }
        } else {
          details[field] = value;
        }
      },
      prepare(field: string, value: string, isColumn: boolean) {
        return {payload: {field, value, isColumn}};
      },
    },
    setCurrentPanel(state, action: PayloadAction<Panel>) {
      const currentPanel = action.payload;
      // Show the overlay only on a panel's first visit, only when
      // instructions are enabled, and the mode doesn't suppress it.
      let showedOverlay = false;
      if (
        state.instructionsEnabled &&
        !(state.mode && state.mode.hideInstructionsOverlay) &&
        !state.viewedPanels.includes(currentPanel)
      ) {
        state.viewedPanels.push(currentPanel);
        showedOverlay = true;
      }
      state.currentPanel = currentPanel;
      state.instructionsOverlayActive = showedOverlay;
      state.instructionsKey = currentPanel as InstructionsKey;
      state.showOverlay = showedOverlay;
      if (currentPanel === 'dataDisplayLabel') {
        state.currentColumn = undefined;
        state.selectedFeatures = [];
      } else if (currentPanel === 'results') {
        state.testData = {};
        state.prediction = undefined;
        state.resultsTab = ResultsGrades.CORRECT;
        state.showResultsDetails = false;
      } else {
        state.currentColumn = undefined;
      }
    },
    setCurrentColumn(state, action: PayloadAction<string>) {
      const currentColumn = action.payload;
      if (!getShowColumnClicking(state)) {
        // If no column clicking, do nothing.
        return;
      }
      if (
        state.currentPanel === 'dataDisplayFeatures' &&
        currentColumn === state.labelColumn
      ) {
        // If doing feature selection, and the label column is clicked, do
        // nothing.
        return;
      } else if (state.currentColumn === currentColumn) {
        // If column is selected, then deselect.
        if (state.currentPanel === 'dataDisplayFeatures') {
          state.instructionsKey = 'dataDisplayFeatures';
          state.showOverlay = false;
        }
        state.currentColumn = undefined;
      } else {
        if (state.currentPanel === 'dataDisplayFeatures') {
          if (
            state.columnsByDataType[currentColumn] === ColumnTypes.NUMERICAL
          ) {
            state.instructionsKey = 'selectedFeatureNumerical';
            state.showOverlay = false;
          } else if (
            state.columnsByDataType[currentColumn] === ColumnTypes.CATEGORICAL
          ) {
            state.instructionsKey = 'selectedFeatureCategorical';
            state.showOverlay = false;
          }
        }
        // Select the column.
        state.currentColumn = currentColumn;
      }
    },
    setHighlightColumn(state, action: PayloadAction<string>) {
      const highlightColumn = action.payload;
      if (!getShowColumnClicking(state)) {
        // If no column clicking, do nothing.
        return;
      }
      if (
        state.currentPanel === 'dataDisplayFeatures' &&
        highlightColumn === state.labelColumn
      ) {
        // If doing feature selection, and the label column is clicked, do
        // nothing.
        return;
      }
      state.highlightColumn = highlightColumn;
    },
    setHighlightDataset(state, action: PayloadAction<string>) {
      state.highlightDataset = action.payload;
    },
    setResultsPhase(state, action: PayloadAction<number>) {
      state.resultsPhase = action.payload;
    },
    setResultsHighlightRow(state, action: PayloadAction<number>) {
      state.resultsHighlightRow = action.payload;
    },
    setSaveStatus: {
      reducer(
        state,
        action: PayloadAction<{status: string; data?: SaveResponseData}>,
      ) {
        state.saveStatus = action.payload.status;
        state.saveResponseData = action.payload.data;
      },
      prepare(status: string, data?: SaveResponseData) {
        return {payload: {status, data}};
      },
    },
    setHistoricResult: {
      reducer(
        state,
        action: PayloadAction<{
          label: string;
          features: string[];
          accuracy: string;
        }>,
      ) {
        state.historicResults.unshift({
          label: action.payload.label,
          features: action.payload.features,
          accuracy: action.payload.accuracy,
        });
      },
      prepare(label: string, features: string[], accuracy: string) {
        return {payload: {label, features, accuracy}};
      },
    },
    setShowResultsDetails(state, action: PayloadAction<boolean>) {
      state.instructionsKey = action.payload ? 'resultsDetails' : 'results';
      state.showOverlay = false;
      state.showResultsDetails = action.payload;
    },
    setKValue(state, action: PayloadAction<number>) {
      state.kValue = action.payload;
    },
    setInstructionsDismissed(state) {
      state.instructionsOverlayActive = false;
    },
    setInstructionsEnabled(state, action: PayloadAction<boolean>) {
      state.instructionsEnabled = action.payload;
    },
    setResultsTab(state, action: PayloadAction<string>) {
      state.resultsTab = action.payload;
    },
  },
});

export const {
  setMode,
  setSelectedName,
  setSelectedCSV,
  setSelectedJSON,
  setInvalidData,
  setImportedData,
  setImportedMetadata,
  setRemovedRowsCount,
  setColumnsByDataType,
  addSelectedFeature,
  removeSelectedFeature,
  setLabelColumn,
  setFeatureNumberKey,
  setReserveLocation,
  setAccuracyCheckExamples,
  setAccuracyCheckLabels,
  setAccuracyCheckPredictedLabels,
  setTrainingExamples,
  setTrainingLabels,
  setTestData,
  setPrediction,
  resetState,
  setTrainedModel,
  setTrainedModelDetail,
  setCurrentPanel,
  setCurrentColumn,
  setHighlightColumn,
  setHighlightDataset,
  setResultsPhase,
  setResultsHighlightRow,
  setSaveStatus,
  setHistoricResult,
  setShowResultsDetails,
  setKValue,
  setInstructionsDismissed,
  setInstructionsEnabled,
  setResultsTab,
} = ailabSlice.actions;

export default ailabSlice.reducer;

/**
 * Save the trained model. Composes the payload from current state, marks the
 * save in progress, then hands off to the consumer's `save` callback.
 */
export const saveModel =
  (
    saveTrainedModel: SaveTrainedModel,
  ): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch, getState) => {
    const dataToSave = getTrainedModelDataToSave(getState());
    dispatch(setSaveStatus('started'));
    saveTrainedModel(dataToSave, (response: SaveResponse) => {
      dispatch(setSaveStatus(response.status, response.data));
      dispatch(
        setCurrentPanel(
          response.status === 'success' ? 'modelSummary' : 'saveModel',
        ),
      );
    });
  };

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

// Builds {prev, next} and reads the I18n global for button text, so it is not
// memoized on Redux state. App selects it with a prev/next-aware equality fn so
// the new object reference doesn't trigger unnecessary rerenders.
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
    selectedTrainer: getTrainerId(state),
    featureNumberKey: state.featureNumberKey,
    label: getColumnDataToSave(state, state.labelColumn!),
    features: getFeaturesToSave(state),
    summaryStat: getSummaryStat(state),
    trainedModel: state.trainedModel ? state.trainedModel.toJSON() : null,
    kValue: state.kValue,
  };

  return dataToSave;
}
