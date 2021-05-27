/* eslint no-unused-vars: "error" */
import {getStore, registerReducers} from '@cdo/apps/redux';
import header from './headerRedux';
import progress from './progressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import lessonLock from './lessonLockRedux';
import viewAs from './viewAsRedux';
import shareDialog from './components/shareDialogRedux';
import exportDialog from './components/exportDialogRedux';
import hiddenStage from './hiddenLessonRedux';
import isRtl from './isRtlRedux';
import responsive from './responsiveRedux';
import publishDialog from '../templates/projects/publishDialog/publishDialogRedux';
import projects from '../templates/projects/projectsRedux';
import verifiedTeacher from './verifiedTeacherRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import arrowDisplay from '@cdo/apps/templates/arrowDisplayRedux';

registerReducers({
  header,
  progress,
  teacherSections,
  lessonLock,
  viewAs,
  shareDialog,
  exportDialog,
  hiddenStage,
  isRtl,
  responsive,
  publishDialog,
  projects,
  verifiedTeacher,
  currentUser,
  arrowDisplay
});

export {getStore};
