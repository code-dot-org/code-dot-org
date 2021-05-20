/* eslint no-unused-vars: "error" */
import {getStore, registerReducers} from '@cdo/apps/redux';
import header from './headerRedux';
import progress from './progressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import stageLock from './stageLockRedux';
import viewAs from './viewAsRedux';
import shareDialog from './components/shareDialogRedux';
import exportDialog from './components/exportDialogRedux';
import hiddenLesson from './hiddenLessonRedux';
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
  stageLock,
  viewAs,
  shareDialog,
  exportDialog,
  hiddenLesson,
  isRtl,
  responsive,
  publishDialog,
  projects,
  verifiedTeacher,
  currentUser,
  arrowDisplay
});

export {getStore};
