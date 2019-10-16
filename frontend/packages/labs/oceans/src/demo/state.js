const initialState = {
  currentMode: null,
  fishData: [],
  canvas: null,
  ctx: null,
  trainer: null,
  trainingIndex: 0
};
let state = {...initialState};

export const getState = function() {
  return state;
};

export const setState = function(newState) {
  state = {...state, ...newState};
  return state;
};
