import {getAssetPath} from './assetPath';
import {TestDataLocations} from './constants';
import {invalidatePendingDatasetLoads} from './datasetLoad';
import {type Dataset, getDatasets} from './datasetManifest';
import {loadDataset} from './loadDataset';
import {
  setMode,
  setCurrentPanel,
  setSelectedCSV,
  setSelectedJSON,
  setSelectedName,
  setReserveLocation,
  resetState,
} from './redux';
import {store} from './store';
import train from './train';
import type {Mode} from './types';

/**
 * Prepare the lab for a level. AilabEngine calls this once per level.
 */
export const loadLevel = function (mode?: Mode): void {
  reload(mode, /*keepHistoricResults*/ false);
};

export const startOver = function (): void {
  reload(store.getState().mode, /*keepHistoricResults*/ true);
};

const reload = (mode: Mode | undefined, keepHistoricResults: boolean): void => {
  invalidatePendingDatasetLoads();
  store.dispatch(resetState(keepHistoricResults));
  train.reset();
  store.dispatch(setMode(mode));
  processMode(mode);
};

// Process an optional mode.
const processMode = (mode: Mode | undefined): void => {
  const assetPath = getAssetPath();

  const reserveLocation = mode?.reserveLastRows
    ? TestDataLocations.END
    : TestDataLocations.RANDOM;
  store.dispatch(setReserveLocation(reserveLocation));

  const onlyDatasetId =
    mode?.datasets?.length === 1 ? mode.datasets[0] : undefined;
  if (!onlyDatasetId) {
    store.dispatch(setCurrentPanel('selectDataset'));
    return;
  }

  const item = getDatasets().find((item: Dataset) => item.id === onlyDatasetId);
  if (!item) {
    console.error('AI Lab could not find a dataset to load.');
    return;
  }

  store.dispatch(setSelectedName(item.name));
  store.dispatch(setSelectedCSV(assetPath + item.path));
  store.dispatch(setSelectedJSON(assetPath + item.metadataPath));
  loadDataset(assetPath + item.path, assetPath + item.metadataPath);

  store.dispatch(setCurrentPanel('datasetView'));
};
