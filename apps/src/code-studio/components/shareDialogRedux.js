import {
  channels as channelsApi,
} from '../../clientApi';

// Action types

const SHOW_SHARE_DIALOG = 'shareDialog/SHOW_SHARE_DIALOG';
const HIDE_SHARE_DIALOG = 'shareDialog/HIDE_SHARE_DIALOG';
const SET_GET_NEXT_FRAME = 'shareDialog/SET_GET_NEXT_FRAME';
const UNPUBLISH_REQUEST  = 'shareDialog/UNPUBLISH_REQUEST';
const UNPUBLISH_SUCCESS  = 'shareDialog/UNPUBLISH_SUCCESS';
const UNPUBLISH_FAILURE  = 'shareDialog/UNPUBLISH_FAILURE';
const SAVE_REPLAY_LOG  = 'shareDialog/SAVE_REPLAY_LOG';

// Reducer

const initialState = {
  isOpen: false,
  isUnpublishPending: false,
  didUnpublish: false,
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
        ...initialState,
      };
    case UNPUBLISH_REQUEST:
      return {
        ...state,
        isUnpublishPending: true,
      };
    case UNPUBLISH_SUCCESS:
      return {
        ...state,
        ...initialState,
        didUnpublish: true,
      };
    case UNPUBLISH_FAILURE:
      return {
        ...state,
        isUnpublishPending: false,
      };
    case SET_GET_NEXT_FRAME:
      return {
        ...state,
        getNextFrame: action.func,
      };
    case SAVE_REPLAY_LOG:
      return {
        ...state,
        replayLog: action.replayLog
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

export function unpublishProject(projectId) {
  return dispatch => {
    dispatch({type: UNPUBLISH_REQUEST});
    return new Promise((resolve, reject) => {
      channelsApi.withProjectId(projectId).ajax(
        'POST',
        'unpublish',
        () => {
          dispatch({type: UNPUBLISH_SUCCESS});
          resolve();
        },
        err => {
          dispatch({type: UNPUBLISH_FAILURE});
          reject(err);
        },
        null
      );
    });
  };
}

export function setGetNextFrame(func) {
  return {type: SET_GET_NEXT_FRAME, func};
}

export function saveReplayLog(replayLog) {
  return {type: SAVE_REPLAY_LOG, replayLog};
}
