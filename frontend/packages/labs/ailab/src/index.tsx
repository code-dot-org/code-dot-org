import {ThemeProvider} from '@mui/material/styles';
import {createRoot, type Root} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';

import App, {type AppProps} from './App';
import {getAssetPath, setAssetPath} from './assetPath';
import {TestDataLocations} from './constants';
import {parseCSV} from './csvReaderWrapper';
import type {Dataset} from './datasetManifest';
import {getAvailableDatasets, getDatasets} from './datasetManifest';
import {setMetricsLogger} from './helpers/metrics';
import I18n from './i18n';
import {parseJSON} from './jsonReaderWrapper';
import {
  setMode,
  setCurrentPanel,
  setDatasetId,
  setSelectedCSV,
  setSelectedJSON,
  setSelectedName,
  setReserveLocation,
  setInstructionsDismissed,
  setInstructionsEnabled,
  resetState,
  setHistoricResults,
} from './redux';
import {
  type AilabSnapshot,
  restoreSnapshot,
  selectSnapshot,
  startOverSnapshot,
} from './snapshot';
import {store} from './store';
import train from './train';
import type {Mode} from './types';

let root: Root | undefined;
let unsubscribe: (() => void) | undefined;
let onStateChange: ((snapshot: AilabSnapshot) => void) | undefined;
let lastSnapshot: AilabSnapshot | undefined;
// Bumped by every loadLevel, so a slower earlier load can tell it lost.
let loadCount = 0;
// Until a level's saved work is restored, its half-loaded state is not reported.
let restoring = false;

export interface MountOptions extends AppProps {
  /** Base path the consumer serves the lab's datasets/images from. */
  assetPath: string;
  i18n?: Record<string, string>;
  logMetric?: (eventName: string, details: Record<string, unknown>) => void;
  /** Called with the student's work each time it changes, for the consumer to save. */
  onStateChange?: (snapshot: AilabSnapshot) => void;
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

  onStateChange = options.onStateChange;
  lastSnapshot = selectSnapshot(store.getState());
  unsubscribe = store.subscribe(() => {
    if (restoring) {
      return;
    }
    const snapshot = selectSnapshot(store.getState());
    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      onStateChange?.(snapshot);
    }
  });

  root = createRoot(document.getElementById('root')!);
  // Code Studio's MUI theme does not reach into this separate React root.
  root.render(
    <Provider store={store}>
      <ThemeProvider
        theme={getMuiThemeForBrand(document.documentElement.dataset.brand)}
      >
        <App {...options} />
      </ThemeProvider>
    </Provider>,
  );
};

/**
 * Tears down the lab.
 */
export const unmount = function (): void {
  unsubscribe?.();
  unsubscribe = undefined;
  onStateChange = undefined;
  root?.unmount();
  root = undefined;
};

/**
 * Prepare the lab for a level. Call this once per level after mount().
 * `snapshot` is the student's saved work on this level, if any.
 */
export const loadLevel = function (
  mode?: Mode,
  snapshot?: AilabSnapshot,
): Promise<void> {
  return load(mode, snapshot, false);
};

export const startOver = function (): Promise<void> {
  const state = store.getState();
  const loaded = load(state.mode, startOverSnapshot(state), true);
  // Shown at once, rather than after the dataset reloads.
  store.dispatch(setHistoricResults(state.historicResults));
  return loaded;
};

// With `report`, the restored state is reported as a change; otherwise it
// counts as what the consumer already has.
const load = async (
  mode: Mode | undefined,
  snapshot: AilabSnapshot | undefined,
  report: boolean,
): Promise<void> => {
  const thisLoad = ++loadCount;
  const isCurrent = () => thisLoad === loadCount;
  restoring = true;
  store.dispatch(resetState());
  train.reset();
  store.dispatch(setMode(mode));
  await processMode(mode, isCurrent);
  if (!isCurrent()) {
    return;
  }
  if (snapshot) {
    restoreSnapshot(snapshot);
  }
  restoring = false;
  const restored = selectSnapshot(store.getState());
  if (report && restored !== lastSnapshot) {
    onStateChange?.(restored);
  }
  lastSnapshot = restored;
};

/**
 * Mount the lab and load its initial level data in one call.
 */
export const initAll = function (options: InitAllOptions): void {
  mount(options);
  void loadLevel(options.mode);
};

export const instructionsDismissed = function (): void {
  store.dispatch(setInstructionsDismissed());
};

// Process an optional mode. Resolves once the dataset and its metadata load.
const processMode = async (
  mode: Mode | undefined,
  isCurrent: () => boolean,
): Promise<void> => {
  const assetPath = getAssetPath();

  const reserveLocation = mode?.randomizeTestData
    ? TestDataLocations.RANDOM
    : TestDataLocations.END;
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

  store.dispatch(setDatasetId(item.id));
  store.dispatch(setSelectedName(item.name));
  store.dispatch(setSelectedCSV(assetPath + item.path));
  store.dispatch(setSelectedJSON(assetPath + item.metadataPath));
  store.dispatch(setCurrentPanel('datasetView'));

  await Promise.all([
    parseCSV(assetPath + item.path, true, false, isCurrent),
    // Also retrieve model metadata and set column data types.
    parseJSON(assetPath + item.metadataPath, isCurrent),
  ]);
};

// Export a few types.
export type {
  InstructionsKey,
  Mode,
  ModelDataToSave,
  SaveResponse,
} from './types';
export {INSTRUCTIONS_KEYS} from './types';
export type {AilabSnapshot} from './snapshot';
export type {Lab2Instructions} from './lab2Instructions';
export {LAB2_INSTRUCTIONS} from './lab2Instructions';
export type {Dataset} from './datasetManifest';
export {
  getAvailableDatasets,
  getDatasets,
  getRawDatasets,
} from './datasetManifest';
