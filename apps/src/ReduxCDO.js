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

/**
 * Creates a store configured for use the way we want for Code.org.
 * @see http://redux.js.org/docs/api/createStore.html
 * @param {!function} reducer
 * @param {?} [initialState] optionally give the store an initial state.
 * @return {Store} Configured Redux store, ready for use.
 */
module.exports = function createStoreCDO(reducer, initialState) {
  if (process.env.NODE_ENV !== "production") {
    var createLogger = require('redux-logger');
    var reduxLogger = createLogger();
    var devTools = window.devToolsExtension ?
        window.devToolsExtension() :
        function (f) { return f; };
    return redux.createStore(reducer, initialState, redux.compose(
        redux.applyMiddleware(reduxLogger),
        devTools
    ));
  }

  return redux.createStore(reducer, initialState);
};
