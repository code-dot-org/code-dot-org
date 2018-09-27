import {SET_SONG} from './actions';
import {getStore} from '../redux';

export default function songSelector(state, action) {
  state = state || {
    mode: "IDLE",
  };
  switch (action.type) {
    case SET_SONG:
      return {
        mode: "SET_SONG",
        lastSelection: action.value,
      };
    default:
      return state;
  }
}

export function setSong(song) {
  return {
    type: SET_SONG,
    value: song,
  };
}

export function getSong() {
  const state = getStore().getState();
  return state.songSelector.lastSelection;
}
