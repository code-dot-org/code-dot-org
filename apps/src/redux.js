/**
 *                                                _______________________
 *      _______________________-------------------                       `\
 *    /:--__                                                              |
 *   ||< > |                                   ___________________________/
 *   | \__/_________________-------------------                         |
 *   |                                                                  |
 *    |                   THE LORD OF THE REDUX STORES                   |
 *    |                                                                  |
 *    |     "Three Stores for the Elven-kings under the sky,             |
 *     |       Seven for the Dwarf-lords in their halls of stone,         |
 *     |     Nine for Mortal Men doomed to die,                           |
 *     |       One for the Dark Lord on his dark throne                   |
 *     |     In the Land of Mordor where the Shadows lie.                  |
 *      |      One Store to rule them all, One Store to find them,         |
 *      |      One Store to bring them all and in the darkness bind them   |
 *      |    In the Land of Mordor where the Shadows lie.                 |
 *     |                                              ____________________|_
 *     |  ___________________-------------------------                      `\
 *     |/`--_                                                                 |
 *     ||[ ]||                                            ___________________/
 *      \===/___________________--------------------------
 *
 *
 * @file The global redux store - "There can be only one"
 */

import Immutable from 'immutable';
import experiments from "./util/experiments";
import * as redux from 'redux';
import reduxThunk from 'redux-thunk';

if (process.env.NODE_ENV !== "production") {
  var createLogger = require('redux-logger');
}


let reduxStore;
let globalReducers = {};


if (IN_UNIT_TEST) {
  let __oldReduxStore;
  let __oldGlobalReducers;

  module.exports.stubRedux = function () {
    if (__oldReduxStore) {
      throw new Error("Reduce store has already been stubbed. Did you forget to call restore?");
    }
    __oldReduxStore = reduxStore;
    __oldGlobalReducers = globalReducers;
    reduxStore = null;
    globalReducers = {};
  };

  module.exports.restoreRedux = function () {
    reduxStore = __oldReduxStore;
    globalReducers = __oldGlobalReducers;
    __oldReduxStore = null;
    __oldGlobalReducers = null;
  };
}

/**
 * Get a reference to our redux store. If it doesn't exist yet, create it.
 */
export function getStore() {
  if (!reduxStore) {
    reduxStore = createStore(Object.keys(globalReducers).length > 0 ?
                             redux.combineReducers(globalReducers) : s => s);
  }

  return reduxStore;
}

/**
 * Register multiple top-level reducers with the global store and get back
 * selector functions to access the state for each reducer.
 * @param {object} reducers - an object mapping unique keys to reducer functions
 *     The keys will be used in the state object.
 * @returns void
 */
export function registerReducers(reducers) {
  for (let key in reducers) {
    const existingReducer = globalReducers[key];
    if (existingReducer && existingReducer !== reducers[key]) {
      throw new Error(`reducer with key "${key}" already registered!`);
    }
  }
  Object.assign(globalReducers, reducers);
  if (reduxStore) {
    reduxStore.replaceReducer(redux.combineReducers(globalReducers));
  }
}

/**
 * @returns {boolean} whether or not a reducer with the given key has been registered
 */
export function hasReducer(key) {
  return !!globalReducers[key];
}

/**
 * Creates a store configured for use the way we want for Code.org.
 * @see http://redux.js.org/docs/api/createStore.html
 * @param {!function} reducer
 * @return {Store} Configured Redux store, ready for use.
 */
function createStore(reducer, initialState) {

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
}
