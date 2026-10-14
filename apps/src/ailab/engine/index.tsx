import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';
import {ThemeProvider} from '@mui/material/styles';
import React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {Provider} from 'react-redux';

import App, {type AppProps} from './App';
import {getAssetPath, setAssetPath} from './assetPath';
import {TestDataLocations} from './constants';
import {invalidatePendingDatasetLoads} from './datasetLoad';
import {
  type Dataset,
  getAvailableDatasets,
  getDatasets,
} from './datasetManifest';
import {setMetricsLogger} from './helpers/metrics';
import I18n from './i18n';
import {loadDataset} from './loadDataset';
import {ProjectProvider} from './ProjectContext';
import {
  setMode,
  setCurrentPanel,
  setSelectedCSV,
  setSelectedJSON,
  setSelectedName,
  setReserveLocation,
  setInstructionsDismissed,
  setInstructionsEnabled,
  resetState,
} from './redux';
import {store} from './store';
import train from './train';
import {TrainingDataProvider} from './TrainingDataContext';
import type {Mode} from './types';

let root: Root | undefined;

export interface MountOptions extends AppProps {
  /** Base path the consumer serves the lab's datasets/images from. */
  assetPath: string;
  i18n?: Record<string, string>;
  logMetric?: (eventName: string, details: Record<string, unknown>) => void;
}

export interface InitAllOptions extends MountOptions {
  mode?: Mode;
}

/**
 * Render the lab and wire the session-scoped consumer callbacks. Idempotent:
 * once mounted, further calls are ignored.
 *
 * @param {Object} options.i18n Optional. Object where each method returns the
 * locale relevant string to display. If undefined, English strings are used.
 */
export const mount = function (options: MountOptions): void {
  if (root) {
    console.warn(
      'ailab already mounted; ignoring subsequent calls to mount().'
    );
    return;
  }
  setAssetPath(options.assetPath);
  I18n.initI18n(options.i18n);
  if (options.logMetric) {
    setMetricsLogger(options.logMetric);
  }
  // Dispatching early so instructions enabled state is set before processMode().
  store.dispatch(setInstructionsEnabled(!!options.setInstructionsKey));

  root = createRoot(document.getElementById('root')!);
  // Code Studio's MUI theme does not reach into this separate React root.
  root.render(
    <Provider store={store}>
      <ProjectProvider>
        <TrainingDataProvider>
          <ThemeProvider
            theme={getMuiThemeForBrand(document.documentElement.dataset.brand)}
          >
            <App {...options} />
          </ThemeProvider>
        </TrainingDataProvider>
      </ProjectProvider>
    </Provider>
  );
};

/**
 * Tears down the lab.
 */
export const unmount = function (): void {
  root?.unmount();
  root = undefined;
};

/**
 * Prepare the lab for a level. Call this once per level after mount().
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

/**
 * Mount the lab and load its initial level data in one call.
 */
export const initAll = function (options: InitAllOptions): void {
  mount(options);
  loadLevel(options.mode);
};

export const instructionsDismissed = function (): void {
  store.dispatch(setInstructionsDismissed());
};

// Process an optional mode.
const processMode = (mode: Mode | undefined): void => {
  const assetPath = getAssetPath();

  const reserveLocation = mode?.reserveLastRows
    ? TestDataLocations.END
    : TestDataLocations.RANDOM;
  store.dispatch(setReserveLocation(reserveLocation));

  // The dataset picker is hidden for now, so a mode without exactly one
  // dataset loads the first one the picker would have listed.
  const item =
    mode?.datasets?.length === 1
      ? getDatasets().find((item: Dataset) => item.id === mode.datasets![0])
      : getAvailableDatasets(mode?.datasets)[0];
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

// Export a few types.
export type {
  InstructionsKey,
  Metadata,
  Mode,
  ModelDataToSave,
  SaveResponse,
} from './types';
export {INSTRUCTIONS_KEYS} from './types';
export {selectableColumns} from './helpers/columnDetails';
export type {Lab2Instructions} from './lab2Instructions';
export {LAB2_INSTRUCTIONS} from './lab2Instructions';
export type {Dataset} from './datasetManifest';
export {
  getAvailableDatasets,
  getDatasets,
  getRawDatasets,
} from './datasetManifest';
