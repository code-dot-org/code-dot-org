import { createStore } from '@cdo/apps/redux';
import { combineReducers } from 'redux';
import progress from './progressRedux';

/**
 * A module for maintaining the redux store used by code-studio
 */

let reduxStore;

/**
 * Get a reference to our redux store. If it doesn't exist yet, create it.
 */
export const getStore = () => {
  if (!reduxStore) {
    createCodeStudioStore();
  }

  return reduxStore;
};

/**
 * Create our redux store.
 */
const createCodeStudioStore = () => {
  if (reduxStore) {
    throw new Error('reduxStore already exists');
  }

  const reducers = combineReducers({
    progress
  });

  reduxStore = createStore(reducers);
};
