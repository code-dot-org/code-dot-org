(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global $, WebKitMutationObserver */

/**
 * Workaround for Chrome 34 SVG bug #349701
 *
 * Bug details: https://code.google.com/p/chromium/issues/detail?id=349701
 *   tl;dr: only the first clippath in a given svg element renders
 *
 * Workaround: wrap all clippath/image pairs into their own svg elements
 *
 * 1. Wrap any existing clippath/image pairs in empty svg elements
 * 2. Wrap new clippath/image pairs once added, remove empty wrappers once removed
 * 3. Farmer special case: give the farmer's wrapper svg the "pegman-location" attribute
 */

var PEGMAN_ORDERING_CLASS = 'pegman-location';

module.exports = {
  fixup: function () {
    wrapExistingClipPaths();
    handleClipPathChanges();
  }
};

function clipPathIDForImage(image) {
  var clipPath = $(image).attr('clip-path');
  return clipPath ? clipPath.match(/\(\#(.*)\)/)[1] : undefined;
}

function wrapImageAndClipPathWithSVG(image, wrapperClass) {
  var svgWrapper = $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" />');
  if (wrapperClass) {
    svgWrapper.attr('class', wrapperClass);
  }

  var clipPathID = clipPathIDForImage(image);
  var clipPath = $('#' + clipPathID);
  clipPath.insertAfter(image).add(image).wrapAll(svgWrapper);
}

// Find pairs of new images and clip paths, wrapping them in SVG tags when a pair is found
function handleClipPathChanges() {
  var i;
  var canvas = $('#visualization>svg')[0];
  if (!canvas) {
    return;
  }

  var newImages = {};
  var newClipPaths = {};

  var observer = new WebKitMutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for (i = 0; i < mutation.addedNodes.length; i++) {
        var newNode = mutation.addedNodes[i];
        if (newNode.nodeName == 'image') { newImages[$(newNode).attr('id')] = newNode; }
        if (newNode.nodeName == 'clipPath') { newClipPaths[$(newNode).attr('id')] = newNode; }
      }
      for (i = 0; i < mutation.removedNodes.length; i++) {
        var removedNode = mutation.removedNodes[i];
        if (removedNode.nodeName == 'image' || removedNode.nodeName == 'clipPath') {
          $('svg > svg:empty').remove();
        }
      }
    });

    $.each(newImages, function(key, image) {
      var clipPathID = clipPathIDForImage(image);
      if (newClipPaths.hasOwnProperty(clipPathID)) {
        wrapImageAndClipPathWithSVG(image);
        delete newImages[key];
        delete newClipPaths[clipPathID];
      }
    });
  });

  observer.observe(canvas, { childList: true });
}

function wrapExistingClipPaths() {
  $('[clip-path]').each(function(i, image){
    if ($(image).attr('class') === PEGMAN_ORDERING_CLASS) {
      // Special case for Farmer, whose class is used for element ordering
      $(image).attr('class', '');
      wrapImageAndClipPathWithSVG(image, PEGMAN_ORDERING_CLASS);
    } else {
      wrapImageAndClipPathWithSVG(image);
    }
  });
}

},{}],2:[function(require,module,exports){
/* global $ */

var base = {
  api_base_url: "/v3/channels",

  all: function(callback) {
    $.ajax({
      url: this.api_base_url,
      type: "get",
      dataType: "json",
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, null);
    });
  },

  create: function(value, callback) {
    $.ajax({
      url: this.api_base_url,
      type: "post",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(value)
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, undefined);
    });
  },

  delete: function(id, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id + "/delete",
      type: "post",
      dataType: "json",
    }).done(function(data, text) {
      callback(null, true);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  },

  fetch: function(id, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id,
      type: "get",
      dataType: "json",
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, undefined);
    });
  },

  update: function(id, value, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id,
      type: "post",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(value)
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  }
};

