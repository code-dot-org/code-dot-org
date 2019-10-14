let state = {
  currentMode: null
};

export const getState = function() {
  return state;
};

export const setState = function(newState, onComplete = () => {}) {
  console.log("setState", newState);

  state = {...state, ...newState};
  onComplete();
};
