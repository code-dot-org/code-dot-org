/* globals dashboard, trackEvent, Dialog, React, appOptions */

/**
 * Dynamic header generation and event bindings for header actions.
 */

// Namespace for manipulating the header DOM.
var header = module.exports = {};

/**
 * @param stageData{{
 *   script_id: number,
 *   script_name: number,
 *   script_stages: id,
 *   title: string,
 *   finishLink: string,
 *   finishText: string,
 *   trophies: Object,
 *   levels: Array.<{
 *     id: number,
 *     position: number,
 *     title: string,
 *     kind: string
 *   }>
 * }}
 */
header.build = function (stageData, progressData, currentLevelId, scriptName, puzzlePage) {
  stageData = stageData || {};
  progressData = progressData || {};

  var clientProgress = dashboard.clientState.allLevelsProgress()[scriptName] || {};

  $('.header_text').first().text(stageData.title);
  if (stageData.finishLink) {
    $('.header_finished_link').show().append($('<a>').attr('href', stageData.finishLink).text(stageData.finishText));
  }
  if (stageData.script_stages > 1) {
    $('.header_popup_link').show();
    stageData.freeplay_links.forEach(function (item) {
      $('.' + item + '_free_play').show();
    });
  }
  if (progressData.trophies) {
    $('.header_trophy_link').show();
    $('.header_trophy_link .current_trophies').text(progressData.trophies.current);
    $('.header_trophy_link .max_trophies').text(progressData.trophies.of + ' ' + progressData.trophies.max);
  }
  if (progressData.linesOfCodeText) {
    $('.header_popup .header_text').text(progressData.linesOfCodeText);
  }

  dashboard.progress.renderStageProgress(stageData, progressData, clientProgress, currentLevelId, puzzlePage);

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

  function showHeaderPopup(target) {
    sizeHeaderPopupToViewport();
    $('.header_popup').show();
    $('.header_popup_link_glyph').html('&#x25B2;');
    $('.header_popup_link_text').text(dashboard.i18n.t('less'));
    $(document).on('click', hideHeaderPopup);
    lazyLoadPopup($(target).closest('.header_trophy_link').length > 0);
    isHeaderPopupVisible = true;
  }
  function hideHeaderPopup() {
    $('.header_popup').hide();
    $('.header_popup_link_glyph').html('&#x25BC;');
    $('.header_popup_link_text').text(dashboard.i18n.t('more'));
    $(document).off('click', hideHeaderPopup);
    isHeaderPopupVisible = false;
  }

  $('.header_popup_link, .header_trophy_link').click(function (e) {
    e.stopPropagation();
    if ($('.header_popup').is(':visible')) {
      hideHeaderPopup();
    } else {
      showHeaderPopup(e.target);
    }
  });
  $('.header_popup').click(function (e) {
    e.stopPropagation(); // Clicks inside the popup shouldn't close it
  });
  $('.header_popup_close').click(hideHeaderPopup);

  $(window).resize(dashboard.utils.debounce(function () {
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
    var footerHeight = headerPopup.find('.header_popup_footer').outerHeight();
    headerPopup.find('.header_popup_scrollable').css('max-height',
        viewportHeight - (popupTop + popupBottom + footerHeight));
  }

  var popupLoaded = false;
  function lazyLoadPopup(trophiesClicked) {
    if (!popupLoaded) {
      popupLoaded = true;
      $.ajax({
        url: "/popup/stats",
        data: {
          script_id: stageData.script_id,
          current_level_id: currentLevelId,
          user_id: dashboard.clientState.queryParams('user_id'),
          section_id: dashboard.clientState.queryParams('section_id')
        }, success: function (result) {
          $('.header_popup_body').html(result);
          if (trophiesClicked) {
            jumpToTrophies();
          }
        }
      });
    } else if (trophiesClicked) {
      jumpToTrophies();
    }
  }
  function jumpToTrophies() {
    window.scrollTo(0, +$('#trophies').offset().top);
  }
};

function shareProject() {
  dashboard.project.save(function () {
    var origin = location.protocol + '//' + location.host;
    var shareUrl = origin + dashboard.project.getPathName();
    var encodedShareUrl = encodeURIComponent(shareUrl);

    var i18n = window.dashboard.i18n;

    var dialogDom = document.getElementById('project-share-dialog');
    if (!dialogDom) {
      dialogDom = document.createElement('div');
      dialogDom.setAttribute('id', 'project-share-dialog');
      document.body.appendChild(dialogDom);
    }

    var dialog = React.createElement(dashboard.ShareDialog, {
      i18n: i18n,
      icon: appOptions.skin.staticAvatar,
      title: i18n.t('project.share_title'),
      shareCopyLink: i18n.t('project.share_copy_link'),
      shareUrl: shareUrl,
      encodedShareUrl: encodedShareUrl,
      closeText: i18n.t('project.close'),
      isAbusive: dashboard.project.exceedsAbuseThreshold(),
      abuseTos: i18n.t('project.abuse.tos'),
      abuseContact: i18n.t('project.abuse.contact_us'),
      channelId: dashboard.project.getCurrentId(),
      appType: dashboard.project.getStandaloneApp(),
      onClickPopup: dashboard.popupWindow
    });
    ReactDOM.render(dialog, dialogDom);
  });
}

function remixProject() {
  if (dashboard.project.getCurrentId()) {
    dashboard.project.serverSideRemix();
  } else {
    // We don't have an id. This implies we are either a legacy /c/ share page,
    // or we're on a blank project page that hasn't been saved for the first time
    // yet. In both cases, copy will create a new project for us.
    var newName = "Remix: " + (dashboard.project.getCurrentName() || appOptions.level.projectTemplateLevelName || "My Project");
    dashboard.project.copy(newName, function() {
      $(".project_name").text(newName);
    });
  }
}

// Minimal project header for viewing channel shares and legacy /c/ share pages.
header.showMinimalProjectHeader = function () {
  var projectName = $('<div class="project_name_wrapper header_text">')
      .append($('<div class="project_name header_text">').text(dashboard.project.getCurrentName()))
      .append($('<div class="project_updated_at header_text">').text(dashboard.i18n.t('project.click_to_remix')));

  $('.project_info')
      .append(projectName)
      .append($('<div class="project_remix header_button header_button_light">').text(dashboard.i18n.t('project.remix')));
  $('.project_remix').click(remixProject);
};

// Project header for script levels that are backed by a project. Shows a
// Share and Remix button, and places a last_modified time below the stage
// name
header.showHeaderForProjectBacked = function () {
  if ($('.project_info .project_share').length !== 0) {
    return;
  }
  $('.project_info')
      .append($('<div class="project_share header_button header_button_light">').text(dashboard.i18n.t('project.share')))
      .append($('<div class="project_remix header_button header_button_light">').text(dashboard.i18n.t('project.remix')));
  $('.project_share').click(shareProject);
  $('.project_remix').click(remixProject);

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

  // TODO: Remove this (and the related style) when Game Lab is no longer in beta.
  if ('gamelab' === appOptions.app) {
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
