import type {Store, Reducer, ReducersMapObject} from 'redux';

export type EnhancedStore = Store & {
  asyncReducers: ReducersMapObject;
  injectReducer: (asyncReducer: Reducer) => void;
};
