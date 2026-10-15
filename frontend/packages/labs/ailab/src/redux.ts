import {
  createSlice,
  type PayloadAction,
  type ThunkAction,
  type AnyAction,
} from '@reduxjs/toolkit';

import {TestDataLocations, ResultsGrades} from './constants';
import {getResultsDataInDataTableForm} from './helpers/accuracy';
import {
  uniqLabelFeaturesSelected,
  prevNextButtons,
} from './helpers/navigationValidation';
import {getTrainedModelDataToSave} from './selectors/saveSelectors';
import type {
  AilabProject,
  DataRow,
  Metadata,
  Mode,
  PresetColumns,
  TrainedModelDetailsSave,
  SaveResponseData,
  PrevNextButtons,
  InstructionsKey,
  SaveResponse,
  SaveTrainedModel,
  Panel,
  TrainedModel,
  TrainingModalStep,
} from './types';

export type DatasetLayout = 'table' | 'cards';

export interface RootState {
  name: string | undefined;
  csvfile: string | undefined;
  jsonfile: string | undefined;
  invalidData: string | undefined;
  data: DataRow[];
  metadata: Metadata;
  removedRowsCount: number;
  highlightDataset: string | undefined;
  columnsByDataType: Record<string, string>;
  featureNumberKey: Record<string, Record<string, number>>;
  trainingExamples: number[][];
  trainingLabels: (number | string)[];
  reserveLocation: string;
  accuracyCheckExamples: number[][];
  accuracyCheckLabels: (number | string)[];
  accuracyCheckPredictedLabels: (number | string)[];
  testData: Record<string, string | number>;
  prediction: number | string | undefined;
  predictionTestData: Record<string, string | number>;
  predictionInputs: number[];
  // Undefined shows the whole path; a number shows it up to that step.
  predictionStep: number | undefined;
  predictionStepByHand: boolean;
  predictionPlaying: boolean;
  predictionCount: number;
  trainedModelDetails: TrainedModelDetailsSave;
  currentPanel: Panel;
  trainingModalStep: TrainingModalStep | undefined;
  isTrainingReplay: boolean;
  currentColumn: string | undefined;
  datasetLayout: DatasetLayout;
  saveStatus: string;
  saveResponseData: SaveResponseData | undefined;
  viewedPanels: string[];
  instructionsOverlayActive: boolean;
  instructionsEnabled: boolean;
  instructionsKey: InstructionsKey | null;
  showOverlay: boolean;
  resultsTab: string;
  presetColumns: PresetColumns | undefined;
  resetCount: number;
  resetKeepsHistoricResults: boolean;
  mode?: Mode;
}

// What a training run writes to Redux, so a cancelled run can be undone. The
// model and the project data it also produces are undone by their own
// contexts.
const TRAINING_RESULT_KEYS = [
  'featureNumberKey',
  'trainingExamples',
  'trainingLabels',
  'accuracyCheckExamples',
  'accuracyCheckLabels',
  'accuracyCheckPredictedLabels',
] as const;

export type TrainingResults = Pick<
  RootState,
  (typeof TRAINING_RESULT_KEYS)[number]
>;

