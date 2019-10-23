const initialState = {
  currentMode: null,
  fishData: [],
  pondFish: [],
  backgroundCanvas: null,
  canvas: null,
  ctx: null,
  trainer: null,
  trainingIndex: 0,
  uiContainer: null,
  uiElements: [],
  headerContainer: null,
  headerElements: [],
  footerContainer: null,
  footerElements: [],
  iterationCount: 0,
  isRunning: false
};
let state = {...initialState};

export const getState = function() {
  return state;
};

export const setState = function(newState) {
  state = {...state, ...newState};
  return state;
};
