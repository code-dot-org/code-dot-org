const initialState = {
  currentMode: null,
  fishData: [],
  canvas: null,
  ctx: null,
  trainer: null,
  trainingIndex: 0,
  backgroundImg: null,
  uiDrawn: false
};
let state = {...initialState};

export const getState = function() {
  return state;
};

export const setState = function(newState) {
  if (newState.currentMode) {
    state = {
      ...initialState,
      fishData: state.fishData,
      trainer: state.trainer,
      ...newState
    };
  } else {
    state = {...state, ...newState};
  }

  return state;
};
