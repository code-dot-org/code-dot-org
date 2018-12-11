// Actions

/** @enum {string} */
export const SET_SELECTED_SONG = 'dance/SET_SELECTED_SONG';
export const SET_SONG_DATA = 'dance/SET_SONG_DATA';
export const SET_RUN_IS_STARTING = 'dance/SET_RUN_IS_STARTING';

export function setSelectedSong(song) {
  return {
    type: SET_SELECTED_SONG,
    value: song,
  };
}

export function setSongData(songData) {
  return {
    type: SET_SONG_DATA,
    songData
  };
}

export function setRunIsStarting(runIsStarting) {
  return {
    type: SET_RUN_IS_STARTING,
    runIsStarting
  };
}

export const actions = {
  setSelectedSong
};

// Reducers

const initialState = {
  selectedSong: 'macklemore90',
  songData: {},
};

function songs(state, action) {
  state = state || initialState;
  switch (action.type) {
    case SET_SELECTED_SONG:
      return {
        ...state,
        selectedSong: action.value
      };
    case SET_SONG_DATA:
      return {
        ...state,
        songData: action.songData,
      };
    case SET_RUN_IS_STARTING:
      return {
        ...state,
        runIsStarting: action.runIsStarting
      };
    default:
      return state;
  }
}


export const reducers = {
  songs
};
