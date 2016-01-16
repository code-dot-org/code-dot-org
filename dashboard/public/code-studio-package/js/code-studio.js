require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({170:[function(require,module,exports){
/**
 * @file Replacement for application.js.erb in dashboard as much as possible.
 *       Code added here will be loaded for (almost) every page in dashboard,
 *       so use sparingly!
 *
 * Note: This is included _after_ application.js.erb during our transition period,
 * so when moving things preserve the include order as much as possible.
 */
'use strict';
/* global Sounds */

require('./videos');

window.React = require('react');
// TODO (bbuchanan): Stop including these components in a global way, just
//                   require them specifically where needed.
require('./components/abuse_error.jsx');
require('./components/abuse_exclamation.jsx');
require('./components/dialog.jsx');
require('./components/report_abuse_form.jsx');
require('./components/send_to_phone.jsx');
require('./components/share_dialog.jsx');
require('./components/share_dialog_body.jsx');
require('./components/small_footer.jsx');
require('./components/stage_progress.jsx');

// Prevent callstack exceptions when opening multiple dialogs
// http://stackoverflow.com/a/15856139/2506748
$.fn.modal.Constructor.prototype.enforceFocus = function () {};

// In IE console is only defined when developer tools is open. Define it as a
// noop when undefined (otherwise exceptions get thrown)
if (!window.console) {
  window.console = {};
}
if (!window.console.log) {
  window.console.log = function () {};
}

// Wrap existing window onerror caller with a script error check.  If we have a
// script error and a url, throw that so that we have the info in new relic.
var windowOnError = window.onerror;
window.onerror = function (msg, url, ln) {
  if (/^Script error/.test(msg) && url) {
    arguments[0] = 'Script Error: ' + url;
  }
  if (windowOnError) {
    return windowOnError.apply(this, arguments);
  }
};

// Prevent escape from canceling page loads.
var KEY_ESCAPE = 27;
$(document).keydown(function (e) {
  if (e.keyCode === KEY_ESCAPE) {
    e.stopPropagation();
    e.preventDefault();
  }
});

setTimeout(function () {
  $('#codeApp .slow_load').show();
}, 10000);

window.CDOSounds = new Sounds();

},{"./components/abuse_error.jsx":171,"./components/abuse_exclamation.jsx":172,"./components/dialog.jsx":173,"./components/report_abuse_form.jsx":174,"./components/send_to_phone.jsx":175,"./components/share_dialog.jsx":176,"./components/share_dialog_body.jsx":177,"./components/small_footer.jsx":178,"./components/stage_progress.jsx":179,"./videos":189,"react":168}],189:[function(require,module,exports){
'use strict';
/* global dashboard, Dialog, YT */

var videojs = require('video.js');
var testImageAccess = require('./url_test');

window.createVideoWithFallback = function (parentElement, options, width, height) {
  upgradeInsecureOptions(options);
  var video = createVideo(options);
  video.width(width).height(height);
  if (parentElement) {
    parentElement.append(video);
  }
  setupVideoFallback(options, width, height);
  return video;
};

function onVideoEnded() {
  $('.video-modal').trigger("ended");
}

function onYouTubeIframeAPIReady() {
  // requires there be an iframe#video present on the page
  var player = new YT.Player('video');
  player.addEventListener('onStateChange', function (state) {
    if (state.data === YT.PlayerState.ENDED) {
      onVideoEnded();
    }
  });
}

function createVideo(options) {
  return $('<iframe id="video"/>').addClass('video-player').attr({
    src: options.src,
    scrolling: 'no'
  });
}

// Options include:
//   src - the url to the video
//   key - an uid.
//   name - a string.
//   redirect - the redirect page after the video is dismissed.
//   onClose - actions to take after closing the video dialog, or immediately
//             if the video isn't shown.
window.showVideoDialog = function (options, forceShowVideo) {
  if (forceShowVideo === undefined) {
    forceShowVideo = false;
  }

  if (options.onClose === undefined) {
    options.onClose = function () {};
  }

  if (dashboard.clientState.hasSeenVideo(options.key) && forceShowVideo === false) {
    // Anything we were going to do when the video closed, we ought to do
    // right now.
    options.onClose();
    if (options.redirect) {
      window.location.href = options.redirect;
    }
    return;
  }

  upgradeInsecureOptions(options);
  var widthRatio = 0.8;
  var heightRatio = 0.8;
  var aspectRatio = 16 / 9;

  var body = $('<div/>');
  var content = $('#notes-content').contents().clone();
  content.find('.video-name').text(options.name);
  body.append(content);

  var video = createVideo(options);
  body.append(video);

  var notesDiv = $('<div id="notes-outer"><div id="notes"/></div>');
  body.append(notesDiv);
  getShowNotes(options.key, notesDiv.children('#notes'));

  var dialog = new Dialog({ body: body, redirect: options.redirect });
  var $div = $(dialog.div);
  $div.addClass('video-modal');

  $('.video-modal').on("remove", function () {
    // Manually removing src to fix a continual playback bug in IE9
    // https://github.com/code-dot-org/code-dot-org/pull/5277#issue-116253168
    video.removeAttr('src');
    options.onClose();
    dashboard.clientState.recordVideoSeen(options.key);
    // Raise an event that the dialog has been hidden, in case anything needs to
    // play/respond to it.
    var event = document.createEvent('Event');
    event.initEvent('videoHidden', true, true);
    document.dispatchEvent(event);
  });

  var tabHandler = function tabHandler(event, ui) {
    var tab = ui.tab || ui.newTab; // Depends on event.
    var videoElement = $('#video');
    if (tab.find('a').attr('href') === "#video") {
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

  var download = $('<a/>').append($('<img src="/shared/images/download_button.png"/>')).addClass('download-video').attr('href', options.download);
  var nav = $div.find('.ui-tabs-nav');
  nav.append(download);

  // Resize modal to fit constraining dimension.
  var height = $(window).height() * widthRatio,
      width = $(window).width() * heightRatio;

  if (height * aspectRatio < width) {
    $div.height(height);
    $div.width(height * aspectRatio);
  } else {
    $div.height(width / aspectRatio);
    $div.width(width);
  }

  // Standard css hack to center a div within the viewport.
  $div.css({
    top: '50%',
    left: '50%',
    marginTop: $div.height() / -2 + 'px',
    marginLeft: $div.width() / -2 + 'px'
  });

  var divHeight = $div.innerHeight() - nav.outerHeight();
  $(video).height(divHeight);

  notesDiv.height(divHeight);

  if (window.YT && window.YT.loaded) {
    onYouTubeIframeAPIReady();
  } else {
    // Use the official YouTube IFrame Player API to load the YouTube video.
    // Ref: https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    // calls window.onYouTubeIframeAPIReady
  }

  dialog.show();

  var videoModal = $('.video-modal');

  videoModal.on("ended", function () {
    dialog.hide();
  });

  // Raise an event that the dialog has been shown, in case anything needs to
  // pause/respond to it.
  var event = document.createEvent('Event');
  event.initEvent('videoShown', true, true);
  document.dispatchEvent(event);

  // Don't add fallback player if a video modal has closed
  var shouldStillAdd = true;
  videoModal.one('hidden.bs.modal', function () {
    shouldStillAdd = false;
  });

  setupVideoFallback(options, $div.width(), divHeight, function () {
    return shouldStillAdd;
  });
};

// Precondition: $('#video') must exist on the DOM before this function is called.
function setupVideoFallback(videoInfo, playerWidth, playerHeight, shouldStillAddCallback) {
  shouldStillAddCallback = shouldStillAddCallback || function () {
    return true;
  };

  if (!videoInfo.enable_fallback) {
    return;
  }

  if (videoInfo.force_fallback) {
    addFallbackVideoPlayer(videoInfo, playerWidth, playerHeight);
    return;
  }

  window.onYouTubeBlocked(function () {
    if (!shouldStillAddCallback()) {
      return;
    }
    addFallbackVideoPlayer(videoInfo, playerWidth, playerHeight);
  });
}

// This is on window because it gets accessed externally for our video test page.
window.onYouTubeBlocked = function (callback) {
  testImageAccess(youTubeAvailabilityEndpointURL() + '?' + Math.random(), function () {}, callback);
};

function youTubeAvailabilityEndpointURL() {
  if (window.document.URL.toString().indexOf('force_youtube_fallback') >= 0) {
    return 'https://unreachable-test-subdomain.example.com/favicon.ico';
  }
  return "https://www.youtube.com/favicon.ico";
}

// Precondition: $('#video') must exist on the DOM before this function is called.
function addFallbackVideoPlayer(videoInfo, playerWidth, playerHeight) {
  var fallbackPlayerID = 'fallbackPlayer' + Date.now();
  var playerCode = '<div><video id="' + fallbackPlayerID + '" ' + 'width="' + playerWidth + '" height="' + playerHeight + '" ' + (videoInfo.autoplay ? 'autoplay ' : '') + 'class="video-js vjs-default-skin vjs-big-play-centered" ' + 'controls preload="auto" ' + 'poster="' + videoInfo.thumbnail + '">' + '<source src="' + videoInfo.download + '" type="video/mp4"/>' + '</video></div>';

  // Swap current #video with new code
  $('#video').replaceWith(playerCode);

  videojs.options.flash.swf = '/code-studio/assets/video-js/video-js.swf';
  videojs.options.techOrder = ["flash", "html5"];

  var videoPlayer = videojs(fallbackPlayerID, {}, function () {
    var $fallbackPlayer = $('#' + fallbackPlayerID);
    var showingErrorMessage = $fallbackPlayer.find('p').length > 0;
    if (showingErrorMessage) {
      $fallbackPlayer.addClass('fallback-video-player-failed');
      if (hasNotesTab()) {
        openNotesTab();
      }
    }
    // Properly dispose of video.js player instance when hidden
    $fallbackPlayer.parents('.modal').one('hidden.bs.modal', function () {
      videoPlayer.dispose();
    });
  });

  videoPlayer.on('ended', onVideoEnded);
}

function hasNotesTab() {
  return $('.dash_modal_body a[href="#notes-outer"]').length > 0;
}

function openNotesTab() {
  var notesTabIndex = $('.dash_modal_body a[href="#notes-outer"]').parent().index();
  $('.ui-tabs').tabs('option', 'active', notesTabIndex);
}

function getShowNotes(key, container) {
  var callback = function callback(data) {
    container.html(data);
  };

  $.ajax({
    url: '/notes/' + key,
    success: callback
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

},{"./url_test":188,"video.js":169}],188:[function(require,module,exports){
'use strict';

// Tests whether the browser can access an image URL.
// Useful as a workaround for CORS security to test access to an origin.
function testImageAccess(url, successCallback, failureCallback, timeoutMs) {
  timeoutMs = typeof timeoutMs !== 'undefined' ? timeoutMs : 5000;
  var img = new Image();
  var called = false;
  function finish(callback) {
    return function () {
      if (called) {
        return;
      }
      called = true;
      window.clearTimeout(timeout);
      callback();
    };
  }
  var timeout = window.setTimeout(finish(failureCallback), timeoutMs);
  img.onerror = finish(failureCallback);
  img.onload = finish(successCallback);
  img.src = url;
  // store a reference to the Image so it doesn't get collected
  window.testImages = window.testImages || [];
  window.testImages.push(img);
}
module.exports = testImageAccess;

},{}],179:[function(require,module,exports){
/* global React */

'use strict';

window.dashboard = window.dashboard || {};

/**
 * Stage progress component used in level header and course overview.
 */
window.dashboard.StageProgress = (function (React) {
  return React.createClass({
    propTypes: {
      levels: React.PropTypes.arrayOf(React.PropTypes.shape({
        title: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
        status: React.PropTypes.string,
        kind: React.PropTypes.oneOf(['unplugged', 'assessment', 'puzzle']),
        link: React.PropTypes.string,
        id: React.PropTypes.number
      })),
      currentLevelIndex: React.PropTypes.number
    },

    render: function render() {
      var lastIndex = this.props.levels.length - 1;
      var progressDots = this.props.levels.map((function (level, index) {

        var innerClass = 'level_link ' + level.status;
        if (level.kind == 'unplugged') {
          innerClass += ' unplugged_level';
        }

        var outerClass = level.kind === 'assessment' ? 'puzzle_outer_assessment' : 'puzzle_outer_level';
        outerClass = index === this.props.currentLevelIndex ? 'puzzle_outer_current' : outerClass;
        if (index === lastIndex) {
          outerClass += ' last';
        }

        return [React.createElement(
          'div',
          { className: outerClass },
          React.createElement(
            'a',
            { id: 'header-level-' + level.id, href: level.link, className: innerClass },
            level.title
          )
        ), ' '];
      }).bind(this));

      return React.createElement(
        'div',
        { className: 'progress_container' },
        progressDots
      );
    }
  });
})(React);

},{}],178:[function(require,module,exports){
/*jshint scripturl:true*/

// This code might better live in shared eventually. doing that would
// require adding JSX transpiling to shared, and the ability to output multiple
// bundles

'use strict';

window.dashboard = window.dashboard || {};

window.dashboard.footer = (function () {
  /**
   * Gets our React component SmallFooter. We use a getter so that we don't depend
   * on React being in the global namespace at load time.
   */
  function createSmallFooter(React) {
    var MenuState = {
      MINIMIZING: 'MINIMIZING',
      MINIMIZED: 'MINIMIZED',
      EXPANDED: 'EXPANDED',
      COPYRIGHT: 'COPYRIGHT'
    };

    var EncodedParagraph = React.createClass({
      displayName: 'EncodedParagraph',

      render: function render() {
        return React.createElement('p', { dangerouslySetInnerHTML: {
            __html: decodeURIComponent(this.props.text)
          } });
      }
    });

    return React.createClass({
      propTypes: {
        // We let dashboard generate our i18n dropdown and pass it along as an
        // encode string of html
        i18nDropdown: React.PropTypes.string,
        copyrightInBase: React.PropTypes.bool.isRequired,
        copyrightStrings: React.PropTypes.shape({
          thank_you: React.PropTypes.string.isRequired,
          help_from_html: React.PropTypes.string.isRequired,
          art_from_html: React.PropTypes.string.isRequired,
          powered_by_aws: React.PropTypes.string.isRequired,
          trademark: React.PropTypes.string.isRequired
        }),
        baseCopyrightString: React.PropTypes.string,
        baseMoreMenuString: React.PropTypes.string.isRequired,
        baseStyle: React.PropTypes.object,
        menuItems: React.PropTypes.arrayOf(React.PropTypes.shape({
          text: React.PropTypes.string.isRequired,
          link: React.PropTypes.string.isRequired,
          copyright: React.PropTypes.bool,
          newWindow: React.PropTypes.bool
        })).isRequired,
        className: React.PropTypes.string
      },

      getInitialState: function getInitialState() {
        return {
          menuState: MenuState.MINIMIZED,
          baseWidth: 0,
          baseHeight: 0
        };
      },

      componentDidMount: function componentDidMount() {
        this.captureBaseElementDimensions();
        window.addEventListener('resize', this.captureBaseElementDimensions);
      },

      captureBaseElementDimensions: function captureBaseElementDimensions() {
        var base = React.findDOMNode(this.refs.base);
        this.setState({
          baseWidth: base.offsetWidth,
          baseHeight: base.offsetHeight
        });
      },

      minimizeOnClickAnywhere: function minimizeOnClickAnywhere(event) {
        // The first time we click anywhere, hide any open children
        $(document.body).one('click', (function (event) {
          // menu copyright has its own click handler
          if (event.target === React.findDOMNode(this.refs.menuCopyright)) {
            return;
          }

          this.setState({
            menuState: MenuState.MINIMIZING,
            moreOffset: 0
          });

          // Create a window during which we can't show again, so that clicking
          // on copyright doesnt immediately hide/reshow
          setTimeout((function () {
            this.setState({ menuState: MenuState.MINIMIZED });
          }).bind(this), 200);
        }).bind(this));
      },

      clickBase: function clickBase() {
        if (this.props.copyrightInBase) {
          // When we have multiple items in our base row, ignore clicks to the
          // row that aren't on those particular items
          return;
        }

        this.clickBaseMenu();
      },

      clickBaseCopyright: function clickBaseCopyright() {
        if (this.state.menuState === MenuState.MINIMIZING) {
          return;
        }

        if (this.state.menuState === MenuState.COPYRIGHT) {
          this.setState({ menuState: MenuState.MINIMIZED });
          return;
        }

        this.setState({ menuState: MenuState.COPYRIGHT });
        this.minimizeOnClickAnywhere();
      },

      clickMenuCopyright: function clickMenuCopyright(event) {
        this.setState({ menuState: MenuState.COPYRIGHT });
        this.minimizeOnClickAnywhere();
      },

      clickBaseMenu: function clickBaseMenu() {
        if (this.state.menuState === MenuState.MINIMIZING) {
          return;
        }

        if (this.state.menuState === MenuState.EXPANDED) {
          this.setState({ menuState: MenuState.MINIMIZED });
          return;
        }

        this.setState({ menuState: MenuState.EXPANDED });
        this.minimizeOnClickAnywhere();
      },

      render: function render() {
        var styles = {
          smallFooter: {
            fontSize: this.props.fontSize
          },
          base: $.extend({}, this.props.baseStyle, {
            paddingBottom: 3,
            paddingTop: 3,
            // subtract top/bottom padding from row height
            height: this.props.rowHeight ? this.props.rowHeight - 6 : undefined
          }),
          copyright: {
            display: this.state.menuState === MenuState.COPYRIGHT ? 'block' : 'none',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 650,
            maxWidth: '50%',
            minWidth: this.state.baseWidth
          },
          copyrightScrollArea: {
            overflowY: 'auto',
            maxHeight: 210,
            padding: '0.8em',
            borderBottom: 'solid thin #e7e8ea',
            marginBottom: this.state.baseHeight
          },
          moreMenu: {
            display: this.state.menuState === MenuState.EXPANDED ? 'block' : 'none',
            bottom: this.state.baseHeight,
            width: this.state.baseWidth
          },
          listItem: {
            height: this.props.rowHeight,
            // account for padding (3px on top and bottom) and bottom border (1px)
            // on bottom border on child anchor element
            lineHeight: this.props.rowHeight ? this.props.rowHeight - 6 - 1 + 'px' : undefined
          }
        };

        var caretIcon = this.state.menuState === MenuState.EXPANDED ? 'fa fa-caret-down' : 'fa fa-caret-up';

        return React.createElement(
          'div',
          { className: this.props.className, style: styles.smallFooter },
          React.createElement(
            'div',
            { className: 'small-footer-base', ref: 'base', style: styles.base, onClick: this.clickBase },
            React.createElement('div', { dangerouslySetInnerHTML: {
                __html: decodeURIComponent(this.props.i18nDropdown)
              } }),
            React.createElement(
              'small',
              null,
              this.renderCopyright(),
              React.createElement(
                'a',
                { className: 'more-link', href: 'javascript:void(0)',
                  onClick: this.clickBaseMenu },
                this.props.baseMoreMenuString + ' ',
                React.createElement('i', { className: caretIcon })
              )
            )
          ),
          React.createElement(
            'div',
            { id: 'copyright-flyout', style: styles.copyright },
            React.createElement(
              'div',
              { id: 'copyright-scroll-area', style: styles.copyrightScrollArea },
              React.createElement(EncodedParagraph, { text: this.props.copyrightStrings.thank_you }),
              React.createElement(
                'p',
                null,
                this.props.copyrightStrings.help_from_html
              ),
              React.createElement(EncodedParagraph, { text: this.props.copyrightStrings.art_from_html }),
              React.createElement(
                'p',
                null,
                this.props.copyrightStrings.powered_by_aws
              ),
              React.createElement(EncodedParagraph, { text: this.props.copyrightStrings.trademark })
            )
          ),
          this.renderMoreMenu(styles)
        );
      },

      renderCopyright: function renderCopyright() {
        if (this.props.copyrightInBase) {
          return React.createElement(
            'span',
            null,
            React.createElement(
              'a',
              { className: 'copyright-link', href: '#',
                onClick: this.clickBaseCopyright },
              this.props.baseCopyrightString
            ),
            '  |  '
          );
        }
      },

      renderMoreMenu: function renderMoreMenu(styles) {
        var menuItemElements = this.props.menuItems.map((function (item, index) {
          return React.createElement(
            'li',
            { key: index, style: styles.listItem },
            React.createElement(
              'a',
              { href: item.link,
                ref: item.copyright ? "menuCopyright" : undefined,
                target: item.newWindow ? "_blank" : undefined,
                onClick: item.copyright ? this.clickMenuCopyright : undefined },
              item.text
            )
          );
        }).bind(this));
        return React.createElement(
          'ul',
          { id: 'more-menu', style: styles.moreMenu },
          menuItemElements
        );
      }
    });
  }

  /**
   * We only want to create our SmallFooter component class once, and we don't
   * want to do this until we have a React.
   */
  var SmallFooter;

  function ensureSmallFooter(React) {
    if (SmallFooter) {
      return;
    }

    SmallFooter = createSmallFooter(React);
  }

  return {
    /**
     * render our small footer, adding copyright strings if we have them
     */
    render: function render(React, reactProps, element) {
      ensureSmallFooter(React);

      return React.render(React.createElement(SmallFooter, reactProps), element);
    }
  };
})();

},{}],176:[function(require,module,exports){
'use strict';

require('./share_dialog_body.jsx');
require('./dialog.jsx');

window.dashboard = window.dashboard || {};

/**
 * Share Dialog used by projects
 */
window.dashboard.ShareDialog = (function (React) {
  var Dialog = window.dashboard.Dialog;
  var ShareDialogBody = window.dashboard.ShareDialogBody;

  return React.createClass({
    propTypes: {
      i18n: React.PropTypes.object.isRequired,
      icon: React.PropTypes.string,
      title: React.PropTypes.string.isRequired,
      shareCopyLink: React.PropTypes.string.isRequired,
      shareUrl: React.PropTypes.string.isRequired,
      encodedShareUrl: React.PropTypes.string.isRequired,
      closeText: React.PropTypes.string.isRequired,
      isAbusive: React.PropTypes.bool.isRequired,
      abuseTos: React.PropTypes.string.isRequired,
      abuseContact: React.PropTypes.string.isRequired,
      channelId: React.PropTypes.string.isRequired,
      appType: React.PropTypes.string.isRequired,
      onClickPopup: React.PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
      return { isOpen: true };
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
      this.setState({ isOpen: true });
    },

    close: function close() {
      this.setState({ isOpen: false });
    },

    render: function render() {
      // TODO - Can we now make SendToPhone completely Reactified?
      return React.createElement(
        Dialog,
        { isOpen: this.state.isOpen, handleClose: this.close },
        React.createElement(ShareDialogBody, {
          i18n: this.props.i18n,
          icon: this.props.icon,
          title: this.props.title,
          shareCopyLink: this.props.shareCopyLink,
          shareUrl: this.props.shareUrl,
          encodedShareUrl: this.props.encodedShareUrl,
          closeText: this.props.closeText,
          isAbusive: this.props.isAbusive,
          abuseTos: this.props.abuseTos,
          abuseContact: this.props.abuseContact,
          channelId: this.props.channelId,
          appType: this.props.appType,
          onClickPopup: this.props.onClickPopup,
          onClickClose: this.close
        })
      );
    }
  });
})(React);

},{"./dialog.jsx":173,"./share_dialog_body.jsx":177}],177:[function(require,module,exports){
'use strict';

require('./abuse_error.jsx');

/* global React */

window.dashboard = window.dashboard || {};

/**
 * The body of our share project dialog.
 * Note: The only consumer of this calls renderToStaticMarkup, so any events
 * will be lost.
 */
window.dashboard.ShareDialogBody = (function (React) {
  var select = function select(event) {
    event.target.select();
  };

  return React.createClass({
    propTypes: {
      icon: React.PropTypes.string,
      title: React.PropTypes.string.isRequired,
      shareCopyLink: React.PropTypes.string.isRequired,
      shareUrl: React.PropTypes.string.isRequired,
      encodedShareUrl: React.PropTypes.string.isRequired,
      closeText: React.PropTypes.string.isRequired,
      isAbusive: React.PropTypes.bool.isRequired,
      abuseTos: React.PropTypes.string.isRequired,
      abuseContact: React.PropTypes.string.isRequired,

      // Used by SendToPhone
      channelId: React.PropTypes.string.isRequired,
      appType: React.PropTypes.string.isRequired,

      onClickPopup: React.PropTypes.func.isRequired,
      onClickClose: React.PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
      return {
        showSendToPhone: false
      };
    },

    showSendToPhone: function showSendToPhone(event) {
      this.setState({ showSendToPhone: true });
      event.preventDefault();
    },

    render: function render() {
      var image;
      var modalClass = 'modal-content';
      if (this.props.icon) {
        image = React.createElement('img', { className: 'modal-image', src: this.props.icon });
      } else {
        modalClass += ' no-modal-icon';
      }

      var facebookShareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + this.props.encodedShareUrl;
      var twitterShareUrl = "https://twitter.com/intent/tweet?url=" + this.props.encodedShareUrl + "&amp;text=Check%20out%20what%20I%20made%20@codeorg&amp;hashtags=HourOfCode&amp;related=codeorg";

      var horzPadding = {
        paddingLeft: 1,
        paddingRight: 1
      };

      var abuseStyle = {
        border: '1px solid',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20
      };

      var abuseTextStyle = {
        color: '#b94a48',
        fontSize: 14
      };

      var abuseContents;
      if (this.props.isAbusive) {
        abuseContents = React.createElement(window.dashboard.AbuseError, {
          i18n: {
            tos: this.props.abuseTos,
            contact_us: this.props.abuseContact
          },
          className: 'alert-error',
          style: abuseStyle,
          textStyle: abuseTextStyle });
      }

      var sendToPhone;
      if (this.state.showSendToPhone) {
        sendToPhone = React.createElement(window.dashboard.SendToPhone, {
          channelId: this.props.channelId,
          appType: this.props.appType });
      }

      return React.createElement(
        'div',
        null,
        image,
        React.createElement(
          'div',
          { id: 'project-share', className: modalClass },
          React.createElement(
            'p',
            { className: 'dialog-title' },
            this.props.title
          ),
          abuseContents,
          React.createElement(
            'p',
            null,
            this.props.shareCopyLink
          ),
          React.createElement(
            'div',
            null,
            React.createElement('input', {
              type: 'text',
              id: 'sharing-input',
              onClick: select,
              readOnly: 'true',
              value: this.props.shareUrl,
              style: { cursor: 'copy', width: 465 } })
          ),
          React.createElement(
            'button',
            {
              id: 'continue-button',
              style: { float: 'right' },
              onClick: this.props.onClickClose },
            this.props.closeText
          ),
          React.createElement(
            'div',
            { className: 'social-buttons' },
            React.createElement(
              'a',
              { href: facebookShareUrl, target: '_blank', onClick: this.props.onClickPopup.bind(this), style: horzPadding },
              React.createElement('i', { className: 'fa fa-facebook' })
            ),
            React.createElement(
              'a',
              { href: twitterShareUrl, target: '_blank', onClick: this.props.onClickPopup.bind(this), style: horzPadding },
              React.createElement('i', { className: 'fa fa-twitter' })
            ),
            React.createElement(
              'a',
              { id: 'sharing-phone', href: '', style: horzPadding, onClick: this.showSendToPhone },
              React.createElement('i', { className: 'fa fa-mobile-phone', style: { fontSize: 36 } })
            )
          ),
          sendToPhone
        )
      );
    }
  });
})(React);
/* Awkward that this is called continue-button, when text is
   close, but id is (unfortunately) used for styling */

},{"./abuse_error.jsx":171}],175:[function(require,module,exports){
/* global React, trackEvent */

'use strict';

window.dashboard = window.dashboard || {};

/**
 * Send-to-phone component used by share project dialog.
 */
window.dashboard.SendToPhone = (function (React) {
  // TODO (brent) - could we also use this instead of what we have in sharing.html.ejs?

  var SendState = {
    invalidVal: 'invalidVal',
    canSubmit: 'canSubmit',
    sending: 'sending',
    sent: 'sent',
    error: 'error'
  };

  function sendButtonString(sendState) {
    switch (sendState) {
      case SendState.invalidVal:
      case SendState.canSubmit:
        return 'Send';
      case SendState.sending:
        return 'Sending...';
      case SendState.sent:
        return 'Sent!';
      case SendState.error:
        return 'Error!';
      default:
        throw new Error('unexpected');
    }
  }

  var baseStyles = {
    label: {},
    div: {}
  };

  return React.createClass({
    propTypes: {
      channelId: React.PropTypes.string.isRequired,
      appType: React.PropTypes.string.isRequired,
      styles: React.PropTypes.shape({
        label: React.PropTypes.object,
        div: React.PropTypes.object
      })
    },

    getInitialState: function getInitialState() {
      return {
        sendState: SendState.invalidVal
      };
    },

    componentDidMount: function componentDidMount() {
      this.maskPhoneInput();
    },

    maskPhoneInput: function maskPhoneInput() {
      if (!this.refs.phone) {
        return;
      }

      var phone = this.refs.phone.getDOMNode();
      $(phone).mask('(000) 000-0000', {
        onComplete: (function () {
          this.setState({ sendState: SendState.canSubmit });
        }).bind(this),
        onChange: (function () {
          this.setState({ sendState: SendState.invalidVal });
        }).bind(this)
      });
      phone.focus();
    },

    handleSubmit: function handleSubmit() {
      // Do nothing if we aren't in a state where we can send.
      if (this.state.sendState !== SendState.canSubmit) {
        return;
      }
      var phone = this.refs.phone.getDOMNode();

      this.setState({ sendState: SendState.sending });

      var params = $.param({
        type: this.props.appType,
        channel_id: this.props.channelId,
        phone: $(phone).val()
      });
      $.post('/sms/send', params).done((function () {
        this.setState({ sendState: SendState.sent });
        trackEvent('SendToPhone', 'success');
      }).bind(this)).fail((function () {
        this.setState({ sendState: SendState.error });
        trackEvent('SendToPhone', 'error');
      }).bind(this));
    },

    render: function render() {
      var styles = $.extend({}, baseStyles, this.props.styles);
      return React.createElement(
        'div',
        null,
        React.createElement(
          'label',
          { style: styles.label, htmlFor: 'phone' },
          'Enter a US phone number:'
        ),
        React.createElement('input', {
          type: 'text',
          ref: 'phone',
          name: 'phone',
          disabled: this.state.sendState !== SendState.invalidVal && this.state.sendState !== SendState.canSubmit }),
        React.createElement(
          'button',
          {
            disabled: this.state.sendState === SendState.invalidVal,
            onClick: this.handleSubmit },
          sendButtonString(this.state.sendState)
        ),
        React.createElement(
          'div',
          { style: styles.div },
          'A text message will be sent via ',
          React.createElement(
            'a',
            { href: 'http://twilio.com' },
            'Twilio'
          ),
          '. Charges may apply to the recipient.'
        )
      );
    }
  });
})(React);

},{}],174:[function(require,module,exports){
/* global dashboard, React */

'use strict';

window.dashboard = window.dashboard || {};

/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */
window.dashboard.ReportAbuseForm = (function (React) {
  var INPUT_WIDTH = 500;
  // dropdown width is wider so that it still lines up with inputs (which have
  // padding)
  var DROPDOWN_WIDTH = 514;

  var alert = window.alert;

  /**
   * A dropdown with the set of ages we use across our site (4-20, 21+)
   */
  var AgeDropdown = React.createClass({
    displayName: 'AgeDropdown',

    propTypes: {
      age: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
      style: React.PropTypes.object
    },

    render: function render() {
      var style = $.extend({}, { width: DROPDOWN_WIDTH }, this.props.style);

      var age = this.props.age && this.props.age.toString();
      var ages = ['', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21+'];

      if (this.props.age !== null && ages.indexOf(age) === -1) {
        throw new Error('Invalid age: ' + age);
      }

      return React.createElement(
        'select',
        { name: 'age', style: style, value: age },
        ages.map(function (age) {
          return React.createElement(
            'option',
            { key: age, value: age },
            age
          );
        })
      );
    }
  });

  return React.createClass({
    propTypes: {
      i18n: React.PropTypes.object.isRequired,
      csrfToken: React.PropTypes.string.isRequired,
      abuseUrl: React.PropTypes.string.isRequired,
      name: React.PropTypes.string,
      email: React.PropTypes.string,
      age: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number])
    },

    /**
     * Extracts a channel id from the given abuse url
     * @returns {string} Channel id, or undefined if we can't get one.
     */
    getChannelId: function getChannelId() {
      var match = /.*\/projects\/[^\/]+\/([^\/]+)/.exec(this.props.abuseUrl);
      return match && match[1];
    },

    handleSubmit: function handleSubmit(event) {
      var i18n = this.props.i18n;
      if (React.findDOMNode(this.refs.email).value === '') {
        alert(i18n.t('project.abuse.report_abuse_form.validation.email'));
        event.preventDefault();
        return;
      }

      if (React.findDOMNode(this.refs.age).value === '') {
        alert(i18n.t('project.abuse.report_abuse_form.validation.age'));
        event.preventDefault();
        return;
      }

      if (React.findDOMNode(this.refs.abuse_type).value === '') {
        alert(i18n.t('project.abuse.report_abuse_form.validation.abuse_type'));
        event.preventDefault();
        return;
      }

      if (React.findDOMNode(this.refs.abuse_detail).value === '') {
        alert(i18n.t('project.abuse.report_abuse_form.validation.abuse_detail'));
        event.preventDefault();
        return;
      }
    },

    render: function render() {
      var i18n = this.props.i18n;
      return React.createElement(
        'div',
        { style: { width: DROPDOWN_WIDTH } },
        React.createElement(
          'h2',
          null,
          i18n.t('footer.report_abuse')
        ),
        React.createElement(
          'p',
          null,
          i18n.t('project.abuse.report_abuse_form.intro')
        ),
        React.createElement('br', null),
        React.createElement(
          'form',
          { action: '/report_abuse', method: 'post' },
          React.createElement('input', { type: 'hidden', name: 'authenticity_token', value: this.props.csrfToken }),
          React.createElement('input', { type: 'hidden', name: 'channel_id', value: this.getChannelId() }),
          React.createElement('input', { type: 'hidden', name: 'name', value: this.props.name }),
          React.createElement(
            'div',
            { style: { display: this.props.email ? 'none' : 'block' } },
            React.createElement(
              'div',
              null,
              i18n.t('activerecord.attributes.user.email')
            ),
            React.createElement('input', { type: 'text', style: { width: INPUT_WIDTH }, defaultValue: this.props.email, name: 'email', ref: 'email' })
          ),
          React.createElement(
            'div',
            { style: { display: this.props.age ? 'none' : 'block' } },
            React.createElement(
              'div',
              null,
              i18n.t('activerecord.attributes.user.age')
            ),
            React.createElement(AgeDropdown, { age: this.props.age, ref: 'age' })
          ),
          React.createElement(
            'div',
            null,
            i18n.t('project.abuse.report_abuse_form.abusive_url')
          ),
          React.createElement('input', { type: 'text', readOnly: !!this.props.abuseUrl, style: { width: INPUT_WIDTH }, defaultValue: this.props.abuseUrl, name: 'abuse_url' }),
          React.createElement('div', { dangerouslySetInnerHTML: {
              __html: i18n.t('project.abuse.report_abuse_form.abuse_type.question', {
                link_start: '<a href="https://code.org/tos" target="_blank">',
                link_end: '</a>'
              }) } }),
          React.createElement(
            'select',
            { style: { width: DROPDOWN_WIDTH }, name: 'abuse_type', ref: 'abuse_type' },
            React.createElement('option', { value: '' }),
            React.createElement(
              'option',
              { value: 'harassment' },
              i18n.t('project.abuse.report_abuse_form.abuse_type.harassment')
            ),
            React.createElement(
              'option',
              { value: 'offensive' },
              i18n.t('project.abuse.report_abuse_form.abuse_type.offensive')
            ),
            React.createElement(
              'option',
              { value: 'infringement' },
              i18n.t('project.abuse.report_abuse_form.abuse_type.infringement')
            ),
            React.createElement(
              'option',
              { value: 'other' },
              i18n.t('project.abuse.report_abuse_form.abuse_type.other')
            )
          ),
          React.createElement(
            'div',
            null,
            i18n.t('project.abuse.report_abuse_form.detail')
          ),
          React.createElement('textarea', { style: { width: INPUT_WIDTH, height: 100 }, name: 'abuse_detail', ref: 'abuse_detail' }),
          React.createElement('div', { dangerouslySetInnerHTML: {
              __html: i18n.t('project.abuse.report_abuse_form.acknowledge', {
                link_start_privacy: '<a href="https://code.org/privacy" target="_blank">',
                link_start_tos: '<a href="https://code.org/tos" target="_blank">',
                link_end: '</a>'
              }) } }),
          React.createElement(
            'button',
            { onClick: this.handleSubmit },
            i18n.t('submit')
          )
        )
      );
    }
  });
})(React);
/* we dangerouslySetInnerHTML because our string has html in it*/ /* we dangerouslySetInnerHTML because our string has html in it*/

},{}],173:[function(require,module,exports){
"use strict";

window.dashboard = window.dashboard || {};

/**
 * Dialog
 * A generic modal dialog that has an x-close in the upper right, and a
 * semi-transparent backdrop. Can be closed by clicking the x, clicking the
 * backdrop, or pressing esc.
 */
window.dashboard.Dialog = (function (React) {
  return React.createClass({
    propTypes: {
      children: React.PropTypes.element.isRequired,
      isOpen: React.PropTypes.bool.isRequired,
      handleClose: React.PropTypes.func.isRequired
    },

    componentDidMount: function componentDidMount() {
      this.focusDialog();
    },

    componentDidUpdate: function componentDidUpdate() {
      this.focusDialog();
    },

    closeOnEscape: function closeOnEscape(event) {
      if (event.key === 'Escape') {
        this.closeDialog();
      }
    },

    closeDialog: function closeDialog() {
      this.props.handleClose();
    },

    focusDialog: function focusDialog() {
      if (this.props.isOpen) {
        this.refs.dialog.getDOMNode().focus();
      }
    },

    render: function render() {
      if (!this.props.isOpen) {
        return React.createElement("div", null);
      }

      return React.createElement(
        "div",
        null,
        React.createElement("div", { className: "modal-backdrop in", onClick: this.closeDialog }),
        React.createElement(
          "div",
          { tabIndex: "-1", className: "modal dash_modal in", ref: "dialog", onKeyDown: this.closeOnEscape },
          React.createElement(
            "div",
            { className: "modal-body dash_modal_body" },
            React.createElement("div", { id: "x-close", className: "x-close", onClick: this.closeDialog }),
            this.props.children
          )
        )
      );
    }
  });
})(React);

},{}],172:[function(require,module,exports){
'use strict';

require('./abuse_error.jsx');

/* global React */

window.dashboard = window.dashboard || {};

/**
 * A big blue box with an exclamation mark on the left and our abuse text on
 * the right.
 */
window.dashboard.AbuseExclamation = (function (React) {
  var AbuseError = window.dashboard.AbuseError;

  return React.createClass({
    propTypes: {
      i18n: React.PropTypes.shape({
        tos: React.PropTypes.string.isRequired,
        contact_us: React.PropTypes.string.isRequired,
        edit_project: React.PropTypes.string.isRequired,
        go_to_code_studio: React.PropTypes.string.isRequired
      }).isRequired,
      isOwner: React.PropTypes.bool.isRequired
    },
    render: function render() {
      var cyan = '#0094ca';
      var style = {
        backgroundColor: cyan,
        color: 'white',
        maxWidth: 600,
        margin: '0 auto',
        marginTop: 20,
        borderRadius: 15
      };

      var circleStyle = {
        width: 100,
        height: 100,
        background: 'gold',
        borderRadius: 50,
        MozBorderRadius: 50,
        WebkitBorderRadius: 50,
        margin: 20,
        position: 'relative'
      };

      var exclamationStyle = {
        fontSize: 80,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };

      var bodyStyle = {
        paddingLeft: 0,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 20
      };

      var textStyle = {
        fontSize: 18,
        lineHeight: '24px',
        padding: 5
      };

      var finalLink, finalLinkText;
      if (this.props.isOwner) {
        finalLink = 'edit';
        finalLinkText = this.props.i18n.edit_project;
      } else {
        finalLink = 'https:/studio.code.org';
        finalLinkText = this.props.i18n.go_to_code_studio;
      }

      return React.createElement(
        'table',
        { style: style },
        React.createElement(
          'tr',
          null,
          React.createElement(
            'td',
            null,
            React.createElement(
              'div',
              { style: circleStyle },
              React.createElement(
                'div',
                { style: exclamationStyle },
                '!'
              )
            )
          ),
          React.createElement(
            'td',
            { style: bodyStyle },
            React.createElement(AbuseError, {
              i18n: this.props.i18n,
              className: 'exclamation-abuse',
              textStyle: textStyle }),
            React.createElement(
              'p',
              { className: 'exclamation-abuse', style: textStyle },
              React.createElement(
                'a',
                { href: finalLink },
                finalLinkText
              )
            )
          )
        )
      );
    }
  });
})(React);

},{"./abuse_error.jsx":171}],171:[function(require,module,exports){
/* global React */

"use strict";

window.dashboard = window.dashboard || {};
/**
 * A component containing some text/links for projects that have had abuse
 * reported. This is used in our blocking AbuseBox, in the share dialog, and
 * in our smaller alert in apps.
 */
window.dashboard.AbuseError = (function (React) {
  return React.createClass({
    propTypes: {
      i18n: React.PropTypes.shape({
        tos: React.PropTypes.string.isRequired,
        contact_us: React.PropTypes.string.isRequired
      }).isRequired,
      className: React.PropTypes.string,
      style: React.PropTypes.object,
      textStyle: React.PropTypes.object
    },
    render: function render() {
      // It's only OK to use dangerouslySetInnerHTML as long as we're not
      // populating it with user input. In our case, we're setting it using
      // our i18n strings
      return React.createElement(
        "div",
        { className: this.props.className, style: this.props.style },
        React.createElement("p", { style: this.props.textStyle,
          dangerouslySetInnerHTML: { __html: this.props.i18n.tos } }),
        React.createElement("p", { style: this.props.textStyle,
          dangerouslySetInnerHTML: { __html: this.props.i18n.contact_us } })
      );
    }
  });
})(React);

},{}],169:[function(require,module,exports){
/*! Video.js v4.5.2 Copyright 2014 Brightcove, Inc. https://github.com/videojs/video.js/blob/master/LICENSE */ 
(function() {var b=void 0,f=!0,h=null,l=!1;function m(){return function(){}}function p(a){return function(){return this[a]}}function q(a){return function(){return a}}var t;document.createElement("video");document.createElement("audio");document.createElement("track");function u(a,c,d){if("string"===typeof a){0===a.indexOf("#")&&(a=a.slice(1));if(u.va[a])return u.va[a];a=u.u(a)}if(!a||!a.nodeName)throw new TypeError("The element or ID supplied is not valid. (videojs)");return a.player||new u.Player(a,c,d)}
var videojs=u;window.Wd=window.Xd=u;u.Rb="4.5";u.Fc="https:"==document.location.protocol?"https://":"http://";u.options={techOrder:["html5","flash"],html5:{},flash:{},width:300,height:150,defaultVolume:0,children:{mediaLoader:{},posterImage:{},textTrackDisplay:{},loadingSpinner:{},bigPlayButton:{},controlBar:{}},notSupportedMessage:'Sorry, no compatible source and playback technology were found for this video. Try using another browser like <a href="http://bit.ly/ccMUEC">Chrome</a> or download the latest <a href="http://adobe.ly/mwfN1">Adobe Flash Player</a>.'};
"GENERATED_CDN_VSN"!==u.Rb&&(videojs.options.flash.swf=u.Fc+"vjs.zencdn.net/"+u.Rb+"/video-js.swf");u.va={};"function"===typeof define&&define.amd?define([],function(){return videojs}):"object"===typeof exports&&"object"===typeof module&&(module.exports=videojs);u.ka=u.CoreObject=m();
u.ka.extend=function(a){var c,d;a=a||{};c=a.init||a.j||this.prototype.init||this.prototype.j||m();d=function(){c.apply(this,arguments)};d.prototype=u.l.create(this.prototype);d.prototype.constructor=d;d.extend=u.ka.extend;d.create=u.ka.create;for(var e in a)a.hasOwnProperty(e)&&(d.prototype[e]=a[e]);return d};u.ka.create=function(){var a=u.l.create(this.prototype);this.apply(a,arguments);return a};
u.d=function(a,c,d){var e=u.getData(a);e.z||(e.z={});e.z[c]||(e.z[c]=[]);d.s||(d.s=u.s++);e.z[c].push(d);e.V||(e.disabled=l,e.V=function(c){if(!e.disabled){c=u.ic(c);var d=e.z[c.type];if(d)for(var d=d.slice(0),k=0,r=d.length;k<r&&!c.pc();k++)d[k].call(a,c)}});1==e.z[c].length&&(document.addEventListener?a.addEventListener(c,e.V,l):document.attachEvent&&a.attachEvent("on"+c,e.V))};
u.o=function(a,c,d){if(u.mc(a)){var e=u.getData(a);if(e.z)if(c){var g=e.z[c];if(g){if(d){if(d.s)for(e=0;e<g.length;e++)g[e].s===d.s&&g.splice(e--,1)}else e.z[c]=[];u.ec(a,c)}}else for(g in e.z)c=g,e.z[c]=[],u.ec(a,c)}};u.ec=function(a,c){var d=u.getData(a);0===d.z[c].length&&(delete d.z[c],document.removeEventListener?a.removeEventListener(c,d.V,l):document.detachEvent&&a.detachEvent("on"+c,d.V));u.zb(d.z)&&(delete d.z,delete d.V,delete d.disabled);u.zb(d)&&u.uc(a)};
u.ic=function(a){function c(){return f}function d(){return l}if(!a||!a.Ab){var e=a||window.event;a={};for(var g in e)"layerX"!==g&&("layerY"!==g&&"keyboardEvent.keyLocation"!==g)&&("returnValue"==g&&e.preventDefault||(a[g]=e[g]));a.target||(a.target=a.srcElement||document);a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement;a.preventDefault=function(){e.preventDefault&&e.preventDefault();a.returnValue=l;a.fd=c;a.defaultPrevented=f};a.fd=d;a.defaultPrevented=l;a.stopPropagation=function(){e.stopPropagation&&
e.stopPropagation();a.cancelBubble=f;a.Ab=c};a.Ab=d;a.stopImmediatePropagation=function(){e.stopImmediatePropagation&&e.stopImmediatePropagation();a.pc=c;a.stopPropagation()};a.pc=d;if(a.clientX!=h){g=document.documentElement;var j=document.body;a.pageX=a.clientX+(g&&g.scrollLeft||j&&j.scrollLeft||0)-(g&&g.clientLeft||j&&j.clientLeft||0);a.pageY=a.clientY+(g&&g.scrollTop||j&&j.scrollTop||0)-(g&&g.clientTop||j&&j.clientTop||0)}a.which=a.charCode||a.keyCode;a.button!=h&&(a.button=a.button&1?0:a.button&
4?1:a.button&2?2:0)}return a};u.k=function(a,c){var d=u.mc(a)?u.getData(a):{},e=a.parentNode||a.ownerDocument;"string"===typeof c&&(c={type:c,target:a});c=u.ic(c);d.V&&d.V.call(a,c);if(e&&!c.Ab()&&c.bubbles!==l)u.k(e,c);else if(!e&&!c.defaultPrevented&&(d=u.getData(c.target),c.target[c.type])){d.disabled=f;if("function"===typeof c.target[c.type])c.target[c.type]();d.disabled=l}return!c.defaultPrevented};
u.U=function(a,c,d){function e(){u.o(a,c,e);d.apply(this,arguments)}e.s=d.s=d.s||u.s++;u.d(a,c,e)};var v=Object.prototype.hasOwnProperty;u.e=function(a,c){var d,e;d=document.createElement(a||"div");for(e in c)v.call(c,e)&&(-1!==e.indexOf("aria-")||"role"==e?d.setAttribute(e,c[e]):d[e]=c[e]);return d};u.Z=function(a){return a.charAt(0).toUpperCase()+a.slice(1)};u.l={};u.l.create=Object.create||function(a){function c(){}c.prototype=a;return new c};
u.l.ra=function(a,c,d){for(var e in a)v.call(a,e)&&c.call(d||this,e,a[e])};u.l.B=function(a,c){if(!c)return a;for(var d in c)v.call(c,d)&&(a[d]=c[d]);return a};u.l.Wc=function(a,c){var d,e,g;a=u.l.copy(a);for(d in c)v.call(c,d)&&(e=a[d],g=c[d],a[d]=u.l.Na(e)&&u.l.Na(g)?u.l.Wc(e,g):c[d]);return a};u.l.copy=function(a){return u.l.B({},a)};u.l.Na=function(a){return!!a&&"object"===typeof a&&"[object Object]"===a.toString()&&a.constructor===Object};
u.bind=function(a,c,d){function e(){return c.apply(a,arguments)}c.s||(c.s=u.s++);e.s=d?d+"_"+c.s:c.s;return e};u.pa={};u.s=1;u.expando="vdata"+(new Date).getTime();u.getData=function(a){var c=a[u.expando];c||(c=a[u.expando]=u.s++,u.pa[c]={});return u.pa[c]};u.mc=function(a){a=a[u.expando];return!(!a||u.zb(u.pa[a]))};u.uc=function(a){var c=a[u.expando];if(c){delete u.pa[c];try{delete a[u.expando]}catch(d){a.removeAttribute?a.removeAttribute(u.expando):a[u.expando]=h}}};
u.zb=function(a){for(var c in a)if(a[c]!==h)return l;return f};u.n=function(a,c){-1==(" "+a.className+" ").indexOf(" "+c+" ")&&(a.className=""===a.className?c:a.className+" "+c)};u.t=function(a,c){var d,e;if(-1!=a.className.indexOf(c)){d=a.className.split(" ");for(e=d.length-1;0<=e;e--)d[e]===c&&d.splice(e,1);a.className=d.join(" ")}};u.F=u.e("video");u.J=navigator.userAgent;u.Kc=/iPhone/i.test(u.J);u.Jc=/iPad/i.test(u.J);u.Lc=/iPod/i.test(u.J);u.Ic=u.Kc||u.Jc||u.Lc;var aa=u,w;var x=u.J.match(/OS (\d+)_/i);
w=x&&x[1]?x[1]:b;aa.Kd=w;u.Hc=/Android/i.test(u.J);var ba=u,y;var z=u.J.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i),A,B;z?(A=z[1]&&parseFloat(z[1]),B=z[2]&&parseFloat(z[2]),y=A&&B?parseFloat(z[1]+"."+z[2]):A?A:h):y=h;ba.Qb=y;u.Mc=u.Hc&&/webkit/i.test(u.J)&&2.3>u.Qb;u.Ub=/Firefox/i.test(u.J);u.Ld=/Chrome/i.test(u.J);u.$b=!!("ontouchstart"in window||window.Gc&&document instanceof window.Gc);
u.wb=function(a){var c,d,e,g;c={};if(a&&a.attributes&&0<a.attributes.length){d=a.attributes;for(var j=d.length-1;0<=j;j--){e=d[j].name;g=d[j].value;if("boolean"===typeof a[e]||-1!==",autoplay,controls,loop,muted,default,".indexOf(","+e+","))g=g!==h?f:l;c[e]=g}}return c};
u.Pd=function(a,c){var d="";document.defaultView&&document.defaultView.getComputedStyle?d=document.defaultView.getComputedStyle(a,"").getPropertyValue(c):a.currentStyle&&(d=a["client"+c.substr(0,1).toUpperCase()+c.substr(1)]+"px");return d};u.yb=function(a,c){c.firstChild?c.insertBefore(a,c.firstChild):c.appendChild(a)};u.Nb={};u.u=function(a){0===a.indexOf("#")&&(a=a.slice(1));return document.getElementById(a)};
u.ta=function(a,c){c=c||a;var d=Math.floor(a%60),e=Math.floor(a/60%60),g=Math.floor(a/3600),j=Math.floor(c/60%60),k=Math.floor(c/3600);if(isNaN(a)||Infinity===a)g=e=d="-";g=0<g||0<k?g+":":"";return g+(((g||10<=j)&&10>e?"0"+e:e)+":")+(10>d?"0"+d:d)};u.Sc=function(){document.body.focus();document.onselectstart=q(l)};u.Ed=function(){document.onselectstart=q(f)};u.trim=function(a){return(a+"").replace(/^\s+|\s+$/g,"")};u.round=function(a,c){c||(c=0);return Math.round(a*Math.pow(10,c))/Math.pow(10,c)};
u.sb=function(a,c){return{length:1,start:function(){return a},end:function(){return c}}};
u.get=function(a,c,d){var e,g;"undefined"===typeof XMLHttpRequest&&(window.XMLHttpRequest=function(){try{return new window.ActiveXObject("Msxml2.XMLHTTP.6.0")}catch(a){}try{return new window.ActiveXObject("Msxml2.XMLHTTP.3.0")}catch(c){}try{return new window.ActiveXObject("Msxml2.XMLHTTP")}catch(d){}throw Error("This browser does not support XMLHttpRequest.");});g=new XMLHttpRequest;try{g.open("GET",a)}catch(j){d(j)}e=0===a.indexOf("file:")||0===window.location.href.indexOf("file:")&&-1===a.indexOf("http");
g.onreadystatechange=function(){4===g.readyState&&(200===g.status||e&&0===g.status?c(g.responseText):d&&d())};try{g.send()}catch(k){d&&d(k)}};u.wd=function(a){try{var c=window.localStorage||l;c&&(c.volume=a)}catch(d){22==d.code||1014==d.code?u.log("LocalStorage Full (VideoJS)",d):18==d.code?u.log("LocalStorage not allowed (VideoJS)",d):u.log("LocalStorage Error (VideoJS)",d)}};u.kc=function(a){a.match(/^https?:\/\//)||(a=u.e("div",{innerHTML:'<a href="'+a+'">x</a>'}).firstChild.href);return a};
u.log=function(){u.log.history=u.log.history||[];u.log.history.push(arguments);window.console&&window.console.log(Array.prototype.slice.call(arguments))};u.cd=function(a){var c,d;a.getBoundingClientRect&&a.parentNode&&(c=a.getBoundingClientRect());if(!c)return{left:0,top:0};a=document.documentElement;d=document.body;return{left:u.round(c.left+(window.pageXOffset||d.scrollLeft)-(a.clientLeft||d.clientLeft||0)),top:u.round(c.top+(window.pageYOffset||d.scrollTop)-(a.clientTop||d.clientTop||0))}};
u.ja={};u.ja.Eb=function(a,c){var d,e,g;a=u.l.copy(a);for(d in c)c.hasOwnProperty(d)&&(e=a[d],g=c[d],a[d]=u.l.Na(e)&&u.l.Na(g)?u.ja.Eb(e,g):c[d]);return a};
u.b=u.ka.extend({j:function(a,c,d){this.c=a;this.h=u.l.copy(this.h);c=this.options(c);this.R=c.id||(c.el&&c.el.id?c.el.id:a.id()+"_component_"+u.s++);this.ld=c.name||h;this.a=c.el||this.e();this.K=[];this.Ja={};this.Ka={};this.nc();this.I(d);if(c.vc!==l){var e,g;e=u.bind(this.C(),this.C().reportUserActivity);this.d("touchstart",function(){e();clearInterval(g);g=setInterval(e,250)});a=function(){e();clearInterval(g)};this.d("touchmove",e);this.d("touchend",a);this.d("touchcancel",a)}}});t=u.b.prototype;
t.dispose=function(){this.k({type:"dispose",bubbles:l});if(this.K)for(var a=this.K.length-1;0<=a;a--)this.K[a].dispose&&this.K[a].dispose();this.Ka=this.Ja=this.K=h;this.o();this.a.parentNode&&this.a.parentNode.removeChild(this.a);u.uc(this.a);this.a=h};t.c=f;t.C=p("c");t.options=function(a){return a===b?this.h:this.h=u.ja.Eb(this.h,a)};t.e=function(a,c){return u.e(a,c)};t.u=p("a");t.La=function(){return this.G||this.a};t.id=p("R");t.name=p("ld");t.children=p("K");t.ed=function(a){return this.Ja[a]};
t.fa=function(a){return this.Ka[a]};t.Y=function(a,c){var d,e;"string"===typeof a?(e=a,c=c||{},d=c.componentClass||u.Z(e),c.name=e,d=new window.videojs[d](this.c||this,c)):d=a;this.K.push(d);"function"===typeof d.id&&(this.Ja[d.id()]=d);(e=e||d.name&&d.name())&&(this.Ka[e]=d);"function"===typeof d.el&&d.el()&&this.La().appendChild(d.el());return d};
t.removeChild=function(a){"string"===typeof a&&(a=this.fa(a));if(a&&this.K){for(var c=l,d=this.K.length-1;0<=d;d--)if(this.K[d]===a){c=f;this.K.splice(d,1);break}c&&(this.Ja[a.id]=h,this.Ka[a.name]=h,(c=a.u())&&c.parentNode===this.La()&&this.La().removeChild(a.u()))}};t.nc=function(){var a=this.h;if(a&&a.children){var c=this;u.l.ra(a.children,function(a,e){e!==l&&!e.loadEvent&&(c[a]=c.Y(a,e))})}};t.Q=q("");t.d=function(a,c){u.d(this.a,a,u.bind(this,c));return this};
t.o=function(a,c){u.o(this.a,a,c);return this};t.U=function(a,c){u.U(this.a,a,u.bind(this,c));return this};t.k=function(a,c){u.k(this.a,a,c);return this};t.I=function(a){a&&(this.aa?a.call(this):(this.Ua===b&&(this.Ua=[]),this.Ua.push(a)));return this};t.za=function(){this.aa=f;var a=this.Ua;if(a&&0<a.length){for(var c=0,d=a.length;c<d;c++)a[c].call(this);this.Ua=[];this.k("ready")}};t.n=function(a){u.n(this.a,a);return this};t.t=function(a){u.t(this.a,a);return this};
t.show=function(){this.a.style.display="block";return this};t.D=function(){this.a.style.display="none";return this};function C(a){a.t("vjs-lock-showing")}t.disable=function(){this.D();this.show=m()};t.width=function(a,c){return E(this,"width",a,c)};t.height=function(a,c){return E(this,"height",a,c)};t.Yc=function(a,c){return this.width(a,f).height(c)};
function E(a,c,d,e){if(d!==b)return a.a.style[c]=-1!==(""+d).indexOf("%")||-1!==(""+d).indexOf("px")?d:"auto"===d?"":d+"px",e||a.k("resize"),a;if(!a.a)return 0;d=a.a.style[c];e=d.indexOf("px");return-1!==e?parseInt(d.slice(0,e),10):parseInt(a.a["offset"+u.Z(c)],10)}
u.q=u.b.extend({j:function(a,c){u.b.call(this,a,c);var d=l;this.d("touchstart",function(a){a.preventDefault();d=f});this.d("touchmove",function(){d=l});var e=this;this.d("touchend",function(a){d&&e.p(a);a.preventDefault()});this.d("click",this.p);this.d("focus",this.Qa);this.d("blur",this.Pa)}});t=u.q.prototype;
t.e=function(a,c){c=u.l.B({className:this.Q(),innerHTML:'<div class="vjs-control-content"><span class="vjs-control-text">'+(this.oa||"Need Text")+"</span></div>",role:"button","aria-live":"polite",tabIndex:0},c);return u.b.prototype.e.call(this,a,c)};t.Q=function(){return"vjs-control "+u.b.prototype.Q.call(this)};t.p=m();t.Qa=function(){u.d(document,"keyup",u.bind(this,this.ba))};t.ba=function(a){if(32==a.which||13==a.which)a.preventDefault(),this.p()};
t.Pa=function(){u.o(document,"keyup",u.bind(this,this.ba))};u.O=u.b.extend({j:function(a,c){u.b.call(this,a,c);this.Rc=this.fa(this.h.barName);this.handle=this.fa(this.h.handleName);a.d(this.sc,u.bind(this,this.update));this.d("mousedown",this.Ra);this.d("touchstart",this.Ra);this.d("focus",this.Qa);this.d("blur",this.Pa);this.d("click",this.p);this.c.d("controlsvisible",u.bind(this,this.update));a.I(u.bind(this,this.update));this.P={}}});t=u.O.prototype;
t.e=function(a,c){c=c||{};c.className+=" vjs-slider";c=u.l.B({role:"slider","aria-valuenow":0,"aria-valuemin":0,"aria-valuemax":100,tabIndex:0},c);return u.b.prototype.e.call(this,a,c)};t.Ra=function(a){a.preventDefault();u.Sc();this.P.move=u.bind(this,this.Gb);this.P.end=u.bind(this,this.Hb);u.d(document,"mousemove",this.P.move);u.d(document,"mouseup",this.P.end);u.d(document,"touchmove",this.P.move);u.d(document,"touchend",this.P.end);this.Gb(a)};
t.Hb=function(){u.Ed();u.o(document,"mousemove",this.P.move,l);u.o(document,"mouseup",this.P.end,l);u.o(document,"touchmove",this.P.move,l);u.o(document,"touchend",this.P.end,l);this.update()};t.update=function(){if(this.a){var a,c=this.xb(),d=this.handle,e=this.Rc;isNaN(c)&&(c=0);a=c;if(d){a=this.a.offsetWidth;var g=d.u().offsetWidth;a=g?g/a:0;c*=1-a;a=c+a/2;d.u().style.left=u.round(100*c,2)+"%"}e.u().style.width=u.round(100*a,2)+"%"}};
function F(a,c){var d,e,g,j;d=a.a;e=u.cd(d);j=g=d.offsetWidth;d=a.handle;if(a.h.Gd)return j=e.top,e=c.changedTouches?c.changedTouches[0].pageY:c.pageY,d&&(d=d.u().offsetHeight,j+=d/2,g-=d),Math.max(0,Math.min(1,(j-e+g)/g));g=e.left;e=c.changedTouches?c.changedTouches[0].pageX:c.pageX;d&&(d=d.u().offsetWidth,g+=d/2,j-=d);return Math.max(0,Math.min(1,(e-g)/j))}t.Qa=function(){u.d(document,"keyup",u.bind(this,this.ba))};
t.ba=function(a){37==a.which?(a.preventDefault(),this.yc()):39==a.which&&(a.preventDefault(),this.zc())};t.Pa=function(){u.o(document,"keyup",u.bind(this,this.ba))};t.p=function(a){a.stopImmediatePropagation();a.preventDefault()};u.W=u.b.extend();u.W.prototype.defaultValue=0;u.W.prototype.e=function(a,c){c=c||{};c.className+=" vjs-slider-handle";c=u.l.B({innerHTML:'<span class="vjs-control-text">'+this.defaultValue+"</span>"},c);return u.b.prototype.e.call(this,"div",c)};u.la=u.b.extend();
function ca(a,c){a.Y(c);c.d("click",u.bind(a,function(){C(this)}))}u.la.prototype.e=function(){var a=this.options().Uc||"ul";this.G=u.e(a,{className:"vjs-menu-content"});a=u.b.prototype.e.call(this,"div",{append:this.G,className:"vjs-menu"});a.appendChild(this.G);u.d(a,"click",function(a){a.preventDefault();a.stopImmediatePropagation()});return a};u.N=u.q.extend({j:function(a,c){u.q.call(this,a,c);this.selected(c.selected)}});
u.N.prototype.e=function(a,c){return u.q.prototype.e.call(this,"li",u.l.B({className:"vjs-menu-item",innerHTML:this.h.label},c))};u.N.prototype.p=function(){this.selected(f)};u.N.prototype.selected=function(a){a?(this.n("vjs-selected"),this.a.setAttribute("aria-selected",f)):(this.t("vjs-selected"),this.a.setAttribute("aria-selected",l))};
u.S=u.q.extend({j:function(a,c){u.q.call(this,a,c);this.ua=this.Ma();this.Y(this.ua);this.L&&0===this.L.length&&this.D();this.d("keyup",this.ba);this.a.setAttribute("aria-haspopup",f);this.a.setAttribute("role","button")}});t=u.S.prototype;t.na=l;t.Ma=function(){var a=new u.la(this.c);this.options().title&&a.u().appendChild(u.e("li",{className:"vjs-menu-title",innerHTML:u.Z(this.A),Cd:-1}));if(this.L=this.createItems())for(var c=0;c<this.L.length;c++)ca(a,this.L[c]);return a};t.qa=m();
t.Q=function(){return this.className+" vjs-menu-button "+u.q.prototype.Q.call(this)};t.Qa=m();t.Pa=m();t.p=function(){this.U("mouseout",u.bind(this,function(){C(this.ua);this.a.blur()}));this.na?G(this):H(this)};t.ba=function(a){a.preventDefault();32==a.which||13==a.which?this.na?G(this):H(this):27==a.which&&this.na&&G(this)};function H(a){a.na=f;a.ua.n("vjs-lock-showing");a.a.setAttribute("aria-pressed",f);a.L&&0<a.L.length&&a.L[0].u().focus()}
function G(a){a.na=l;C(a.ua);a.a.setAttribute("aria-pressed",l)}
u.Player=u.b.extend({j:function(a,c,d){this.M=a;a.id=a.id||"vjs_video_"+u.s++;c=u.l.B(da(a),c);this.v={};this.tc=c.poster;this.rb=c.controls;a.controls=l;c.vc=l;u.b.call(this,this,c,d);this.controls()?this.n("vjs-controls-enabled"):this.n("vjs-controls-disabled");this.U("play",function(a){u.k(this.a,{type:"firstplay",target:this.a})||(a.preventDefault(),a.stopPropagation(),a.stopImmediatePropagation())});this.d("ended",this.md);this.d("play",this.Jb);this.d("firstplay",this.nd);this.d("pause",this.Ib);
this.d("progress",this.pd);this.d("durationchange",this.qc);this.d("error",this.Fb);this.d("fullscreenchange",this.od);u.va[this.R]=this;c.plugins&&u.l.ra(c.plugins,function(a,c){this[a](c)},this);var e,g,j,k;e=u.bind(this,this.reportUserActivity);this.d("mousedown",function(){e();clearInterval(g);g=setInterval(e,250)});this.d("mousemove",e);this.d("mouseup",function(){e();clearInterval(g)});this.d("keydown",e);this.d("keyup",e);j=setInterval(u.bind(this,function(){this.ia&&(this.ia=l,this.userActive(f),
clearTimeout(k),k=setTimeout(u.bind(this,function(){this.ia||this.userActive(l)}),2E3))}),250);this.d("dispose",function(){clearInterval(j);clearTimeout(k)})}});t=u.Player.prototype;t.h=u.options;t.dispose=function(){this.k("dispose");this.o("dispose");u.va[this.R]=h;this.M&&this.M.player&&(this.M.player=h);this.a&&this.a.player&&(this.a.player=h);clearInterval(this.Ta);this.wa();this.i&&this.i.dispose();u.b.prototype.dispose.call(this)};
function da(a){var c={sources:[],tracks:[]};u.l.B(c,u.wb(a));if(a.hasChildNodes()){var d,e,g,j;a=a.childNodes;g=0;for(j=a.length;g<j;g++)d=a[g],e=d.nodeName.toLowerCase(),"source"===e?c.sources.push(u.wb(d)):"track"===e&&c.tracks.push(u.wb(d))}return c}
t.e=function(){var a=this.a=u.b.prototype.e.call(this,"div"),c=this.M;c.removeAttribute("width");c.removeAttribute("height");if(c.hasChildNodes()){var d,e,g,j,k;d=c.childNodes;e=d.length;for(k=[];e--;)g=d[e],j=g.nodeName.toLowerCase(),"track"===j&&k.push(g);for(d=0;d<k.length;d++)c.removeChild(k[d])}a.id=c.id;a.className=c.className;c.id+="_html5_api";c.className="vjs-tech";c.player=a.player=this;this.n("vjs-paused");this.width(this.h.width,f);this.height(this.h.height,f);c.parentNode&&c.parentNode.insertBefore(a,
c);u.yb(c,a);return a};
function I(a,c,d){a.i&&(a.aa=l,a.i.dispose(),a.Cb&&(a.Cb=l,clearInterval(a.Ta)),a.Db&&J(a),a.i=l);"Html5"!==c&&a.M&&(u.g.gc(a.M),a.M=h);a.xa=c;a.aa=l;var e=u.l.B({source:d,parentEl:a.a},a.h[c.toLowerCase()]);d&&(d.src==a.v.src&&0<a.v.currentTime&&(e.startTime=a.v.currentTime),a.v.src=d.src);a.i=new window.videojs[c](a,e);a.i.I(function(){this.c.za();if(!this.m.progressEvents){var a=this.c;a.Cb=f;a.Ta=setInterval(u.bind(a,function(){this.v.mb<this.buffered().end(0)?this.k("progress"):1==this.bufferedPercent()&&
(clearInterval(this.Ta),this.k("progress"))}),500);a.i.U("progress",function(){this.m.progressEvents=f;var a=this.c;a.Cb=l;clearInterval(a.Ta)})}this.m.timeupdateEvents||(a=this.c,a.Db=f,a.d("play",a.Cc),a.d("pause",a.wa),a.i.U("timeupdate",function(){this.m.timeupdateEvents=f;J(this.c)}))})}function J(a){a.Db=l;a.wa();a.o("play",a.Cc);a.o("pause",a.wa)}t.Cc=function(){this.fc&&this.wa();this.fc=setInterval(u.bind(this,function(){this.k("timeupdate")}),250)};t.wa=function(){clearInterval(this.fc)};
t.Jb=function(){u.t(this.a,"vjs-paused");u.n(this.a,"vjs-playing")};t.nd=function(){this.h.starttime&&this.currentTime(this.h.starttime);this.n("vjs-has-started")};t.Ib=function(){u.t(this.a,"vjs-playing");u.n(this.a,"vjs-paused")};t.pd=function(){1==this.bufferedPercent()&&this.k("loadedalldata")};t.md=function(){this.h.loop&&(this.currentTime(0),this.play())};t.qc=function(){var a=K(this,"duration");a&&this.duration(a)};t.od=function(){this.isFullScreen()?this.n("vjs-fullscreen"):this.t("vjs-fullscreen")};
t.Fb=function(a){u.log("Video Error",a)};function L(a,c,d){if(a.i&&!a.i.aa)a.i.I(function(){this[c](d)});else try{a.i[c](d)}catch(e){throw u.log(e),e;}}function K(a,c){if(a.i&&a.i.aa)try{return a.i[c]()}catch(d){throw a.i[c]===b?u.log("Video.js: "+c+" method not defined for "+a.xa+" playback technology.",d):"TypeError"==d.name?(u.log("Video.js: "+c+" unavailable on "+a.xa+" playback technology element.",d),a.i.aa=l):u.log(d),d;}}t.play=function(){L(this,"play");return this};
t.pause=function(){L(this,"pause");return this};t.paused=function(){return K(this,"paused")===l?l:f};t.currentTime=function(a){return a!==b?(L(this,"setCurrentTime",a),this.Db&&this.k("timeupdate"),this):this.v.currentTime=K(this,"currentTime")||0};t.duration=function(a){if(a!==b)return this.v.duration=parseFloat(a),this;this.v.duration===b&&this.qc();return this.v.duration||0};
t.buffered=function(){var a=K(this,"buffered"),c=a.length-1,d=this.v.mb=this.v.mb||0;a&&(0<=c&&a.end(c)!==d)&&(d=a.end(c),this.v.mb=d);return u.sb(0,d)};t.bufferedPercent=function(){return this.duration()?this.buffered().end(0)/this.duration():0};t.volume=function(a){if(a!==b)return a=Math.max(0,Math.min(1,parseFloat(a))),this.v.volume=a,L(this,"setVolume",a),u.wd(a),this;a=parseFloat(K(this,"volume"));return isNaN(a)?1:a};
t.muted=function(a){return a!==b?(L(this,"setMuted",a),this):K(this,"muted")||l};t.Wa=function(){return K(this,"supportsFullScreen")||l};t.oc=l;t.isFullScreen=function(a){return a!==b?(this.oc=a,this):this.oc};
t.requestFullScreen=function(){var a=u.Nb.requestFullScreen;this.isFullScreen(f);a?(u.d(document,a.ub,u.bind(this,function(c){this.isFullScreen(document[a.isFullScreen]);this.isFullScreen()===l&&u.o(document,a.ub,arguments.callee);this.k("fullscreenchange")})),this.a[a.wc]()):this.i.Wa()?L(this,"enterFullScreen"):(this.gd=f,this.Zc=document.documentElement.style.overflow,u.d(document,"keydown",u.bind(this,this.jc)),document.documentElement.style.overflow="hidden",u.n(document.body,"vjs-full-window"),
this.k("enterFullWindow"),this.k("fullscreenchange"));return this};t.cancelFullScreen=function(){var a=u.Nb.requestFullScreen;this.isFullScreen(l);if(a)document[a.ob]();else this.i.Wa()?L(this,"exitFullScreen"):(M(this),this.k("fullscreenchange"));return this};t.jc=function(a){27===a.keyCode&&(this.isFullScreen()===f?this.cancelFullScreen():M(this))};
function M(a){a.gd=l;u.o(document,"keydown",a.jc);document.documentElement.style.overflow=a.Zc;u.t(document.body,"vjs-full-window");a.k("exitFullWindow")}
t.src=function(a){if(a===b)return K(this,"src");if(a instanceof Array){var c;a:{c=a;for(var d=0,e=this.h.techOrder;d<e.length;d++){var g=u.Z(e[d]),j=window.videojs[g];if(j.isSupported())for(var k=0,r=c;k<r.length;k++){var n=r[k];if(j.canPlaySource(n)){c={source:n,i:g};break a}}}c=l}c?(a=c.source,c=c.i,c==this.xa?this.src(a):I(this,c,a)):(this.a.appendChild(u.e("p",{innerHTML:this.options().notSupportedMessage})),this.za())}else a instanceof Object?window.videojs[this.xa].canPlaySource(a)?this.src(a.src):
this.src([a]):(this.v.src=a,this.aa?(L(this,"src",a),"auto"==this.h.preload&&this.load(),this.h.autoplay&&this.play()):this.I(function(){this.src(a)}));return this};t.load=function(){L(this,"load");return this};t.currentSrc=function(){return K(this,"currentSrc")||this.v.src||""};t.Sa=function(a){return a!==b?(L(this,"setPreload",a),this.h.preload=a,this):K(this,"preload")};t.autoplay=function(a){return a!==b?(L(this,"setAutoplay",a),this.h.autoplay=a,this):K(this,"autoplay")};
t.loop=function(a){return a!==b?(L(this,"setLoop",a),this.h.loop=a,this):K(this,"loop")};t.poster=function(a){if(a===b)return this.tc;this.tc=a;L(this,"setPoster",a);this.k("posterchange")};t.controls=function(a){return a!==b?(a=!!a,this.rb!==a&&((this.rb=a)?(this.t("vjs-controls-disabled"),this.n("vjs-controls-enabled"),this.k("controlsenabled")):(this.t("vjs-controls-enabled"),this.n("vjs-controls-disabled"),this.k("controlsdisabled"))),this):this.rb};u.Player.prototype.Pb;t=u.Player.prototype;
t.usingNativeControls=function(a){return a!==b?(a=!!a,this.Pb!==a&&((this.Pb=a)?(this.n("vjs-using-native-controls"),this.k("usingnativecontrols")):(this.t("vjs-using-native-controls"),this.k("usingcustomcontrols"))),this):this.Pb};t.error=function(){return K(this,"error")};t.ended=function(){return K(this,"ended")};t.seeking=function(){return K(this,"seeking")};t.ia=f;t.reportUserActivity=function(){this.ia=f};t.Ob=f;
t.userActive=function(a){return a!==b?(a=!!a,a!==this.Ob&&((this.Ob=a)?(this.ia=f,this.t("vjs-user-inactive"),this.n("vjs-user-active"),this.k("useractive")):(this.ia=l,this.i&&this.i.U("mousemove",function(a){a.stopPropagation();a.preventDefault()}),this.t("vjs-user-active"),this.n("vjs-user-inactive"),this.k("userinactive"))),this):this.Ob};var N,O,P;P=document.createElement("div");O={};
P.Md!==b?(O.wc="requestFullscreen",O.ob="exitFullscreen",O.ub="fullscreenchange",O.isFullScreen="fullScreen"):(document.mozCancelFullScreen?(N="moz",O.isFullScreen=N+"FullScreen"):(N="webkit",O.isFullScreen=N+"IsFullScreen"),P[N+"RequestFullScreen"]&&(O.wc=N+"RequestFullScreen",O.ob=N+"CancelFullScreen"),O.ub=N+"fullscreenchange");document[O.ob]&&(u.Nb.requestFullScreen=O);u.Da=u.b.extend();
u.Da.prototype.h={Rd:"play",children:{playToggle:{},currentTimeDisplay:{},timeDivider:{},durationDisplay:{},remainingTimeDisplay:{},progressControl:{},fullscreenToggle:{},volumeControl:{},muteToggle:{}}};u.Da.prototype.e=function(){return u.e("div",{className:"vjs-control-bar"})};u.Xb=u.q.extend({j:function(a,c){u.q.call(this,a,c);a.d("play",u.bind(this,this.Jb));a.d("pause",u.bind(this,this.Ib))}});t=u.Xb.prototype;t.oa="Play";t.Q=function(){return"vjs-play-control "+u.q.prototype.Q.call(this)};
t.p=function(){this.c.paused()?this.c.play():this.c.pause()};t.Jb=function(){u.t(this.a,"vjs-paused");u.n(this.a,"vjs-playing");this.a.children[0].children[0].innerHTML="Pause"};t.Ib=function(){u.t(this.a,"vjs-playing");u.n(this.a,"vjs-paused");this.a.children[0].children[0].innerHTML="Play"};u.$a=u.b.extend({j:function(a,c){u.b.call(this,a,c);a.d("timeupdate",u.bind(this,this.da))}});
u.$a.prototype.e=function(){var a=u.b.prototype.e.call(this,"div",{className:"vjs-current-time vjs-time-controls vjs-control"});this.G=u.e("div",{className:"vjs-current-time-display",innerHTML:'<span class="vjs-control-text">Current Time </span>0:00',"aria-live":"off"});a.appendChild(this.G);return a};u.$a.prototype.da=function(){var a=this.c.Va?this.c.v.currentTime:this.c.currentTime();this.G.innerHTML='<span class="vjs-control-text">Current Time </span>'+u.ta(a,this.c.duration())};
u.ab=u.b.extend({j:function(a,c){u.b.call(this,a,c);a.d("timeupdate",u.bind(this,this.da))}});u.ab.prototype.e=function(){var a=u.b.prototype.e.call(this,"div",{className:"vjs-duration vjs-time-controls vjs-control"});this.G=u.e("div",{className:"vjs-duration-display",innerHTML:'<span class="vjs-control-text">Duration Time </span>0:00',"aria-live":"off"});a.appendChild(this.G);return a};
u.ab.prototype.da=function(){var a=this.c.duration();a&&(this.G.innerHTML='<span class="vjs-control-text">Duration Time </span>'+u.ta(a))};u.bc=u.b.extend({j:function(a,c){u.b.call(this,a,c)}});u.bc.prototype.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-time-divider",innerHTML:"<div><span>/</span></div>"})};u.gb=u.b.extend({j:function(a,c){u.b.call(this,a,c);a.d("timeupdate",u.bind(this,this.da))}});
u.gb.prototype.e=function(){var a=u.b.prototype.e.call(this,"div",{className:"vjs-remaining-time vjs-time-controls vjs-control"});this.G=u.e("div",{className:"vjs-remaining-time-display",innerHTML:'<span class="vjs-control-text">Remaining Time </span>-0:00',"aria-live":"off"});a.appendChild(this.G);return a};u.gb.prototype.da=function(){this.c.duration()&&(this.G.innerHTML='<span class="vjs-control-text">Remaining Time </span>-'+u.ta(this.c.duration()-this.c.currentTime()))};
u.Ea=u.q.extend({j:function(a,c){u.q.call(this,a,c)}});u.Ea.prototype.oa="Fullscreen";u.Ea.prototype.Q=function(){return"vjs-fullscreen-control "+u.q.prototype.Q.call(this)};u.Ea.prototype.p=function(){this.c.isFullScreen()?(this.c.cancelFullScreen(),this.a.children[0].children[0].innerHTML="Fullscreen"):(this.c.requestFullScreen(),this.a.children[0].children[0].innerHTML="Non-Fullscreen")};u.fb=u.b.extend({j:function(a,c){u.b.call(this,a,c)}});u.fb.prototype.h={children:{seekBar:{}}};
u.fb.prototype.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-progress-control vjs-control"})};u.Yb=u.O.extend({j:function(a,c){u.O.call(this,a,c);a.d("timeupdate",u.bind(this,this.Aa));a.I(u.bind(this,this.Aa))}});t=u.Yb.prototype;t.h={children:{loadProgressBar:{},playProgressBar:{},seekHandle:{}},barName:"playProgressBar",handleName:"seekHandle"};t.sc="timeupdate";t.e=function(){return u.O.prototype.e.call(this,"div",{className:"vjs-progress-holder","aria-label":"video progress bar"})};
t.Aa=function(){var a=this.c.Va?this.c.v.currentTime:this.c.currentTime();this.a.setAttribute("aria-valuenow",u.round(100*this.xb(),2));this.a.setAttribute("aria-valuetext",u.ta(a,this.c.duration()))};t.xb=function(){return this.c.currentTime()/this.c.duration()};t.Ra=function(a){u.O.prototype.Ra.call(this,a);this.c.Va=f;this.Hd=!this.c.paused();this.c.pause()};t.Gb=function(a){a=F(this,a)*this.c.duration();a==this.c.duration()&&(a-=0.1);this.c.currentTime(a)};
t.Hb=function(a){u.O.prototype.Hb.call(this,a);this.c.Va=l;this.Hd&&this.c.play()};t.zc=function(){this.c.currentTime(this.c.currentTime()+5)};t.yc=function(){this.c.currentTime(this.c.currentTime()-5)};u.cb=u.b.extend({j:function(a,c){u.b.call(this,a,c);a.d("progress",u.bind(this,this.update))}});u.cb.prototype.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-load-progress",innerHTML:'<span class="vjs-control-text">Loaded: 0%</span>'})};
u.cb.prototype.update=function(){this.a.style&&(this.a.style.width=u.round(100*this.c.bufferedPercent(),2)+"%")};u.Wb=u.b.extend({j:function(a,c){u.b.call(this,a,c)}});u.Wb.prototype.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-play-progress",innerHTML:'<span class="vjs-control-text">Progress: 0%</span>'})};u.Ga=u.W.extend({j:function(a,c){u.W.call(this,a,c);a.d("timeupdate",u.bind(this,this.da))}});u.Ga.prototype.defaultValue="00:00";
u.Ga.prototype.e=function(){return u.W.prototype.e.call(this,"div",{className:"vjs-seek-handle","aria-live":"off"})};u.Ga.prototype.da=function(){var a=this.c.Va?this.c.v.currentTime:this.c.currentTime();this.a.innerHTML='<span class="vjs-control-text">'+u.ta(a,this.c.duration())+"</span>"};u.ib=u.b.extend({j:function(a,c){u.b.call(this,a,c);a.i&&(a.i.m&&a.i.m.volumeControl===l)&&this.n("vjs-hidden");a.d("loadstart",u.bind(this,function(){a.i.m&&a.i.m.volumeControl===l?this.n("vjs-hidden"):this.t("vjs-hidden")}))}});
u.ib.prototype.h={children:{volumeBar:{}}};u.ib.prototype.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-volume-control vjs-control"})};u.hb=u.O.extend({j:function(a,c){u.O.call(this,a,c);a.d("volumechange",u.bind(this,this.Aa));a.I(u.bind(this,this.Aa));setTimeout(u.bind(this,this.update),0)}});t=u.hb.prototype;t.Aa=function(){this.a.setAttribute("aria-valuenow",u.round(100*this.c.volume(),2));this.a.setAttribute("aria-valuetext",u.round(100*this.c.volume(),2)+"%")};
t.h={children:{volumeLevel:{},volumeHandle:{}},barName:"volumeLevel",handleName:"volumeHandle"};t.sc="volumechange";t.e=function(){return u.O.prototype.e.call(this,"div",{className:"vjs-volume-bar","aria-label":"volume level"})};t.Gb=function(a){this.c.muted()&&this.c.muted(l);this.c.volume(F(this,a))};t.xb=function(){return this.c.muted()?0:this.c.volume()};t.zc=function(){this.c.volume(this.c.volume()+0.1)};t.yc=function(){this.c.volume(this.c.volume()-0.1)};
u.cc=u.b.extend({j:function(a,c){u.b.call(this,a,c)}});u.cc.prototype.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-volume-level",innerHTML:'<span class="vjs-control-text"></span>'})};u.jb=u.W.extend();u.jb.prototype.defaultValue="00:00";u.jb.prototype.e=function(){return u.W.prototype.e.call(this,"div",{className:"vjs-volume-handle"})};
u.ea=u.q.extend({j:function(a,c){u.q.call(this,a,c);a.d("volumechange",u.bind(this,this.update));a.i&&(a.i.m&&a.i.m.volumeControl===l)&&this.n("vjs-hidden");a.d("loadstart",u.bind(this,function(){a.i.m&&a.i.m.volumeControl===l?this.n("vjs-hidden"):this.t("vjs-hidden")}))}});u.ea.prototype.e=function(){return u.q.prototype.e.call(this,"div",{className:"vjs-mute-control vjs-control",innerHTML:'<div><span class="vjs-control-text">Mute</span></div>'})};
u.ea.prototype.p=function(){this.c.muted(this.c.muted()?l:f)};u.ea.prototype.update=function(){var a=this.c.volume(),c=3;0===a||this.c.muted()?c=0:0.33>a?c=1:0.67>a&&(c=2);this.c.muted()?"Unmute"!=this.a.children[0].children[0].innerHTML&&(this.a.children[0].children[0].innerHTML="Unmute"):"Mute"!=this.a.children[0].children[0].innerHTML&&(this.a.children[0].children[0].innerHTML="Mute");for(a=0;4>a;a++)u.t(this.a,"vjs-vol-"+a);u.n(this.a,"vjs-vol-"+c)};
u.ma=u.S.extend({j:function(a,c){u.S.call(this,a,c);a.d("volumechange",u.bind(this,this.update));a.i&&(a.i.m&&a.i.m.Dc===l)&&this.n("vjs-hidden");a.d("loadstart",u.bind(this,function(){a.i.m&&a.i.m.Dc===l?this.n("vjs-hidden"):this.t("vjs-hidden")}));this.n("vjs-menu-button")}});u.ma.prototype.Ma=function(){var a=new u.la(this.c,{Uc:"div"}),c=new u.hb(this.c,u.l.B({Gd:f},this.h.Yd));a.Y(c);return a};u.ma.prototype.p=function(){u.ea.prototype.p.call(this);u.S.prototype.p.call(this)};
u.ma.prototype.e=function(){return u.q.prototype.e.call(this,"div",{className:"vjs-volume-menu-button vjs-menu-button vjs-control",innerHTML:'<div><span class="vjs-control-text">Mute</span></div>'})};u.ma.prototype.update=u.ea.prototype.update;u.Fa=u.q.extend({j:function(a,c){u.q.call(this,a,c);a.poster()&&this.src(a.poster());(!a.poster()||!a.controls())&&this.D();a.d("posterchange",u.bind(this,function(){this.src(a.poster())}));a.d("play",u.bind(this,this.D))}});var Q="backgroundSize"in u.F.style;
u.Fa.prototype.e=function(){var a=u.e("div",{className:"vjs-poster",tabIndex:-1});Q||a.appendChild(u.e("img"));return a};u.Fa.prototype.src=function(a){var c=this.u();a!==b&&(Q?c.style.backgroundImage='url("'+a+'")':c.firstChild.src=a)};u.Fa.prototype.p=function(){this.C().controls()&&this.c.play()};
u.Vb=u.b.extend({j:function(a,c){u.b.call(this,a,c);a.d("canplay",u.bind(this,this.D));a.d("canplaythrough",u.bind(this,this.D));a.d("playing",u.bind(this,this.D));a.d("seeking",u.bind(this,this.show));a.d("seeked",u.bind(this,this.D));a.d("error",u.bind(this,this.show));a.d("ended",u.bind(this,this.D));a.d("waiting",u.bind(this,this.show))}});u.Vb.prototype.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-loading-spinner"})};u.Ya=u.q.extend();
u.Ya.prototype.e=function(){return u.q.prototype.e.call(this,"div",{className:"vjs-big-play-button",innerHTML:'<span aria-hidden="true"></span>',"aria-label":"play video"})};u.Ya.prototype.p=function(){this.c.play()};
u.r=u.b.extend({j:function(a,c,d){c=c||{};c.vc=l;u.b.call(this,a,c,d);var e,g;g=this;e=this.C();a=function(){if(e.controls()&&!e.usingNativeControls()){var a;g.d("mousedown",g.p);g.d("touchstart",function(c){c.preventDefault();a=this.c.userActive()});g.d("touchmove",function(){a&&this.C().reportUserActivity()});var c,d,n,s;c=0;g.d("touchstart",function(){c=(new Date).getTime();n=f});s=function(){n=l};g.d("touchmove",s);g.d("touchleave",s);g.d("touchcancel",s);g.d("touchend",function(){n===f&&(d=(new Date).getTime()-
c,250>d&&this.k("tap"))});g.d("tap",g.qd)}};c=u.bind(g,g.td);this.I(a);e.d("controlsenabled",a);e.d("controlsdisabled",c)}});t=u.r.prototype;t.td=function(){this.o("tap");this.o("touchstart");this.o("touchmove");this.o("touchleave");this.o("touchcancel");this.o("touchend");this.o("click");this.o("mousedown")};t.p=function(a){0===a.button&&this.C().controls()&&(this.C().paused()?this.C().play():this.C().pause())};t.qd=function(){this.C().userActive(!this.C().userActive())};t.Lb=m();
t.m={volumeControl:f,fullscreenResize:l,progressEvents:l,timeupdateEvents:l};u.media={};u.media.Xa="play pause paused currentTime setCurrentTime duration buffered volume setVolume muted setMuted width height supportsFullScreen enterFullScreen src load currentSrc preload setPreload autoplay setAutoplay loop setLoop error networkState readyState seeking initialTime startOffsetTime played seekable ended videoTracks audioTracks videoWidth videoHeight textTracks defaultPlaybackRate playbackRate mediaGroup controller controls defaultMuted".split(" ");
function ea(){var a=u.media.Xa[i];return function(){throw Error('The "'+a+"\" method is not available on the playback technology's API");}}for(var i=u.media.Xa.length-1;0<=i;i--)u.r.prototype[u.media.Xa[i]]=ea();
u.g=u.r.extend({j:function(a,c,d){this.m.volumeControl=u.g.Tc();this.m.movingMediaElementInDOM=!u.Ic;this.m.fullscreenResize=f;u.r.call(this,a,c,d);for(d=u.g.bb.length-1;0<=d;d--)u.d(this.a,u.g.bb[d],u.bind(this.c,this.ad));(c=c.source)&&this.a.currentSrc===c.src&&0<this.a.networkState?a.k("loadstart"):c&&(this.a.src=c.src);if(u.$b&&a.options().nativeControlsForTouch!==l){var e,g,j,k;e=this;g=this.C();c=g.controls();e.a.controls=!!c;j=function(){e.a.controls=f};k=function(){e.a.controls=l};g.d("controlsenabled",
j);g.d("controlsdisabled",k);c=function(){g.o("controlsenabled",j);g.o("controlsdisabled",k)};e.d("dispose",c);g.d("usingcustomcontrols",c);g.usingNativeControls(f)}a.I(function(){this.M&&(this.h.autoplay&&this.paused())&&(delete this.M.poster,this.play())});this.za()}});t=u.g.prototype;t.dispose=function(){u.r.prototype.dispose.call(this)};
t.e=function(){var a=this.c,c=a.M,d;if(!c||this.m.movingMediaElementInDOM===l)c?(d=c.cloneNode(l),u.g.gc(c),c=d,a.M=h):c=u.e("video",{id:a.id()+"_html5_api",className:"vjs-tech"}),c.player=a,u.yb(c,a.u());d=["autoplay","preload","loop","muted"];for(var e=d.length-1;0<=e;e--){var g=d[e];a.h[g]!==h&&(c[g]=a.h[g])}return c};t.ad=function(a){this.k(a);a.stopPropagation()};t.play=function(){this.a.play()};t.pause=function(){this.a.pause()};t.paused=function(){return this.a.paused};t.currentTime=function(){return this.a.currentTime};
t.vd=function(a){try{this.a.currentTime=a}catch(c){u.log(c,"Video is not ready. (Video.js)")}};t.duration=function(){return this.a.duration||0};t.buffered=function(){return this.a.buffered};t.volume=function(){return this.a.volume};t.Ad=function(a){this.a.volume=a};t.muted=function(){return this.a.muted};t.yd=function(a){this.a.muted=a};t.width=function(){return this.a.offsetWidth};t.height=function(){return this.a.offsetHeight};
t.Wa=function(){return"function"==typeof this.a.webkitEnterFullScreen&&(/Android/.test(u.J)||!/Chrome|Mac OS X 10.5/.test(u.J))?f:l};t.hc=function(){var a=this.a;a.paused&&a.networkState<=a.Jd?(this.a.play(),setTimeout(function(){a.pause();a.webkitEnterFullScreen()},0)):a.webkitEnterFullScreen()};t.bd=function(){this.a.webkitExitFullScreen()};t.src=function(a){this.a.src=a};t.load=function(){this.a.load()};t.currentSrc=function(){return this.a.currentSrc};t.poster=function(){return this.a.poster};
t.Lb=function(a){this.a.poster=a};t.Sa=function(){return this.a.Sa};t.zd=function(a){this.a.Sa=a};t.autoplay=function(){return this.a.autoplay};t.ud=function(a){this.a.autoplay=a};t.controls=function(){return this.a.controls};t.loop=function(){return this.a.loop};t.xd=function(a){this.a.loop=a};t.error=function(){return this.a.error};t.seeking=function(){return this.a.seeking};t.ended=function(){return this.a.ended};u.g.isSupported=function(){try{u.F.volume=0.5}catch(a){return l}return!!u.F.canPlayType};
u.g.nb=function(a){try{return!!u.F.canPlayType(a.type)}catch(c){return""}};u.g.Tc=function(){var a=u.F.volume;u.F.volume=a/2+0.1;return a!==u.F.volume};var R,fa=/^application\/(?:x-|vnd\.apple\.)mpegurl/i,ga=/^video\/mp4/i;
u.g.rc=function(){4<=u.Qb&&(R||(R=u.F.constructor.prototype.canPlayType),u.F.constructor.prototype.canPlayType=function(a){return a&&fa.test(a)?"maybe":R.call(this,a)});u.Mc&&(R||(R=u.F.constructor.prototype.canPlayType),u.F.constructor.prototype.canPlayType=function(a){return a&&ga.test(a)?"maybe":R.call(this,a)})};u.g.Fd=function(){var a=u.F.constructor.prototype.canPlayType;u.F.constructor.prototype.canPlayType=R;R=h;return a};u.g.rc();u.g.bb="loadstart suspend abort error emptied stalled loadedmetadata loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange timeupdate progress play pause ratechange volumechange".split(" ");
u.g.gc=function(a){if(a){a.player=h;for(a.parentNode&&a.parentNode.removeChild(a);a.hasChildNodes();)a.removeChild(a.firstChild);a.removeAttribute("src");if("function"===typeof a.load)try{a.load()}catch(c){}}};
u.f=u.r.extend({j:function(a,c,d){u.r.call(this,a,c,d);var e=c.source;d=c.parentEl;var g=this.a=u.e("div",{id:a.id()+"_temp_flash"}),j=a.id()+"_flash_api";a=a.h;var k=u.l.B({readyFunction:"videojs.Flash.onReady",eventProxyFunction:"videojs.Flash.onEvent",errorEventProxyFunction:"videojs.Flash.onError",autoplay:a.autoplay,preload:a.Sa,loop:a.loop,muted:a.muted},c.flashVars),r=u.l.B({wmode:"opaque",bgcolor:"#000000"},c.params),n=u.l.B({id:j,name:j,"class":"vjs-tech"},c.attributes),s;e&&(e.type&&u.f.jd(e.type)?
(a=u.f.Ac(e.src),k.rtmpConnection=encodeURIComponent(a.qb),k.rtmpStream=encodeURIComponent(a.Mb)):k.src=encodeURIComponent(u.kc(e.src)));this.setCurrentTime=function(a){s=a;this.a.vjs_setProperty("currentTime",a)};this.currentTime=function(){return this.seeking()?s:this.a.vjs_getProperty("currentTime")};u.yb(g,d);c.startTime&&this.I(function(){this.load();this.play();this.currentTime(c.startTime)});u.Ub&&this.I(function(){u.d(this.u(),"mousemove",u.bind(this,function(){this.C().k({type:"mousemove",
bubbles:l})}))});if(c.iFrameMode===f&&!u.Ub){var D=u.e("iframe",{id:j+"_iframe",name:j+"_iframe",className:"vjs-tech",scrolling:"no",marginWidth:0,marginHeight:0,frameBorder:0});k.readyFunction="ready";k.eventProxyFunction="events";k.errorEventProxyFunction="errors";u.d(D,"load",u.bind(this,function(){var a,d=D.contentWindow;a=D.contentDocument?D.contentDocument:D.contentWindow.document;a.write(u.f.lc(c.swf,k,r,n));d.player=this.c;d.ready=u.bind(this.c,function(c){var d=this.i;d.a=a.getElementById(c);
u.f.pb(d)});d.events=u.bind(this.c,function(a,c){this&&"flash"===this.xa&&this.k(c)});d.errors=u.bind(this.c,function(a,c){u.log("Flash Error",c)})}));g.parentNode.replaceChild(D,g)}else u.f.$c(c.swf,g,k,r,n)}});t=u.f.prototype;t.dispose=function(){u.r.prototype.dispose.call(this)};t.play=function(){this.a.vjs_play()};t.pause=function(){this.a.vjs_pause()};
t.src=function(a){if(a===b)return this.currentSrc();u.f.hd(a)?(a=u.f.Ac(a),this.Td(a.qb),this.Ud(a.Mb)):(a=u.kc(a),this.a.vjs_src(a));if(this.c.autoplay()){var c=this;setTimeout(function(){c.play()},0)}};t.currentSrc=function(){var a=this.a.vjs_getProperty("currentSrc");if(a==h){var c=this.rtmpConnection(),d=this.rtmpStream();c&&d&&(a=u.f.Bd(c,d))}return a};t.load=function(){this.a.vjs_load()};t.poster=function(){this.a.vjs_getProperty("poster")};t.Lb=m();t.buffered=function(){return u.sb(0,this.a.vjs_getProperty("buffered"))};
t.Wa=q(l);t.hc=q(l);var S=u.f.prototype,T="rtmpConnection rtmpStream preload defaultPlaybackRate playbackRate autoplay loop mediaGroup controller controls volume muted defaultMuted".split(" "),U="error networkState readyState seeking initialTime duration startOffsetTime paused played seekable ended videoTracks audioTracks videoWidth videoHeight textTracks".split(" ");function ha(){var a=T[V],c=a.charAt(0).toUpperCase()+a.slice(1);S["set"+c]=function(c){return this.a.vjs_setProperty(a,c)}}
function W(a){S[a]=function(){return this.a.vjs_getProperty(a)}}var V;for(V=0;V<T.length;V++)W(T[V]),ha();for(V=0;V<U.length;V++)W(U[V]);u.f.isSupported=function(){return 10<=u.f.version()[0]};u.f.nb=function(a){if(!a.type)return"";a=a.type.replace(/;.*/,"").toLowerCase();if(a in u.f.dd||a in u.f.Bc)return"maybe"};u.f.dd={"video/flv":"FLV","video/x-flv":"FLV","video/mp4":"MP4","video/m4v":"MP4"};u.f.Bc={"rtmp/mp4":"MP4","rtmp/flv":"FLV"};
u.f.onReady=function(a){a=u.u(a);var c=a.player||a.parentNode.player,d=c.i;a.player=c;d.a=a;u.f.pb(d)};u.f.pb=function(a){a.u().vjs_getProperty?a.za():setTimeout(function(){u.f.pb(a)},50)};u.f.onEvent=function(a,c){u.u(a).player.k(c)};u.f.onError=function(a,c){u.u(a).player.k("error");u.log("Flash Error",c,a)};
u.f.version=function(){var a="0,0,0";try{a=(new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash")).GetVariable("$version").replace(/\D+/g,",").match(/^,?(.+),?$/)[1]}catch(c){try{navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin&&(a=(navigator.plugins["Shockwave Flash 2.0"]||navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g,",").match(/^,?(.+),?$/)[1])}catch(d){}}return a.split(",")};
u.f.$c=function(a,c,d,e,g){a=u.f.lc(a,d,e,g);a=u.e("div",{innerHTML:a}).childNodes[0];d=c.parentNode;c.parentNode.replaceChild(a,c);var j=d.childNodes[0];setTimeout(function(){j.style.display="block"},1E3)};
u.f.lc=function(a,c,d,e){var g="",j="",k="";c&&u.l.ra(c,function(a,c){g+=a+"="+c+"&amp;"});d=u.l.B({movie:a,flashvars:g,allowScriptAccess:"always",allowNetworking:"all"},d);u.l.ra(d,function(a,c){j+='<param name="'+a+'" value="'+c+'" />'});e=u.l.B({data:a,width:"100%",height:"100%"},e);u.l.ra(e,function(a,c){k+=a+'="'+c+'" '});return'<object type="application/x-shockwave-flash"'+k+">"+j+"</object>"};u.f.Bd=function(a,c){return a+"&"+c};
u.f.Ac=function(a){var c={qb:"",Mb:""};if(!a)return c;var d=a.indexOf("&"),e;-1!==d?e=d+1:(d=e=a.lastIndexOf("/")+1,0===d&&(d=e=a.length));c.qb=a.substring(0,d);c.Mb=a.substring(e,a.length);return c};u.f.jd=function(a){return a in u.f.Bc};u.f.Oc=/^rtmp[set]?:\/\//i;u.f.hd=function(a){return u.f.Oc.test(a)};
u.Nc=u.b.extend({j:function(a,c,d){u.b.call(this,a,c,d);if(!a.h.sources||0===a.h.sources.length){c=0;for(d=a.h.techOrder;c<d.length;c++){var e=u.Z(d[c]),g=window.videojs[e];if(g&&g.isSupported()){I(a,e);break}}}else a.src(a.h.sources)}});u.Player.prototype.textTracks=function(){return this.ya=this.ya||[]};function X(a,c,d){for(var e=a.ya,g=0,j=e.length,k,r;g<j;g++)k=e[g],k.id()===c?(k.show(),r=k):d&&(k.H()==d&&0<k.mode())&&k.disable();(c=r?r.H():d?d:l)&&a.k(c+"trackchange")}
u.w=u.b.extend({j:function(a,c){u.b.call(this,a,c);this.R=c.id||"vjs_"+c.kind+"_"+c.language+"_"+u.s++;this.xc=c.src;this.Xc=c["default"]||c.dflt;this.Dd=c.title;this.Qd=c.srclang;this.kd=c.label;this.$=[];this.kb=[];this.ga=this.ha=0;this.c.d("fullscreenchange",u.bind(this,this.Qc))}});t=u.w.prototype;t.H=p("A");t.src=p("xc");t.tb=p("Xc");t.title=p("Dd");t.label=p("kd");t.Vc=p("$");t.Pc=p("kb");t.readyState=p("ha");t.mode=p("ga");
t.Qc=function(){this.a.style.fontSize=this.c.isFullScreen()?140*(screen.width/this.c.width())+"%":""};t.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-"+this.A+" vjs-text-track"})};t.show=function(){Y(this);this.ga=2;u.b.prototype.show.call(this)};t.D=function(){Y(this);this.ga=1;u.b.prototype.D.call(this)};
t.disable=function(){2==this.ga&&this.D();this.c.o("timeupdate",u.bind(this,this.update,this.R));this.c.o("ended",u.bind(this,this.reset,this.R));this.reset();this.c.fa("textTrackDisplay").removeChild(this);this.ga=0};function Y(a){0===a.ha&&a.load();0===a.ga&&(a.c.d("timeupdate",u.bind(a,a.update,a.R)),a.c.d("ended",u.bind(a,a.reset,a.R)),("captions"===a.A||"subtitles"===a.A)&&a.c.fa("textTrackDisplay").Y(a))}
t.load=function(){0===this.ha&&(this.ha=1,u.get(this.xc,u.bind(this,this.rd),u.bind(this,this.Fb)))};t.Fb=function(a){this.error=a;this.ha=3;this.k("error")};t.rd=function(a){var c,d;a=a.split("\n");for(var e="",g=1,j=a.length;g<j;g++)if(e=u.trim(a[g])){-1==e.indexOf("--\x3e")?(c=e,e=u.trim(a[++g])):c=this.$.length;c={id:c,index:this.$.length};d=e.split(" --\x3e ");c.startTime=ia(d[0]);c.sa=ia(d[1]);for(d=[];a[++g]&&(e=u.trim(a[g]));)d.push(e);c.text=d.join("<br/>");this.$.push(c)}this.ha=2;this.k("loaded")};
function ia(a){var c=a.split(":");a=0;var d,e,g;3==c.length?(d=c[0],e=c[1],c=c[2]):(d=0,e=c[0],c=c[1]);c=c.split(/\s+/);c=c.splice(0,1)[0];c=c.split(/\.|,/);g=parseFloat(c[1]);c=c[0];a+=3600*parseFloat(d);a+=60*parseFloat(e);a+=parseFloat(c);g&&(a+=g/1E3);return a}
t.update=function(){if(0<this.$.length){var a=this.c.currentTime();if(this.Kb===b||a<this.Kb||this.Oa<=a){var c=this.$,d=this.c.duration(),e=0,g=l,j=[],k,r,n,s;a>=this.Oa||this.Oa===b?s=this.vb!==b?this.vb:0:(g=f,s=this.Bb!==b?this.Bb:c.length-1);for(;;){n=c[s];if(n.sa<=a)e=Math.max(e,n.sa),n.Ia&&(n.Ia=l);else if(a<n.startTime){if(d=Math.min(d,n.startTime),n.Ia&&(n.Ia=l),!g)break}else g?(j.splice(0,0,n),r===b&&(r=s),k=s):(j.push(n),k===b&&(k=s),r=s),d=Math.min(d,n.sa),e=Math.max(e,n.startTime),n.Ia=
f;if(g)if(0===s)break;else s--;else if(s===c.length-1)break;else s++}this.kb=j;this.Oa=d;this.Kb=e;this.vb=k;this.Bb=r;a=this.kb;c="";d=0;for(e=a.length;d<e;d++)c+='<span class="vjs-tt-cue">'+a[d].text+"</span>";this.a.innerHTML=c;this.k("cuechange")}}};t.reset=function(){this.Oa=0;this.Kb=this.c.duration();this.Bb=this.vb=0};u.Sb=u.w.extend();u.Sb.prototype.A="captions";u.Zb=u.w.extend();u.Zb.prototype.A="subtitles";u.Tb=u.w.extend();u.Tb.prototype.A="chapters";
u.ac=u.b.extend({j:function(a,c,d){u.b.call(this,a,c,d);if(a.h.tracks&&0<a.h.tracks.length){c=this.c;a=a.h.tracks;var e;for(d=0;d<a.length;d++){e=a[d];var g=c,j=e.kind,k=e.label,r=e.language,n=e;e=g.ya=g.ya||[];n=n||{};n.kind=j;n.label=k;n.language=r;j=u.Z(j||"subtitles");g=new window.videojs[j+"Track"](g,n);e.push(g)}}}});u.ac.prototype.e=function(){return u.b.prototype.e.call(this,"div",{className:"vjs-text-track-display"})};
u.X=u.N.extend({j:function(a,c){var d=this.ca=c.track;c.label=d.label();c.selected=d.tb();u.N.call(this,a,c);this.c.d(d.H()+"trackchange",u.bind(this,this.update))}});u.X.prototype.p=function(){u.N.prototype.p.call(this);X(this.c,this.ca.R,this.ca.H())};u.X.prototype.update=function(){this.selected(2==this.ca.mode())};u.eb=u.X.extend({j:function(a,c){c.track={H:function(){return c.kind},C:a,label:function(){return c.kind+" off"},tb:q(l),mode:q(l)};u.X.call(this,a,c);this.selected(f)}});
u.eb.prototype.p=function(){u.X.prototype.p.call(this);X(this.c,this.ca.R,this.ca.H())};u.eb.prototype.update=function(){for(var a=this.c.textTracks(),c=0,d=a.length,e,g=f;c<d;c++)e=a[c],e.H()==this.ca.H()&&2==e.mode()&&(g=l);this.selected(g)};u.T=u.S.extend({j:function(a,c){u.S.call(this,a,c);1>=this.L.length&&this.D()}});
u.T.prototype.qa=function(){var a=[],c;a.push(new u.eb(this.c,{kind:this.A}));for(var d=0;d<this.c.textTracks().length;d++)c=this.c.textTracks()[d],c.H()===this.A&&a.push(new u.X(this.c,{track:c}));return a};u.Ba=u.T.extend({j:function(a,c,d){u.T.call(this,a,c,d);this.a.setAttribute("aria-label","Captions Menu")}});u.Ba.prototype.A="captions";u.Ba.prototype.oa="Captions";u.Ba.prototype.className="vjs-captions-button";
u.Ha=u.T.extend({j:function(a,c,d){u.T.call(this,a,c,d);this.a.setAttribute("aria-label","Subtitles Menu")}});u.Ha.prototype.A="subtitles";u.Ha.prototype.oa="Subtitles";u.Ha.prototype.className="vjs-subtitles-button";u.Ca=u.T.extend({j:function(a,c,d){u.T.call(this,a,c,d);this.a.setAttribute("aria-label","Chapters Menu")}});t=u.Ca.prototype;t.A="chapters";t.oa="Chapters";t.className="vjs-chapters-button";
t.qa=function(){for(var a=[],c,d=0;d<this.c.textTracks().length;d++)c=this.c.textTracks()[d],c.H()===this.A&&a.push(new u.X(this.c,{track:c}));return a};
t.Ma=function(){for(var a=this.c.textTracks(),c=0,d=a.length,e,g,j=this.L=[];c<d;c++)if(e=a[c],e.H()==this.A&&e.tb()){if(2>e.readyState()){this.Nd=e;e.d("loaded",u.bind(this,this.Ma));return}g=e;break}a=this.ua=new u.la(this.c);a.a.appendChild(u.e("li",{className:"vjs-menu-title",innerHTML:u.Z(this.A),Cd:-1}));if(g){e=g.$;for(var k,c=0,d=e.length;c<d;c++)k=e[c],k=new u.Za(this.c,{track:g,cue:k}),j.push(k),a.Y(k)}0<this.L.length&&this.show();return a};
u.Za=u.N.extend({j:function(a,c){var d=this.ca=c.track,e=this.cue=c.cue,g=a.currentTime();c.label=e.text;c.selected=e.startTime<=g&&g<e.sa;u.N.call(this,a,c);d.d("cuechange",u.bind(this,this.update))}});u.Za.prototype.p=function(){u.N.prototype.p.call(this);this.c.currentTime(this.cue.startTime);this.update(this.cue.startTime)};u.Za.prototype.update=function(){var a=this.cue,c=this.c.currentTime();this.selected(a.startTime<=c&&c<a.sa)};
u.l.B(u.Da.prototype.h.children,{subtitlesButton:{},captionsButton:{},chaptersButton:{}});
if("undefined"!==typeof window.JSON&&"function"===window.JSON.parse)u.JSON=window.JSON;else{u.JSON={};var Z=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;u.JSON.parse=function(a,c){function d(a,e){var k,r,n=a[e];if(n&&"object"===typeof n)for(k in n)Object.prototype.hasOwnProperty.call(n,k)&&(r=d(n,k),r!==b?n[k]=r:delete n[k]);return c.call(a,e,n)}var e;a=String(a);Z.lastIndex=0;Z.test(a)&&(a=a.replace(Z,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));
if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return e=eval("("+a+")"),"function"===typeof c?d({"":e},""):e;throw new SyntaxError("JSON.parse(): invalid or malformed JSON data");}}
u.dc=function(){var a,c,d=document.getElementsByTagName("video");if(d&&0<d.length)for(var e=0,g=d.length;e<g;e++)if((c=d[e])&&c.getAttribute)c.player===b&&(a=c.getAttribute("data-setup"),a!==h&&(a=u.JSON.parse(a||"{}"),videojs(c,a)));else{u.lb();break}else u.Ec||u.lb()};u.lb=function(){setTimeout(u.dc,1)};"complete"===document.readyState?u.Ec=f:u.U(window,"load",function(){u.Ec=f});u.lb();u.sd=function(a,c){u.Player.prototype[a]=c};var ja=this;ja.Id=f;function $(a,c){var d=a.split("."),e=ja;!(d[0]in e)&&e.execScript&&e.execScript("var "+d[0]);for(var g;d.length&&(g=d.shift());)!d.length&&c!==b?e[g]=c:e=e[g]?e[g]:e[g]={}};$("videojs",u);$("_V_",u);$("videojs.options",u.options);$("videojs.players",u.va);$("videojs.TOUCH_ENABLED",u.$b);$("videojs.cache",u.pa);$("videojs.Component",u.b);u.b.prototype.player=u.b.prototype.C;u.b.prototype.options=u.b.prototype.options;u.b.prototype.init=u.b.prototype.j;u.b.prototype.dispose=u.b.prototype.dispose;u.b.prototype.createEl=u.b.prototype.e;u.b.prototype.contentEl=u.b.prototype.La;u.b.prototype.el=u.b.prototype.u;u.b.prototype.addChild=u.b.prototype.Y;
u.b.prototype.getChild=u.b.prototype.fa;u.b.prototype.getChildById=u.b.prototype.ed;u.b.prototype.children=u.b.prototype.children;u.b.prototype.initChildren=u.b.prototype.nc;u.b.prototype.removeChild=u.b.prototype.removeChild;u.b.prototype.on=u.b.prototype.d;u.b.prototype.off=u.b.prototype.o;u.b.prototype.one=u.b.prototype.U;u.b.prototype.trigger=u.b.prototype.k;u.b.prototype.triggerReady=u.b.prototype.za;u.b.prototype.show=u.b.prototype.show;u.b.prototype.hide=u.b.prototype.D;
u.b.prototype.width=u.b.prototype.width;u.b.prototype.height=u.b.prototype.height;u.b.prototype.dimensions=u.b.prototype.Yc;u.b.prototype.ready=u.b.prototype.I;u.b.prototype.addClass=u.b.prototype.n;u.b.prototype.removeClass=u.b.prototype.t;u.b.prototype.buildCSSClass=u.b.prototype.Q;u.Player.prototype.ended=u.Player.prototype.ended;$("videojs.MediaLoader",u.Nc);$("videojs.TextTrackDisplay",u.ac);$("videojs.ControlBar",u.Da);$("videojs.Button",u.q);$("videojs.PlayToggle",u.Xb);
$("videojs.FullscreenToggle",u.Ea);$("videojs.BigPlayButton",u.Ya);$("videojs.LoadingSpinner",u.Vb);$("videojs.CurrentTimeDisplay",u.$a);$("videojs.DurationDisplay",u.ab);$("videojs.TimeDivider",u.bc);$("videojs.RemainingTimeDisplay",u.gb);$("videojs.Slider",u.O);$("videojs.ProgressControl",u.fb);$("videojs.SeekBar",u.Yb);$("videojs.LoadProgressBar",u.cb);$("videojs.PlayProgressBar",u.Wb);$("videojs.SeekHandle",u.Ga);$("videojs.VolumeControl",u.ib);$("videojs.VolumeBar",u.hb);
$("videojs.VolumeLevel",u.cc);$("videojs.VolumeMenuButton",u.ma);$("videojs.VolumeHandle",u.jb);$("videojs.MuteToggle",u.ea);$("videojs.PosterImage",u.Fa);$("videojs.Menu",u.la);$("videojs.MenuItem",u.N);$("videojs.MenuButton",u.S);u.S.prototype.createItems=u.S.prototype.qa;u.T.prototype.createItems=u.T.prototype.qa;u.Ca.prototype.createItems=u.Ca.prototype.qa;$("videojs.SubtitlesButton",u.Ha);$("videojs.CaptionsButton",u.Ba);$("videojs.ChaptersButton",u.Ca);$("videojs.MediaTechController",u.r);
u.r.prototype.features=u.r.prototype.m;u.r.prototype.m.volumeControl=u.r.prototype.m.Dc;u.r.prototype.m.fullscreenResize=u.r.prototype.m.Od;u.r.prototype.m.progressEvents=u.r.prototype.m.Sd;u.r.prototype.m.timeupdateEvents=u.r.prototype.m.Vd;u.r.prototype.setPoster=u.r.prototype.Lb;$("videojs.Html5",u.g);u.g.Events=u.g.bb;u.g.isSupported=u.g.isSupported;u.g.canPlaySource=u.g.nb;u.g.patchCanPlayType=u.g.rc;u.g.unpatchCanPlayType=u.g.Fd;u.g.prototype.setCurrentTime=u.g.prototype.vd;
u.g.prototype.setVolume=u.g.prototype.Ad;u.g.prototype.setMuted=u.g.prototype.yd;u.g.prototype.setPreload=u.g.prototype.zd;u.g.prototype.setAutoplay=u.g.prototype.ud;u.g.prototype.setLoop=u.g.prototype.xd;u.g.prototype.enterFullScreen=u.g.prototype.hc;u.g.prototype.exitFullScreen=u.g.prototype.bd;$("videojs.Flash",u.f);u.f.isSupported=u.f.isSupported;u.f.canPlaySource=u.f.nb;u.f.onReady=u.f.onReady;$("videojs.TextTrack",u.w);u.w.prototype.label=u.w.prototype.label;u.w.prototype.kind=u.w.prototype.H;
u.w.prototype.mode=u.w.prototype.mode;u.w.prototype.cues=u.w.prototype.Vc;u.w.prototype.activeCues=u.w.prototype.Pc;$("videojs.CaptionsTrack",u.Sb);$("videojs.SubtitlesTrack",u.Zb);$("videojs.ChaptersTrack",u.Tb);$("videojs.autoSetup",u.dc);$("videojs.plugin",u.sd);$("videojs.createTimeRange",u.sb);$("videojs.util",u.ja);u.ja.mergeOptions=u.ja.Eb;})();

},{}],168:[function(require,module,exports){
module.exports = require('./lib/React');

},{"./lib/React":41}],41:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule React
 */

/* globals __REACT_DEVTOOLS_GLOBAL_HOOK__*/

'use strict';

var EventPluginUtils = require("./EventPluginUtils");
var ReactChildren = require("./ReactChildren");
var ReactComponent = require("./ReactComponent");
var ReactClass = require("./ReactClass");
var ReactContext = require("./ReactContext");
var ReactCurrentOwner = require("./ReactCurrentOwner");
var ReactElement = require("./ReactElement");
var ReactElementValidator = require("./ReactElementValidator");
var ReactDOM = require("./ReactDOM");
var ReactDOMTextComponent = require("./ReactDOMTextComponent");
var ReactDefaultInjection = require("./ReactDefaultInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");
var ReactPropTypes = require("./ReactPropTypes");
var ReactReconciler = require("./ReactReconciler");
var ReactServerRendering = require("./ReactServerRendering");

var assign = require("./Object.assign");
var findDOMNode = require("./findDOMNode");
var onlyChild = require("./onlyChild");

ReactDefaultInjection.inject();

var createElement = ReactElement.createElement;
var createFactory = ReactElement.createFactory;
var cloneElement = ReactElement.cloneElement;

if ("production" !== process.env.NODE_ENV) {
  createElement = ReactElementValidator.createElement;
  createFactory = ReactElementValidator.createFactory;
  cloneElement = ReactElementValidator.cloneElement;
}

var render = ReactPerf.measure('React', 'render', ReactMount.render);

var React = {
  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    only: onlyChild
  },
  Component: ReactComponent,
  DOM: ReactDOM,
  PropTypes: ReactPropTypes,
  initializeTouchEvents: function(shouldUseTouch) {
    EventPluginUtils.useTouchEvents = shouldUseTouch;
  },
  createClass: ReactClass.createClass,
  createElement: createElement,
  cloneElement: cloneElement,
  createFactory: createFactory,
  createMixin: function(mixin) {
    // Currently a noop. Will be used to validate and trace mixins.
    return mixin;
  },
  constructAndRenderComponent: ReactMount.constructAndRenderComponent,
  constructAndRenderComponentByID: ReactMount.constructAndRenderComponentByID,
  findDOMNode: findDOMNode,
  render: render,
  renderToString: ReactServerRendering.renderToString,
  renderToStaticMarkup: ReactServerRendering.renderToStaticMarkup,
  unmountComponentAtNode: ReactMount.unmountComponentAtNode,
  isValidElement: ReactElement.isValidElement,
  withContext: ReactContext.withContext,

  // Hook for JSX spread, don't use this for anything else.
  __spread: assign
};

// Inject the runtime into a devtools global hook regardless of browser.
// Allows for debugging when the hook is injected on the page.
if (
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject === 'function') {
  __REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
    CurrentOwner: ReactCurrentOwner,
    InstanceHandles: ReactInstanceHandles,
    Mount: ReactMount,
    Reconciler: ReactReconciler,
    TextComponent: ReactDOMTextComponent
  });
}

if ("production" !== process.env.NODE_ENV) {
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  if (ExecutionEnvironment.canUseDOM && window.top === window.self) {

    // If we're in Chrome, look for the devtools marker and provide a download
    // link if not installed.
    if (navigator.userAgent.indexOf('Chrome') > -1) {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
        console.debug(
          'Download the React DevTools for a better development experience: ' +
          'https://fb.me/react-devtools'
        );
      }
    }

    var expectedFeatures = [
      // shims
      Array.isArray,
      Array.prototype.every,
      Array.prototype.forEach,
      Array.prototype.indexOf,
      Array.prototype.map,
      Date.now,
      Function.prototype.bind,
      Object.keys,
      String.prototype.split,
      String.prototype.trim,

      // shams
      Object.create,
      Object.freeze
    ];

    for (var i = 0; i < expectedFeatures.length; i++) {
      if (!expectedFeatures[i]) {
        console.error(
          'One or more ES5 shim/shams expected by React are not available: ' +
          'https://fb.me/react-warning-polyfills'
        );
        break;
      }
    }
  }
}

React.version = '0.13.3';

module.exports = React;

}).call(this,require('_process'))

},{"./EventPluginUtils":31,"./ExecutionEnvironment":33,"./Object.assign":39,"./ReactChildren":45,"./ReactClass":46,"./ReactComponent":47,"./ReactContext":51,"./ReactCurrentOwner":52,"./ReactDOM":53,"./ReactDOMTextComponent":64,"./ReactDefaultInjection":67,"./ReactElement":70,"./ReactElementValidator":71,"./ReactInstanceHandles":79,"./ReactMount":83,"./ReactPerf":88,"./ReactPropTypes":91,"./ReactReconciler":94,"./ReactServerRendering":97,"./findDOMNode":130,"./onlyChild":157,"_process":2}],157:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule onlyChild
 */
'use strict';

var ReactElement = require("./ReactElement");

var invariant = require("./invariant");

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection. The current implementation of this
 * function assumes that a single child gets passed without a wrapper, but the
 * purpose of this helper function is to abstract away the particular structure
 * of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactComponent} The first and only `ReactComponent` contained in the
 * structure.
 */
function onlyChild(children) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactElement.isValidElement(children),
    'onlyChild must be passed a children with exactly one child.'
  ) : invariant(ReactElement.isValidElement(children)));
  return children;
}

