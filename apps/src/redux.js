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

import {configureStore} from '@reduxjs/toolkit';
import Immutable from 'immutable';
import * as redux from 'redux';
import reduxThunk from 'redux-thunk';

import experiments from './util/experiments';

if (process.env.NODE_ENV !== 'production') {
  var createLogger = require('redux-logger');
}

let reduxStore;
let globalReducers = {};

if (IN_UNIT_TEST) {
  let __oldReduxStore;
  let __oldGlobalReducers;

  module.exports.stubRedux = function () {
    if (__oldReduxStore) {
      throw new Error(
        'Redux store has already been stubbed. Did you forget to call restore?'
      );
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

if (IN_STORYBOOK || IN_UNIT_TEST) {
  // Storybooks need the ability to create multiple distinct stores instead of
  // using a singleton
  module.exports.createStoreWithReducers = createStoreWithReducers;
}

/**
 * Get a reference to our redux store. If it doesn't exist yet, create it.
 */
export function getStore() {
  if (!reduxStore) {
    reduxStore = createStoreWithReducers();
    if (experiments.isEnabled('reduxGlobalStore')) {
      // Expose our store globally, to make debugging easier
      window.reduxStore = reduxStore;
    }
  }

  return reduxStore;
}

/**
 * Create our store
 */
function createStoreWithReducers() {
  return createStore(
    Object.keys(globalReducers).length > 0 ? globalReducers : s => s
  );
}

/**
 * Register multiple top-level reducers with the global store. This does not remove
 * any reducers that have been previously registered.
 *
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
  // to your url. This will also enable logging if there is a non-immutable or non-serializable
  // value in the redux store, with some ignores already set up (see below).
  var enableReduxDebugging = experiments.isEnabled(experiments.REDUX_LOGGING);
  if (process.env.NODE_ENV !== 'production' && enableReduxDebugging) {
    var reduxLogger = createLogger({
      collapsed: true,
      // convert immutable.js objects to JS for logging (code copied from
      // redux-logger readme)
      stateTransformer: state => {
        let newState = {};

        for (var i of Object.keys(state)) {
          if (Immutable.Iterable.isIterable(state[i])) {
            newState[i] = state[i].toJS();
          } else {
            newState[i] = state[i];
          }
        }

        return newState;
      },
    });

    return configureStore({
      reducer: reducer,
      preloadedState: initialState,
      middleware: getDefaultMiddleware =>
        // the default middleware includes redux thunk, immutability check,
        // and serializability check. Some of our store does not pass these checks,
        // so we are ignoring them for now. We only enable this in dev mode
        // because it causes console errors if something fails the check, and
        // can potentially cause a page crash (in the case of the JS Interpreter and the
        // immutability check).
        getDefaultMiddleware({
          immutableCheck: {
            ignoredPaths: ['jsInterpreter', 'jsdebugger'],
          },
          serializableCheck: {
            ignoredActionPaths: [
              'blob',
              'jsdebugger',
              'observer',
              'jsInterpreter',
              'runApp',
              'props.showNextHint',
              'props.assetUrl',
              'props.exportApp',
              'payload.getChanges',
            ],
            ignoredPaths: [
              'hiddenLesson',
              'blob',
              'pageConstants',
              'observer',
              'watchedExpressions',
              'instructions',
              'runApp',
              'jsdebugger',
              /animationList\.propsByKey.*\.blob/,
              'maker',
              'data',
              'screens',
              'header.getLevelBuilderChanges',
              'getChanges',
            ],
          },
        }).concat(reduxLogger),
    });
  }

  return configureStore({
    reducer: reducer,
    preloadedState: initialState,
    middleware: [reduxThunk],
    devTools: process.env.NODE_ENV === 'development', // only enable devTools in development
  });
}
