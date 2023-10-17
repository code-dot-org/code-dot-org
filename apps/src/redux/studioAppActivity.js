const SET_START_IDLE = 'studioAppActivity/SET_START_IDLE';
const SET_END_IDLE = 'studioAppActivity/SET_END_IDLE';
const RESET_IDLE_TIME = 'studioAppActivity/RESET_IDLE_TIME';

const studioAppActivityInitialState = {
  idleTimeSinceLastReport: 0,
  idleStart: null,
  isIdle: false,
};

export default function reducer(state = studioAppActivityInitialState, action) {
  if (action.type === SET_START_IDLE) {
    return Object.assign({}, state, {
      isIdle: true,
      idleStart: new Date().getTime(),
    });
  }

  if (action.type === SET_END_IDLE) {
    if (state.idleStart) {
      const newIdleTime =
        state.idleTimeSinceLastReport + timeSinceIdleStart(state);

      return Object.assign({}, state, {
        isIdle: false,
        idleTimeSinceLastReport: newIdleTime,
      });
    } else {
      return state;
    }
  }

  if (action.type === RESET_IDLE_TIME) {
    const idleStart = state.isIdle ? new Date().getTime() : null;

    return Object.assign({}, state, {
      idleTimeSinceLastReport: 0,
      idleStart,
    });
  }

  return state;
}

const timeSinceIdleStart = state => {
  const now = new Date().getTime();
  return now - state.idleStart;
};

export const setStartIdle = () => ({
  type: SET_START_IDLE,
});

export const setEndIdle = () => ({
  type: SET_END_IDLE,
});

export const resetIdleTime = () => ({
  type: RESET_IDLE_TIME,
});

export const getIdleTimeSinceLastReport = state => {
  if (state.isIdle) {
    return state.idleTimeSinceLastReport + timeSinceIdleStart(state);
  } else {
    return state.idleTimeSinceLastReport;
  }
};