module.exports = onlyChild;

}).call(this,require('_process'))

},{"./ReactElement":70,"./invariant":148,"_process":2}],97:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks static-only
 * @providesModule ReactServerRendering
 */
'use strict';

var ReactElement = require("./ReactElement");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMarkupChecksum = require("./ReactMarkupChecksum");
var ReactServerRenderingTransaction =
  require("./ReactServerRenderingTransaction");

var emptyObject = require("./emptyObject");
var instantiateReactComponent = require("./instantiateReactComponent");
var invariant = require("./invariant");

/**
 * @param {ReactElement} element
 * @return {string} the HTML markup
 */
function renderToString(element) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactElement.isValidElement(element),
    'renderToString(): You must pass a valid ReactElement.'
  ) : invariant(ReactElement.isValidElement(element)));

  var transaction;
  try {
    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(false);

    return transaction.perform(function() {
      var componentInstance = instantiateReactComponent(element, null);
      var markup =
        componentInstance.mountComponent(id, transaction, emptyObject);
      return ReactMarkupChecksum.addChecksumToMarkup(markup);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
  }
}

/**
 * @param {ReactElement} element
 * @return {string} the HTML markup, without the extra React ID and checksum
 * (for generating static pages)
 */
function renderToStaticMarkup(element) {
  ("production" !== process.env.NODE_ENV ? invariant(
    ReactElement.isValidElement(element),
    'renderToStaticMarkup(): You must pass a valid ReactElement.'
  ) : invariant(ReactElement.isValidElement(element)));

  var transaction;
  try {
    var id = ReactInstanceHandles.createReactRootID();
    transaction = ReactServerRenderingTransaction.getPooled(true);

    return transaction.perform(function() {
      var componentInstance = instantiateReactComponent(element, null);
      return componentInstance.mountComponent(id, transaction, emptyObject);
    }, null);
  } finally {
    ReactServerRenderingTransaction.release(transaction);
  }
}

module.exports = {
  renderToString: renderToString,
  renderToStaticMarkup: renderToStaticMarkup
};

}).call(this,require('_process'))

},{"./ReactElement":70,"./ReactInstanceHandles":79,"./ReactMarkupChecksum":82,"./ReactServerRenderingTransaction":98,"./emptyObject":128,"./instantiateReactComponent":147,"./invariant":148,"_process":2}],98:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactServerRenderingTransaction
 * @typechecks
 */

