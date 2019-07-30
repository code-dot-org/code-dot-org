/* globals dashboard */

import $ from 'jquery';
import _ from 'lodash';

import {
  showProjectHeader as showProjectHeaderAction,
  showMinimalProjectHeader as showMinimalProjectHeaderAction,
  showProjectBackedHeader,
  showLevelBuilderSaveButton as showLevelBuilderSaveButtonAction,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
  showProjectUpdatedAt,
  setProjectUpdatedAt,
  refreshProjectName,
  setShowTryAgainDialog
} from './headerRedux';

import progress from './progress';
import {getStore} from '../redux';

/**
 * Dynamic header generation and event bindings for header actions.
 */

/**
 * See ApplicationHelper::PUZZLE_PAGE_NONE.
 */
const PUZZLE_PAGE_NONE = -1;

/**
 * @param {object} scriptData
 * @param {boolean} scriptData.disablePostMilestone
 * @param {boolean} scriptData.isHocScript
 * @param {string} scriptData.name
 * @param {object} stageData{{
 *   script_id: number,
 *   script_name: number,
 *   script_stages: id,
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
export const build = function(
  scriptData,
  stageData,
  progressData,
  currentLevelId,
  puzzlePage,
  signedIn,
  stageExtrasEnabled
) {
  scriptData = scriptData || {};
  stageData = stageData || {};
  progressData = progressData || {};

  const scriptName = scriptData.name;

  if (stageData.finishLink) {
    $('.header_finished_link')
      .show()
      .append(
        $('<a>')
          .attr('href', stageData.finishLink)
          .text(stageData.finishText)
      );
  }
  if (stageData.script_stages > 1) {
    $('.header_popup_link').show();
  }

  let saveAnswersBeforeNavigation = puzzlePage !== PUZZLE_PAGE_NONE;
  progress.renderStageProgress(
    scriptData,
    stageData,
    progressData,
    currentLevelId,
    saveAnswersBeforeNavigation,
    signedIn,
    stageExtrasEnabled
  );

  /**
   * Track boolean "visible" state of header popup to avoid
   * expensive lookup on window resize.
   * @type {boolean}
   */
  var isHeaderPopupVisible = false;

  function showHeaderPopup() {
    sizeHeaderPopupToViewport();
    $('.header_popup').show();
    $('.header_popup_link_glyph').html('&#x25B2;');
    $('.header_popup_link_text').text(dashboard.i18n.t('less'));
    $(document).on('click', hideHeaderPopup);
    progress.renderMiniView(
      $('.user-stats-block')[0],
      scriptName,
      currentLevelId,
      progressData.linesOfCodeText,
      scriptData.student_detail_progress_view
    );
    isHeaderPopupVisible = true;
  }
  function hideHeaderPopup(event) {
    // Clicks inside the popup shouldn't close it, unless it's on close button
    const target = event && event.target;
    if (
      $('.header_popup').find(target).length > 0 &&
      !$(event.target).hasClass('header_popup_close')
    ) {
      return;
    }
    $('.header_popup').hide();
    $('.header_popup_link_glyph').html('&#x25BC;');
    $('.header_popup_link_text').text(dashboard.i18n.t('more'));
    $(document).off('click', hideHeaderPopup);
    isHeaderPopupVisible = false;
  }

  $('.header_popup_link').click(function(e) {
    e.stopPropagation();
    $('.header_popup').is(':visible') ? hideHeaderPopup() : showHeaderPopup();
  });

  $(window).resize(
    _.debounce(function() {
      if (isHeaderPopupVisible) {
        sizeHeaderPopupToViewport();
      }
    }, 250)
  );

  /**
   * Adjust the maximum size of the popup's inner scroll area so that the whole popup
   * will fit within the browser viewport.
   */
  function sizeHeaderPopupToViewport() {
    var viewportHeight = $(window).height();
    var headerWrapper = $('.header-wrapper');
    var headerPopup = $('.header_popup');
    var popupTop =
      parseInt(headerWrapper.css('padding-top'), 10) +
      parseInt(headerPopup.css('top'), 10);
    var popupBottom = parseInt(headerPopup.css('margin-bottom'), 10);
    headerPopup
      .find('.header_popup_scrollable')
      .css('max-height', viewportHeight - (popupTop + popupBottom));
  }
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

export const showMinimalProjectHeader = function() {
  getStore().dispatch(refreshProjectName());
  getStore().dispatch(showMinimalProjectHeaderAction());
};

export const showLevelBuilderSaveButton = function(getChanges) {
  getStore().dispatch(showLevelBuilderSaveButtonAction(getChanges));
};

/**
 * @param {object} options{{
 *   showShareAndRemix: boolean,
 *   showExport: boolean
 * }}
 */
export const showHeaderForProjectBacked = function(options) {
  if (options.showShareAndRemix) {
    getStore().dispatch(showProjectBackedHeader(options.showExport));
  }

  getStore().dispatch(showProjectUpdatedAt());
  header.updateTimestamp();
};

export const showProjectHeader = function(options) {
  header.updateTimestamp();
  getStore().dispatch(refreshProjectName());
  getStore().dispatch(showProjectHeaderAction(options.showExport));
};

export const updateTimestamp = function() {
  const timestamp = dashboard.project.getCurrentTimestamp();
  getStore().dispatch(setProjectUpdatedAt(timestamp));
};

export const showProjectSaveError = () => {
  getStore().dispatch(setProjectUpdatedError());
};

export const showProjectSaving = () => {
  getStore().dispatch(setProjectUpdatedSaving());
};

export const showTryAgainDialog = () => {
  getStore().dispatch(setShowTryAgainDialog(true));
};

export const hideTryAgainDialog = () => {
  getStore().dispatch(setShowTryAgainDialog(false));
};

const header = {
  build,
  showMinimalProjectHeader,
  showLevelBuilderSaveButton,
  showHeaderForProjectBacked,
  showProjectHeader,
  updateTimestamp,
  showProjectSaveError,
  showProjectSaving,
  showTryAgainDialog,
  hideTryAgainDialog
};
export default header;
