import {getStore} from '@cdo/apps/redux';

import {
  REQUEST_LOCATION,
  CANCEL_LOCATION_SELECTION,
  SELECT_LOCATION,
  UPDATE_LOCATION,
} from '../actions';
import {LocationPickerMode} from '../spritelab/constants';

export default function locationPicker(state, action) {
  state = state || {
    mode: LocationPickerMode.IDLE,
  };
  switch (action.type) {
    case REQUEST_LOCATION:
      return {
        ...state,
        mode: LocationPickerMode.SELECTING,
        lastSelection: action.value,
        requestTime: Date.now(),
      };
    case CANCEL_LOCATION_SELECTION:
      return {
        ...state,
        mode: LocationPickerMode.IDLE,
        lastSelection: undefined,
      };
    case SELECT_LOCATION:
      return {
        ...state,
        mode: LocationPickerMode.IDLE,
        lastSelection: action.value,
      };
    case UPDATE_LOCATION:
      return {
        ...state,
        mode: LocationPickerMode.SELECTING,
        lastSelection: action.value,
      };
    default:
      return state;
  }
}

export function requestLocation(initialValue) {
  return {
    type: REQUEST_LOCATION,
    value: initialValue,
  };
}

export function updateLocation(loc) {
  return {
    type: UPDATE_LOCATION,
    value: loc,
  };
}

export function selectLocation(loc) {
  return {
    type: SELECT_LOCATION,
    value: loc,
  };
}

export function cancelLocationSelection() {
  return {
    type: CANCEL_LOCATION_SELECTION,
  };
}

export function isPickingLocation(state) {
  return state.mode === LocationPickerMode.SELECTING;
}

export function getLocation(initialValue, candidateHandler, completeHandler) {
  candidateHandler = candidateHandler || (() => {});
  completeHandler = completeHandler || (() => {});

  const store = getStore();
  store.dispatch(requestLocation(initialValue));
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state.locationPicker.mode === LocationPickerMode.SELECTING) {
      candidateHandler(state.locationPicker.lastSelection);
    } else {
      completeHandler(state.locationPicker.lastSelection);
      unsubscribe();
    }
  });
}