'use strict';

var PooledClass = require("./PooledClass");
var CallbackQueue = require("./CallbackQueue");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");

var assign = require("./Object.assign");
var emptyFunction = require("./emptyFunction");

/**
 * Provides a `CallbackQueue` queue for collecting `onDOMReady` callbacks
 * during the performing of the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  close: emptyFunction
};

var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },

  close: emptyFunction
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  PUT_LISTENER_QUEUEING,
  ON_DOM_READY_QUEUEING
];

/**
 * @class ReactServerRenderingTransaction
 * @param {boolean} renderToStaticMarkup
 */
function ReactServerRenderingTransaction(renderToStaticMarkup) {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = renderToStaticMarkup;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array} Empty list of operation wrap proceedures.
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;

    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};


assign(
  ReactServerRenderingTransaction.prototype,
  Transaction.Mixin,
  Mixin
);

PooledClass.addPoolingTo(ReactServerRenderingTransaction);

module.exports = ReactServerRenderingTransaction;

},{"./CallbackQueue":18,"./Object.assign":39,"./PooledClass":40,"./ReactPutListenerQueue":92,"./Transaction":116,"./emptyFunction":127}],67:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultInjection
 */

'use strict';

var BeforeInputEventPlugin = require("./BeforeInputEventPlugin");
var ChangeEventPlugin = require("./ChangeEventPlugin");
var ClientReactRootIndex = require("./ClientReactRootIndex");
var DefaultEventPluginOrder = require("./DefaultEventPluginOrder");
var EnterLeaveEventPlugin = require("./EnterLeaveEventPlugin");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var HTMLDOMPropertyConfig = require("./HTMLDOMPropertyConfig");
var MobileSafariClickEventPlugin = require("./MobileSafariClickEventPlugin");
var ReactBrowserComponentMixin = require("./ReactBrowserComponentMixin");
var ReactClass = require("./ReactClass");
var ReactComponentBrowserEnvironment =
  require("./ReactComponentBrowserEnvironment");
