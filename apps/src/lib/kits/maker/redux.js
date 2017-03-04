/** @file Redux reducers/actions/selectors for Maker Toolkit */
import * as Immutable from 'immutable';

// State model
const MakerState = Immutable.Record({
  enabled: false,
});

// Selectors
export function isEnabled(state) {
  return state.enabled;
}

export const selectors = {
  isEnabled,
};

// Actions
const ENABLE = 'maker/ENABLE';
export function enable() {
  return {type: ENABLE};
}

export const actions = {
  enable,
};

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
