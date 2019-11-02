let setStateCallback = null;

const initialState = {
  appMode: null,
  currentMode: null,
  dataSet: null,
  fishData: [],
  pondFish: [],
  backgroundCanvas: null,
  canvas: null,
  ctx: null,
  trainer: null,
  trainingIndex: 0,
  iterationCount: 0,
  isRunning: false,
  yesCount: 0,
  noCount: 0,
  canSkipPredict: false,
  loadTrashImages: null,
  currentInstructionsPage: 0
};
let state = {...initialState};

export const getState = function() {
  return state;
};

export const setState = function(newState) {
  state = {...state, ...newState};

  if (setStateCallback) {
    setStateCallback();
  }

  return state;
};

export const setSetStateCallback = callback => {
  setStateCallback = callback;
};
