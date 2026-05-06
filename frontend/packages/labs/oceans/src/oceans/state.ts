/** Mutable trainer instance (KNN or SVM), set during init. */
export interface Trainer {
  clearAll(): void;
}

/** Top-level application state object, threaded through all lab subsystems. */
export interface State {
  appMode: string | null;
  currentMode: number | null;
  fishData: unknown[];
  pondFish: unknown[];
  recallFish: unknown[];
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
  pondFishBounds: unknown;
  pondClickedFish: unknown;
  pondPanelShowing: boolean;
  pondPanelSide: string | null;
  pondFishMaxExplainValue: number;
  pondRecallFishMaxExplainValue: number;
  guideDismissals: string[];
  guideShowing: boolean;
  guideTypingTimer: ReturnType<typeof setTimeout> | undefined;
  showConfirmationDialog: boolean;
  confirmationDialogOnYes: (() => void) | null;
  textToSpeechLocale: string | undefined;
  hasTextToSpeechStartedByClick: boolean;
  textToSpeechCurrentGuide: string | undefined;
  /** Optional guide sequence key (e.g. 'K5') selecting which guide set to show. */
  guides: string | undefined;
  /** Word fish slots per lane index; null means the slot is unfilled. */
  wordFish: Record<number, unknown> | null;
  fishCount: number;
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
