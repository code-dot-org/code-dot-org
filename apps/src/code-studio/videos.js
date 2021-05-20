/* global Dialog, YT */

import $ from 'jquery';
import trackEvent from '../util/trackEvent';
import React from 'react';
import ReactDOM from 'react-dom';
import FallbackPlayerCaptionDialogLink from '../templates/FallbackPlayerCaptionDialogLink';
import videojs from 'video.js';
var testImageAccess = require('./url_test');
var clientState = require('./clientState');
import i18n from '@cdo/locale';
import _ from 'lodash';

const TAB_NAV_CLASS = '.ui-tabs-nav';
const MODAL_CLASS_NAME = 'video-modal';
const MODAL_CLASS = '.' + MODAL_CLASS_NAME;
var videos = (module.exports = {});

videos.createVideoWithFallback = function(
  parentElement,
  options,
  width,
  height,
  fullWidth,
  roundedCorners
) {
  upgradeInsecureOptions(options);
  var video = createVideo(options);
  if (fullWidth) {
    video.addClass('video-player-full-width');
    parentElement.addClass('video-content-full-width');
    width = '100%';
    height = '100%';
  } else {
    video.width(width).height(height);
  }
  if (roundedCorners) {
    video.addClass('video-player-rounded-corners');
  }
  if (parentElement) {
    parentElement.append(video);
  }
  setupVideoFallback(options, width, height);
  return video;
};

function onVideoEnded() {
  $(MODAL_CLASS).trigger('ended');
}

var currentVideoOptions;
function onYouTubeIframeAPIReady() {
  // requires there be an iframe#video present on the page
  new YT.Player('video', {
    events: {
      onStateChange: function(state) {
        if (state.data === YT.PlayerState.ENDED) {
          onVideoEnded();
        }
      },
      onError: function(error) {
        if (currentVideoOptions) {
          var size = error.target.f.getBoundingClientRect();
          addFallbackVideoPlayer(currentVideoOptions, size.width, size.height);
        }
      }
    }
  });
}

function createVideo(options) {
  const videoDiv = $('<iframe id="video"/>')
    .addClass('video-player')
    .attr({
      src: options.src,
      allowfullscreen: 'true',
      scrolling: 'no'
    });

  const videoTabContainerDiv = $("<div id='videoTabContainer'></div>").append(
    videoDiv
  );

  return videoTabContainerDiv;
}

/**
 * @typedef {Object} AutoplayVideo
 * @property {string} src - the url to the video
 * @property {string} key - an uid.
 * @property {string} name - a string.
 * @property {string} redirect - the redirect page after the video is dismissed.
 * @property {function} onClose - actions to take after closing the video dialog, or immediately
 *           if the video isn't shown.
 */

/**
 * @param {AutoplayVideo} options
 * @param {boolean} [forceShowVideo=false]
 */
