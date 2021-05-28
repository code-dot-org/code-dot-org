/* globals dashboard */

import {
  showProjectHeader,
  showMinimalProjectHeader,
  showProjectBackedHeader,
  showLevelBuilderSaveButton,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  showProjectUpdatedAt,
  setProjectUpdatedAt,
  refreshProjectName,
  setShowTryAgainDialog
} from './headerRedux';

import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import progress from './progress';
import {getStore} from '../redux';

import {PUZZLE_PAGE_NONE} from '@cdo/apps/templates/progress/progressTypes';
import HeaderMiddle from '@cdo/apps/code-studio/components/header/HeaderMiddle';
import SignInCalloutWrapper from './components/header/SignInCalloutWrapper';

/**
 * Dynamic header generation and event bindings for header actions.
 */

// Namespace for manipulating the header DOM.
var header = {};

/**
 * @param {object} scriptData
 * @param {boolean} scriptData.disablePostMilestone
 * @param {boolean} scriptData.isHocScript
 * @param {string} scriptData.name
 * @param {object} lessonData{{
 *   script_id: number,
 *   script_name: number,
 *   num_script_lessons: number,
 *   title: string,
 *   finishLink: string,
 *   finishText: string,
 *   levels: Array.<{
 *     id: string,
 *     position: number,
 *     title: string,
 *     kind: string
 *   }>
 * }}
 * @param {object} progressData
 * @param {string} currentLevelId The id of the level the user is currently
 *   on. This gets used in the url and as a key in many objects. Therefore,
 *   it is a string despite always being a numerical value
 * @param {number} currentPageNumber The page we are on if this is a multi-
 *   page level.
 * @param {boolean} signedIn True/false if we know the sign in state of the
 *   user, null otherwise
 * @param {boolean} lessonExtrasEnabled Whether this user is in a section with
 *   stageExtras enabled for this script
 * @param {boolean} isLessonExtras Boolean indicating we are not on a script
 *   level and therefore are on lesson extras
 */
header.build = function(
  scriptData,
  lessonGroupData,
  lessonData,
  progressData,
  currentLevelId,
  currentPageNumber,
  signedIn,
  lessonExtrasEnabled,
  scriptNameData,
  isLessonExtras
) {
  scriptData = scriptData || {};
  lessonGroupData = lessonGroupData || {};
  lessonData = lessonData || {};
  progressData = progressData || {};

  const linesOfCodeText = progressData.linesOfCodeText;
  let saveAnswersBeforeNavigation = currentPageNumber !== PUZZLE_PAGE_NONE;

  // Set up the store immediately. Note that some progress values are populated
  // asynchronously.
  progress.generateLessonProgress(
    scriptData,
    lessonGroupData,
    lessonData,
    progressData,
    currentLevelId,
    saveAnswersBeforeNavigation,
    signedIn,
    lessonExtrasEnabled,
    isLessonExtras,
    currentPageNumber
  );

  // Hold off on rendering HeaderMiddle.  This will allow the "app load"
  // to potentially begin before we first render HeaderMiddle, giving HeaderMiddle
  // the opportunity to wait until the app is loaded before rendering.
  const store = getStore();
  $(document).ready(function() {
    ReactDOM.render(
      <Provider store={store}>
        <HeaderMiddle
          scriptNameData={scriptNameData}
          lessonData={lessonData}
          scriptData={scriptData}
          currentLevelId={currentLevelId}
          linesOfCodeText={linesOfCodeText}
        />
      </Provider>,
      document.querySelector('.header_level')
    );
    // Only render sign in callout if the course is CSF and the user is
    // not signed in
    if (scriptData.is_csf && signedIn === false) {
      ReactDOM.render(
        <SignInCalloutWrapper />,
        document.querySelector('.signin_callout_wrapper')
      );
    }
  });
};

header.buildProjectInfoOnly = function() {
  ReactDOM.render(
    <Provider store={getStore()}>
      <HeaderMiddle projectInfoOnly={true} />
    </Provider>,
    document.querySelector('.header_level')
  );
};

function setupReduxSubscribers(store) {
  let state = {};
  store.subscribe(() => {
    let lastState = state;
    state = store.getState();

    // Update the project state when a PublishDialog state transition indicates
    // that a project has just been published.
    if (
      lastState.publishDialog &&
      lastState.publishDialog.lastPublishedAt !==
        state.publishDialog.lastPublishedAt
    ) {
      window.dashboard.project.setPublishedAt(
        state.publishDialog.lastPublishedAt
      );
    }

    // Update the project state when a ShareDialog state transition indicates
    // that a project has just been unpublished.
    if (
      lastState.shareDialog &&
      !lastState.shareDialog.didUnpublish &&
      state.shareDialog.didUnpublish
    ) {
      window.dashboard.project.setPublishedAt(null);
    }
  });
}
setupReduxSubscribers(getStore());

header.showMinimalProjectHeader = function() {
  getStore().dispatch(refreshProjectName());
  getStore().dispatch(showMinimalProjectHeader());
};

header.showLevelBuilderSaveButton = function(getChanges) {
  getStore().dispatch(showLevelBuilderSaveButton(getChanges));
};

/**
 * @param {object} options{{
 *   showShareAndRemix: boolean,
 *   showExport: boolean
 * }}
 */
header.showHeaderForProjectBacked = function(options) {
  if (options.showShareAndRemix) {
    getStore().dispatch(showProjectBackedHeader(options.showExport));
  }

  getStore().dispatch(showProjectUpdatedAt());
  header.updateTimestamp();
};

header.showProjectHeader = function(options) {
  header.updateTimestamp();
  getStore().dispatch(refreshProjectName());
  getStore().dispatch(showProjectHeader(options.showExport));
};

header.updateTimestamp = function() {
  const timestamp = dashboard.project.getCurrentTimestamp();
  getStore().dispatch(setProjectUpdatedAt(timestamp));
};

header.showProjectSaveError = () => {
  getStore().dispatch(setProjectUpdatedError());
};

header.showProjectSaving = () => {
  getStore().dispatch(setProjectUpdatedSaving());
};

header.showTryAgainDialog = () => {
  getStore().dispatch(setShowTryAgainDialog(true));
};

header.hideTryAgainDialog = () => {
  getStore().dispatch(setShowTryAgainDialog(false));
};

export default header;
