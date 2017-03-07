/** @file Redux reducers/actions/selectors for Maker Toolkit */
import * as Immutable from 'immutable';

// State model
const MakerState = Immutable.Record({
  enabled: false,
});

// Selectors
function getRoot(state) {
  // Global knowledge eww
  return state.maker;
}

export function isEnabled(state) {
  return getRoot(state).enabled;
}

// Actions
const ENABLE = 'maker/ENABLE';
export function enable() {
  return {type: ENABLE};
}

// Reducer
export function reducer(state, action) {
  if (!state) {
    state = new MakerState();
  }

  if (action.type === ENABLE) {
    return state.set('enabled', true);
  }

  return state;
}
