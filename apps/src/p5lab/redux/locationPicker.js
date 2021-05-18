import {
  REQUEST_LOCATION,
  CANCEL_LOCATION_SELECTION,
  SELECT_LOCATION,
  UPDATE_LOCATION
} from '../actions';
import {LocationPickerMode} from '../spritelab/constants';
import {getStore} from '@cdo/apps/redux';

export default function locationPicker(state, action) {
  state = state || {
    mode: LocationPickerMode.IDLE
  };
  switch (action.type) {
    case REQUEST_LOCATION:
      return {
        mode: LocationPickerMode.SELECTING,
        lastSelection: undefined
      };
    case CANCEL_LOCATION_SELECTION:
      return {
        mode: LocationPickerMode.IDLE
      };
    case SELECT_LOCATION:
      return {
        mode: LocationPickerMode.IDLE,
        lastSelection: action.value
      };
    case UPDATE_LOCATION:
      return {
        mode: LocationPickerMode.SELECTING,
        lastSelection: action.value
      };
    default:
      return state;
  }
}

export function requestLocation() {
  return {
    type: REQUEST_LOCATION
  };
}

export function updateLocation(loc) {
  return {
    type: UPDATE_LOCATION,
    value: loc
  };
}

export function selectLocation(loc) {
  return {
    type: SELECT_LOCATION,
    value: loc
  };
}

export function cancelLocationSelection() {
  return {
    type: CANCEL_LOCATION_SELECTION
  };
}

export function isPickingLocation(state) {
  return state.mode === LocationPickerMode.SELECTING;
}

export function getLocation(candidateHandler, completeHandler) {
  candidateHandler = candidateHandler || (() => {});
  completeHandler = completeHandler || (() => {});

  const store = getStore();
  store.dispatch(requestLocation());
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
