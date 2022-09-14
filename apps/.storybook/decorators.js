import {createStore, combineReducers} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {selectGallery} from '@cdo/apps/templates/projects/projectsRedux';

export const reduxStore = (reducers = {}, state = {}) => {
  return createStore(combineReducers({isRtl, responsive, selectGallery, ...reducers}), state);
};
