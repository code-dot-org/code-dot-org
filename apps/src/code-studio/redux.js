/* eslint no-unused-vars: "error" */
import { getStore, registerReducers } from '@cdo/apps/redux';
import progress from './progressRedux';
import sections from './sectionsRedux';
import stageLock from './stageLockRedux';
import hiddenStage from './hiddenStageRedux';

registerReducers({
  progress,
  sections,
  stageLock,
  hiddenStage
});

export {getStore};
