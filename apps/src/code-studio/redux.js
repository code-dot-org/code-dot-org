/* eslint no-unused-vars: "error" */
import { getStore, registerReducers } from '@cdo/apps/redux';
import progress from './progressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import stageLock from './stageLockRedux';
import viewAs from './viewAsRedux';
import shareDialog from './components/shareDialogRedux';
import hiddenStage from './hiddenStageRedux';
import isRtl from './isRtlRedux';
import responsive from './responsiveRedux';
import publishDialog from '../templates/projects/publishDialog/publishDialogRedux';
import verifiedTeacher from './verifiedTeacherRedux';

registerReducers({
  progress,
  teacherSections,
  stageLock,
  viewAs,
  shareDialog,
  hiddenStage,
  isRtl,
  responsive,
  publishDialog,
  verifiedTeacher,
});

export {getStore};
