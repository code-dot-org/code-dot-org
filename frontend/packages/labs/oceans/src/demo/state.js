let state = {
  currentMode: null,
  fishData: []
};

export const getState = function() {
  return state;
};

export const setState = function(newState) {
  console.log('setState', newState);
  state = {...state, ...newState};
};
