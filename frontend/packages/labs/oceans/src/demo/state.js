let setStateCallback = null;

const initialState = {
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
  word: null,
  trainingQuestion: null,
  currentInstructionsPage: 0,
  pondFishBounds: null,
  pondClickedFish: null,
  guideDismissals: [],
  guideShowing: false,
  pondPanelShowing: false,
  pondPanelSide: null,
  pondFishMaxExplainValue: 1,
};
let state = {...initialState};

export const getState = function() {
  return state;
};

export const setState = function(newState, options = null) {
  return setStateInternal({...state, ...newState}, options);
};

export const setInitialState = function(newState) {
  return setStateInternal({...initialState, ...newState});
};

function setStateInternal(newState, options = null) {
  state = newState;

  if (setStateCallback && !(options && options.skipCallback)) {
    setStateCallback();
  }

  return state;
}

export const setSetStateCallback = callback => {
  setStateCallback = callback;
};
