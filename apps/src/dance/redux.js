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

function selectedSong(state, action) {
  state = state || "macklemore90";
  switch (action.type) {
    case SET_SONG:
      return action.value;
    default:
      return state;
  }
}


export const reducers = {
  selectedSong
};
