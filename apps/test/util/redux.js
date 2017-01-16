import * as redux from 'redux';
import reduxThunk from 'redux-thunk';

export function createStore(reducer, initialState) {
  return redux.createStore(reducer, initialState, redux.applyMiddleware(reduxThunk));
}
