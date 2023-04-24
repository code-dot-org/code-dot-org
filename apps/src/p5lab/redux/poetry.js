import _ from 'lodash';

/**
 * Action keys
 */

const SET_POEM = 'poetry/SET_POEM';
const SET_POEM_LIST = 'poetry/SET_POEM_LIST';

const initialState = {
  selectedPoem: {key: '', title: '', author: '', lines: []},
  poemList: {},
};

/**
 * Reducer
 */

export default function reducer(state, action) {
  state = state || initialState;
  switch (action.type) {
    case SET_POEM:
      return {
        ...state,
        selectedPoem: {
          key: action.key || '',
          title: action.title || '',
          author: action.author || '',
          lines: [...(action.lines || [])],
        },
      };
    case SET_POEM_LIST:
      return {
        ...state,
        poemList: action.poemList,
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
    ...poem,
  };
}

export function setPoemList(poemList) {
  return {
    type: SET_POEM_LIST,
    poemList,
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
