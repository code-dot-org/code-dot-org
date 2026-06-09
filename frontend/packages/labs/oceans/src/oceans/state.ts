import type KNNTrainer from '../utils/KNNTrainer';
import type SVMTrainer from '../utils/SVMTrainer';

import type {GuideEntry} from './models/guideTypes';
import type {OceanObject} from './OceanObject';

/**
 * Runtime fish object stored in pond/recall arrays.  Implemented as
 * `FishOceanObject` at runtime; we expose the broad `OceanObject` shape
 * here so both the model layer and the render layer can read/write
 * without a per-call cast.
 */
export type PondFish = OceanObject;

/**
 * Mutable trainer instance, set during init.  KNN for pixel-classifier
 * modes (fishvtrash, creaturesvtrash{,demo}); SVM for the word-attribute
 * modes (short, long).  Consumers narrow with `instanceof` or type guards
 * before calling SVM-only methods like `explainFish`.
 */
export type Trainer = KNNTrainer<unknown> | SVMTrainer<unknown>;

/** Bounding box for a clickable fish in the pond render layer. */
export interface PondFishBound {
  fishId: number | string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Top-level application state object, threaded through all lab subsystems. */
export interface State {
  appMode: string | null;
  currentMode: number | null;
  fishData: PondFish[];
  pondFish: PondFish[];
  recallFish: PondFish[];
  showRecallFish: boolean;
  totalPondFish: number | null;
  backgroundCanvas: HTMLCanvasElement | null;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  trainer: Trainer | null;
  trainingIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  moveTime: number;
  lastStartTime: number | null;
  lastPauseTime: number;
  runStartTime: number | null;
  biasTextTime: number | null;
  canSkipPredict: boolean | null;
  canSeePondText: boolean | null;
  canSkipPond: boolean | null;
  yesCount: number;
  noCount: number;
  loadTrashImages: boolean | null;
  /** Set to true when the current mode should render sea-creature images. */
  loadCreatureImages: boolean | null;
  word: string | null;
  trainingQuestion: string | null;
  currentInstructionsPage: number;
  pondFishBounds: PondFishBound[] | null;
  pondClickedFish: {id: number | string; x: number; y: number} | null;
  pondPanelShowing: boolean;
  pondPanelSide: string | null;
  pondFishMaxExplainValue: number;
  pondRecallFishMaxExplainValue: number;
  /** Per-part importance summary for the general pond explanation panel. */
  pondExplainGeneralSummary: Array<{
    importance: number;
    partType: string;
  }> | null;
  /** Per-part impact breakdown for the currently clicked fish. */
  pondExplainFishSummary: Array<{impact: number; partType: string}> | null;
  guideDismissals: string[];
  guideShowing: boolean;
  guideTypingTimer: ReturnType<typeof setTimeout> | undefined;
  showConfirmationDialog: boolean;
  confirmationDialogOnYes: (() => void) | null;
  textToSpeechLocale: string | undefined;
  hasTextToSpeechStartedByClick: boolean;
  /** Stores the guide object for which TTS has been started (or undefined). */
  textToSpeechCurrentGuide: GuideEntry | null | undefined;
  /** Optional guide sequence key (e.g. 'K5') selecting which guide set to show. */
  guides: string | undefined;
  /** Word fish slots per lane index; null means the slot is unfilled. */
  wordFish: Record<number, PondFish | null> | null;
  fishCount: number;
  /** Whether fish are swimming in reverse (rewind mode). */
  rewind: boolean;
  /** Callback fired when the user advances past the current activity. */
  onContinue: (() => void) | undefined;
  /** Whether to display the training-mode control panel. */
  displayControls: boolean | null;
  /** Whether the training confirmation header is open/expanded. */
  headOpen: boolean | null;
  /** Timestamp when the pond fish transition animation began. */
  pondFishTransitionStartTime: number | null;
  /** Animation time scale for debugging (defaults to 1.0). */
  timeScale: number | null;
  /** Whether the confirm-exit dialog is displayed (alias for cancel workflow). */
  canSkipPredictByTime: boolean | null;
}

let setStateCallback: (() => void) | null = null;

const initialState: State = {
  appMode: null,
  currentMode: null,
  fishData: [],
  pondFish: [],
  recallFish: [],
  showRecallFish: false,
  totalPondFish: null,
  backgroundCanvas: null,
  canvas: null,
  ctx: null,
  trainer: null,
  trainingIndex: 0,
  isRunning: false,
  isPaused: false,
  moveTime: 1000,
  lastStartTime: null,
  lastPauseTime: 0,
  runStartTime: null,
  biasTextTime: null,
  canSkipPredict: null,
  canSeePondText: null,
  canSkipPond: null,
  yesCount: 0,
  noCount: 0,
  loadTrashImages: null,
  loadCreatureImages: null,
  word: null,
  trainingQuestion: null,
  currentInstructionsPage: 0,
  pondFishBounds: null,
  pondClickedFish: null,
  pondPanelShowing: false,
  pondPanelSide: null,
  pondFishMaxExplainValue: 1,
  pondRecallFishMaxExplainValue: 1,
  pondExplainGeneralSummary: null,
  pondExplainFishSummary: null,
  guideDismissals: [],
  guideShowing: false,
  guideTypingTimer: undefined,
  showConfirmationDialog: false,
  confirmationDialogOnYes: null,
  textToSpeechLocale: undefined,
  hasTextToSpeechStartedByClick: false,
  textToSpeechCurrentGuide: undefined,
  guides: undefined,
  wordFish: null,
  fishCount: 0,
  rewind: false,
  onContinue: undefined,
  displayControls: null,
  headOpen: null,
  pondFishTransitionStartTime: null,
  timeScale: null,
  canSkipPredictByTime: null,
};

let state: State = {...initialState};

/** Returns the current lab state. */
export const getState = function (): State {
  return state;
};

/**
 * Merges `newState` into the current state and fires the registered callback.
 *
 * @param newState - Partial state to merge.
 * @param options - Pass `{skipCallback: true}` to suppress the render callback.
 * @returns The merged state.
 */
export const setState = function (
  newState: Partial<State>,
  options: {skipCallback?: boolean} | null = null,
): State {
  return setStateInternal({...state, ...newState}, options);
};

/**
 * Resets to `initialState` then merges `newState`, bypassing the callback.
 *
 * @param newState - Partial state to apply on top of initial values.
 * @returns The merged state.
 */
export const setInitialState = function (newState: Partial<State>): State {
  return setStateInternal({...initialState, ...newState});
};

function setStateInternal(
  newState: State,
  options: {skipCallback?: boolean} | null = null,
): State {
  state = newState;

  if (setStateCallback && !(options && options.skipCallback)) {
    setStateCallback();
  }

  return state;
}

/**
 * Registers a function to be called whenever state changes.
 *
 * @param callback - Called after every `setState` invocation.
 */
export const setSetStateCallback = (callback: () => void): void => {
  setStateCallback = callback;
};

/** Resets state to initial values without firing the callback. */
export const resetState = (): State => {
  state = {...initialState};
  return state;
};
