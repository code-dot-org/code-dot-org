import {createStore, combineReducers} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';

export const reduxStore = (reducers = {}, state = {}) => {
  return createStore(combineReducers({isRtl, responsive, ...reducers}), state);
};
