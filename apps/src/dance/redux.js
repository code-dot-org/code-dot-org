// Actions

/** @enum {string} */
export const SET_SELECTED_SONG = 'dance/SET_SELECTED_SONG';

export function setSelectedSong(song) {
  return {
    type: SET_SELECTED_SONG,
    value: song,
  };
}

export const actions = {
  setSelectedSong: setSelectedSong
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
    default:
      return state;
  }
}


export const reducers = {
  songs
};
