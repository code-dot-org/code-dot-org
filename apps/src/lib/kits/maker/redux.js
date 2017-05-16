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
  usingFakeBoardNextTime: false,
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

export function isConnecting(state) {
  return getRoot(state).connectionState === CONNECTING;
}

export function isConnected(state) {
  return getRoot(state).connectionState === CONNECTED;
}

export function hasConnectionError(state) {
  return getRoot(state).connectionState === CONNECTION_ERROR;
}

export function shouldRunWithFakeBoard(state) {
  return getRoot(state).usingFakeBoardNextTime;
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
export function reportConnectionError() {
  return {type: REPORT_CONNECTION_ERROR};
}

const DISCONNECT = 'maker/DISCONNECT';
export function disconnect() {
  return {type: DISCONNECT};
}

const USE_FAKE_BOARD_ON_NEXT_RUN = 'maker/USE_FAKE_BOARD_ON_NEXT_RUN';
export function useFakeBoardOnNextRun() {
  return {type: USE_FAKE_BOARD_ON_NEXT_RUN};
}

// Reducer
export function reducer(state = new MakerState(), action) {
  if (action.type === ENABLE) {
    return state.set('enabled', true);
  } else if (action.type === START_CONNECTING) {
    return state.set('connectionState', CONNECTING);
  } else if (action.type === REPORT_CONNECTED) {
    return state.merge({
      'connectionState': CONNECTED,
      'usingFakeBoardNextTime': false,
    });
  } else if (action.type === REPORT_CONNECTION_ERROR) {
    return state.set('connectionState', CONNECTION_ERROR);
  } else if (action.type === DISCONNECT) {
    return state.set('connectionState', DISCONNECTED);
  } else if (action.type === USE_FAKE_BOARD_ON_NEXT_RUN) {
    return state.set('usingFakeBoardNextTime', true);
  }

  return state;
}
