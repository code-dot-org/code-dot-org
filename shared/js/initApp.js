// TODO (brent) - way too many globals
// TODO (brent) - I wonder if we should sub-namespace dashboard
/* global script_path, Dialog, CDOSounds, dashboard, appOptions, $, trackEvent, Applab, sendReport, cancelReport, lastServerResponse, showVideoDialog, ga*/

var timing = require('./timing');
var chrome34Fix = require('./chrome34Fix');
dashboard.project = require('./project');

if (!window.dashboard) {
  throw new Error('Assume existence of window.dashboard');
}

// Sets up default options and initializes blockly
timing.startTiming('Puzzle', script_path, '');
var baseOptions = {
  containerId: 'codeApp',
  Dialog: Dialog,
  cdoSounds: CDOSounds,
  position: { blockYCoordinateInterval: 25 },
  onInitialize: function() {
    dashboard.createCallouts(this.callouts);
    if (window.dashboard.isChrome34) {
      chrome34Fix.fixup();
    }
    $(document).trigger('appInitialized');
  },
  onAttempt: function(report) {
    if (appOptions.level.isProjectLevel) {
      return;
    }
    if (appOptions.channel) {
      // Don't send the levelSource or image to Dashboard for channel-backed levels.
      // (The levelSource is already stored in the channels API.)
      delete report.program;
      delete report.image;
    }
    report.fallbackResponse = appOptions.report.fallback_response;
    report.callback = appOptions.report.callback;
    // Track puzzle attempt event
    trackEvent('Puzzle', 'Attempt', script_path, report.pass ? 1 : 0);
    if (report.pass) {
      trackEvent('Puzzle', 'Success', script_path, report.attempt);
      timing.stopTiming('Puzzle', script_path, '');
    }
    trackEvent('Activity', 'Lines of Code', script_path, report.lines);
    sendReport(report);
  },
  onResetPressed: function() {
    cancelReport();
  },
  onContinue: function() {
    if (lastServerResponse.videoInfo) {
      showVideoDialog(lastServerResponse.videoInfo);
    } else if (lastServerResponse.nextRedirect) {
      window.location.href = lastServerResponse.nextRedirect;
    }
  },
  backToPreviousLevel: function() {
    if (lastServerResponse.previousLevelRedirect) {
      window.location.href = lastServerResponse.previousLevelRedirect;
    }
  },
  showInstructionsWrapper: function(showInstructions) {
    // Always skip all pre-level popups on share levels or when configured thus
    if (this.share || appOptions.level.skipInstructionsPopup) {
      return;
    }

    var hasVideo = !!appOptions.autoplayVideo;
    var hasInstructions = !!(appOptions.level.instructions || appOptions.level.aniGifURL);

    if (hasVideo) {
      showVideoDialog(appOptions.autoplayVideo);
      if (hasInstructions) {
        $('.video-modal').on('hidden.bs.modal', function () {
          showInstructions();
        });
      }
    } else if (hasInstructions) {
      showInstructions();
    }
  }
};
$.extend(true, appOptions, baseOptions);

// Turn string values into functions for keys that begin with 'fn_' (JSON can't contain function definitions)
// E.g. { fn_example: 'function () { return; }' } becomes { example: function () { return; } }
(function fixUpFunctions(node) {
  if (typeof node !== 'object') {
    return;
  }
  for (var i in node) {
    if (/^fn_/.test(i)) {
      try {
        /* jshint ignore:start */
        node[i.replace(/^fn_/, '')] = eval('(' + node[i] + ')');
        /* jshint ignore:end */
      } catch (e) { }
    } else {
      fixUpFunctions(node[i]);
    }
  }
})(appOptions.level);

function initApp() {
  dashboard.project.init();
  window[appOptions.app + 'Main'](appOptions);
}

// Returns a function which returns a $.Deferred instance. When executed, the
// function loads the given app script.
function loadSource(name) {
  return function () {
    var deferred = new $.Deferred();
    document.body.appendChild($('<script>', {
      src: appOptions.baseUrl + 'js/' + name + '.js'
    }).on('load', function () {
      deferred.resolve();
    })[0]);
    return deferred;
  };
}

// Loads the given app stylesheet.
function loadStyle(name) {
  $('body').append($('<link>', {
    rel: 'stylesheet',
    type: 'text/css',
    href: appOptions.baseUrl + 'css/' + name + '.css'
  }));
}

loadStyle('common');
loadStyle(appOptions.app);
var promise;
if (appOptions.droplet) {
  loadStyle('droplet/droplet.min');
  loadStyle('tooltipster/tooltipster.min');
  promise = loadSource('jsinterpreter/acorn_interpreter')()
      .then(loadSource('marked/marked'))
      .then(loadSource('ace/ace'))
      .then(loadSource('ace/mode-javascript'))
      .then(loadSource('ace/ext-language_tools'))
      .then(loadSource('droplet/droplet-full'))
      .then(loadSource('tooltipster/jquery.tooltipster'))
      .then(dashboard.project.load);
} else {
  promise = loadSource('blockly')()
      .then(loadSource('marked/marked'))
      .then(loadSource(appOptions.locale + '/blockly_locale'))
      .then(dashboard.project.load);
}
promise = promise.then(loadSource('common' + appOptions.pretty))
  .then(loadSource(appOptions.locale + '/common_locale'))
  .then(loadSource(appOptions.locale + '/' + appOptions.app + '_locale'))
  .then(loadSource(appOptions.app + appOptions.pretty))
  .then(initApp);