export function getTrainingResults(state: RootState): TrainingResults {
  return Object.fromEntries(
    TRAINING_RESULT_KEYS.map(key => [key, state[key]]),
  ) as TrainingResults;
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
  columnsByDataType: {},
  featureNumberKey: {},
  trainingExamples: [],
  trainingLabels: [],
  reserveLocation: TestDataLocations.END,
  accuracyCheckExamples: [],
  accuracyCheckLabels: [],
  accuracyCheckPredictedLabels: [],
  testData: {},
  prediction: undefined,
  predictionTestData: {},
  predictionInputs: [],
  predictionStep: undefined,
  predictionStepByHand: false,
  predictionPlaying: false,
  predictionCount: 0,
  trainedModelDetails: {},
  currentPanel: 'datasetView',
  trainingModalStep: undefined,
  isTrainingReplay: false,
  currentColumn: undefined,
  datasetLayout: 'table',
  // Possible values for saveStatus: "notStarted", "started", "success",
  // "piiProfanity", and "failure".
  saveStatus: 'notStarted',
  // Additional data for a failed save response.  Currently contains
  // details when server-side "share filtering" prevents a save.
  saveResponseData: undefined,
  viewedPanels: [],
  instructionsOverlayActive: false,
  instructionsEnabled: false,
  instructionsKey: null,
  showOverlay: false,
  resultsTab: ResultsGrades.CORRECT,
  presetColumns: undefined,
  resetCount: 0,
  resetKeepsHistoricResults: false,
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
    },
    setPresetColumns(state, action: PayloadAction<PresetColumns>) {
      state.presetColumns = action.payload;
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
    setTestDataValues(state, action: PayloadAction<Record<string, string>>) {
      Object.assign(state.testData, action.payload);
      state.prediction = undefined;
    },
    setPrediction: {
      reducer(
        state,
        action: PayloadAction<{prediction: number | string; inputs: number[]}>,
      ) {
        state.prediction = action.payload.prediction;
        state.predictionTestData = {...state.testData};
        state.predictionInputs = action.payload.inputs;
        state.predictionStep = undefined;
        state.predictionStepByHand = false;
        state.predictionPlaying = false;
        state.predictionCount += 1;
      },
      prepare(prediction: number | string, inputs: number[]) {
        return {payload: {prediction, inputs}};
      },
    },
    playPredictionStep(state, action: PayloadAction<number>) {
      state.predictionStep = action.payload;
      state.predictionStepByHand = false;
    },
    setPredictionPlaying(state, action: PayloadAction<boolean>) {
      state.predictionPlaying = action.payload;
    },
    stepPredictionByHand(state, action: PayloadAction<number>) {
      state.predictionStep = action.payload;
      state.predictionStepByHand = true;
      state.predictionPlaying = false;
    },
    resetState: {
      reducer(state, action: PayloadAction<{keepHistoricResults: boolean}>) {
        return {
          ...initialState,
          mode: state.mode,
          reserveLocation: state.reserveLocation,
          instructionsEnabled: state.instructionsEnabled,
          resetCount: state.resetCount + 1,
          resetKeepsHistoricResults: action.payload.keepHistoricResults,
        };
      },
      prepare(keepHistoricResults = false) {
        return {payload: {keepHistoricResults}};
      },
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
      state.trainingModalStep = undefined;
      state.isTrainingReplay = false;
      state.instructionsOverlayActive = showedOverlay;
      state.instructionsKey = currentPanel as InstructionsKey;
      state.showOverlay = showedOverlay;
      if (currentPanel === 'results') {
        state.testData = {};
        state.prediction = undefined;
        state.resultsTab = ResultsGrades.CORRECT;
      } else {
        state.currentColumn = undefined;
      }
    },
    setDatasetLayout(state, action: PayloadAction<DatasetLayout>) {
      state.datasetLayout = action.payload;
    },
    setCurrentColumn(state, action: PayloadAction<string>) {
      const currentColumn = action.payload;
      if (!getShowColumnClicking(state)) {
        return;
      }
      state.currentColumn =
        state.currentColumn === currentColumn ? undefined : currentColumn;
    },
    setHighlightDataset(state, action: PayloadAction<string>) {
      state.highlightDataset = action.payload;
    },
    setTrainingModalStep(
      state,
      action: PayloadAction<TrainingModalStep | undefined>,
    ) {
      state.trainingModalStep = action.payload;
      if (action.payload !== 'testing') {
        state.isTrainingReplay = false;
      }
    },
    replayTraining(state) {
      state.trainingModalStep = 'training';
      state.isTrainingReplay = true;
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
    restoreTrainingResults(state, action: PayloadAction<TrainingResults>) {
      Object.assign(state, action.payload);
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
  setPresetColumns,
  setRemovedRowsCount,
  setColumnsByDataType,
  setFeatureNumberKey,
  setReserveLocation,
  setAccuracyCheckExamples,
  setAccuracyCheckLabels,
  setAccuracyCheckPredictedLabels,
  setTrainingExamples,
  setTrainingLabels,
  setTestData,
  setTestDataValues,
  setPrediction,
  playPredictionStep,
  setPredictionPlaying,
  stepPredictionByHand,
  resetState,
  setTrainedModelDetail,
  setCurrentPanel,
  setCurrentColumn,
  setDatasetLayout,
  setHighlightDataset,
  setTrainingModalStep,
  replayTraining,
  setSaveStatus,
  restoreTrainingResults,
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
    project: AilabProject,
    trainedModel?: TrainedModel,
  ): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch, getState) => {
    const dataToSave = getTrainedModelDataToSave(
      getState(),
      project,
      trainedModel,
    );
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

export function getShowColumnClicking(state: RootState): boolean {
  return !(state.mode && state.mode.hideColumnClicking);
}

export function getHideDatasetView(state: RootState): boolean {
  return !!state.mode?.hideDatasetView;
}

export function getHideTestingView(state: RootState): boolean {
  return !!state.mode?.hideTestingView;
}

export function getPredictAvailable(
  state: RootState,
  project: AilabProject,
): boolean {
  return (
    Object.keys(state.testData).filter(
      value => state.testData[value] && state.testData[value] !== '',
    ).length === project.selectedFeatures.length
  );
}

// Builds {prev, next} and reads the I18n global for button text, so it is not
// memoized on Redux state. App selects it with a prev/next-aware equality fn so
// the new object reference doesn't trigger unnecessary rerenders.
export function getPanelButtons(
  state: RootState,
  project: AilabProject,
): PrevNextButtons {
  return prevNextButtons(state, project);
}

export function readyToTrain(project: AilabProject): boolean {
  return uniqLabelFeaturesSelected(project);
}

/* Functions for processing data to display. */

export function getTableData(
  state: RootState,
  project: AilabProject,
  useResultsData: boolean,
): DataRow[] {
  if (useResultsData) {
    return getResultsDataInDataTableForm(state, project);
  } else {
    return state.data;
  }
}
