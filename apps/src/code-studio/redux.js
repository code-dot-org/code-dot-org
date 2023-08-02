/* eslint no-unused-vars: "error" */
import {getStore, registerReducers} from '@cdo/apps/redux';
import header from './headerRedux';
import project from './projectRedux';
import app from './appRedux';
import progress from './progressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import lessonLock from './lessonLockRedux';
import viewAs from './viewAsRedux';
import shareDialog from './components/shareDialogRedux';
import hiddenLesson from './hiddenLessonRedux';
import isRtl from './isRtlRedux';
import responsive from './responsiveRedux';
import publishDialog from '../templates/projects/publishDialog/publishDialogRedux';
import projects from '../templates/projects/projectsRedux';
import verifiedInstructor from './verifiedInstructorRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import arrowDisplay from '@cdo/apps/templates/arrowDisplayRedux';
import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';
import microBit from '../lib/kits/maker/microBitRedux';
import lab from '../lab2/lab2Redux';

registerReducers({
  header,
  project,
  app,
  progress,
  teacherSections,
  teacherPanel,
  lessonLock,
  viewAs,
  shareDialog,
  hiddenLesson,
  isRtl,
  responsive,
  publishDialog,
  projects,
  verifiedInstructor,
  currentUser,
  arrowDisplay,
  microBit,
  lab,
});

export {getStore};
