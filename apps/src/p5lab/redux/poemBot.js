const SET_POEM = 'poemBot/SET_POEM';

export default function poemBot(state, action) {
  state = state || {selectedPoem: {title: '', author: '', lines: []}};
  switch (action.type) {
    case SET_POEM:
      return {
        selectedPoem: action.poem
      };
    default:
      return state;
  }
}

export function setPoem(poem) {
  return {
    type: SET_POEM,
    poem
  };
}