videos.showVideoDialog = function(options, forceShowVideo) {
  if (forceShowVideo === undefined) {
    forceShowVideo = false;
  }

  if (options.onClose === undefined) {
    options.onClose = function() {};
  }

  if (clientState.hasSeenVideo(options.key) && forceShowVideo === false) {
    // Anything we were going to do when the video closed, we ought to do
    // right now.
    options.onClose();
    if (options.redirect) {
      window.location.href = options.redirect;
    }
    return;
  }

  // Let's record the fact that we're opening a dialog box for the video.
  options.inDialog = true;

  upgradeInsecureOptions(options);

  var body = $('<div/>');
  var content = $('#notes-content')
    .contents()
    .clone();
  content.find('.video-name').text(options.name);
  body.append(content);

  var video = createVideo(options);
  body.append(video);

  var notesDiv = $('<div id="notes-outer"><div id="notes"/></div>');
  body.append(notesDiv);

  getShowNotes(
    options.key,
    function(data) {
      notesDiv.children('#notes').html(data);
    },
    function() {
      openVideoTab();
      body
        .find('a[href="#notes-outer"]')
        .parent()
        .remove();
      body.tabs('refresh');
    }
  );

  var dialog = new Dialog({body: body, redirect: options.redirect});
  var $div = $(dialog.div);
  $div.addClass(MODAL_CLASS_NAME);

  $(MODAL_CLASS).on('remove', function() {
    // Manually removing src to fix a continual playback bug in IE9
    // https://github.com/code-dot-org/code-dot-org/pull/5277#issue-116253168
    video.removeAttr('src');
    options.onClose();
    clientState.recordVideoSeen(options.key);
    // Raise an event that the dialog has been hidden, in case anything needs to
    // play/respond to it.
    var event = document.createEvent('Event');
    event.initEvent('videoHidden', true, true);
    document.dispatchEvent(event);
  });

  var tabHandler = function(event, ui) {
    var tab = ui.tab || ui.newTab; // Depends on event.
    var videoElement = $('#video');
    if (tab.find('a').attr('href') === '#video') {
      // If it is the video page, restore the src
      videoElement.attr('src', options.src);
    } else {
      video.removeAttr('src');
      var videoJSElement = document.querySelector('.video-js');
      if (videoJSElement) {
        videojs(videoJSElement).pause();
      }
    }
    // Remember which tab is selected.
    var selected = tab.parents('.ui-tabs').tabs('option', 'active');
    try {
      window.sessionStorage.setItem('lastTab', selected);
    } catch (exc) {
      console.log('Caught exception in sessionStorage.setItem: ', exc);
    }
  };

  var lastTab = window.sessionStorage.getItem('lastTab');
  body.tabs({
    event: 'click touchend',
    activate: tabHandler,
    create: tabHandler,
    active: lastTab !== null ? lastTab : 0 // Set starting tab.
  });

  var download = $('<a/>')
    .append($('<img src="/shared/images/download_button.png"/>'))
    .addClass('download-video')
    .css('float', 'left')
    .attr('href', options.download)
    .click(function() {
      // track download in Google Analytics
      trackEvent('downloadvideo', 'startdownloadvideo', options.key);
      return true;
    });
  if (document.dir === 'rtl') {
    download.css('float', 'right');
  }
  var nav = $div.find(TAB_NAV_CLASS);
  nav.append(download);

  // Even though some React code will mount to this div and clear its
  // contents, include the same link string as the React code will use, so that
  // our calculations for the modal dimensions will account for its presence.
  var fallbackPlayerLinkDiv = $(
    '<div id="fallback-player-caption-dialog-link">' +
      '<a style="opacity: 0; pointer-events: none">' +
      i18n.fallbackVideoClosedCaptioningLink() +
      '</a></div>'
  ).css({
    'padding-right': '40px',
    'padding-top': '9px',
    'text-align': 'right'
  });
  nav.append(fallbackPlayerLinkDiv);

  let resizeVideoPlayerListener = _.throttle(resizeVideoPlayer, 200);

  // A scroll listener is required for iOS due to its viewport management - it
  // scrolls the page down to show the url & nav bar but doesn't resize the page
  window.addEventListener('scroll', resizeVideoPlayerListener);
  window.addEventListener('resize', resizeVideoPlayerListener);
  resizeVideoPlayer();

  currentVideoOptions = options;
  if (window.YT && window.YT.loaded) {
    onYouTubeIframeAPIReady();
  } else {
    // Use the official YouTube IFrame Player API to load the YouTube video.
    // Ref: https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    // calls window.onYouTubeIframeAPIReady
  }

  dialog.show();

  var videoModal = $(MODAL_CLASS);

  videoModal.on('ended', function() {
    dialog.hide();
  });

  // Raise an event that the dialog has been shown, in case anything needs to
  // pause/respond to it.
  var event = document.createEvent('Event');
  event.initEvent('videoShown', true, true);
  document.dispatchEvent(event);

  // Don't add fallback player if a video modal has closed
  var shouldStillAdd = true;
  videoModal.one('hidden.bs.modal', function() {
    window.removeEventListener('resize', resizeVideoPlayerListener);
    window.removeEventListener('scroll', resizeVideoPlayerListener);
    shouldStillAdd = false;
  });

  var divHeight = getVideoHeight();
  setupVideoFallback(options, $div.width(), divHeight, function() {
    return shouldStillAdd;
  });
};

/**
 * Sets the video player container to 80% of the width or height of the screen
 * at a 9/16 ratio.
 */
