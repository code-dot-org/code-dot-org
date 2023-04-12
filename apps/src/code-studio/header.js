/* globals dashboard */

import $ from 'jquery';
import {
  showProjectHeader,
  showMinimalProjectHeader,
  showProjectBackedHeader,
  showLevelBuilderSaveButton
} from './headerRedux';
import {
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  showProjectUpdatedAt,
  setProjectUpdatedAt,
  refreshProjectName,
  setShowTryAgainDialog
} from './projectRedux';
import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import progress from './progress';
import {getStore} from '../redux';
import {
  setUserSignedIn,
  setInitialData
} from '@cdo/apps/templates/currentUserRedux';
import {setVerified} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';
import logToCloud from '../logToCloud';

import {PUZZLE_PAGE_NONE} from '@cdo/apps/templates/progress/progressTypes';
import HeaderMiddle from '@cdo/apps/code-studio/components/header/HeaderMiddle';
import SignInCalloutWrapper from './components/header/SignInCalloutWrapper';

import LabContainer from '@cdo/apps/code-studio/components/LabContainer';

/**
 * Dynamic header generation and event bindings for header actions.
 */

// Namespace for manipulating the header DOM.
var header = {};

/**
 * @param {object} scriptData
 * @param {boolean} scriptData.disablePostMilestone
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
 *   lessonExtras enabled for this script
 * @param {boolean} isLessonExtras Boolean indicating we are not on a script
 *   level and therefore are on lesson extras
 */
header.build = function (
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

  let saveAnswersBeforeNavigation = currentPageNumber !== PUZZLE_PAGE_NONE;

  const currentLevelApp = lessonData.levels.find(level =>
    level.ids.find(id => id === currentLevelId)
  )?.app;
  const showLabContainer = currentLevelApp === 'music';

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
  $(document).ready(function () {
    ReactDOM.render(
      <Provider store={store}>
        <HeaderMiddle
          scriptNameData={scriptNameData}
          lessonData={lessonData}
          scriptData={scriptData}
          currentLevelId={currentLevelId}
          setWindowTitle={() => setWindowTitle(store)}
        />
        {showLabContainer && (
          <LabContainer setWindowTitle={() => setWindowTitle(store)} />
        )}
      </Provider>,
      document.querySelector('.header_level')
    );
    // Only render sign in callout if the course is CSF and the user is
    // not signed in
    if (scriptData.show_sign_in_callout && signedIn === false) {
      ReactDOM.render(
        <SignInCalloutWrapper />,
        document.querySelector('.signin_callout_wrapper')
      );
    }
    setWindowTitle(store);
  });

  // A handler for user-initiated browser back & forward button
  // presses, when arriving on a page that we pushed onto the
  // browser session history stack.
  window.addEventListener('popstate', function (event) {
    const path = new URL(document.location).pathname;
    const values = path.split('/');
    const levelIndex = Number(values[6]) - 1;
    const levelId = lessonData.levels[levelIndex].activeId;

    // Update the redux store.
    getStore().dispatch(setCurrentLevelId(levelId));

    // Update the browser.
    setWindowTitle(store);
  });
};

header.buildProjectInfoOnly = function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <HeaderMiddle projectInfoOnly={true} />
    </Provider>,
    document.querySelector('.header_level')
  );
};

// When viewing the level page in code review mode, we want to show only the
// lesson information (which is displayed by the ScriptName component).
header.buildScriptNameOnly = function (scriptNameData) {
  ReactDOM.render(
    <Provider store={getStore()}>
      <HeaderMiddle scriptNameData={scriptNameData} scriptNameOnly={true} />
    </Provider>,
    document.querySelector('.header_level')
  );
};

// When the page is cached, this function is called to retrieve and set the
// sign-in button or user menu in the DOM.
header.buildUserMenu = function () {
  // Need to wait until the document is ready so we can accurately check to see
  // if the create menu is present.
  $(document).ready(() => {
    const showCreateMenu = $('.create_menu').length > 0;

    fetch(`/dashboardapi/user_menu?showCreateMenu=${showCreateMenu}`, {
      credentials: 'same-origin'
    })
      .then(response => response.text())
      .then(data => $('#sign_in_or_user').html(data))
      .catch(err => {
        console.log(err);
      });
  });
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

function setUpGlobalData(store) {
  fetch('/api/v1/users/current', {
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then(data => {
      store.dispatch(setUserSignedIn(data.is_signed_in));
      if (data.is_signed_in) {
        store.dispatch(setInitialData(data));
        data.is_verified_instructor && store.dispatch(setVerified());

        logToCloud.setCustomAttribute('userId', data.id);
      }
    })
    .catch(err => {
      console.log(err);
    });
}
setUpGlobalData(getStore());

header.showMinimalProjectHeader = function () {
  getStore().dispatch(refreshProjectName());
  getStore().dispatch(showMinimalProjectHeader());
};

header.showLevelBuilderSaveButton = function (
  getChanges,
  overrideHeaderText,
  overrideOnSaveURL
) {
  getStore().dispatch(
    showLevelBuilderSaveButton(
      getChanges,
      overrideHeaderText,
      overrideOnSaveURL
    )
  );
};

/**
 * @param {object} options{{
 *   showShareAndRemix: boolean,
 *   showExport: boolean
 * }}
 */
header.showHeaderForProjectBacked = function (options) {
  if (options.showShareAndRemix) {
    getStore().dispatch(showProjectBackedHeader());
  }

  getStore().dispatch(showProjectUpdatedAt());
  header.updateTimestamp();
};

header.showProjectHeader = function () {
  header.updateTimestamp();
  getStore().dispatch(refreshProjectName());
  getStore().dispatch(showProjectHeader());
};

header.updateTimestamp = function () {
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

// If we are on a new level without doing a page reload, then we should set the title
// to match what levels_helper.rb's level_title function would have done.
function setWindowTitle(store) {
  const storeState = store.getState();
  const numLessons = storeState.progress.lessons[0].num_script_lessons;
  const lessonName = storeState.progress.lessons[0].name;
  const levelId = storeState.progress.currentLevelId;
  const lessonIndex =
    storeState.progress.lessons[0].levels.findIndex(
      level => level.activeId === levelId
    ) + 1;
  const scriptDisplayName = storeState.progress.scriptDisplayName;

  /*
    Equivalent code:

    if @script_level.script.lessons.many?
      "#{lesson} ##{position} | #{script}"
    elsif @script_level.position != 1
      "#{script} ##{position}"
  */

  document.title =
    numLessons > 1
      ? `${lessonName} #${lessonIndex} | ${scriptDisplayName} - Code.org`
      : `${lessonName} #${lessonIndex} - Code.org`;
}

export default header;
