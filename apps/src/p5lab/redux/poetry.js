const SET_POEM = 'poetry/SET_POEM';

export default function poetry(state, action) {
  state = state || {selectedPoem: {title: '', author: '', lines: []}};
  switch (action.type) {
    case SET_POEM:
      return {
        selectedPoem: {
          title: action.title || '',
          author: action.author || '',
          lines: [...(action.lines || [])]
        }
      };
    default:
      return state;
  }
}

export function setPoem(poem) {
  return {
    type: SET_POEM,
    ...poem
  };
}
