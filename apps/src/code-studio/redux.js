/* eslint no-unused-vars: "error" */
import { getStore, registerReducers } from '@cdo/apps/redux';
import progress from './progressRedux';
import sections from './sectionsRedux';
import stageLock from './stageLockRedux';
import hiddenStage from './hiddenStageRedux';
import isRtl from './isRtlRedux';

registerReducers({
  progress,
  sections,
  stageLock,
  hiddenStage,
  isRtl,
});

export {getStore};