var ReactDefaultBatchingStrategy = require("./ReactDefaultBatchingStrategy");
var ReactDOMComponent = require("./ReactDOMComponent");
var ReactDOMButton = require("./ReactDOMButton");
var ReactDOMForm = require("./ReactDOMForm");
var ReactDOMImg = require("./ReactDOMImg");
var ReactDOMIDOperations = require("./ReactDOMIDOperations");
var ReactDOMIframe = require("./ReactDOMIframe");
var ReactDOMInput = require("./ReactDOMInput");
var ReactDOMOption = require("./ReactDOMOption");
var ReactDOMSelect = require("./ReactDOMSelect");
var ReactDOMTextarea = require("./ReactDOMTextarea");
var ReactDOMTextComponent = require("./ReactDOMTextComponent");
var ReactElement = require("./ReactElement");
var ReactEventListener = require("./ReactEventListener");
var ReactInjection = require("./ReactInjection");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactReconcileTransaction = require("./ReactReconcileTransaction");
var SelectEventPlugin = require("./SelectEventPlugin");
var ServerReactRootIndex = require("./ServerReactRootIndex");
var SimpleEventPlugin = require("./SimpleEventPlugin");
var SVGDOMPropertyConfig = require("./SVGDOMPropertyConfig");

var createFullPageComponent = require("./createFullPageComponent");

