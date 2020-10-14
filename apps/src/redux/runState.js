/**
 * This duck module tracks whether the current app's run state.
 */
import _ from 'lodash';

const SET_IS_RUNNING = 'runState/SET_IS_RUNNING';
const SET_IS_EDIT_WHILE_RUN = 'runState/SET_IS_EDIT_WHILE_RUN';
const SET_IS_DEBUGGER_PAUSED = 'runState/SET_IS_DEBUGGER_PAUSED';
const SET_STEP_SPEED = 'runState/SET_STEP_SPEED';
const SET_AWAITING_CONTAINED_RESPONSE =
  'runState/SET_AWAITING_CONTAINED_RESPONSE';
const SET_IS_DEBUGGING_SPRITES = 'runState/SET_IS_DEBUGGING_SPRITES';

const initialState = {
  isRunning: false,
  isEditWhileRun: false,
  isDebuggerPaused: false,
  nextStep: null,
  stepSpeed: 1,
  isDebuggingSprites: false,
  // true when waiting for user to provide an answer to a contained level
  awaitingContainedResponse: false
};

/**
 * Reducer for runState. It should be impossible to be debugging if not running.
 */
export default function reducer(state, action) {
  state = state || initialState;

  if (action.type === SET_IS_RUNNING) {
    return _.assign({}, state, {
      isRunning: action.isRunning,
      isDebuggerPaused:
        action.isRunning === false ? false : state.isDebuggerPaused,
      isDebuggingSprites:
        action.isRunning === false ? false : state.isDebuggingSprites
    });
  }

  if (action.type === SET_IS_EDIT_WHILE_RUN) {
    return _.assign({}, state, {
      isEditWhileRun: action.isEditWhileRun
    });
  }

  if (action.type === SET_IS_DEBUGGER_PAUSED) {
    return _.assign({}, state, {
      isRunning: action.isDebuggerPaused ? true : state.isRunning,
      isDebuggerPaused: action.isDebuggerPaused,
      nextStep: action.nextStep
    });
  }

  if (action.type === SET_STEP_SPEED) {
    if (typeof action.stepSpeed === 'number') {
      return _.assign({}, state, {
        stepSpeed: action.stepSpeed
      });
    }
  }

  if (action.type === SET_AWAITING_CONTAINED_RESPONSE) {
    if (state.awaitingContainedResponse !== action.awaitingContainedResponse) {
      return {
        ...state,
        awaitingContainedResponse: action.awaitingContainedResponse
      };
    }
  }

  if (action.type === SET_IS_DEBUGGING_SPRITES && state.isRunning) {
    return {
      ...state,
      isDebuggingSprites: action.isDebuggingSprites
    };
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
 * @param {boolean} isRunning - Whether the app is currently running or not.
 */
export const setIsEditWhileRun = isEditWhileRun => ({
  type: SET_IS_EDIT_WHILE_RUN,
  isEditWhileRun: isEditWhileRun
});

/**
 * @param {boolean} isDebuggerPaused - Whether the app is currently paused in the
 *   debugger
 * @param {JSInterpreter.StepType} nextStep - the next step of the interpreter
 */
export const setIsDebuggerPaused = (isDebuggerPaused, nextStep) => ({
  type: SET_IS_DEBUGGER_PAUSED,
  isDebuggerPaused: isDebuggerPaused,
  nextStep
});

/**
 * @param {number} stepSpeed - New step speed for student code execution,
 *        in range 0..1.
 */
export const setStepSpeed = stepSpeed => ({
  type: SET_STEP_SPEED,
  stepSpeed
});

export const setAwaitingContainedResponse = awaitingContainedResponse => ({
  type: SET_AWAITING_CONTAINED_RESPONSE,
  awaitingContainedResponse
});

/**
 * @param {boolean} isDebuggingSprites - Whether the app is currently debugging
 *        sprites or not.
 */
export const setIsDebuggingSprites = isDebuggingSprites => ({
  type: SET_IS_DEBUGGING_SPRITES,
  isDebuggingSprites: isDebuggingSprites
});
