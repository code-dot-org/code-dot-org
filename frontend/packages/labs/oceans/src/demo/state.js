const initialState = {
  currentMode: null,
  fishData: [],
  canvas: null,
  ctx: null,
  trainingIndex: 0,
  backgroundImg: null
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
      ...newState
    };
  } else {
    state = {...state, ...newState};
  }

  return state;
};
