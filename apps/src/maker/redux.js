/** @file Redux reducers/actions/selectors for Maker Toolkit */
import * as Immutable from 'immutable';

// connection states
const DISCONNECTED = 'connectionState/DISCONNECTED';
const CONNECTING = 'connectionState/CONNECTING';
const CONNECTED = 'connectionState/CONNECTED';
const CONNECTION_ERROR = 'connectionState/CONNECTION_ERROR';

// State model
const MakerState = Immutable.Record({
  enabled: false,
  connectionState: DISCONNECTED,
  connectionError: null,
  usingVirtualBoardNextTime: false,
});

// Selectors
function getRoot(state) {
  // Default value allows non-maker code to refer to Maker selectors safely,
  // even in contexts where Maker isn't provided or Redux isn't set up.
  return (state && state.maker) || new MakerState();
}

export function isEnabled(state) {
  return getRoot(state).enabled;
}

export function isAvailable(state) {
  return !!(state && state.maker);
}

export function isConnecting(state) {
  return getRoot(state).connectionState === CONNECTING;
}

export function isConnected(state) {
  return getRoot(state).connectionState === CONNECTED;
}

export function hasConnectionError(state) {
  return getRoot(state).connectionState === CONNECTION_ERROR;
}

export function getConnectionError(state) {
  return getRoot(state).connectionError;
}

export function shouldRunWithVirtualBoard(state) {
  return getRoot(state).usingVirtualBoardNextTime;
}

// Actions
const ENABLE = 'maker/ENABLE';
export function enable() {
  return {type: ENABLE};
}

const START_CONNECTING = 'maker/START_CONNECTING';
export function startConnecting() {
  return {type: START_CONNECTING};
}

const REPORT_CONNECTED = 'maker/REPORT_CONNECTED';
export function reportConnected() {
  return {type: REPORT_CONNECTED};
}

const REPORT_CONNECTION_ERROR = 'maker/REPORT_CONNECTION_ERROR';
export function reportConnectionError(error) {
  return {type: REPORT_CONNECTION_ERROR, error};
}

const DISCONNECT = 'maker/DISCONNECT';
export function disconnect() {
  return {type: DISCONNECT};
}

const USE_VIRTUAL_BOARD_ON_NEXT_RUN = 'maker/USE_VIRTUAL_BOARD_ON_NEXT_RUN';
export function useVirtualBoardOnNextRun() {
  return {type: USE_VIRTUAL_BOARD_ON_NEXT_RUN};
}

// Reducer
export function reducer(state = new MakerState(), action) {
  if (action.type === ENABLE) {
    return state.set('enabled', true);
  } else if (action.type === START_CONNECTING) {
    return state.set('connectionState', CONNECTING);
  } else if (action.type === REPORT_CONNECTED) {
    return state.merge({
      connectionState: CONNECTED,
    });
  } else if (action.type === REPORT_CONNECTION_ERROR) {
    return state.merge({
      connectionState: CONNECTION_ERROR,
      connectionError: action.error,
    });
  } else if (action.type === DISCONNECT) {
    return state.merge({
      connectionState: DISCONNECTED,
      connectionError: null,
    });
  } else if (action.type === USE_VIRTUAL_BOARD_ON_NEXT_RUN) {
    return state.set('usingVirtualBoardNextTime', true);
  }

  return state;
}
