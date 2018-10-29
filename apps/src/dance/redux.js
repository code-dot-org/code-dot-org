// Actions

/** @enum {string} */
export const SET_SONG = 'dance/SET_SONG';

export function setSong(song) {
  return {
    type: SET_SONG,
    value: song,
  };
}

export const actions = {
  setSong
};

// Reducers

const initialState = {
  selectedSong: 'macklemore90'
};

function songs(state, action) {
  state = state || initialState;
  switch (action.type) {
    case SET_SONG:
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