function autoGenerateWrapperClass(type) {
  return ReactClass.createClass({
    tagName: type.toUpperCase(),
    render: function() {
      return new ReactElement(
        type,
        null,
        null,
        null,
        null,
        this.props
      );
    }
  });
}

function inject() {
  ReactInjection.EventEmitter.injectReactEventListener(
    ReactEventListener
  );

  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */
  ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
  ReactInjection.EventPluginHub.injectInstanceHandle(ReactInstanceHandles);
  ReactInjection.EventPluginHub.injectMount(ReactMount);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
  ReactInjection.EventPluginHub.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    MobileSafariClickEventPlugin: MobileSafariClickEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin
  });

  ReactInjection.NativeComponent.injectGenericComponentClass(
    ReactDOMComponent
  );

  ReactInjection.NativeComponent.injectTextComponentClass(
    ReactDOMTextComponent
  );

  ReactInjection.NativeComponent.injectAutoWrapper(
    autoGenerateWrapperClass
  );

  // This needs to happen before createFullPageComponent() otherwise the mixin
  // won't be included.
  ReactInjection.Class.injectMixin(ReactBrowserComponentMixin);

  ReactInjection.NativeComponent.injectComponentClasses({
    'button': ReactDOMButton,
    'form': ReactDOMForm,
    'iframe': ReactDOMIframe,
    'img': ReactDOMImg,
    'input': ReactDOMInput,
    'option': ReactDOMOption,
    'select': ReactDOMSelect,
    'textarea': ReactDOMTextarea,

    'html': createFullPageComponent('html'),
    'head': createFullPageComponent('head'),
    'body': createFullPageComponent('body')
  });

  ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
  ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

  ReactInjection.EmptyComponent.injectEmptyComponent('noscript');

  ReactInjection.Updates.injectReconcileTransaction(
    ReactReconcileTransaction
  );
  ReactInjection.Updates.injectBatchingStrategy(
    ReactDefaultBatchingStrategy
  );

  ReactInjection.RootIndex.injectCreateReactRootIndex(
    ExecutionEnvironment.canUseDOM ?
      ClientReactRootIndex.createReactRootIndex :
      ServerReactRootIndex.createReactRootIndex
  );

  ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);
  ReactInjection.DOMComponent.injectIDOperations(ReactDOMIDOperations);

  if ("production" !== process.env.NODE_ENV) {
    var url = (ExecutionEnvironment.canUseDOM && window.location.href) || '';
    if ((/[?&]react_perf\b/).test(url)) {
      var ReactDefaultPerf = require("./ReactDefaultPerf");
      ReactDefaultPerf.start();
    }
  }
}

