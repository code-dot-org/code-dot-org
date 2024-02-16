import {channels as channelsApi} from '../../clientApi';

// Action types

const SHOW_SHARE_DIALOG = 'shareDialog/SHOW_SHARE_DIALOG';
const HIDE_SHARE_DIALOG = 'shareDialog/HIDE_SHARE_DIALOG';
const SAVE_REPLAY_LOG = 'shareDialog/SAVE_REPLAY_LOG';
const SHOW_LIBRARY_CREATION_DIALOG = 'shareDialog/SHOW_LIBRARY_CREATION_DIALOG';
const HIDE_LIBRARY_CREATION_DIALOG = 'shareDialog/HIDE_LIBRARY_CREATION_DIALOG';

// Reducer

const initialState = {
  isOpen: false,
  libraryDialogIsOpen: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_SHARE_DIALOG:
      return {
        ...state,
        ...initialState,
        isOpen: true,
      };
    case HIDE_SHARE_DIALOG:
      return {
        ...state,
        isOpen: false,
      };
    case SAVE_REPLAY_LOG:
      return {
        ...state,
        replayLog: action.replayLog,
      };
    case SHOW_LIBRARY_CREATION_DIALOG:
      return {
        ...state,
        libraryDialogIsOpen: true,
      };
    case HIDE_LIBRARY_CREATION_DIALOG:
      return {
        ...state,
        libraryDialogIsOpen: false,
      };
    default:
      return state;
  }
}

// Action creators

export function showShareDialog() {
  return {type: SHOW_SHARE_DIALOG};
}

export function hideShareDialog() {
  return {type: HIDE_SHARE_DIALOG};
}

export function saveReplayLog(replayLog) {
  return {type: SAVE_REPLAY_LOG, replayLog};
}

export function showLibraryCreationDialog() {
  return {type: SHOW_LIBRARY_CREATION_DIALOG};
}

export function hideLibraryCreationDialog() {
  return {type: HIDE_LIBRARY_CREATION_DIALOG};
}
