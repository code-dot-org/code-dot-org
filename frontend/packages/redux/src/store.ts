import {configureStore, combineReducers} from '@reduxjs/toolkit';
import type {Reducer, ReducersMapObject} from 'redux';

import type {EnhancedStore} from './types';

const store: EnhancedStore = configureStore({
  reducer: {},
}) as unknown as EnhancedStore;

// Maintain a set of asynchronously added reducers
store.asyncReducers = {} as ReducersMapObject;

store.injectReducer = (asyncReducer: Reducer) => {
  store.asyncReducers[asyncReducer.name] = asyncReducer;
  store.replaceReducer(combineReducers({...store.asyncReducers}));
}

export default store;