module.exports = {
  inject: inject
};

}).call(this,require('_process'))

},{"./BeforeInputEventPlugin":15,"./ChangeEventPlugin":19,"./ClientReactRootIndex":20,"./DefaultEventPluginOrder":25,"./EnterLeaveEventPlugin":26,"./ExecutionEnvironment":33,"./HTMLDOMPropertyConfig":35,"./MobileSafariClickEventPlugin":38,"./ReactBrowserComponentMixin":42,"./ReactClass":46,"./ReactComponentBrowserEnvironment":48,"./ReactDOMButton":54,"./ReactDOMComponent":55,"./ReactDOMForm":56,"./ReactDOMIDOperations":57,"./ReactDOMIframe":58,"./ReactDOMImg":59,"./ReactDOMInput":60,"./ReactDOMOption":61,"./ReactDOMSelect":62,"./ReactDOMTextComponent":64,"./ReactDOMTextarea":65,"./ReactDefaultBatchingStrategy":66,"./ReactDefaultPerf":68,"./ReactElement":70,"./ReactEventListener":75,"./ReactInjection":77,"./ReactInstanceHandles":79,"./ReactMount":83,"./ReactReconcileTransaction":93,"./SVGDOMPropertyConfig":101,"./SelectEventPlugin":102,"./ServerReactRootIndex":103,"./SimpleEventPlugin":104,"./createFullPageComponent":124,"_process":2}],124:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule createFullPageComponent
 * @typechecks
 */

'use strict';

// Defeat circular references by requiring this directly.
var ReactClass = require("./ReactClass");
var ReactElement = require("./ReactElement");

var invariant = require("./invariant");

/**
 * Create a component that will throw an exception when unmounted.
 *
 * Components like <html> <head> and <body> can't be removed or added
 * easily in a cross-browser way, however it's valuable to be able to
 * take advantage of React's reconciliation for styling and <title>
 * management. So we just document it and throw in dangerous cases.
 *
 * @param {string} tag The tag to wrap
 * @return {function} convenience constructor of new component
 */
function createFullPageComponent(tag) {
  var elementFactory = ReactElement.createFactory(tag);

  var FullPageComponent = ReactClass.createClass({
    tagName: tag.toUpperCase(),
    displayName: 'ReactFullPageComponent' + tag,

    componentWillUnmount: function() {
      ("production" !== process.env.NODE_ENV ? invariant(
        false,
        '%s tried to unmount. Because of cross-browser quirks it is ' +
        'impossible to unmount some top-level components (eg <html>, <head>, ' +
        'and <body>) reliably and efficiently. To fix this, have a single ' +
        'top-level component that never unmounts render these elements.',
        this.constructor.displayName
      ) : invariant(false));
    },

    render: function() {
      return elementFactory(this.props);
    }
  });

  return FullPageComponent;
}

module.exports = createFullPageComponent;

}).call(this,require('_process'))

},{"./ReactClass":46,"./ReactElement":70,"./invariant":148,"_process":2}],104:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SimpleEventPlugin
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPluginUtils = require("./EventPluginUtils");
var EventPropagators = require("./EventPropagators");
var SyntheticClipboardEvent = require("./SyntheticClipboardEvent");
var SyntheticEvent = require("./SyntheticEvent");
var SyntheticFocusEvent = require("./SyntheticFocusEvent");
var SyntheticKeyboardEvent = require("./SyntheticKeyboardEvent");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var SyntheticDragEvent = require("./SyntheticDragEvent");
var SyntheticTouchEvent = require("./SyntheticTouchEvent");
var SyntheticUIEvent = require("./SyntheticUIEvent");
var SyntheticWheelEvent = require("./SyntheticWheelEvent");

var getEventCharCode = require("./getEventCharCode");

var invariant = require("./invariant");
var keyOf = require("./keyOf");
var warning = require("./warning");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  blur: {
    phasedRegistrationNames: {
      bubbled: keyOf({onBlur: true}),
      captured: keyOf({onBlurCapture: true})
    }
  },
  click: {
    phasedRegistrationNames: {
      bubbled: keyOf({onClick: true}),
      captured: keyOf({onClickCapture: true})
    }
  },
  contextMenu: {
    phasedRegistrationNames: {
      bubbled: keyOf({onContextMenu: true}),
      captured: keyOf({onContextMenuCapture: true})
    }
  },
  copy: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCopy: true}),
      captured: keyOf({onCopyCapture: true})
    }
  },
  cut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onCut: true}),
      captured: keyOf({onCutCapture: true})
    }
  },
  doubleClick: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDoubleClick: true}),
      captured: keyOf({onDoubleClickCapture: true})
    }
  },
  drag: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrag: true}),
      captured: keyOf({onDragCapture: true})
    }
  },
  dragEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnd: true}),
      captured: keyOf({onDragEndCapture: true})
    }
  },
  dragEnter: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragEnter: true}),
      captured: keyOf({onDragEnterCapture: true})
    }
  },
  dragExit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragExit: true}),
      captured: keyOf({onDragExitCapture: true})
    }
  },
  dragLeave: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragLeave: true}),
      captured: keyOf({onDragLeaveCapture: true})
    }
  },
  dragOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragOver: true}),
      captured: keyOf({onDragOverCapture: true})
    }
  },
  dragStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDragStart: true}),
      captured: keyOf({onDragStartCapture: true})
    }
  },
  drop: {
    phasedRegistrationNames: {
      bubbled: keyOf({onDrop: true}),
      captured: keyOf({onDropCapture: true})
    }
  },
  focus: {
    phasedRegistrationNames: {
      bubbled: keyOf({onFocus: true}),
      captured: keyOf({onFocusCapture: true})
    }
  },
  input: {
    phasedRegistrationNames: {
      bubbled: keyOf({onInput: true}),
      captured: keyOf({onInputCapture: true})
    }
  },
  keyDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyDown: true}),
      captured: keyOf({onKeyDownCapture: true})
    }
  },
  keyPress: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyPress: true}),
      captured: keyOf({onKeyPressCapture: true})
    }
  },
  keyUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onKeyUp: true}),
      captured: keyOf({onKeyUpCapture: true})
    }
  },
  load: {
    phasedRegistrationNames: {
      bubbled: keyOf({onLoad: true}),
      captured: keyOf({onLoadCapture: true})
    }
  },
  error: {
    phasedRegistrationNames: {
      bubbled: keyOf({onError: true}),
      captured: keyOf({onErrorCapture: true})
    }
  },
  // Note: We do not allow listening to mouseOver events. Instead, use the
  // onMouseEnter/onMouseLeave created by `EnterLeaveEventPlugin`.
  mouseDown: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseDown: true}),
      captured: keyOf({onMouseDownCapture: true})
    }
  },
  mouseMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseMove: true}),
      captured: keyOf({onMouseMoveCapture: true})
    }
  },
  mouseOut: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseOut: true}),
      captured: keyOf({onMouseOutCapture: true})
    }
  },
  mouseOver: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseOver: true}),
      captured: keyOf({onMouseOverCapture: true})
    }
  },
  mouseUp: {
    phasedRegistrationNames: {
      bubbled: keyOf({onMouseUp: true}),
      captured: keyOf({onMouseUpCapture: true})
    }
  },
  paste: {
    phasedRegistrationNames: {
      bubbled: keyOf({onPaste: true}),
      captured: keyOf({onPasteCapture: true})
    }
  },
  reset: {
    phasedRegistrationNames: {
      bubbled: keyOf({onReset: true}),
      captured: keyOf({onResetCapture: true})
    }
  },
  scroll: {
    phasedRegistrationNames: {
      bubbled: keyOf({onScroll: true}),
      captured: keyOf({onScrollCapture: true})
    }
  },
  submit: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSubmit: true}),
      captured: keyOf({onSubmitCapture: true})
    }
  },
  touchCancel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchCancel: true}),
      captured: keyOf({onTouchCancelCapture: true})
    }
  },
  touchEnd: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchEnd: true}),
      captured: keyOf({onTouchEndCapture: true})
    }
  },
  touchMove: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchMove: true}),
      captured: keyOf({onTouchMoveCapture: true})
    }
  },
  touchStart: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchStart: true}),
      captured: keyOf({onTouchStartCapture: true})
    }
  },
  wheel: {
    phasedRegistrationNames: {
      bubbled: keyOf({onWheel: true}),
      captured: keyOf({onWheelCapture: true})
    }
  }
};

var topLevelEventsToDispatchConfig = {
  topBlur:        eventTypes.blur,
  topClick:       eventTypes.click,
  topContextMenu: eventTypes.contextMenu,
  topCopy:        eventTypes.copy,
  topCut:         eventTypes.cut,
  topDoubleClick: eventTypes.doubleClick,
  topDrag:        eventTypes.drag,
  topDragEnd:     eventTypes.dragEnd,
  topDragEnter:   eventTypes.dragEnter,
  topDragExit:    eventTypes.dragExit,
  topDragLeave:   eventTypes.dragLeave,
  topDragOver:    eventTypes.dragOver,
  topDragStart:   eventTypes.dragStart,
  topDrop:        eventTypes.drop,
  topError:       eventTypes.error,
  topFocus:       eventTypes.focus,
  topInput:       eventTypes.input,
  topKeyDown:     eventTypes.keyDown,
  topKeyPress:    eventTypes.keyPress,
  topKeyUp:       eventTypes.keyUp,
  topLoad:        eventTypes.load,
  topMouseDown:   eventTypes.mouseDown,
  topMouseMove:   eventTypes.mouseMove,
  topMouseOut:    eventTypes.mouseOut,
  topMouseOver:   eventTypes.mouseOver,
  topMouseUp:     eventTypes.mouseUp,
  topPaste:       eventTypes.paste,
  topReset:       eventTypes.reset,
  topScroll:      eventTypes.scroll,
  topSubmit:      eventTypes.submit,
  topTouchCancel: eventTypes.touchCancel,
  topTouchEnd:    eventTypes.touchEnd,
  topTouchMove:   eventTypes.touchMove,
  topTouchStart:  eventTypes.touchStart,
  topWheel:       eventTypes.wheel
};

for (var type in topLevelEventsToDispatchConfig) {
  topLevelEventsToDispatchConfig[type].dependencies = [type];
}

var SimpleEventPlugin = {

  eventTypes: eventTypes,

  /**
   * Same as the default implementation, except cancels the event when return
   * value is false. This behavior will be disabled in a future release.
   *
   * @param {object} Event to be dispatched.
   * @param {function} Application-level callback.
   * @param {string} domID DOM ID to pass to the callback.
   */
  executeDispatch: function(event, listener, domID) {
    var returnValue = EventPluginUtils.executeDispatch(event, listener, domID);

    ("production" !== process.env.NODE_ENV ? warning(
      typeof returnValue !== 'boolean',
      'Returning `false` from an event handler is deprecated and will be ' +
      'ignored in a future release. Instead, manually call ' +
      'e.stopPropagation() or e.preventDefault(), as appropriate.'
    ) : null);

    if (returnValue === false) {
      event.stopPropagation();
      event.preventDefault();
    }
  },

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor;
    switch (topLevelType) {
      case topLevelTypes.topInput:
      case topLevelTypes.topLoad:
      case topLevelTypes.topError:
      case topLevelTypes.topReset:
      case topLevelTypes.topSubmit:
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
        EventConstructor = SyntheticEvent;
        break;
      case topLevelTypes.topKeyPress:
        // FireFox creates a keypress event for function keys too. This removes
        // the unwanted keypress events. Enter is however both printable and
        // non-printable. One would expect Tab to be as well (but it isn't).
        if (getEventCharCode(nativeEvent) === 0) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case topLevelTypes.topBlur:
      case topLevelTypes.topFocus:
        EventConstructor = SyntheticFocusEvent;
        break;
      case topLevelTypes.topClick:
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
        /* falls through */
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topDoubleClick:
      case topLevelTypes.topMouseDown:
      case topLevelTypes.topMouseMove:
      case topLevelTypes.topMouseOut:
      case topLevelTypes.topMouseOver:
      case topLevelTypes.topMouseUp:
        EventConstructor = SyntheticMouseEvent;
        break;
      case topLevelTypes.topDrag:
      case topLevelTypes.topDragEnd:
      case topLevelTypes.topDragEnter:
      case topLevelTypes.topDragExit:
      case topLevelTypes.topDragLeave:
      case topLevelTypes.topDragOver:
      case topLevelTypes.topDragStart:
      case topLevelTypes.topDrop:
        EventConstructor = SyntheticDragEvent;
        break;
      case topLevelTypes.topTouchCancel:
      case topLevelTypes.topTouchEnd:
      case topLevelTypes.topTouchMove:
      case topLevelTypes.topTouchStart:
        EventConstructor = SyntheticTouchEvent;
        break;
      case topLevelTypes.topScroll:
        EventConstructor = SyntheticUIEvent;
        break;
      case topLevelTypes.topWheel:
        EventConstructor = SyntheticWheelEvent;
        break;
      case topLevelTypes.topCopy:
      case topLevelTypes.topCut:
      case topLevelTypes.topPaste:
        EventConstructor = SyntheticClipboardEvent;
        break;
    }
    ("production" !== process.env.NODE_ENV ? invariant(
      EventConstructor,
      'SimpleEventPlugin: Unhandled event type, `%s`.',
      topLevelType
    ) : invariant(EventConstructor));
    var event = EventConstructor.getPooled(
      dispatchConfig,
      topLevelTargetID,
      nativeEvent
    );
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }

};

