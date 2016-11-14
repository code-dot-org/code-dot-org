import Immutable from 'immutable';
import experiments from "./util/experiments";
import * as redux from 'redux';
import reduxThunk from 'redux-thunk';
import { connect } from 'react-redux';

if (process.env.NODE_ENV !== "production") {
  var createLogger = require('redux-logger');
}


let reduxStore;
let globalReducers = {};

let __oldReduxStore;
let __oldGlobalReducers;

export function stubRedux() {
  if (__oldReduxStore) {
    throw new Error("Reduce store has already been stubbed. Did you forget to call restore?");
  }
  __oldReduxStore = reduxStore;
  __oldGlobalReducers = globalReducers;
  reduxStore = null;
  globalReducers = {};
}

export function restoreRedux() {
  reduxStore = __oldReduxStore;
  globalReducers = __oldGlobalReducers;
  __oldReduxStore = null;
  __oldGlobalReducers = null;
}


/**
 * Get a reference to our redux store. If it doesn't exist yet, create it.
 */
export function getStore() {
  if (!reduxStore) {
    reduxStore = createStore(redux.combineReducers(globalReducers));
  }

  return reduxStore;
}

/**
 * Register a top-level reducer with the global store and get back
 * a selector function to access the state for that reducer.
 * @param {string} key - a unique key to identify this reducer.
 *     The key will be used in the state object.
 * @param {function} reducer - the reducer function
 * @returns {function} a selector function to access the state for that reducer.
 */
export function registerReducer(key, reducer) {
  return registerReducers({[key]: reducer})[key];
}

/**
 * Register multiple top-level reducers with the global store and get back
 * selector functions to access the state for each reducer.
 * @param {object} reducers - an object mapping unique keys to reducer functions
 *     The keys will be used in the state object.
 * @returns {object} - an object mapping the keys to selector functions for accessing
 *     the state of the corresponding reducer.
 */
export function registerReducers(reducers) {
  for (var key in reducers) {
    if (hasReducer(key)) {
      throw new Error(`reducer with key "${key}" already registered!`);
    }
  }
  Object.assign(globalReducers, reducers);
  if (reduxStore) {
    reduxStore.replaceReducer(redux.combineReducers(globalReducers));
  }
  const selectors = {};
  for (key in reducers) {
    selectors[key] = getReducerStateSelector(key);
  }
  return selectors;
}

/**
 * @returns {function} a selector function to access the state for that reducer.
 */
export function getReducerStateSelector(key) {
  return state => state[key];
}

/**
 * @returns {function} a new connect function where the state is the state for the
 * specified global reducer key.
 */
export function getConnectFunction(key) {
  const selector = getReducerStateSelector(key);
  return function (mapStateToProps, ...args) {
    return connect(
      (state, ...rest) => mapStateToProps(selector(state), ...rest),
      ...args
    );
  };
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
