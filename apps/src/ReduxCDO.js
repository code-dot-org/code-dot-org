/** @file Code.org configured store-creation method.
 *  @see http://redux.js.org/docs/api/createStore.html */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';

var redux = require('redux');
var applyMiddleware = redux.applyMiddleware;
var compose = redux.compose;
var createStore = redux.createStore;
var createLogger = require('redux-logger');

/**
 * Creates a store configured for use the way we want for Code.org.
 * @see http://redux.js.org/docs/api/createStore.html
 * @param {!function} reducer
 * @param {?} [initialState] optionally give the store an initial state.
 * @return {Store} Configured Redux store, ready for use.
 */
module.exports = function createStoreCDO(reducer, initialState) {
  var reduxLogger = createLogger();
  return createStore(reducer, initialState, compose(
      applyMiddleware(reduxLogger),
      window.devToolsExtension ? window.devToolsExtension() : undefined
  ));
};
