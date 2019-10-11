let state = {
  currentMode: null
};

export const getState = function() {
  return state;
};

export const setState = function(newState, onComplete = () => {}) {
  state = {...state, ...newState};
  onComplete();
};
