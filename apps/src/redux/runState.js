/**
 * This duck module tracks whether the current app's run state.
 */
import _ from 'lodash';

const SET_IS_RUNNING = 'runState/SET_IS_RUNNING';
const SET_IS_DEBUGGER_PAUSED = 'runState/SET_IS_DEBUGGER_PAUSED';
const SET_STEP_SPEED = 'runState/SET_STEP_SPEED';

const initialState = {
  isRunning: false,
  isDebuggerPaused: false,
  stepSpeed: 1
};

/**
 * Reducer for runState. It should be impossible to be debugging if not running.
 */
export default function reducer(state, action) {
  state = state || initialState;

  if (action.type === SET_IS_RUNNING) {
    return _.assign({}, state, {
      isRunning: action.isRunning,
      isDebuggerPaused: action.isRunning === false ? false : state.isDebuggerPaused
    });
  }

  if (action.type === SET_IS_DEBUGGER_PAUSED) {
    return _.assign({}, state, {
      isRunning: action.isDebuggerPaused ? true : state.isRunning,
      isDebuggerPaused: action.isDebuggerPaused,
    });
  }

  if (action.type === SET_STEP_SPEED) {
    return _.assign({}, state, {
      stepSpeed: action.stepSpeed
    });
  }

  return state;
}

/**
 * @param {boolean} isRunning - Whether the app is currently running or not.
 */
export const setIsRunning = isRunning => ({
  type: SET_IS_RUNNING,
  isRunning: isRunning
});

/**
 * @param {boolean} isDebuggerPaused - Whether the app is currently paused in the
 *   debugger
 */
export const setIsDebuggerPaused = isDebuggerPaused => ({
  type: SET_IS_DEBUGGER_PAUSED,
  isDebuggerPaused: isDebuggerPaused
});

/**
 * @param {number} stepSpeed - New step speed for student code execution,
 *        in range 0..1.
 */
export const setStepSpeed = stepSpeed => ({
  type: SET_STEP_SPEED,
  stepSpeed
});
