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
    // When mode changes, reset backgroundImg and uiDrawn.
    state = {
      ...state,
      backgroundImg: null,
      uiDrawn: false,
      ...newState
    };
  } else {
    state = {...state, ...newState};
  }

  return state;
};