module.exports = SimpleEventPlugin;

}).call(this,require('_process'))

},{"./EventConstants":27,"./EventPluginUtils":31,"./EventPropagators":32,"./SyntheticClipboardEvent":105,"./SyntheticDragEvent":107,"./SyntheticEvent":108,"./SyntheticFocusEvent":109,"./SyntheticKeyboardEvent":111,"./SyntheticMouseEvent":112,"./SyntheticTouchEvent":113,"./SyntheticUIEvent":114,"./SyntheticWheelEvent":115,"./getEventCharCode":135,"./invariant":148,"./keyOf":154,"./warning":167,"_process":2}],115:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticWheelEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface WheelEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var WheelEventInterface = {
  deltaX: function(event) {
    return (
      'deltaX' in event ? event.deltaX :
      // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
      'wheelDeltaX' in event ? -event.wheelDeltaX : 0
    );
  },
  deltaY: function(event) {
    return (
      'deltaY' in event ? event.deltaY :
      // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
      'wheelDeltaY' in event ? -event.wheelDeltaY :
      // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
      'wheelDelta' in event ? -event.wheelDelta : 0
    );
  },
  deltaZ: null,

  // Browsers without "deltaMode" is reporting in raw wheel delta where one
  // notch on the scroll is always +/- 120, roughly equivalent to pixels.
  // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
  // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
  deltaMode: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);

module.exports = SyntheticWheelEvent;

},{"./SyntheticMouseEvent":112}],113:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticTouchEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventModifierState = require("./getEventModifierState");

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);

module.exports = SyntheticTouchEvent;

},{"./SyntheticUIEvent":114,"./getEventModifierState":137}],111:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticKeyboardEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require("./SyntheticUIEvent");

var getEventCharCode = require("./getEventCharCode");
var getEventKey = require("./getEventKey");
var getEventModifierState = require("./getEventModifierState");

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var KeyboardEventInterface = {
  key: getEventKey,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: getEventModifierState,
  // Legacy Interface
  charCode: function(event) {
    // `charCode` is the result of a KeyPress event and represents the value of
    // the actual printable character.

    // KeyPress is deprecated, but its replacement is not yet final and not
    // implemented in any major browser. Only KeyPress has charCode.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    return 0;
  },
  keyCode: function(event) {
    // `keyCode` is the result of a KeyDown/Up event and represents the value of
    // physical keyboard key.

    // The actual meaning of the value depends on the users' keyboard layout
    // which cannot be detected. Assuming that it is a US keyboard layout
    // provides a surprisingly accurate mapping for US and European users.
    // Due to this, it is left to the user to implement at this time.
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
  which: function(event) {
    // `which` is an alias for either `keyCode` or `charCode` depending on the
    // type of the event.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

module.exports = SyntheticKeyboardEvent;

},{"./SyntheticUIEvent":114,"./getEventCharCode":135,"./getEventKey":136,"./getEventModifierState":137}],136:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventKey
 * @typechecks static-only
 */

'use strict';

var getEventCharCode = require("./getEventCharCode");

/**
 * Normalization of deprecated HTML5 `key` values
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var normalizeKey = {
  'Esc': 'Escape',
  'Spacebar': ' ',
  'Left': 'ArrowLeft',
  'Up': 'ArrowUp',
  'Right': 'ArrowRight',
  'Down': 'ArrowDown',
  'Del': 'Delete',
  'Win': 'OS',
  'Menu': 'ContextMenu',
  'Apps': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'MozPrintableKey': 'Unidentified'
};

/**
 * Translation from legacy `keyCode` to HTML5 `key`
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var translateToKey = {
  8: 'Backspace',
  9: 'Tab',
  12: 'Clear',
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  19: 'Pause',
  20: 'CapsLock',
  27: 'Escape',
  32: ' ',
  33: 'PageUp',
  34: 'PageDown',
  35: 'End',
  36: 'Home',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  45: 'Insert',
  46: 'Delete',
  112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
  118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
  144: 'NumLock',
  145: 'ScrollLock',
  224: 'Meta'
};

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
function getEventKey(nativeEvent) {
  if (nativeEvent.key) {
    // Normalize inconsistent values reported by browsers due to
    // implementations of a working draft specification.

    // FireFox implements `key` but returns `MozPrintableKey` for all
    // printable characters (normalized to `Unidentified`), ignore it.
    var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
    if (key !== 'Unidentified') {
      return key;
    }
  }

  // Browser does not implement `key`, polyfill as much of it as we can.
  if (nativeEvent.type === 'keypress') {
    var charCode = getEventCharCode(nativeEvent);

    // The enter-key is technically both printable and non-printable and can
    // thus be captured by `keypress`, no other non-printable key should.
    return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
  }
  if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
    // While user keyboard layout determines the actual meaning of each
    // `keyCode` value, almost all function keys have a universal value.
    return translateToKey[nativeEvent.keyCode] || 'Unidentified';
  }
  return '';
}

module.exports = getEventKey;

},{"./getEventCharCode":135}],135:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEventCharCode
 * @typechecks static-only
 */

'use strict';

/**
 * `charCode` represents the actual "character code" and is safe to use with
 * `String.fromCharCode`. As such, only keys that correspond to printable
 * characters produce a valid `charCode`, the only exception to this is Enter.
 * The Tab-key is considered non-printable and does not have a `charCode`,
 * presumably because it does not produce a tab-character in browsers.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `charCode` property.
 */
function getEventCharCode(nativeEvent) {
  var charCode;
  var keyCode = nativeEvent.keyCode;

  if ('charCode' in nativeEvent) {
    charCode = nativeEvent.charCode;

    // FF does not set `charCode` for the Enter-key, check against `keyCode`.
    if (charCode === 0 && keyCode === 13) {
      charCode = 13;
    }
  } else {
    // IE8 does not implement `charCode`, but `keyCode` has the correct value.
    charCode = keyCode;
  }

  // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
  // Must not discard the (non-)printable Enter-key.
  if (charCode >= 32 || charCode === 13) {
    return charCode;
  }

  return 0;
}

module.exports = getEventCharCode;

},{}],109:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticFocusEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticUIEvent = require("./SyntheticUIEvent");

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var FocusEventInterface = {
  relatedTarget: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);

module.exports = SyntheticFocusEvent;

},{"./SyntheticUIEvent":114}],107:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticDragEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface DragEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var DragEventInterface = {
  dataTransfer: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);

module.exports = SyntheticDragEvent;

},{"./SyntheticMouseEvent":112}],105:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SyntheticClipboardEvent
 * @typechecks static-only
 */

'use strict';

var SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/clipboard-apis/
 */
var ClipboardEventInterface = {
  clipboardData: function(event) {
    return (
      'clipboardData' in event ?
        event.clipboardData :
        window.clipboardData
    );
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent);
}

SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);

module.exports = SyntheticClipboardEvent;

},{"./SyntheticEvent":108}],103:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ServerReactRootIndex
 * @typechecks
 */

'use strict';

/**
 * Size of the reactRoot ID space. We generate random numbers for React root
 * IDs and if there's a collision the events and DOM update system will
 * get confused. In the future we need a way to generate GUIDs but for
 * now this will work on a smaller scale.
 */
var GLOBAL_MOUNT_POINT_MAX = Math.pow(2, 53);

var ServerReactRootIndex = {
  createReactRootIndex: function() {
    return Math.ceil(Math.random() * GLOBAL_MOUNT_POINT_MAX);
  }
};

module.exports = ServerReactRootIndex;

},{}],102:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SelectEventPlugin
 */

'use strict';

var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticEvent = require("./SyntheticEvent");

var getActiveElement = require("./getActiveElement");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("./keyOf");
var shallowEqual = require("./shallowEqual");

var topLevelTypes = EventConstants.topLevelTypes;

var eventTypes = {
  select: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSelect: null}),
      captured: keyOf({onSelectCapture: null})
    },
    dependencies: [
      topLevelTypes.topBlur,
      topLevelTypes.topContextMenu,
      topLevelTypes.topFocus,
      topLevelTypes.topKeyDown,
      topLevelTypes.topMouseDown,
      topLevelTypes.topMouseUp,
      topLevelTypes.topSelectionChange
    ]
  }
};

var activeElement = null;
var activeElementID = null;
var lastSelection = null;
var mouseDown = false;

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @param {object}
 */
function getSelection(node) {
  if ('selectionStart' in node &&
      ReactInputSelection.hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd
    };
  } else if (window.getSelection) {
    var selection = window.getSelection();
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset
    };
  } else if (document.selection) {
    var range = document.selection.createRange();
    return {
      parentElement: range.parentElement(),
      text: range.text,
      top: range.boundingTop,
      left: range.boundingLeft
    };
  }
}

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
function constructSelectEvent(nativeEvent) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior). In HTML5, select
  // fires only on input and textarea thus if there's no focused element we
  // won't dispatch.
  if (mouseDown ||
      activeElement == null ||
      activeElement !== getActiveElement()) {
    return null;
  }

  // Only fire when selection has actually changed.
  var currentSelection = getSelection(activeElement);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    var syntheticEvent = SyntheticEvent.getPooled(
      eventTypes.select,
      activeElementID,
      nativeEvent
    );

    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement;

    EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);

    return syntheticEvent;
  }
}

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
var SelectEventPlugin = {

  eventTypes: eventTypes,

  /**
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {DOMEventTarget} topLevelTarget The listening component root node.
   * @param {string} topLevelTargetID ID of `topLevelTarget`.
   * @param {object} nativeEvent Native browser event.
   * @return {*} An accumulation of synthetic events.
   * @see {EventPluginHub.extractEvents}
   */
  extractEvents: function(
      topLevelType,
      topLevelTarget,
      topLevelTargetID,
      nativeEvent) {

    switch (topLevelType) {
      // Track the input node that has focus.
      case topLevelTypes.topFocus:
        if (isTextInputElement(topLevelTarget) ||
            topLevelTarget.contentEditable === 'true') {
          activeElement = topLevelTarget;
          activeElementID = topLevelTargetID;
          lastSelection = null;
        }
        break;
      case topLevelTypes.topBlur:
        activeElement = null;
        activeElementID = null;
        lastSelection = null;
        break;

      // Don't fire the event while the user is dragging. This matches the
      // semantics of the native select event.
      case topLevelTypes.topMouseDown:
        mouseDown = true;
        break;
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topMouseUp:
        mouseDown = false;
        return constructSelectEvent(nativeEvent);

      // Chrome and IE fire non-standard event when selection is changed (and
      // sometimes when it hasn't).
      // Firefox doesn't support selectionchange, so check selection status
      // after each key entry. The selection changes after keydown and before
      // keyup, but we check on keydown as well in the case of holding down a
      // key, when multiple keydown events are fired but only one keyup is.
      case topLevelTypes.topSelectionChange:
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        return constructSelectEvent(nativeEvent);
    }
  }
};

module.exports = SelectEventPlugin;

},{"./EventConstants":27,"./EventPropagators":32,"./ReactInputSelection":78,"./SyntheticEvent":108,"./getActiveElement":134,"./isTextInputElement":151,"./keyOf":154,"./shallowEqual":163}],163:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule shallowEqual
 */

'use strict';

/**
 * Performs equality by iterating through keys on an object and returning
 * false when any key has values which are not strictly equal between
 * objA and objB. Returns true when the values of all keys are strictly equal.
 *
 * @return {boolean}
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

module.exports = shallowEqual;

},{}],101:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SVGDOMPropertyConfig
 */

/*jslint bitwise: true*/

'use strict';

var DOMProperty = require("./DOMProperty");

var MUST_USE_ATTRIBUTE = DOMProperty.injection.MUST_USE_ATTRIBUTE;

var SVGDOMPropertyConfig = {
  Properties: {
    clipPath: MUST_USE_ATTRIBUTE,
    cx: MUST_USE_ATTRIBUTE,
    cy: MUST_USE_ATTRIBUTE,
    d: MUST_USE_ATTRIBUTE,
    dx: MUST_USE_ATTRIBUTE,
    dy: MUST_USE_ATTRIBUTE,
    fill: MUST_USE_ATTRIBUTE,
    fillOpacity: MUST_USE_ATTRIBUTE,
    fontFamily: MUST_USE_ATTRIBUTE,
    fontSize: MUST_USE_ATTRIBUTE,
    fx: MUST_USE_ATTRIBUTE,
    fy: MUST_USE_ATTRIBUTE,
    gradientTransform: MUST_USE_ATTRIBUTE,
    gradientUnits: MUST_USE_ATTRIBUTE,
    markerEnd: MUST_USE_ATTRIBUTE,
    markerMid: MUST_USE_ATTRIBUTE,
    markerStart: MUST_USE_ATTRIBUTE,
    offset: MUST_USE_ATTRIBUTE,
    opacity: MUST_USE_ATTRIBUTE,
    patternContentUnits: MUST_USE_ATTRIBUTE,
    patternUnits: MUST_USE_ATTRIBUTE,
    points: MUST_USE_ATTRIBUTE,
    preserveAspectRatio: MUST_USE_ATTRIBUTE,
    r: MUST_USE_ATTRIBUTE,
    rx: MUST_USE_ATTRIBUTE,
    ry: MUST_USE_ATTRIBUTE,
    spreadMethod: MUST_USE_ATTRIBUTE,
    stopColor: MUST_USE_ATTRIBUTE,
    stopOpacity: MUST_USE_ATTRIBUTE,
    stroke: MUST_USE_ATTRIBUTE,
    strokeDasharray: MUST_USE_ATTRIBUTE,
    strokeLinecap: MUST_USE_ATTRIBUTE,
    strokeOpacity: MUST_USE_ATTRIBUTE,
    strokeWidth: MUST_USE_ATTRIBUTE,
    textAnchor: MUST_USE_ATTRIBUTE,
    transform: MUST_USE_ATTRIBUTE,
    version: MUST_USE_ATTRIBUTE,
    viewBox: MUST_USE_ATTRIBUTE,
    x1: MUST_USE_ATTRIBUTE,
    x2: MUST_USE_ATTRIBUTE,
    x: MUST_USE_ATTRIBUTE,
    y1: MUST_USE_ATTRIBUTE,
    y2: MUST_USE_ATTRIBUTE,
    y: MUST_USE_ATTRIBUTE
  },
  DOMAttributeNames: {
    clipPath: 'clip-path',
    fillOpacity: 'fill-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    patternContentUnits: 'patternContentUnits',
    patternUnits: 'patternUnits',
    preserveAspectRatio: 'preserveAspectRatio',
    spreadMethod: 'spreadMethod',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strokeDasharray: 'stroke-dasharray',
    strokeLinecap: 'stroke-linecap',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    textAnchor: 'text-anchor',
    viewBox: 'viewBox'
  }
};

module.exports = SVGDOMPropertyConfig;

},{"./DOMProperty":22}],93:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactReconcileTransaction
 * @typechecks static-only
 */

'use strict';

var CallbackQueue = require("./CallbackQueue");
var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactInputSelection = require("./ReactInputSelection");
var ReactPutListenerQueue = require("./ReactPutListenerQueue");
var Transaction = require("./Transaction");

var assign = require("./Object.assign");

/**
 * Ensures that, when possible, the selection range (currently selected text
 * input) is not disturbed by performing the transaction.
 */
var SELECTION_RESTORATION = {
  /**
   * @return {Selection} Selection information.
   */
  initialize: ReactInputSelection.getSelectionInformation,
  /**
   * @param {Selection} sel Selection information returned from `initialize`.
   */
  close: ReactInputSelection.restoreSelection
};

/**
 * Suppresses events (blur/focus) that could be inadvertently dispatched due to
 * high level DOM manipulations (like temporarily removing a text input from the
 * DOM).
 */
var EVENT_SUPPRESSION = {
  /**
   * @return {boolean} The enabled status of `ReactBrowserEventEmitter` before
   * the reconciliation.
   */
  initialize: function() {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },

  /**
   * @param {boolean} previouslyEnabled Enabled status of
   *   `ReactBrowserEventEmitter` before the reconciliation occured. `close`
   *   restores the previous value.
   */
  close: function(previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  }
};

/**
 * Provides a queue for collecting `componentDidMount` and
 * `componentDidUpdate` callbacks during the the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  /**
   * After DOM is flushed, invoke all registered `onDOMReady` callbacks.
   */
  close: function() {
    this.reactMountReady.notifyAll();
  }
};

var PUT_LISTENER_QUEUEING = {
  initialize: function() {
    this.putListenerQueue.reset();
  },

  close: function() {
    this.putListenerQueue.putListeners();
  }
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  PUT_LISTENER_QUEUEING,
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING
];

/**
 * Currently:
 * - The order that these are listed in the transaction is critical:
 * - Suppresses events.
 * - Restores selection range.
 *
 * Future:
 * - Restore document/overflow scroll positions that were unintentionally
 *   modified via DOM insertions above the top viewport boundary.
 * - Implement/integrate with customized constraint based layout system and keep
 *   track of which dimensions must be remeasured.
 *
 * @class ReactReconcileTransaction
 */
function ReactReconcileTransaction() {
  this.reinitializeTransaction();
  // Only server-side rendering really needs this option (see
  // `ReactServerRendering`), but server-side uses
  // `ReactServerRenderingTransaction` instead. This option is here so that it's
  // accessible and defaults to false when `ReactDOMComponent` and
  // `ReactTextComponent` checks it in `mountComponent`.`
  this.renderToStaticMarkup = false;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.putListenerQueue = ReactPutListenerQueue.getPooled();
}

var Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array<object>} List of operation wrap proceedures.
   *   TODO: convert to array<TransactionWrapper>
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  getPutListenerQueue: function() {
    return this.putListenerQueue;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be resused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;

    ReactPutListenerQueue.release(this.putListenerQueue);
    this.putListenerQueue = null;
  }
};


assign(ReactReconcileTransaction.prototype, Transaction.Mixin, Mixin);

PooledClass.addPoolingTo(ReactReconcileTransaction);

module.exports = ReactReconcileTransaction;

},{"./CallbackQueue":18,"./Object.assign":39,"./PooledClass":40,"./ReactBrowserEventEmitter":43,"./ReactInputSelection":78,"./ReactPutListenerQueue":92,"./Transaction":116}],92:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactPutListenerQueue
 */

'use strict';

var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");

var assign = require("./Object.assign");

function ReactPutListenerQueue() {
  this.listenersToPut = [];
}

assign(ReactPutListenerQueue.prototype, {
  enqueuePutListener: function(rootNodeID, propKey, propValue) {
    this.listenersToPut.push({
      rootNodeID: rootNodeID,
      propKey: propKey,
      propValue: propValue
    });
  },

  putListeners: function() {
    for (var i = 0; i < this.listenersToPut.length; i++) {
      var listenerToPut = this.listenersToPut[i];
      ReactBrowserEventEmitter.putListener(
        listenerToPut.rootNodeID,
        listenerToPut.propKey,
        listenerToPut.propValue
      );
    }
  },

  reset: function() {
    this.listenersToPut.length = 0;
  },

  destructor: function() {
    this.reset();
  }
});

PooledClass.addPoolingTo(ReactPutListenerQueue);

module.exports = ReactPutListenerQueue;

},{"./Object.assign":39,"./PooledClass":40,"./ReactBrowserEventEmitter":43}],78:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInputSelection
 */

'use strict';

var ReactDOMSelection = require("./ReactDOMSelection");

var containsNode = require("./containsNode");
var focusNode = require("./focusNode");
var getActiveElement = require("./getActiveElement");

function isInDocument(node) {
  return containsNode(document.documentElement, node);
}

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */
var ReactInputSelection = {

  hasSelectionCapabilities: function(elem) {
    return elem && (
      ((elem.nodeName === 'INPUT' && elem.type === 'text') ||
      elem.nodeName === 'TEXTAREA' || elem.contentEditable === 'true')
    );
  },

  getSelectionInformation: function() {
    var focusedElem = getActiveElement();
    return {
      focusedElem: focusedElem,
      selectionRange:
          ReactInputSelection.hasSelectionCapabilities(focusedElem) ?
          ReactInputSelection.getSelection(focusedElem) :
          null
    };
  },

  /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */
  restoreSelection: function(priorSelectionInformation) {
    var curFocusedElem = getActiveElement();
    var priorFocusedElem = priorSelectionInformation.focusedElem;
    var priorSelectionRange = priorSelectionInformation.selectionRange;
    if (curFocusedElem !== priorFocusedElem &&
        isInDocument(priorFocusedElem)) {
      if (ReactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
        ReactInputSelection.setSelection(
          priorFocusedElem,
          priorSelectionRange
        );
      }
      focusNode(priorFocusedElem);
    }
  },

  /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */
  getSelection: function(input) {
    var selection;

    if ('selectionStart' in input) {
      // Modern browser with input or textarea.
      selection = {
        start: input.selectionStart,
        end: input.selectionEnd
      };
    } else if (document.selection && input.nodeName === 'INPUT') {
      // IE8 input.
      var range = document.selection.createRange();
      // There can only be one selection per document in IE, so it must
      // be in our element.
      if (range.parentElement() === input) {
        selection = {
          start: -range.moveStart('character', -input.value.length),
          end: -range.moveEnd('character', -input.value.length)
        };
      }
    } else {
      // Content editable or old IE textarea.
      selection = ReactDOMSelection.getOffsets(input);
    }

    return selection || {start: 0, end: 0};
  },

  /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */
  setSelection: function(input, offsets) {
    var start = offsets.start;
    var end = offsets.end;
    if (typeof end === 'undefined') {
      end = start;
    }

    if ('selectionStart' in input) {
      input.selectionStart = start;
      input.selectionEnd = Math.min(end, input.value.length);
    } else if (document.selection && input.nodeName === 'INPUT') {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    } else {
      ReactDOMSelection.setOffsets(input, offsets);
    }
  }
};

module.exports = ReactInputSelection;

},{"./ReactDOMSelection":63,"./containsNode":122,"./focusNode":132,"./getActiveElement":134}],134:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getActiveElement
 * @typechecks
 */

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document body is not yet defined.
 */
function getActiveElement() /*?DOMElement*/ {
  try {
    return document.activeElement || document.body;
  } catch (e) {
    return document.body;
  }
}

module.exports = getActiveElement;

},{}],63:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMSelection
 */

'use strict';

var ExecutionEnvironment = require("./ExecutionEnvironment");

var getNodeForCharacterOffset = require("./getNodeForCharacterOffset");
var getTextContentAccessor = require("./getTextContentAccessor");

/**
 * While `isCollapsed` is available on the Selection object and `collapsed`
 * is available on the Range object, IE11 sometimes gets them wrong.
 * If the anchor/focus nodes and offsets are the same, the range is collapsed.
 */
function isCollapsed(anchorNode, anchorOffset, focusNode, focusOffset) {
  return anchorNode === focusNode && anchorOffset === focusOffset;
}

/**
 * Get the appropriate anchor and focus node/offset pairs for IE.
 *
 * The catch here is that IE's selection API doesn't provide information
 * about whether the selection is forward or backward, so we have to
 * behave as though it's always forward.
 *
 * IE text differs from modern selection in that it behaves as though
 * block elements end with a new line. This means character offsets will
 * differ between the two APIs.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getIEOffsets(node) {
  var selection = document.selection;
  var selectedRange = selection.createRange();
  var selectedLength = selectedRange.text.length;

  // Duplicate selection so we can move range without breaking user selection.
  var fromStart = selectedRange.duplicate();
  fromStart.moveToElementText(node);
  fromStart.setEndPoint('EndToStart', selectedRange);

  var startOffset = fromStart.text.length;
  var endOffset = startOffset + selectedLength;

  return {
    start: startOffset,
    end: endOffset
  };
}

/**
 * @param {DOMElement} node
 * @return {?object}
 */
