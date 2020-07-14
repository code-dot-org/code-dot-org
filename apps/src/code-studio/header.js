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

import HeaderMiddle from '@cdo/apps/code-studio/components/header/HeaderMiddle';

/**
 * Dynamic header generation and event bindings for header actions.
 */

// Namespace for manipulating the header DOM.
var header = {};

/**
 * See ApplicationHelper::PUZZLE_PAGE_NONE.
 */
const PUZZLE_PAGE_NONE = -1;

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
 *     id: number,
 *     position: number,
 *     title: string,
 *     kind: string
 *   }>
 * }}
 * @param {object} progressData
 * @param {string} currentLevelId
 * @param {number} puzzlePage
 * @param {boolean} signedIn True/false if we know the sign in state of the
 *   user, null otherwise
 * @param {boolean} stageExtrasEnabled Whether this user is in a section with
 *   stageExtras enabled for this script
 */
header.build = function(
  scriptData,
  lessonData,
  progressData,
  currentLevelId,
  puzzlePage,
  signedIn,
  stageExtrasEnabled,
  scriptNameData,
  hasAppOptions
) {
  scriptData = scriptData || {};
  lessonData = lessonData || {};
  progressData = progressData || {};

  const linesOfCodeText = progressData.linesOfCodeText;

  let saveAnswersBeforeNavigation = puzzlePage !== PUZZLE_PAGE_NONE;

  // Set up the store immediately.
  progress.generateStageProgress(
    scriptData,
    lessonData,
    progressData,
    currentLevelId,
    saveAnswersBeforeNavigation,
    signedIn,
    stageExtrasEnabled
  );

  // Hold off on rendering HeaderMiddle.  This will allow the "app load"
  // to potentially begin before we first render HeaderMiddle, giving HeaderMiddle
  // the opportunity to wait until the app is loaded before rendering.
  $(document).ready(function() {
    ReactDOM.render(
      <Provider store={getStore()}>
        <HeaderMiddle
          scriptNameData={scriptNameData}
          lessonData={lessonData}
          scriptData={scriptData}
          currentLevelId={currentLevelId}
          linesOfCodeText={linesOfCodeText}
          hasAppOptions={hasAppOptions}
        />
      </Provider>,
      document.querySelector('.header_level')
    );
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
