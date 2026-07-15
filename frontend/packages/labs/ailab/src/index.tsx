import {createRoot, type Root} from 'react-dom/client';
import {Provider} from 'react-redux';

import App, {type AppProps} from './App';
import {getAssetPath, setAssetPath} from './assetPath';
import {TestDataLocations} from './constants';
import {parseCSV} from './csvReaderWrapper';
import type {Dataset} from './datasetManifest';
import {getDatasets} from './datasetManifest';
import {setMetricsLogger} from './helpers/metrics';
import I18n from './i18n';
import {parseJSON} from './jsonReaderWrapper';
import {
  setMode,
  setCurrentPanel,
  setSelectedCSV,
  setSelectedJSON,
  setReserveLocation,
  setInstructionsDismissed,
  setInstructionsEnabled,
  resetState,
} from './redux';
import {store} from './store';
import train from './train';
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
      'ailab already mounted; ignoring subsequent calls to mount().',
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
  root.render(
    <Provider store={store}>
      <App {...options} />
    </Provider>,
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
  store.dispatch(resetState());
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
  let panelSet = false;

  if (mode) {
    // Load a single dataset immediately.
    if (mode.datasets && mode.datasets.length === 1) {
      const item = getDatasets().filter((item: Dataset) => {
        return item.id === mode.datasets![0];
      })[0];
      store.dispatch(setSelectedCSV(assetPath + item.path));
      store.dispatch(setSelectedJSON(assetPath + item.metadataPath));
      // TODO - Fix race condition: parseCSV and parseJSON dispatch into the store 
      // directly and are fire-and-forget, so an in-flight load from a prior 
      // level/dataset can resolve after a newer loadLevel and clobber state.
      parseCSV(assetPath + item.path, true, false);

      // Also retrieve model metadata and set column data types.
      parseJSON(assetPath + item.metadataPath);

      if (mode.hideSelectLabel) {
        store.dispatch(setCurrentPanel('dataDisplayFeatures'));
      } else {
        store.dispatch(setCurrentPanel('dataDisplayLabel'));
      }
      panelSet = true;
    }
  }

  const reserveLocation = mode?.randomizeTestData
    ? TestDataLocations.RANDOM
    : TestDataLocations.END;
  store.dispatch(setReserveLocation(reserveLocation));

  if (!panelSet) {
    store.dispatch(setCurrentPanel('selectDataset'));
  }
};

// Export a few types.
export type {
  InstructionsKey,
  Mode,
  ModelDataToSave,
  SaveResponse,
} from './types';
export {INSTRUCTIONS_KEYS} from './types';
export type {Dataset} from './datasetManifest';
export {getAvailableDatasets, getDatasets} from './datasetManifest';
