/** @file Code.org configured store-creation method.
 *  @see http://redux.js.org/docs/api/createStore.html */
'use strict';

var redux = require('redux');
var reduxThunk = require('redux-thunk').default;
if (process.env.NODE_ENV !== "production") {
  var createLogger = require('redux-logger');
}

/**
 * Creates a store configured for use the way we want for Code.org.
 * @see http://redux.js.org/docs/api/createStore.html
 * @param {!function} reducer
 * @return {Store} Configured Redux store, ready for use.
 */
module.exports.createStore = function (reducer) {

  // You have to manually enable debugging here, both to keep the logger out
  // of production bundles, and because it causes a lot of console noise and
  // makes our unit tests fail.
  var enableReduxDebugging = false;
  if (process.env.NODE_ENV !== "production" && enableReduxDebugging) {
    var reduxLogger = createLogger();

    // window.devToolsExtension is a Redux middleware function that must be
    //   included to attach to the Redux DevTools Chrome extension.
    // If it's not present then the extension isn't available, and we use
    //   a no-op identity function instead.
    // see https://github.com/zalmoxisus/redux-devtools-extension
    var devTools = window.devToolsExtension ?
        window.devToolsExtension() :
        function (f) { return f; };

    return redux.createStore(reducer, redux.compose(
        redux.applyMiddleware(reduxThunk, reduxLogger),
        devTools
    ));
  }

  return redux.createStore(reducer, redux.applyMiddleware(reduxThunk));
};

/**
 * Create a non-functioning redux store that allows us to always call getState
 * and dispatch as no-ops.
 */
module.exports.createFakeStore = function () {
  return {
    getState: function () {
      return {};
    },
    dispatch: function () {
    }
  };
};