function resizeVideoPlayer() {
  let $div = $(MODAL_CLASS);
  const navBarHeight = $div.find(TAB_NAV_CLASS).outerHeight();
  const screenRatio = 0.8;
  const aspectRatio = 16 / 9;
  const maxHeight = window.innerHeight * screenRatio;
  const maxWidth = window.innerWidth * screenRatio;

  // Find whether width or height is the limiting factor when the aspect ratio
  // is 9/16. Then set the dimensions to the largest possible values.
  let containerHeight, containerWidth;
  if ((maxHeight - navBarHeight) * aspectRatio < maxWidth) {
    containerHeight = maxHeight;
    containerWidth = (maxHeight - navBarHeight) * aspectRatio;
  } else {
    containerHeight = maxWidth / aspectRatio + navBarHeight;
    containerWidth = maxWidth;
  }

  // Set the dimensions of the video modal
  $div.height(containerHeight);
  $div.width(containerWidth);

  // The video modal should centered within the inner height of the window
  // (i.e. window height minus browser chrome)
  const top = (window.innerHeight - containerHeight) / 2;

  // Standard css hack to center a div within the viewport.
  $div.css({
    position: 'fixed',
    top: top,
    left: '50%',
    marginLeft: containerWidth / -2 + 'px'
  });

  // The nav bar will have changed dimensions due to the resizing of the
  // container. We re-calculate the available height for the video to account
  // for this.
  const availableHeight = getVideoHeight();
  $('.video-player').height(availableHeight);
  $('#notes-outer').height(availableHeight);
}

/**
 * Gets the target height of the video player based on the container's
 * dimensions.
 */
function getVideoHeight() {
  const container = $(MODAL_CLASS);

  // Here we get the remaining height of the video's container that isn't taken
  // up by the video navigation options.
  return container.innerHeight() - container.find(TAB_NAV_CLASS).outerHeight();
}

// Precondition: $('#video') must exist on the DOM before this function is called.
function setupVideoFallback(
  videoInfo,
  playerWidth,
  playerHeight,
  shouldStillAddCallback
) {
  shouldStillAddCallback =
    shouldStillAddCallback ||
    function() {
      return true;
    };

  if (!videoInfo.enable_fallback) {
    return;
  }

  if (videoInfo.force_fallback) {
    addFallbackVideoPlayer(videoInfo, playerWidth, playerHeight);
    return;
  }

  videos.onYouTubeBlocked(function() {
    if (!shouldStillAddCallback()) {
      return;
    }
    addFallbackVideoPlayer(videoInfo, playerWidth, playerHeight);
  }, videoInfo);
}

// This is exported (and placed on window) because it gets accessed externally for our video test page.
videos.onYouTubeBlocked = function(youTubeBlockedCallback, videoInfo) {
  var key = videoInfo ? videoInfo.key : undefined;

  // Handle URLs with either youtube.com or youtube-nocookie.com.
  var noCookie = videoInfo
    ? videoInfo.src.indexOf('youtube-nocookie.com') !== -1
    : true;

  testImageAccess(
    youTubeAvailabilityEndpointURL(noCookie) + '?' + Math.random(),
    // Called when YouTube availability check succeeds.
    function() {
      // Track event in Google Analytics.
      trackEvent('showvideo', 'startVideoYouTube', key);
    },

    // Called when YouTube availability check fails.
    function() {
      // Track event in Google Analytics.
      trackEvent('showvideo', 'startVideoFallback', key);
      youTubeBlockedCallback();
    }
  );
};

function youTubeAvailabilityEndpointURL(noCookie) {
  const url = window.document.URL.toString();
  if (url.indexOf('force_youtube_fallback') >= 0) {
    return 'https://unreachable-test-subdomain.example.com/favicon.ico';
  } else if (url.indexOf('force_youtube_player') >= 0) {
    return 'https://code.org/images/favicon.ico';
  }

  if (noCookie) {
    return 'https://www.youtube-nocookie.com/favicon.ico';
  } else {
    return 'https://www.youtube.com/favicon.ico';
  }
}

