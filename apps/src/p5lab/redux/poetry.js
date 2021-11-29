import _ from 'lodash';

/**
 * Action keys
 */

const SET_POEM = 'poetry/SET_POEM';

/**
 * Reducer
 */

export default function poetry(state, action) {
  state = state || {selectedPoem: {key: '', title: '', author: '', lines: []}};
  switch (action.type) {
    case SET_POEM:
      return {
        selectedPoem: {
          key: action.key || '',
          title: action.title || '',
          author: action.author || '',
          lines: [...(action.lines || [])]
        }
      };
    default:
      return state;
  }
}

/**
 * Action creators
 */

export function setPoem(poem) {
  return {
    type: SET_POEM,
    ...poem
  };
}

/**
 * Helpers
 */

export function hasSelectedPoemChanged(prevState = {}, currentState = {}) {
  return !_.isEqual(
    prevState.poetry?.selectedPoem,
    currentState.poetry?.selectedPoem
  );
}
