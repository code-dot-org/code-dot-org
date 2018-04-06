/* globals dashboard, appOptions, Craft */

import $ from 'jquery';
import _ from 'lodash';
import progress from './progress';
import Dialog from './LegacyDialog';
import { getStore } from '../redux';
import { shareProject } from './headerShare';
import { convertBlocksXml } from '../craft/code-connection/utils';

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
header.build = function (scriptData, stageData, progressData, currentLevelId,
    puzzlePage, signedIn, stageExtrasEnabled) {
  scriptData = scriptData || {};
  stageData = stageData || {};
  progressData = progressData || {};

  const scriptName = scriptData.name;

  if (stageData.finishLink) {
    $('.header_finished_link').show().append($('<a>').attr('href', stageData.finishLink).text(stageData.finishText));
  }
  if (stageData.script_stages > 1) {
    $('.header_popup_link').show();
    stageData.freeplay_links.forEach(function (item) {
      $('.' + item + '_free_play').show();
    });
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

  $('.level_free_play').qtip({
    content: {
      attr: 'title'
    },
    position: {
      my: 'top center',
      at: 'bottom center'
    }
  });

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
    progress.renderMiniView($('.user-stats-block')[0], scriptName, currentLevelId,
      progressData.linesOfCodeText, scriptData.student_detail_progress_view);
    isHeaderPopupVisible = true;
  }
  function hideHeaderPopup(event) {
    // Clicks inside the popup shouldn't close it, unless it's on close button
    const target = event && event.target;
    if ($(".header_popup").find(target).length > 0 &&
        !$(event.target).hasClass('header_popup_close')) {
      return;
    }
    $('.header_popup').hide();
    $('.header_popup_link_glyph').html('&#x25BC;');
    $('.header_popup_link_text').text(dashboard.i18n.t('more'));
    $(document).off('click', hideHeaderPopup);
    isHeaderPopupVisible = false;
  }

  $('.header_popup_link').click(function (e) {
    e.stopPropagation();
    $('.header_popup').is(':visible') ? hideHeaderPopup() : showHeaderPopup();
  });

  $(window).resize(_.debounce(function () {
    if (isHeaderPopupVisible) {
      sizeHeaderPopupToViewport();
    }
  }, 250));

  /**
   * Adjust the maximum size of the popup's inner scroll area so that the whole popup
   * will fit within the browser viewport.
   */
  function sizeHeaderPopupToViewport() {
    var viewportHeight = $(window).height();
    var headerWrapper = $('.header-wrapper');
    var headerPopup = $('.header_popup');
    var popupTop = parseInt(headerWrapper.css('padding-top'), 10) +
        parseInt(headerPopup.css('top'), 10);
    var popupBottom = parseInt(headerPopup.css('margin-bottom'), 10);
    headerPopup.find('.header_popup_scrollable').css('max-height',
        viewportHeight - (popupTop + popupBottom));
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
      window.dashboard.project.setPublishedAt(state.publishDialog.lastPublishedAt);
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

/**
 * Show a popup dialog to collect an Hour of Code share link, and create a new
 * channel-backed project from the associated LevelSource.
 *
 * Currently only supported for Minecraft Code Connection Projects and Minecraft
 * Agent share links
 */
function importProject() {
  if (!Craft) {
    return;
  }

  Craft.showImportFromShareLinkPopup((shareLink) => {
    if (!shareLink) {
      return;
    }

    let sharePath;
    try {
      const anchor = document.createElement('a');
      anchor.href = shareLink;
      sharePath = anchor.pathname;
    } catch (e) {
      // a shareLink that does not represent a valid URL will throw a TypeError
      Craft.showErrorMessagePopup(dashboard.i18n.t('project.share_link_import_bad_link_header'), dashboard.i18n.t('project.share_link_import_bad_link_body'));
      return;
    }

    const legacyShareRegex = /^\/?c\/([^\/]*)/;
    const obfuscatedShareRegex = /^\/?r\/([^\/]*)/;
    const projectShareRegex = /^\/?projects\/minecraft_hero\/([^\/]*)/;

    let levelSourcePath, channelId;

    // Try a couple different kinds of share links, resolving to either a level
    // source or channel
    if (sharePath.match(legacyShareRegex)) {
      const levelSourceId = sharePath.match(legacyShareRegex)[1];
      levelSourcePath = `/c/${levelSourceId}.json`;
    } else if (sharePath.match(obfuscatedShareRegex)) {
      const levelSourceId = sharePath.match(obfuscatedShareRegex)[1];
      levelSourcePath = `/r/${levelSourceId}.json`;
    } else if (sharePath.match(projectShareRegex)) {
      channelId = sharePath.match(projectShareRegex)[1];
    }

    const onFinish = function (source) {
      // Source data will likely be from a different project type than this one,
      // so convert it

      const convertedSource = convertBlocksXml(source);
      dashboard.project.createNewChannelFromSource(convertedSource, function (channelData) {
        const pathName = dashboard.project.appToProjectUrl() + '/' + channelData.id + '/edit';
        location.href = pathName;
      });
    };

    const onError = function () {
      Craft.showErrorMessagePopup(dashboard.i18n.t('project.share_link_import_error_header'), dashboard.i18n.t('project.share_link_import_error_body'));
    };

    // Depending on what kind of source the share link resolved to (if it even
    // did), retrieve the source and process it
    if (levelSourcePath) {
      // level sources can be grabbed with a simple ajax request
      $.ajax({
        url: levelSourcePath,
        type: "get",
        dataType: "json"
      }).done(function (data) {
        onFinish(data.data);
      }).error(function () {
        onError();
      });
    } else if (channelId) {
      // channel-backed sources need to go through the project API
      dashboard.project.getSourceForChannel(channelId, function (source) {
        if (source) {
          onFinish(source);
        } else {
          onError();
        }
      });
    } else {
        Craft.showErrorMessagePopup(dashboard.i18n.t('project.share_link_import_bad_link_header'), dashboard.i18n.t('project.share_link_import_bad_link_body'));
    }
  });
}

function remixProject() {
  if (dashboard.project.getCurrentId() && dashboard.project.canServerSideRemix()) {
    dashboard.project.serverSideRemix();
  } else if (!getStore().getState().pageConstants.isSignedIn) {
    window.location = `/users/sign_in?user_return_to=${window.location.pathname}`;
  } else {
    // We don't have an id. This implies we are either on a legacy /c/ share
    // page or a script level. In these cases, copy will create a new project
    // for us.
    var newName = "Remix: " + (dashboard.project.getCurrentName() || appOptions.level.projectTemplateLevelName || "My Project");
    dashboard.project.copy(newName, {shouldNavigate: true})
      .then(() => $(".project_name").text(newName))
      .catch(err => console.log(err));
  }
}

// Minimal project header for viewing channel shares and legacy /c/ share pages.
header.showMinimalProjectHeader = function () {
  var projectName = $('<div class="project_name_wrapper header_text">')
      .append($('<div class="project_name header_text">').text(dashboard.project.getCurrentName()))
      .append($('<div class="project_updated_at header_text">').text(dashboard.i18n.t('project.click_to_remix')));

  $('.project_info')
      .append(projectName)
      .append($('<div class="project_remix header_button">').text(dashboard.i18n.t('project.remix')));
  $('.project_remix').click(remixProject);
};

// Project header for script levels that are backed by a project. Shows a
// Share and Remix button, and places a last_modified time below the stage
// name
/**
 * @param {object} options{{
 *   showShareAndRemix: boolean
 * }}
 */
header.showHeaderForProjectBacked = function (options) {
  if ($('.project_updated_at').length !== 0) {
    return;
  }
  if (options.showShareAndRemix) {
    $('.project_info')
        .append($('<div class="project_share header_button header_button_light">').text(dashboard.i18n.t('project.share')))
        .append($('<div class="project_remix header_button header_button_light">').text(dashboard.i18n.t('project.remix')));
    $('.project_share').click(shareProject);
    $('.project_remix').click(remixProject);
  }

  // Add updated_at below the level name. Do this by creating a new div, moving
  // the level text into it, applying some styling, and placing that div where
  // levelText was previously.
  // I really don't like that we're modifying DOM elements/styles of other
  // elements here, but until this is all Reactified, I'm not sure if theres
  // a better solution
  var levelText = $(".header_level_container").children().first().detach();
  $(".header_level_container").prepend(
    $('<div>').css({display: 'inline-block', verticalAlign: 'bottom'})
      .append(levelText.css('display', 'block'))
      .append($('<div class="project_updated_at header_text">').css({
        display: 'block',
        textAlign: 'left'
      }))
  );

  header.updateTimestamp();
};

header.showProjectHeader = function () {
  function projectNameShow() {
    $('.project_name').replaceWith($('<div class="project_name header_text">').text(dashboard.project.getCurrentName()));
    header.updateTimestamp();
    $('.project_save').replaceWith($('<div class="project_edit header_button header_button_light">').text(dashboard.i18n.t('project.rename')));
  }

  function projectNameEdit() {
    $('.project_updated_at').hide();
    $('.project_name').replaceWith($('<input type="text" class="project_name header_input" maxlength="100">').val(dashboard.project.getCurrentName()));
    $('.project_edit').replaceWith($('<div class="project_save header_button header_button_light">').text(dashboard.i18n.t('project.save')));
  }

  var nameAndUpdated = $('<div class="project_name_wrapper header_text">') // content will be added by projectNameShow
      .append($('<div class="project_name header_text">'))
      .append($('<div class="project_updated_at header_text">'));

  $('.project_info').append(nameAndUpdated)
      .append($('<div class="project_edit header_button header_button_light">').text(dashboard.i18n.t('project.rename')))
      .append($('<div class="project_share header_button header_button_light">').text(dashboard.i18n.t('project.share')))
      .append($('<div class="project_remix header_button header_button_light">').text(dashboard.i18n.t('project.remix')))
      .append($('<div class="project_new header_button header_button_light">').text(dashboard.i18n.t('project.new')));

  // For Minecraft Code Connection (aka CodeBuilder) projects, add the option to
  // import code from an Hour of Code share link
  if (appOptions.level.isConnectionLevel) {
    $('.project_info').append($('<div class="project_import header_button header_button_light">').text(dashboard.i18n.t('project.import')));
  }

  // TODO: Remove this (and the related style) when Web Lab is no longer in beta.
  if ('weblab' === appOptions.app) {
    $('.project_info').append($('<div class="beta-notice">').text(dashboard.i18n.t('beta')));
  }

  projectNameShow();
  $('.freeplay_links').empty().before($('<div class="project_list header_button header_button_light">').text(dashboard.i18n.t('project.my_projects')));

  $(document).on('click', '.project_edit', projectNameEdit);

  $(document).on('input', '.project_name', function () {
    if ($(this).val().trim().length === 0) {
      $('.project_save').attr('disabled', true);
    } else {
      $('.project_save').removeAttr('disabled');
    }
  });

  $(document).on('click', '.project_save', function () {
    if ($(this).attr('disabled')) {
      return;
    }
    $(this).attr('disabled', true);
    dashboard.project.rename($('.project_name').val().trim().substr(0, 100), projectNameShow);
  });

  $('.project_share').click(shareProject);
  $('.project_remix').click(remixProject);
  $('.project_import').click(importProject);

  var $projectMorePopup = $('.project_more_popup');
  function hideProjectMore() {
    $projectMorePopup.hide();
    $('.project_more_glyph').html('&#x25BC;');
    $(document).off('click', hideProjectMore);
  }
  $('.project_more').click(function (e) {
    if ($projectMorePopup.is(':hidden')) {
      e.stopPropagation();
      $projectMorePopup.show();
      $('.project_more_glyph').html('&#x25B2;');
      $(document).on('click', hideProjectMore);
    }
  });
  $projectMorePopup.click(function (e) {
    e.stopPropagation(); // Clicks inside the popup shouldn't close it.
  });

  $('.project_delete').click(function (e) {
    e.preventDefault(); // Don't change the hash.
    var dialog = new Dialog({body: '<img class="modal-image" src="' + appOptions.skin.staticAvatar + '">' +
        '<div id="confirm-delete" class="modal-content">' +
        '<p class="dialog-title">' + dashboard.i18n.t('project.delete_confirm_title') + '</p>' +
        '<p>' + dashboard.i18n.t('project.delete_confirm_text') + '</p>' +
        '<button id="again-button">' + dashboard.i18n.t('project.cancel') + '</button>' +
        '<button id="continue-button" style="float: right">' + dashboard.i18n.t('project.delete') + '</button></div>'
    });
    dialog.show();
    $('#confirm-delete #continue-button').click(function () {
      dashboard.project.delete(function () {
        location.href = dashboard.project.appToProjectUrl();
      });
    });
    $('#confirm-delete #again-button').click(function () {
      dialog.hide();
    });
  });

  $('.project_new').click(dashboard.project.createNew);

  $(document).on('click', '.project_list', function () {
    location.href = '/projects';
  });
};

header.updateTimestamp = function () {
  var timestamp = dashboard.project.getCurrentTimestamp();
  if (timestamp) {
    $('.project_updated_at').empty().append("Saved ")  // TODO i18n
        .append($('<span class="timestamp">').attr('title', timestamp)).show();
    $('.project_updated_at span.timestamp').timeago();
  } else {
    $('.project_updated_at').text("Not saved"); // TODO i18n
  }
};

// TODO i18n
header.showProjectSaveError = () => {
  const saveErrorTooltip = "It looks like we couldn't save your progress. Make sure you have a " +
    "good internet connection and try running the project again to save it.";

  const saveErrorHtml = `
<span class="project-save-error" title="${saveErrorTooltip}">
  <i class="fa fa-exclamation-triangle"/> Error saving project
</span>`;

  $('.project_updated_at').html(saveErrorHtml);
};

export default header;
