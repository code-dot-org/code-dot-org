/* eslint no-unused-vars: "error" */
import { getStore, registerReducers } from '@cdo/apps/redux';
import progress from './progressRedux';
import stageLock from './stageLockRedux';
import shareDialog from './components/shareDialogRedux';
import hiddenStage from './hiddenStageRedux';
import isRtl from './isRtlRedux';
import publishDialog from '../templates/publishDialog/publishDialogRedux';

registerReducers({
  progress,
  stageLock,
  shareDialog,
  hiddenStage,
  isRtl,
  publishDialog,
});

export {getStore};
