/** @file Redux module of helpers for storing and constructing pegasus/dashboard urls */

//Get/Set Pegasus host (proto, domain, port)

// Actions
const SET_PEGASUS_HOST = 'urlHelpers/SET_PEGASUS_HOST';

const INITIAL_STATE = {
  pegasusHost: 'https://code.org',
};

// Reducer
export default function reducer(state = INITIAL_STATE, action = {}) {
  switch (action.type){
    case SET_PEGASUS_HOST:
      return {pegasusHost: action.hostname};
    default:
      return state;
  }
}

// Action Creators
export function setPegasusHost(hostname) {
  return { type: SET_PEGASUS_HOST, hostname };
}

// Selectors
export function pegasusUrl(state, relativePath) {
  if (state && state.urlHelpers) {
    return `${state.urlHelpers.pegasusHost}${relativePath}`;
  }
  return relativePath;
}
