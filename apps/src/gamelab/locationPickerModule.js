import {
  REQUEST_LOCATION,
  CANCEL_LOCATION_SELECTION,
  SELECT_LOCATION,
  UPDATE_LOCATION,
} from './actions';
import {LocationPickerMode} from './constants';
import {getStore} from '../redux';

export default function locationPicker(state, action) {
  state = state || {
    mode: LocationPickerMode.IDLE,
  };
  switch (action.type) {
    case REQUEST_LOCATION:
      return {
        ...state,
        mode: LocationPickerMode.SELECTING,
      };
    case CANCEL_LOCATION_SELECTION:
      return {
        mode: LocationPickerMode.IDLE,
      };
    case SELECT_LOCATION:
      return {
        mode: LocationPickerMode.IDLE,
        lastSelection: action.value,
      };
    case UPDATE_LOCATION:
      return {
        mode: LocationPickerMode.SELECTING,
        lastSelection: action.value,
      };
    default:
      return state;
  }
}

export function requestLocation() {
  return {
    type: REQUEST_LOCATION,
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

export async function getLocation(update) {
  const store = getStore();
  store.dispatch(requestLocation());
  window.fakeResolve = () => store.dispatch(selectLocation('{"x": 300, "y": 300}'));
  return new Promise(resolve => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.locationPicker.mode === LocationPickerMode.IDLE) {
        resolve(state.locationPicker.lastSelection);
        unsubscribe();
      } else {
        update(state.locationPicker.lastSelection);
      }
    });
  });
}
