/* eslint no-unused-vars: "error" */
import {getStore, registerReducers} from '@cdo/apps/redux';
import header from './headerRedux';
import progress from './progressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import lessonLock from './lessonLockRedux';
import viewAs from './viewAsRedux';
import shareDialog from './components/shareDialogRedux';
import exportDialog from './components/exportDialogRedux';
import hiddenLesson from './hiddenLessonRedux';
import isRtl from './isRtlRedux';
import responsive from './responsiveRedux';
import publishDialog from '../templates/projects/publishDialog/publishDialogRedux';
import projects from '../templates/projects/projectsRedux';
import verifiedInstructor from './verifiedInstructorRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import arrowDisplay from '@cdo/apps/templates/arrowDisplayRedux';
import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';

registerReducers({
  header,
  progress,
  teacherSections,
  teacherPanel,
  lessonLock,
  viewAs,
  shareDialog,
  exportDialog,
  hiddenLesson,
  isRtl,
  responsive,
  publishDialog,
  projects,
  verifiedInstructor,
  currentUser,
  arrowDisplay
});

export {getStore};
