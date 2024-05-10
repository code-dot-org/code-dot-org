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
import frozenProjectInfoDialog from '../templates/projects/frozenProjectInfoDialog/frozenProjectInfoDialogRedux';
import verifiedInstructor from './verifiedInstructorRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import arrowDisplay from '@cdo/apps/templates/arrowDisplayRedux';
import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';
import microBit from '../lib/kits/maker/microBitRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import javalabEditor from '@cdo/apps/javalab/redux/editorRedux';
import javalab from '@cdo/apps/javalab/redux/javalabRedux';

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
  frozenProjectInfoDialog,
  projects,
  verifiedInstructor,
  currentUser,
  arrowDisplay,
  microBit,
  lab,
  lab2Project,
  javalabEditor,
  javalab,
});

export {getStore};
