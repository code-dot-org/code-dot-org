/*
  The student's work on a level, as saved between visits. It keeps the
  choices that produced the latest model rather than the model or the dataset
  rows: a visit reloads the level's dataset and retrains from these choices.
*/
import {createSelector} from 'reselect';

import {
  isPanelAvailable,
  isPanelEnabled,
  isTrainedOnCurrentColumns,
} from './helpers/navigationValidation';
import type {RootState} from './redux';
import {
  addSelectedFeature,
  readyToTrain,
  setCurrentPanel,
  setHistoricResults,
  setLabelColumn,
  setSaveStatus,
  setTrainedModelDetails,
} from './redux';
import {store} from './store';
import train from './train';
import type {HistoricResult, Panel, TrainedModelDetailsSave} from './types';
import {CONTENT_PANELS} from './types';

export const SNAPSHOT_VERSION = 1;

export interface AilabSnapshot {
  version: typeof SNAPSHOT_VERSION;
  datasetId: string | undefined;
  labelColumn: string | undefined;
  selectedFeatures: string[];
  /** Whether a model was trained on the current label and features. */
  trained: boolean;
  /** Seed of the latest training's random test split. */
  splitSeed: number | undefined;
  modelSaved: boolean;
  trainedModelDetails: TrainedModelDetailsSave;
  historicResults: HistoricResult[];
  currentPanel: Panel;
}

const isTrained = (state: RootState): boolean =>
  !!state.trainedModel && isTrainedOnCurrentColumns(state);

export const selectSnapshot = createSelector(
  [
    (state: RootState) => state.datasetId,
    (state: RootState) => state.labelColumn,
    (state: RootState) => state.selectedFeatures,
    isTrained,
    (state: RootState) => state.splitSeed,
    (state: RootState) => state.saveStatus === 'success',
    (state: RootState) => state.trainedModelDetails,
    (state: RootState) => state.historicResults,
    (state: RootState) => state.currentPanel,
  ],
  (
    datasetId,
    labelColumn,
    selectedFeatures,
    trained,
    splitSeed,
    modelSaved,
    trainedModelDetails,
    historicResults,
    currentPanel,
  ): AilabSnapshot => ({
    version: SNAPSHOT_VERSION,
    datasetId,
    labelColumn,
    selectedFeatures,
    trained,
    splitSeed: trained ? splitSeed : undefined,
    modelSaved,
    trainedModelDetails,
    historicResults,
    currentPanel,
  }),
);

// Start Over clears the student's work but keeps their past results.
export function startOverSnapshot(state: RootState): AilabSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    datasetId: state.datasetId,
    labelColumn: undefined,
    selectedFeatures: [],
    trained: false,
    splitSeed: undefined,
    modelSaved: false,
    trainedModelDetails: {},
    historicResults: state.historicResults,
    currentPanel: 'datasetView',
  };
}

/**
 * Replay a snapshot onto a freshly loaded level. Call once the level's
 * dataset and metadata have loaded. Columns the dataset no longer has are
 * dropped, and a snapshot of another dataset is ignored.
 */
export function restoreSnapshot(snapshot: AilabSnapshot): void {
  const loaded = store.getState();
  if (
    snapshot.version !== SNAPSHOT_VERSION ||
    snapshot.datasetId !== loaded.datasetId
  ) {
    return;
  }

  const columns = Object.keys(loaded.data[0] ?? {});
  if (
    !loaded.mode?.hideSelectLabel &&
    snapshot.labelColumn &&
    columns.includes(snapshot.labelColumn)
  ) {
    store.dispatch(setLabelColumn(snapshot.labelColumn));
  }
  const {labelColumn} = store.getState();
  (snapshot.selectedFeatures ?? [])
    .filter(feature => columns.includes(feature) && feature !== labelColumn)
    .forEach(feature => store.dispatch(addSelectedFeature(feature)));

  store.dispatch(setTrainedModelDetails(snapshot.trainedModelDetails ?? {}));
  store.dispatch(setHistoricResults(snapshot.historicResults ?? []));

  const selected = store.getState();
  if (
    snapshot.trained &&
    readyToTrain(selected) &&
    isTrainedOnCurrentColumns(selected)
  ) {
    train.init(store, snapshot.splitSeed);
    train.restoreTraining();
  }
  if (snapshot.modelSaved) {
    store.dispatch(setSaveStatus('success'));
  }

  store.dispatch(
    setCurrentPanel(restorablePanel(store.getState(), snapshot.currentPanel)),
  );
}

function restorablePanel(state: RootState, panel: Panel): Panel {
  const reachable =
    !!state.trainedModel &&
    (CONTENT_PANELS as readonly string[]).includes(panel) &&
    isPanelAvailable(state, panel) &&
    isPanelEnabled(state, panel);
  return reachable ? panel : 'datasetView';
}
