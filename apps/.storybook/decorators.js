import {createStore, combineReducers} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import publishDialog from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import deleteDialog from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';

export const reduxStore = (reducers = {}, state = {}) => {
  return createStore(combineReducers({isRtl, responsive, publishDialog, deleteDialog, ...reducers}), state);
};
