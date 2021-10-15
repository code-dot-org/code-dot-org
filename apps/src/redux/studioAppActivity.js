const SET_IDLE_TIME = 'instructions/SET_IDLE_TIME';

const instructionsInitialState = {
  idleTimeMs: 0
};

export default function reducer(state = instructionsInitialState, action) {
  if (action.type === SET_IDLE_TIME) {
    return Object.assign({}, state, {
      idleTimeMs: action.idleTimeMs
    });
  }

  return state;
}

export const setIdleTimeMs = idleTimeMs => ({
  type: SET_IDLE_TIME,
  idleTimeMs
});
