let state = {
  currentMode: null
};

const modes = Object.freeze({
  Training: 0,
  Predicting: 1,
  Pond: 2
});

export const setState = function(newState, onComplete = () => {}) {
  state = {...state, ...newState};
  onComplete();
};