function getModernOffsets(node) {
  var selection = window.getSelection && window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  var anchorNode = selection.anchorNode;
  var anchorOffset = selection.anchorOffset;
  var focusNode = selection.focusNode;
  var focusOffset = selection.focusOffset;

  var currentRange = selection.getRangeAt(0);

  // If the node and offset values are the same, the selection is collapsed.
  // `Selection.isCollapsed` is available natively, but IE sometimes gets
  // this value wrong.
  var isSelectionCollapsed = isCollapsed(
    selection.anchorNode,
    selection.anchorOffset,
    selection.focusNode,
    selection.focusOffset
  );

  var rangeLength = isSelectionCollapsed ? 0 : currentRange.toString().length;

  var tempRange = currentRange.cloneRange();
  tempRange.selectNodeContents(node);
  tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);

  var isTempRangeCollapsed = isCollapsed(
    tempRange.startContainer,
    tempRange.startOffset,
    tempRange.endContainer,
    tempRange.endOffset
  );

  var start = isTempRangeCollapsed ? 0 : tempRange.toString().length;
  var end = start + rangeLength;

  // Detect whether the selection is backward.
  var detectionRange = document.createRange();
  detectionRange.setStart(anchorNode, anchorOffset);
  detectionRange.setEnd(focusNode, focusOffset);
  var isBackward = detectionRange.collapsed;

  return {
    start: isBackward ? end : start,
    end: isBackward ? start : end
  };
}

/**
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setIEOffsets(node, offsets) {
  var range = document.selection.createRange().duplicate();
  var start, end;

  if (typeof offsets.end === 'undefined') {
    start = offsets.start;
    end = start;
  } else if (offsets.start > offsets.end) {
    start = offsets.end;
    end = offsets.start;
  } else {
    start = offsets.start;
    end = offsets.end;
  }

  range.moveToElementText(node);
  range.moveStart('character', start);
  range.setEndPoint('EndToStart', range);
  range.moveEnd('character', end - start);
  range.select();
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setModernOffsets(node, offsets) {
  if (!window.getSelection) {
    return;
  }

  var selection = window.getSelection();
  var length = node[getTextContentAccessor()].length;
  var start = Math.min(offsets.start, length);
  var end = typeof offsets.end === 'undefined' ?
            start : Math.min(offsets.end, length);

  // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.
  if (!selection.extend && start > end) {
    var temp = end;
    end = start;
    start = temp;
  }

  var startMarker = getNodeForCharacterOffset(node, start);
  var endMarker = getNodeForCharacterOffset(node, end);

  if (startMarker && endMarker) {
    var range = document.createRange();
    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();

    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }
  }
}

var useIEOffsets = (
  ExecutionEnvironment.canUseDOM &&
  'selection' in document &&
  !('getSelection' in window)
);

var ReactDOMSelection = {
  /**
   * @param {DOMElement} node
   */
  getOffsets: useIEOffsets ? getIEOffsets : getModernOffsets,

  /**
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */
  setOffsets: useIEOffsets ? setIEOffsets : setModernOffsets
};

module.exports = ReactDOMSelection;

},{"./ExecutionEnvironment":33,"./getNodeForCharacterOffset":141,"./getTextContentAccessor":143}],141:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getNodeForCharacterOffset
 */

'use strict';

/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */
function getLeafNode(node) {
  while (node && node.firstChild) {
    node = node.firstChild;
  }
  return node;
}

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
function getSiblingNode(node) {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    node = node.parentNode;
  }
}

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  var nodeStart = 0;
  var nodeEnd = 0;

  while (node) {
    if (node.nodeType === 3) {
      nodeEnd = nodeStart + node.textContent.length;

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart
        };
      }

      nodeStart = nodeEnd;
    }

    node = getLeafNode(getSiblingNode(node));
  }
}

module.exports = getNodeForCharacterOffset;

},{}],77:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactInjection
 */

'use strict';

var DOMProperty = require("./DOMProperty");
var EventPluginHub = require("./EventPluginHub");
var ReactComponentEnvironment = require("./ReactComponentEnvironment");
var ReactClass = require("./ReactClass");
var ReactEmptyComponent = require("./ReactEmptyComponent");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactNativeComponent = require("./ReactNativeComponent");
var ReactDOMComponent = require("./ReactDOMComponent");
var ReactPerf = require("./ReactPerf");
var ReactRootIndex = require("./ReactRootIndex");
var ReactUpdates = require("./ReactUpdates");

var ReactInjection = {
  Component: ReactComponentEnvironment.injection,
  Class: ReactClass.injection,
  DOMComponent: ReactDOMComponent.injection,
  DOMProperty: DOMProperty.injection,
  EmptyComponent: ReactEmptyComponent.injection,
  EventPluginHub: EventPluginHub.injection,
  EventEmitter: ReactBrowserEventEmitter.injection,
  NativeComponent: ReactNativeComponent.injection,
  Perf: ReactPerf.injection,
  RootIndex: ReactRootIndex.injection,
  Updates: ReactUpdates.injection
};

module.exports = ReactInjection;

},{"./DOMProperty":22,"./EventPluginHub":29,"./ReactBrowserEventEmitter":43,"./ReactClass":46,"./ReactComponentEnvironment":49,"./ReactDOMComponent":55,"./ReactEmptyComponent":72,"./ReactNativeComponent":86,"./ReactPerf":88,"./ReactRootIndex":96,"./ReactUpdates":100}],75:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactEventListener
 * @typechecks static-only
 */

'use strict';

var EventListener = require("./EventListener");
var ExecutionEnvironment = require("./ExecutionEnvironment");
var PooledClass = require("./PooledClass");
var ReactInstanceHandles = require("./ReactInstanceHandles");
var ReactMount = require("./ReactMount");
var ReactUpdates = require("./ReactUpdates");

var assign = require("./Object.assign");
var getEventTarget = require("./getEventTarget");
var getUnboundedScrollPosition = require("./getUnboundedScrollPosition");

/**
 * Finds the parent React component of `node`.
 *
 * @param {*} node
 * @return {?DOMEventTarget} Parent container, or `null` if the specified node
 *                           is not nested.
 */
function findParent(node) {
  // TODO: It may be a good idea to cache this to prevent unnecessary DOM
  // traversal, but caching is difficult to do correctly without using a
  // mutation observer to listen for all DOM changes.
  var nodeID = ReactMount.getID(node);
  var rootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);
  var container = ReactMount.findReactContainerForID(rootID);
  var parent = ReactMount.getFirstReactDOM(container);
  return parent;
}

// Used to store ancestor hierarchy in top level callback
function TopLevelCallbackBookKeeping(topLevelType, nativeEvent) {
  this.topLevelType = topLevelType;
  this.nativeEvent = nativeEvent;
  this.ancestors = [];
}
assign(TopLevelCallbackBookKeeping.prototype, {
  destructor: function() {
    this.topLevelType = null;
    this.nativeEvent = null;
    this.ancestors.length = 0;
  }
});
PooledClass.addPoolingTo(
  TopLevelCallbackBookKeeping,
  PooledClass.twoArgumentPooler
);

function handleTopLevelImpl(bookKeeping) {
  var topLevelTarget = ReactMount.getFirstReactDOM(
    getEventTarget(bookKeeping.nativeEvent)
  ) || window;

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  var ancestor = topLevelTarget;
  while (ancestor) {
    bookKeeping.ancestors.push(ancestor);
    ancestor = findParent(ancestor);
  }

  for (var i = 0, l = bookKeeping.ancestors.length; i < l; i++) {
    topLevelTarget = bookKeeping.ancestors[i];
    var topLevelTargetID = ReactMount.getID(topLevelTarget) || '';
    ReactEventListener._handleTopLevel(
      bookKeeping.topLevelType,
      topLevelTarget,
      topLevelTargetID,
      bookKeeping.nativeEvent
    );
  }
}

function scrollValueMonitor(cb) {
  var scrollPosition = getUnboundedScrollPosition(window);
  cb(scrollPosition);
}

var ReactEventListener = {
  _enabled: true,
  _handleTopLevel: null,

  WINDOW_HANDLE: ExecutionEnvironment.canUseDOM ? window : null,

  setHandleTopLevel: function(handleTopLevel) {
    ReactEventListener._handleTopLevel = handleTopLevel;
  },

  setEnabled: function(enabled) {
    ReactEventListener._enabled = !!enabled;
  },

  isEnabled: function() {
    return ReactEventListener._enabled;
  },


  /**
   * Traps top-level events by using event bubbling.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return null;
    }
    return EventListener.listen(
      element,
      handlerBaseName,
      ReactEventListener.dispatchEvent.bind(null, topLevelType)
    );
  },

  /**
   * Traps a top-level event by using event capturing.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} handle Element on which to attach listener.
   * @return {object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
  trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
    var element = handle;
    if (!element) {
      return null;
    }
    return EventListener.capture(
      element,
      handlerBaseName,
      ReactEventListener.dispatchEvent.bind(null, topLevelType)
    );
  },

  monitorScrollValue: function(refresh) {
    var callback = scrollValueMonitor.bind(null, refresh);
    EventListener.listen(window, 'scroll', callback);
  },

  dispatchEvent: function(topLevelType, nativeEvent) {
    if (!ReactEventListener._enabled) {
      return;
    }

    var bookKeeping = TopLevelCallbackBookKeeping.getPooled(
      topLevelType,
      nativeEvent
    );
    try {
      // Event queue being processed in the same cycle allows
      // `preventDefault`.
      ReactUpdates.batchedUpdates(handleTopLevelImpl, bookKeeping);
    } finally {
      TopLevelCallbackBookKeeping.release(bookKeeping);
    }
  }
};

module.exports = ReactEventListener;

},{"./EventListener":28,"./ExecutionEnvironment":33,"./Object.assign":39,"./PooledClass":40,"./ReactInstanceHandles":79,"./ReactMount":83,"./ReactUpdates":100,"./getEventTarget":138,"./getUnboundedScrollPosition":144}],144:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getUnboundedScrollPosition
 * @typechecks
 */

"use strict";

/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are unbounded, unlike `getScrollPosition`. This means they
 * may be negative or exceed the element boundaries (which is possible using
 * inertial scrolling).
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */
function getUnboundedScrollPosition(scrollable) {
  if (scrollable === window) {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  }
  return {
    x: scrollable.scrollLeft,
    y: scrollable.scrollTop
  };
}

module.exports = getUnboundedScrollPosition;

},{}],68:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultPerf
 * @typechecks static-only
 */

'use strict';

var DOMProperty = require("./DOMProperty");
var ReactDefaultPerfAnalysis = require("./ReactDefaultPerfAnalysis");
var ReactMount = require("./ReactMount");
var ReactPerf = require("./ReactPerf");

var performanceNow = require("./performanceNow");

function roundFloat(val) {
  return Math.floor(val * 100) / 100;
}

function addValue(obj, key, val) {
  obj[key] = (obj[key] || 0) + val;
}

var ReactDefaultPerf = {
  _allMeasurements: [], // last item in the list is the current one
  _mountStack: [0],
  _injected: false,

  start: function() {
    if (!ReactDefaultPerf._injected) {
      ReactPerf.injection.injectMeasure(ReactDefaultPerf.measure);
    }

    ReactDefaultPerf._allMeasurements.length = 0;
    ReactPerf.enableMeasure = true;
  },

  stop: function() {
    ReactPerf.enableMeasure = false;
  },

  getLastMeasurements: function() {
    return ReactDefaultPerf._allMeasurements;
  },

  printExclusive: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getExclusiveSummary(measurements);
    console.table(summary.map(function(item) {
      return {
        'Component class name': item.componentName,
        'Total inclusive time (ms)': roundFloat(item.inclusive),
        'Exclusive mount time (ms)': roundFloat(item.exclusive),
        'Exclusive render time (ms)': roundFloat(item.render),
        'Mount time per instance (ms)': roundFloat(item.exclusive / item.count),
        'Render time per instance (ms)': roundFloat(item.render / item.count),
        'Instances': item.count
      };
    }));
    // TODO: ReactDefaultPerfAnalysis.getTotalTime() does not return the correct
    // number.
  },

  printInclusive: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(measurements);
    console.table(summary.map(function(item) {
      return {
        'Owner > component': item.componentName,
        'Inclusive time (ms)': roundFloat(item.time),
        'Instances': item.count
      };
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  getMeasurementsSummaryMap: function(measurements) {
    var summary = ReactDefaultPerfAnalysis.getInclusiveSummary(
      measurements,
      true
    );
    return summary.map(function(item) {
      return {
        'Owner > component': item.componentName,
        'Wasted time (ms)': item.time,
        'Instances': item.count
      };
    });
  },

  printWasted: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    console.table(ReactDefaultPerf.getMeasurementsSummaryMap(measurements));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  printDOM: function(measurements) {
    measurements = measurements || ReactDefaultPerf._allMeasurements;
    var summary = ReactDefaultPerfAnalysis.getDOMSummary(measurements);
    console.table(summary.map(function(item) {
      var result = {};
      result[DOMProperty.ID_ATTRIBUTE_NAME] = item.id;
      result['type'] = item.type;
      result['args'] = JSON.stringify(item.args);
      return result;
    }));
    console.log(
      'Total time:',
      ReactDefaultPerfAnalysis.getTotalTime(measurements).toFixed(2) + ' ms'
    );
  },

  _recordWrite: function(id, fnName, totalTime, args) {
    // TODO: totalTime isn't that useful since it doesn't count paints/reflows
    var writes =
      ReactDefaultPerf
        ._allMeasurements[ReactDefaultPerf._allMeasurements.length - 1]
        .writes;
    writes[id] = writes[id] || [];
    writes[id].push({
      type: fnName,
      time: totalTime,
      args: args
    });
  },

  measure: function(moduleName, fnName, func) {
    return function() {for (var args=[],$__0=0,$__1=arguments.length;$__0<$__1;$__0++) args.push(arguments[$__0]);
      var totalTime;
      var rv;
      var start;

      if (fnName === '_renderNewRootComponent' ||
          fnName === 'flushBatchedUpdates') {
        // A "measurement" is a set of metrics recorded for each flush. We want
        // to group the metrics for a given flush together so we can look at the
        // components that rendered and the DOM operations that actually
        // happened to determine the amount of "wasted work" performed.
        ReactDefaultPerf._allMeasurements.push({
          exclusive: {},
          inclusive: {},
          render: {},
          counts: {},
          writes: {},
          displayNames: {},
          totalTime: 0
        });
        start = performanceNow();
        rv = func.apply(this, args);
        ReactDefaultPerf._allMeasurements[
          ReactDefaultPerf._allMeasurements.length - 1
        ].totalTime = performanceNow() - start;
        return rv;
      } else if (fnName === '_mountImageIntoNode' ||
          moduleName === 'ReactDOMIDOperations') {
        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (fnName === '_mountImageIntoNode') {
          var mountID = ReactMount.getID(args[1]);
          ReactDefaultPerf._recordWrite(mountID, fnName, totalTime, args[0]);
        } else if (fnName === 'dangerouslyProcessChildrenUpdates') {
          // special format
          args[0].forEach(function(update) {
            var writeArgs = {};
            if (update.fromIndex !== null) {
              writeArgs.fromIndex = update.fromIndex;
            }
            if (update.toIndex !== null) {
              writeArgs.toIndex = update.toIndex;
            }
            if (update.textContent !== null) {
              writeArgs.textContent = update.textContent;
            }
            if (update.markupIndex !== null) {
              writeArgs.markup = args[1][update.markupIndex];
            }
            ReactDefaultPerf._recordWrite(
              update.parentID,
              update.type,
              totalTime,
              writeArgs
            );
          });
        } else {
          // basic format
          ReactDefaultPerf._recordWrite(
            args[0],
            fnName,
            totalTime,
            Array.prototype.slice.call(args, 1)
          );
        }
        return rv;
      } else if (moduleName === 'ReactCompositeComponent' && (
        (// TODO: receiveComponent()?
        (fnName === 'mountComponent' ||
        fnName === 'updateComponent' || fnName === '_renderValidatedComponent')))) {

        if (typeof this._currentElement.type === 'string') {
          return func.apply(this, args);
        }

        var rootNodeID = fnName === 'mountComponent' ?
          args[0] :
          this._rootNodeID;
        var isRender = fnName === '_renderValidatedComponent';
        var isMount = fnName === 'mountComponent';

        var mountStack = ReactDefaultPerf._mountStack;
        var entry = ReactDefaultPerf._allMeasurements[
          ReactDefaultPerf._allMeasurements.length - 1
        ];

        if (isRender) {
          addValue(entry.counts, rootNodeID, 1);
        } else if (isMount) {
          mountStack.push(0);
        }

        start = performanceNow();
        rv = func.apply(this, args);
        totalTime = performanceNow() - start;

        if (isRender) {
          addValue(entry.render, rootNodeID, totalTime);
        } else if (isMount) {
          var subMountTime = mountStack.pop();
          mountStack[mountStack.length - 1] += totalTime;
          addValue(entry.exclusive, rootNodeID, totalTime - subMountTime);
          addValue(entry.inclusive, rootNodeID, totalTime);
        } else {
          addValue(entry.inclusive, rootNodeID, totalTime);
        }

        entry.displayNames[rootNodeID] = {
          current: this.getName(),
          owner: this._currentElement._owner ?
            this._currentElement._owner.getName() :
            '<root>'
        };

        return rv;
      } else {
        return func.apply(this, args);
      }
    };
  }
};

module.exports = ReactDefaultPerf;

},{"./DOMProperty":22,"./ReactDefaultPerfAnalysis":69,"./ReactMount":83,"./ReactPerf":88,"./performanceNow":159}],159:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule performanceNow
 * @typechecks
 */

var performance = require("./performance");

/**
 * Detect if we can use `window.performance.now()` and gracefully fallback to
 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
 * because of Facebook's testing infrastructure.
 */
if (!performance || !performance.now) {
  performance = Date;
}

var performanceNow = performance.now.bind(performance);

module.exports = performanceNow;

},{"./performance":158}],158:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule performance
 * @typechecks
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

var performance;

if (ExecutionEnvironment.canUseDOM) {
  performance =
    window.performance ||
    window.msPerformance ||
    window.webkitPerformance;
}

module.exports = performance || {};

},{"./ExecutionEnvironment":33}],69:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultPerfAnalysis
 */

var assign = require("./Object.assign");

// Don't try to save users less than 1.2ms (a number I made up)
var DONT_CARE_THRESHOLD = 1.2;
var DOM_OPERATION_TYPES = {
  '_mountImageIntoNode': 'set innerHTML',
  INSERT_MARKUP: 'set innerHTML',
  MOVE_EXISTING: 'move',
  REMOVE_NODE: 'remove',
  TEXT_CONTENT: 'set textContent',
  'updatePropertyByID': 'update attribute',
  'deletePropertyByID': 'delete attribute',
  'updateStylesByID': 'update styles',
  'updateInnerHTMLByID': 'set innerHTML',
  'dangerouslyReplaceNodeWithMarkupByID': 'replace'
};

function getTotalTime(measurements) {
  // TODO: return number of DOM ops? could be misleading.
  // TODO: measure dropped frames after reconcile?
  // TODO: log total time of each reconcile and the top-level component
  // class that triggered it.
  var totalTime = 0;
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    totalTime += measurement.totalTime;
  }
  return totalTime;
}

function getDOMSummary(measurements) {
  var items = [];
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var id;

    for (id in measurement.writes) {
      measurement.writes[id].forEach(function(write) {
        items.push({
          id: id,
          type: DOM_OPERATION_TYPES[write.type] || write.type,
          args: write.args
        });
      });
    }
  }
  return items;
}

function getExclusiveSummary(measurements) {
  var candidates = {};
  var displayName;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = assign(
      {},
      measurement.exclusive,
      measurement.inclusive
    );

    for (var id in allIDs) {
      displayName = measurement.displayNames[id].current;

      candidates[displayName] = candidates[displayName] || {
        componentName: displayName,
        inclusive: 0,
        exclusive: 0,
        render: 0,
        count: 0
      };
      if (measurement.render[id]) {
        candidates[displayName].render += measurement.render[id];
      }
      if (measurement.exclusive[id]) {
        candidates[displayName].exclusive += measurement.exclusive[id];
      }
      if (measurement.inclusive[id]) {
        candidates[displayName].inclusive += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[displayName].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (displayName in candidates) {
    if (candidates[displayName].exclusive >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[displayName]);
    }
  }

  arr.sort(function(a, b) {
    return b.exclusive - a.exclusive;
  });

  return arr;
}

function getInclusiveSummary(measurements, onlyClean) {
  var candidates = {};
  var inclusiveKey;

  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = assign(
      {},
      measurement.exclusive,
      measurement.inclusive
    );
    var cleanComponents;

    if (onlyClean) {
      cleanComponents = getUnchangedComponents(measurement);
    }

    for (var id in allIDs) {
      if (onlyClean && !cleanComponents[id]) {
        continue;
      }

      var displayName = measurement.displayNames[id];

      // Inclusive time is not useful for many components without knowing where
      // they are instantiated. So we aggregate inclusive time with both the
      // owner and current displayName as the key.
      inclusiveKey = displayName.owner + ' > ' + displayName.current;

      candidates[inclusiveKey] = candidates[inclusiveKey] || {
        componentName: inclusiveKey,
        time: 0,
        count: 0
      };

      if (measurement.inclusive[id]) {
        candidates[inclusiveKey].time += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[inclusiveKey].count += measurement.counts[id];
      }
    }
  }

  // Now make a sorted array with the results.
  var arr = [];
  for (inclusiveKey in candidates) {
    if (candidates[inclusiveKey].time >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[inclusiveKey]);
    }
  }

  arr.sort(function(a, b) {
    return b.time - a.time;
  });

  return arr;
}

function getUnchangedComponents(measurement) {
  // For a given reconcile, look at which components did not actually
  // render anything to the DOM and return a mapping of their ID to
  // the amount of time it took to render the entire subtree.
  var cleanComponents = {};
  var dirtyLeafIDs = Object.keys(measurement.writes);
  var allIDs = assign({}, measurement.exclusive, measurement.inclusive);

  for (var id in allIDs) {
    var isDirty = false;
    // For each component that rendered, see if a component that triggered
    // a DOM op is in its subtree.
    for (var i = 0; i < dirtyLeafIDs.length; i++) {
      if (dirtyLeafIDs[i].indexOf(id) === 0) {
        isDirty = true;
        break;
      }
    }
    if (!isDirty && measurement.counts[id] > 0) {
      cleanComponents[id] = true;
    }
  }
  return cleanComponents;
}

var ReactDefaultPerfAnalysis = {
  getExclusiveSummary: getExclusiveSummary,
  getInclusiveSummary: getInclusiveSummary,
  getDOMSummary: getDOMSummary,
  getTotalTime: getTotalTime
};

module.exports = ReactDefaultPerfAnalysis;

},{"./Object.assign":39}],66:[function(require,module,exports){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDefaultBatchingStrategy
 */

'use strict';

var ReactUpdates = require("./ReactUpdates");
var Transaction = require("./Transaction");

var assign = require("./Object.assign");
var emptyFunction = require("./emptyFunction");

var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  }
};

var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
};

var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}

assign(
  ReactDefaultBatchingStrategyTransaction.prototype,
  Transaction.Mixin,
  {
    getTransactionWrappers: function() {
      return TRANSACTION_WRAPPERS;
    }
  }
);

var transaction = new ReactDefaultBatchingStrategyTransaction();

var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
  batchedUpdates: function(callback, a, b, c, d) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    // The code is written this way to avoid extra allocations
    if (alreadyBatchingUpdates) {
      callback(a, b, c, d);
    } else {
      transaction.perform(callback, null, a, b, c, d);
    }
  }
};

module.exports = ReactDefaultBatchingStrategy;

},{"./Object.assign":39,"./ReactUpdates":100,"./Transaction":116,"./emptyFunction":127}]