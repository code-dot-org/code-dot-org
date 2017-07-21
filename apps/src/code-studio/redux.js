/* eslint no-unused-vars: "error" */
import { getStore, registerReducers } from '@cdo/apps/redux';
import progress from './progressRedux';
import sections from './sectionsRedux';
import stageLock from './stageLockRedux';
import header from './headerRedux';
import hiddenStage from './hiddenStageRedux';
import isRtl from './isRtlRedux';

registerReducers({
  progress,
  sections,
  stageLock,
  header,
  hiddenStage,
  isRtl,
});

export {getStore};
