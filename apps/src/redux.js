/** @file Code.org configured store-creation method.
 *  @see http://redux.js.org/docs/api/createStore.html */
import Immutable from 'immutable';
import experiments from './experiments';

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
module.exports.createStore = function (reducer, initialState) {

  // You have to manually enable debugging, both to keep the logger out
  // of production bundles, and because it causes a lot of console noise and
  // makes our unit tests fail. To enable, append ?enableExperiments=reduxLogging
  // to your url
  var enableReduxDebugging = experiments.isEnabled('reduxLogging');
  if (process.env.NODE_ENV !== "production" && enableReduxDebugging) {
    var reduxLogger = createLogger({
      collapsed: true,
      // convert immutable.js objects to JS for logging (code copied from
      // redux-logger readme)
      stateTransformer: (state) => {
        let newState = {};

        for (var i of Object.keys(state)) {
          if (Immutable.Iterable.isIterable(state[i])) {
            newState[i] = state[i].toJS();
          } else {
            newState[i] = state[i];
          }
        }

        return newState;
      }
    });

    // window.devToolsExtension is a Redux middleware function that must be
    //   included to attach to the Redux DevTools Chrome extension.
    // If it's not present then the extension isn't available, and we use
    //   a no-op identity function instead.
    // see https://github.com/zalmoxisus/redux-devtools-extension
    var devTools = window.devToolsExtension ?
        window.devToolsExtension() :
        function (f) { return f; };

    return redux.createStore(reducer, initialState, redux.compose(
        redux.applyMiddleware(reduxThunk, reduxLogger),
        devTools
    ));
  }

  return redux.createStore(reducer, initialState, redux.applyMiddleware(reduxThunk));
};