// Precondition: $('#video') must exist on the DOM before this function is called.
function addFallbackVideoPlayer(videoInfo, playerWidth, playerHeight) {
  // Append `?force_youtube_fallback=1` to a url in order to use the fallback
  // player
  var fallbackPlayerID = 'fallbackPlayer' + Date.now();

  // If we have want the video player to be at 100% width & 100% height, then
  // let's assume we are attaching to a container that is relative, and we want
  // to expand to its edges.  This is currently implemented by a standalone
  // video.
  let containerDivStyle;
  let extraVideoStyle = '';
  let dimensions = '';
  if (playerWidth === '100%' && playerHeight === '100%') {
    containerDivStyle =
      'position: absolute; top: 0; bottom: 0; left: 0; right: 0';
    extraVideoStyle = 'vjs-fill';
  } else {
    containerDivStyle = '';
    dimensions = 'width="' + playerWidth + '" height="' + playerHeight + '" ';
  }

  var playerCode =
    '<div style="' +
    containerDivStyle +
    '"><video id="' +
    fallbackPlayerID +
    '" ' +
    dimensions +
    (videoInfo.autoplay ? 'autoplay ' : '') +
    'class="video-js vjs-default-skin vjs-big-play-centered ' +
    extraVideoStyle +
    '" ' +
    'controls preload="auto" ' +
    'poster="' +
    videoInfo.thumbnail +
    '">' +
    '<source src="' +
    videoInfo.download +
    '" type="video/mp4"/>' +
    '</video></div>';

  $('#videoTabContainer').empty();
  $('#videoTabContainer').append(playerCode);

  const videoPlayer = videojs(
    fallbackPlayerID,
    {nativeControlsForTouch: true},
    function() {
      var $fallbackPlayer = $('#' + fallbackPlayerID);

      // Handle a video.js player error.
      this.on('error', function(e) {
        $fallbackPlayer.addClass('fallback-video-player-failed');
        if (hasNotesTab()) {
          openNotesTab();
        }
      });

      function resizeFallbackPlayer() {
        const width = $(MODAL_CLASS).innerWidth();
        const height = getVideoHeight();

        // Embedded videos don't need to be resized and don't have a container
        // modal. Only resize if we are able to find the width and height of
        // the container.
        if (width && height) {
          videoPlayer.dimensions(width, height);
        }
      }

      // A scroll listener is required for iOS due to its viewport management -
      // it scrolls the page down to show the url & nav bar but doesn't resize
      // the page
      let resizeFallbackPlayerListener = _.throttle(resizeFallbackPlayer, 200);
      window.addEventListener('resize', resizeFallbackPlayerListener);
      window.addEventListener('scroll', resizeFallbackPlayerListener);
      resizeFallbackPlayer();

      // Properly dispose of video.js player instance when hidden.
      $fallbackPlayer.parents('.modal').one('hidden.bs.modal', function() {
        window.removeEventListener('resize', resizeFallbackPlayerListener);
        window.removeEventListener('scroll', resizeFallbackPlayerListener);
        videoPlayer.dispose();
      });
    }
  );

  videoPlayer.on('ended', onVideoEnded);
  showFallbackPlayerCaptionLink(videoInfo.inDialog);
}

function hasNotesTab() {
  return $('.dash_modal_body a[href="#notes-outer"]').length > 0;
}

function openNotesTab() {
  var notesTabIndex = $('.dash_modal_body a[href="#notes-outer"]')
    .parent()
    .index();
  $('.ui-tabs').tabs('option', 'active', notesTabIndex);
}

function openVideoTab() {
  var notesTabIndex = $('.dash_modal_body a[href="#videoTabContainer"]')
    .parent()
    .index();
  $('.ui-tabs').tabs('option', 'active', notesTabIndex);
}

function getShowNotes(key, success, error) {
  $.ajax({
    url: '/notes/' + key,
    success: success,
    error: error
  });
}

// Convert http:// video urls to protocol-relative // urls to prevent mixed-content loads on https pages.
function upgradeInsecureOptions(options) {
  if (options.src) {
    options.src = options.src.replace(/^http:\/\//, '//');
  }
  if (options.download) {
    options.download = options.download.replace(/^http:\/\//, '//');
  }
}

/**
 * Show a link to accompany the fallback video player, which, when clicked,
 * pops a modal dialog explaining that the youtube-nocookie.com video player
 * is available if captions are desired.
 * @param inDialog {boolean} Whether this is part of the header of a dialog.
 */
function showFallbackPlayerCaptionLink(inDialog) {
  const mountPoint = document.getElementById(
    'fallback-player-caption-dialog-link'
  );
  if (mountPoint) {
    ReactDOM.render(
      <FallbackPlayerCaptionDialogLink inDialog={inDialog} />,
      mountPoint
    );
  }
}
