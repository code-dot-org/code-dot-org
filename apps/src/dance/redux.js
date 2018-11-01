// Actions

/** @enum {string} */
export const SET_SELECTED_SONG = 'dance/SET_SELECTED_SONG';
export const SET_SONG_DATA = 'dance/SET_SONG_DATA';

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

export const actions = {
  setSelectedSong
};

// Reducers

const initialState = {
  selectedSong: 'macklemore90'
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
    default:
      return state;
  }
}


export const reducers = {
  songs
};