module.exports = {
  create: function (url) {
    return $.extend({}, base, {
      api_base_url: url,
    });
  }
};

},{}],3:[function(require,module,exports){
/* global dashboard, appOptions, $, trackEvent, Applab */

// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;
var hasProjectChanged = false;

var channels = require('./clientApi').create('/v3/channels');

var events = {
  // Fired when run state changes or we enter/exit design mode
  appModeChanged: 'appModeChanged',
  appInitialized: 'appInitialized',
  workspaceChange: 'workspaceChange',
  hashchange: 'hashchange'
};

module.exports = {
  init: function () {
    if (appOptions.level.isProjectLevel || this.current) {

      $(window).on(events.hashchange, function () {
        var hashData = parseHash();
        if ((this.current &&
            hashData.channelId !== this.current.id) ||
            hashData.isEditingProject !== this.isEditing) {
          location.reload();
        }
      }.bind(this));

      if (this.current && this.current.levelHtml) {
        appOptions.level.levelHtml = this.current.levelHtml;
      }

      if (this.isEditing) {
        if (this.current) {
          if (this.current.levelSource) {
            appOptions.level.lastAttempt = this.current.levelSource;
          }
        } else {
          this.current = {
            name: 'My Project'
          };
        }

        $(window).on(events.appModeChanged, function(event, callback) {
          this.save(dashboard.getEditorSource(), callback);
        }.bind(this));

        // Autosave every AUTOSAVE_INTERVAL milliseconds
        $(window).on(events.appInitialized, function () {
          // Get the initial app code as a baseline
          this.current.levelSource = dashboard.getEditorSource();
        }.bind(this));
        $(window).on(events.workspaceChange, function () {
          hasProjectChanged = true;
        });
        window.setInterval(this.autosave_.bind(this), AUTOSAVE_INTERVAL);

        if (!this.current.hidden) {
          if (this.current.isOwner || location.hash === '') {
            dashboard.header.showProjectHeader();
          } else {
            // Viewing someone else's project - set share mode
            dashboard.header.showMinimalProjectHeader();
            // URL with /edit - set hideSource to false
            setAppOptionsForShareMode(false);
          }
        }
      } else if (this.current && this.current.levelSource) {
        appOptions.level.lastAttempt = this.current.levelSource;
        dashboard.header.showMinimalProjectHeader();
        // URL without /edit - set hideSource to true
        setAppOptionsForShareMode(true);
      }
    } else if (appOptions.isLegacyShare && this.appToProjectUrl()) {
      this.current = {
        name: 'Untitled Project'
      };
      dashboard.header.showMinimalProjectHeader();
    }
    if (appOptions.noPadding) {
      $(".full_container").css({"padding":"0px"});
    }
  },
  updateTimestamp: function () {
    if (this.current.updatedAt) {
      // TODO i18n
      $('.project_updated_at').empty().append("Saved ")  // TODO i18n
          .append($('<span class="timestamp">').attr('title', this.current.updatedAt)).show();
      $('.project_updated_at span.timestamp').timeago();
    } else {
      $('.project_updated_at').text("Not saved"); // TODO i18n
    }
  },
  appToProjectUrl: function () {
    switch (appOptions.app) {
      case 'applab':
        return '/p/applab';
      case 'turtle':
        return '/p/artist';
      case 'studio':
        if (appOptions.level.useContractEditor) {
          return '/p/algebra_game';
        }
        return '/p/playlab';
    }
  },
  /**
   * Saves the project to the Channels API. Calls `callback` on success if a
   * callback function was provided.
   */
  save: function(source, callback) {
    $('.project_updated_at').text('Saving...');  // TODO (Josh) i18n
    var channelId = this.current.id;
    this.current.levelSource = source;
    this.current.levelHtml = window.Applab && Applab.getHtml();
    this.current.level = this.appToProjectUrl();

    if (channelId && this.current.isOwner) {
      channels.update(channelId, this.current, function (err, data) {
        this.updateCurrentData_(err, data, false);
        executeCallback(callback, data);
      }.bind(this));
    } else {
      channels.create(this.current, function (err, data) {
        this.updateCurrentData_(err, data, true);
        executeCallback(callback, data);
      }.bind(this));
    }
  },
  updateCurrentData_: function (err, data, isNewChannel) {
    if (err) {
      $('.project_updated_at').text('Error saving project');  // TODO i18n
      return;
    }

    this.current = data;
    if (isNewChannel) {
      location.href = this.current.level + '#' + this.current.id + '/edit';
    }
    this.updateTimestamp();
  },
  /**
   * Autosave the code if things have changed
   */
  autosave_: function () {
    // Bail if a baseline levelSource doesn't exist (app not yet initialized)
    if (this.current.levelSource === undefined) {
      return;
    }
    // `dashboard.getEditorSource()` is expensive for Blockly so only call
    // after `workspaceChange` has fired
    if (!appOptions.droplet && !hasProjectChanged) {
      return;
    }

    var source = dashboard.getEditorSource();
    if (this.current.levelSource === source) {
      hasProjectChanged = false;
      return;
    }

    this.save(source, function () {
      hasProjectChanged = false;
    });
  },
  /**
   * Renames and saves the project.
   */
  rename: function(newName, callback) {
    this.current.name = newName;
    this.save(dashboard.getEditorSource(), callback);
  },
  /**
   * Creates a copy of the project, gives it the provided name, and sets the
   * copy as the current project.
   */
  copy: function(newName, callback) {
    delete this.current.id;
    delete this.current.hidden;
    this.current.name = newName;
    this.save(dashboard.getEditorSource(), callback);
  },
  delete: function(callback) {
    var channelId = this.current.id;
    if (channelId) {
      channels.delete(channelId, function(err, data) {
        executeCallback(callback, data);
      });
    } else {
      executeCallback(callback, false);
    }
  },
  /**
   * @returns {jQuery.Deferred} A deferred which will resolve when the project loads.
   */
  load: function () {
    var deferred;
    if (appOptions.level.isProjectLevel) {
      var hashData = parseHash();
      if (hashData.channelId) {
        if (hashData.isEditingProject) {
          module.exports.isEditing = true;
        } else {
          $('#betainfo').hide();
        }

        // Load the project ID, if one exists
        deferred = new $.Deferred();
        channels.fetch(hashData.channelId, function (err, data) {
          if (err) {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname;
          } else {
            module.exports.current = data;
            deferred.resolve();
          }
        });
        return deferred;
      } else {
        module.exports.isEditing = true;
      }
    } else if (appOptions.level.projectTemplateLevelName || appOptions.app === 'applab') {
      // this is an embedded project
      module.exports.isEditing = true;
      deferred = new $.Deferred();
      channels.fetch(appOptions.channel, function(err, data) {
        if (err) {
          deferred.reject();
        } else {
          module.exports.current = data;
          dashboard.header.showProjectLevelHeader();
          deferred.resolve();
        }
      });
      return deferred;
    }
  }
};

/**
 * Only execute the given argument if it is a function.
 * @param callback
 */
function executeCallback(callback, data) {
  if (typeof callback === 'function') {
    callback(data);
  }
}

function parseHash() {
  // Example paths:
  // edit: /p/artist#7uscayNy-OEfVERwJg0xqQ==/edit
  // view: /p/artist#7uscayNy-OEfVERwJg0xqQ==
  var isEditingProject = false;
  var channelId = location.hash.slice(1);
  if (channelId) {
    // TODO: Use a router.
    var params = channelId.split("/");
    if (params.length > 1 && params[1] == "edit") {
      channelId = params[0];
      isEditingProject = true;
    }
  }
  return {
    channelId: channelId,
    isEditingProject: isEditingProject
  };
}

function setAppOptionsForShareMode(hideSource) {
  appOptions.readonlyWorkspace = true;
  appOptions.callouts = [];
  appOptions.share = true;
  appOptions.hideSource = hideSource;
  // Important to call determineNoPadding() after setting hideSource value
  appOptions.noPadding = determineNoPadding();
}

function determineNoPadding() {
  switch (appOptions.app) {
    case 'applab':
    case 'flappy':
    case 'studio':
    case 'bounce':
      return appOptions.isMobile && appOptions.hideSource;
    default:
      return false;
  }
}

},{"./clientApi":2}],4:[function(require,module,exports){
/* global ga */

var userTimings = {};

module.exports = {
  startTiming: function (category, variable, label) {
    var key = category + variable + label;
    userTimings[key] = new Date().getTime();
  },

  stopTiming: function (category, variable, label) {
    var key = category + variable + label;
    var endTime = new Date().getTime();
    var startTime = userTimings[key];
    var timeElapsed = endTime - startTime;
    ga('send', 'timing', category, variable, timeElapsed, label);
  }
};

},{}],5:[function(require,module,exports){
// TODO (brent) - way too many globals
// TODO (brent) - I wonder if we should sub-namespace dashboard
/* global script_path, Dialog, CDOSounds, dashboard, appOptions, $, trackEvent, Blockly, Applab, sendReport, cancelReport, lastServerResponse, showVideoDialog, ga*/

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

/**
 * @returns {string} The serialized level source from the editor.
 */
dashboard.getEditorSource = function() {
  return window.Blockly ?
    Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)) :
    window.Applab && Applab.getCode();
};

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

},{"./chrome34Fix":1,"./project":3,"./timing":4}]},{},[5]);
