/* eslint no-unused-vars: "error" */
import { getStore, registerReducers } from '@cdo/apps/redux';
import progress from './progressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import stageLock from './stageLockRedux';
import viewAs from './viewAsRedux';
import shareDialog from './components/shareDialogRedux';
import hiddenStage from './hiddenStageRedux';
import isRtl from './isRtlRedux';
import publishDialog from '../templates/publishDialog/publishDialogRedux';
import verifiedTeacher from './verifiedTeacherRedux';
import authoredHints from "@cdo/apps/redux/authoredHints";

registerReducers({
  progress,
  teacherSections,
  stageLock,
  viewAs,
  shareDialog,
  hiddenStage,
  isRtl,
  publishDialog,
  verifiedTeacher,
  authoredHints,
});

export {getStore};
