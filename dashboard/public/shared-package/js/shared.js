(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global WebKitMutationObserver */

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
/**
 * @file Helper API object that wraps asynchronous calls to our data APIs.
 */

/**
 * Standard callback form for asynchronous operations, popularized by Node.
 * @typedef {function} NodeStyleCallback
 * @param {Error|null} error - null if the async operation was successful.
 * @param {*} result - return value for async operation.
 */

/**
 * @name ClientApi
 */
var base = {
  /**
   * Base URL for target API.
   * @type {string}
   */
  api_base_url: "/v3/channels",

  /**
   * Request all collections.
   * @param {NodeStyleCallback} callback - Expected result is an array of
   *        collection objects.
   */
  all: function(callback) {
    $.ajax({
      url: this.api_base_url,
      type: "get",
      dataType: "json"
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, null);
    });
  },

  /**
   * Insert a collection.
   * @param {Object} value - collection contents, must be JSON.stringify-able.
   * @param {NodeStyleCallback} callback - Expected result is the created
   *        collection object (which will include an assigned 'id' key).
   */
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

  /**
   * Remove a collection.
   * @param {string} childPath The path underneath api_base_url
   * @param {NodeStyleCallback} callback - Expected result is TRUE.
   */
  delete: function(childPath, callback) {
    $.ajax({
      url: this.api_base_url + "/" + childPath + "/delete",
      type: "post",
      dataType: "json"
    }).done(function(data, text) {
      callback(null, true);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  },

  /**
   * Retrieve a collection.
   * @param {string} childPath The path underneath api_base_url
   * @param {NodeStyleCallback} callback - Expected result is the requested
   *        collection object.
   */
  fetch: function(childPath, callback) {
    $.ajax({
      url: this.api_base_url + "/" + childPath,
      type: "get",
      dataType: "json",
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, undefined);
    });
  },

  /**
   * Change the contents of a collection.
   * @param {string} childPath The path underneath api_base_url
   * @param {Object} value - The new collection contents.
   * @param {NodeStyleCallback} callback - Expected result is the new collection
   *        object.
   */
  update: function(childPath, value, callback) {
    $.ajax({
      url: this.api_base_url + "/" + childPath,
      type: "post",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(value)
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  },

  /**
   * Copy to the destination collection, since we expect the destination
   * to be empty. A true rest API would replace the destination collection:
   * @see https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services
   * @param {*} src - Source collection identifier.
   * @param {*} dest - Destination collection identifier.
   * @param {NodeStyleCallback} callback
   */
  copyAll: function(src, dest, callback) {
    $.ajax({
      url: this.api_base_url + "/" + dest + '?src=' + src,
      type: "put"
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  },

  /**
   * Replace the contents of an asset or source file.
   * @param {number} id - The collection identifier.
   * @param {String} value - The new file contents.
   * @param {String} filename - The name of the file to create or update.
   * @param {NodeStyleCallback} callback - Expected result is the new collection
   *        object.
   */
  put: function(id, value, filename, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id + "/" + filename,
      type: "put",
      contentType: "application/json; charset=utf-8",
      data: value
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  },

  /**
   * Modify the contents of a collection
   * @param {number} id - The collection identifier.
   * @param {String} queryParams - Any query parameters
   * @param {String} value - The request body
   * @param {NodeStyleCallback} callback - Expected result is the new collection
   *        object.
   */
  patchAll: function(id, queryParams, value, callback) {
    $.ajax({
      url: this.api_base_url + "/" + id + "/?" + queryParams,
      type: "patch",
      contentType: "application/json; charset=utf-8",
      data: value
    }).done(function(data, text) {
      callback(null, data);
    }).fail(function(request, status, error) {
      var err = new Error('status: ' + status + '; error: ' + error);
      callback(err, false);
    });
  }
};



module.exports = {
  /**
   * Create a ClientApi instance with the given base URL.
   * @param {!string} url - Custom API base url (e.g. '/v3/netsim')
   * @returns {ClientApi}
   */
  create: function (url) {
    return $.extend({}, base, {
      api_base_url: url
    });
  }
};

},{}],3:[function(require,module,exports){
// TODO (brent) - way too many globals
/* global script_path, Dialog, CDOSounds, dashboard, appOptions, trackEvent, Applab, Blockly, sendReport, cancelReport, lastServerResponse, showVideoDialog, ga, digestManifest*/

var timing = require('./timing');
var chrome34Fix = require('./chrome34Fix');
var loadApp = require('./loadApp');
var project = require('./project');

window.apps = {
  // Loads the dependencies for the current app based on values in `appOptions`.
  // This function takes a callback which is called once dependencies are ready.
  load: loadApp,
  // Legacy Blockly initialization that was moved here from _blockly.html.haml.
  // Modifies `appOptions` with some default values in `baseOptions`.
  // TODO(dave): Move blockly-specific setup function out of shared and back into dashboard.
  setupApp: function (appOptions) {

    if (!window.dashboard) {
      throw new Error('Assume existence of window.dashboard');
    }
    dashboard.project = project;

    timing.startTiming('Puzzle', script_path, '');

    var lastSavedProgram;

    // Sets up default options and initializes blockly
    var baseOptions = {
      containerId: 'codeApp',
      Dialog: Dialog,
      cdoSounds: CDOSounds,
      position: {blockYCoordinateInterval: 25},
      onInitialize: function() {
        dashboard.createCallouts(this.level.callouts || this.callouts);
        if (window.dashboard.isChrome34) {
          chrome34Fix.fixup();
        }
        if (appOptions.level.projectTemplateLevelName || appOptions.app === 'applab') {
          $('#clear-puzzle-header').hide();
          $('#versions-header').show();
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
        } else {
          // Only locally cache non-channel-backed levels. Use a client-generated
          // timestamp initially (it will be updated with a timestamp from the server
          // if we get a response.
          lastSavedProgram = decodeURIComponent(report.program);
          dashboard.clientState.writeSourceForLevel(appOptions.scriptName, appOptions.serverLevelId, +new Date(), lastSavedProgram);
        }
        report.scriptName = appOptions.scriptName;
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
      onComplete: function (response) {
        if (!appOptions.channel) {
          // Update the cache timestamp with the (more accurate) value from the server.
          dashboard.clientState.writeSourceForLevel(appOptions.scriptName, appOptions.serverLevelId, response.timestamp, lastSavedProgram);
        }
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

        var afterVideoCallback = showInstructions;
        if (appOptions.level.afterVideoBeforeInstructionsFn) {
          afterVideoCallback = function () {
            appOptions.level.afterVideoBeforeInstructionsFn(showInstructions);
          };
        }

        var hasVideo = !!appOptions.autoplayVideo;
        var hasInstructions = !!(appOptions.level.instructions ||
        appOptions.level.aniGifURL);

        if (hasVideo) {
          if (hasInstructions) {
            appOptions.autoplayVideo.onClose = afterVideoCallback;
          }
          showVideoDialog(appOptions.autoplayVideo);
        } else if (hasInstructions) {
          afterVideoCallback();
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
          } catch (e) {
          }
        } else {
          fixUpFunctions(node[i]);
        }
      }
    })(appOptions.level);
  },

  // Set up projects, skipping blockly-specific steps. Designed for use
  // by levels of type "external".
  setupProjectsExternal: function() {
    if (!window.dashboard) {
      throw new Error('Assume existence of window.dashboard');
    }

    dashboard.project = project;
  },

  // Define blockly/droplet-specific callbacks for projects to access
  // level source, HTML and headers.
  // TODO(dave): Extract blockly-specific handler code into _blockly.html.haml.
  sourceHandler: {
    setInitialLevelHtml: function (levelHtml) {
      appOptions.level.levelHtml = levelHtml;
    },
    getLevelHtml: function () {
      return window.Applab && Applab.getHtml();
    },
    setInitialLevelSource: function (levelSource) {
      appOptions.level.lastAttempt = levelSource;
    },
    getLevelSource: function (currentLevelSource) {
      var source;
      if (window.Blockly) {
        // If we're readOnly, source hasn't changed at all
        source = Blockly.readOnly ? currentLevelSource :
          Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
      } else {
        source = window.Applab && Applab.getCode();
      }
      return source;
    },
  },

  // Initialize the Blockly or Droplet app.
  init: function () {
    dashboard.project.init(window.apps.sourceHandler);
    window[appOptions.app + 'Main'](appOptions);
  }
};

},{"./chrome34Fix":1,"./loadApp":4,"./project":5,"./timing":7}],4:[function(require,module,exports){
/* global dashboard, appOptions, mergedActivityCssClass */

var renderAbusive = require('./renderAbusive');

// Max milliseconds to wait for last attempt data from the server
var LAST_ATTEMPT_TIMEOUT = 5000;

// Loads the given app stylesheet.
function loadStyle(name) {
  $('body').append($('<link>', {
    rel: 'stylesheet',
    type: 'text/css',
    href: appOptions.baseUrl + 'css/' + name + '.css'
  }));
}

module.exports = function (callback) {
  var lastAttemptLoaded = false;

  var loadLastAttemptFromSessionStorage = function () {
    if (!lastAttemptLoaded) {
      lastAttemptLoaded = true;

      // Load the locally-cached last attempt (if one exists)
      setLastAttemptUnlessJigsaw(dashboard.clientState.sourceForLevel(
          appOptions.scriptName, appOptions.serverLevelId));

      callback();
    }
  };

  var isViewingSolution = (dashboard.clientState.queryParams('solution') === 'true');
  var isViewingStudentAnswer = !!dashboard.clientState.queryParams('user_id');

  if (!appOptions.channel && !isViewingSolution && !isViewingStudentAnswer) {
    $.ajax('/api/user_progress/' + appOptions.scriptName + '/' + appOptions.stagePosition + '/' + appOptions.levelPosition).done(function (data) {
      // Merge progress from server (loaded via AJAX)
      var serverProgress = data.progress || {};
      var clientProgress = dashboard.clientState.allLevelsProgress()[appOptions.scriptName] || {};
      Object.keys(serverProgress).forEach(function (levelId) {
        if (serverProgress[levelId] !== clientProgress[levelId]) {
          var status = mergedActivityCssClass(clientProgress[levelId], serverProgress[levelId]);

          // Clear the existing class and replace
          $('#header-level-' + levelId).attr('class', 'level_link ' + status);

          // Write down new progress in sessionStorage
          dashboard.clientState.trackProgress(null, null, serverProgress[levelId], appOptions.scriptName, levelId);
        }
      });

      if (!lastAttemptLoaded) {
        if (data.lastAttempt) {
          lastAttemptLoaded = true;

          var timestamp = data.lastAttempt.timestamp;
          var source = data.lastAttempt.source;

          var cachedProgram = dashboard.clientState.sourceForLevel(
              appOptions.scriptName, appOptions.serverLevelId, timestamp);
          if (cachedProgram !== undefined) {
            // Client version is newer
            setLastAttemptUnlessJigsaw(cachedProgram);
          } else if (source && source.length) {
            // Sever version is newer
            setLastAttemptUnlessJigsaw(source);

            // Write down the lastAttempt from server in sessionStorage
            dashboard.clientState.writeSourceForLevel(appOptions.scriptName,
                appOptions.serverLevelId, timestamp, source);
          }
          callback();
        } else {
          loadLastAttemptFromSessionStorage();
        }
      }
    }).fail(loadLastAttemptFromSessionStorage);

    // Use this instead of a timeout on the AJAX request because we still want
    // the header progress data even if the last attempt data takes too long.
    // The progress dots can fade in at any time without impacting the user.
    setTimeout(loadLastAttemptFromSessionStorage, LAST_ATTEMPT_TIMEOUT);
  } else if (window.dashboard && dashboard.project) {
    dashboard.project.load().then(function () {
      if (dashboard.project.hideBecauseAbusive()) {
        renderAbusive();
        return $.Deferred().reject();
      }
    }).then(callback);
  } else {
    loadLastAttemptFromSessionStorage();
  }
};

function setLastAttemptUnlessJigsaw(source) {
  if (appOptions.levelGameName !== 'Jigsaw') {
    appOptions.level.lastAttempt = source;
  }
}

},{"./renderAbusive":6}],5:[function(require,module,exports){
/* global dashboard, appOptions, trackEvent */

// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;

var ABUSE_THRESHOLD = 10;

var hasProjectChanged = false;

var assets = require('./clientApi').create('/v3/assets');
var sources = require('./clientApi').create('/v3/sources');
var channels = require('./clientApi').create('/v3/channels');

// Name of the packed source file
var SOURCE_FILE = 'main.json';

var events = {
  // Fired when run state changes or we enter/exit design mode
  appModeChanged: 'appModeChanged',
  appInitialized: 'appInitialized',
  workspaceChange: 'workspaceChange'
};

/**
 * Helper for when we split our pathname by /. channel_id and action may end up
 * being undefined.
 * Example paths:
 * /projects/applab
 * /projects/playlab/1U53pYpR8szDgtrGIG5lIg
 * /projects/artist/VyVO-bQaGQ-Cyb7DbpabNQ/edit
 */
var PathPart = {
  START: 0,
  PROJECTS: 1,
  APP: 2,
  CHANNEL_ID: 3,
  ACTION: 4
};

/**
 * Current state of our Channel API object
 * @typedef {Object} ProjectInstance
 * @property {string} id
 * @property {string} name
 * hidden // unclear when this ever gets set
 * @property {boolean} isOwner Populated by our update/create callback.
 * @property {string} updatedAt String representation of a Date. Populated by
 *   out update/create callback
 * @property {string} level Path where this particular app type is hosted
 */
var current;
var currentSourceVersionId;
var currentAbuseScore = 0;
var isEditing = false;

/**
 * Current state of our sources API data
 */
var currentSources = {
  source: null,
  html: null
};

/**
 * Get string representation of our sources API object for upload
 */
function packSources() {
  return JSON.stringify(currentSources);
}

/**
 * Populate our current sources API object based off of given data
 * @param {string} data.source
 * @param {string} data.html
 */
function unpackSources(data) {
  currentSources = {
    source: data.source,
    html: data.html
  };
}

var projects = module.exports = {
  /**
   * @returns {string} id of the current project, or undefined if we don't have
   *   a current project.
   */
  getCurrentId: function () {
    if (!current) {
      return;
    }
    return current.id;
  },

  /**
   * @returns {string} name of the current project, or undefined if we don't have
   *   a current project
   */
  getCurrentName: function () {
    if (!current) {
      return;
    }
    return current.name;
  },

  getCurrentTimestamp: function () {
    if (!current) {
      return;
    }
    return current.updatedAt;
  },

  /**
   * @returns {number}
   */
  getAbuseScore: function () {
    return currentAbuseScore;
  },

  /**
   * Sets abuse score to zero, saves the project, and reloads the page
   */
  adminResetAbuseScore: function () {
    var id = this.getCurrentId();
    if (!id) {
      return;
    }
    channels.delete(id + '/abuse', function (err, result) {
      if (err) {
        throw err;
      }
      assets.patchAll(id, 'abuse_score=0', null, function (err, result) {
        if (err) {
          throw err;
        }
        $('.admin-abuse-score').text(0);
      });
    });
  },

  /**
   * @returns {boolean} true if we're frozen
   */
  isFrozen: function () {
    if (!current) {
      return;
    }
    return current.frozen;
  },

  /**
   * @returns {boolean}
   */
  isOwner: function () {
    return current && current.isOwner;
  },

  /**
   * @returns {boolean} true if project has been reported enough times to
   *   exceed our threshold
   */
  exceedsAbuseThreshold: function () {
    return currentAbuseScore >= ABUSE_THRESHOLD;
  },

  /**
   * @return {boolean} true if we should show our abuse box instead of showing
   *   the project.
   */
  hideBecauseAbusive: function () {
    if (!this.exceedsAbuseThreshold() || appOptions.scriptId) {
      // Never want to hide when in the context of a script, as this will always
      // either be me or my teacher viewing my last submission
      return false;
    }

    // When owners edit a project, we don't want to hide it entirely. Instead,
    // we'll load the project and show them a small alert
    var pageAction = parsePath().action;

    // NOTE: appOptions.isAdmin is not a security setting as it can be manipulated
    // by the user. In this case that's okay, since all that does is allow them to
    // view a project that was marked as abusive.
    if ((this.isOwner() || appOptions.isAdmin) &&
        (pageAction === 'edit' || pageAction === 'view')) {
      return false;
    }

    return true;
  },

  //////////////////////////////////////////////////////////////////////
  // Properties and callbacks. These are all candidates for being extracted
  // as configuration parameters which are passed in by the caller.
  //////////////////////////////////////////////////////////////////////

  // TODO(dave): extract isAutosaveEnabled and any boolean helper
  // functions below to become properties on appOptions.project.
  // Projects behavior should ultimately be fully configurable by
  // properties on appOptions.project, rather than reaching out
  // into global state to make decisions.

  /**
   * @returns {boolean} true if we're editing
   */
  isEditing: function () {
    return isEditing;
  },

  // Whether the current level is a project level (i.e. at the /projects url).
  isProjectLevel: function() {
    return (appOptions.level && appOptions.level.isProjectLevel);
  },

  shouldUpdateHeaders: function() {
    return !appOptions.isExternalProjectLevel;
  },

  showProjectHeader: function() {
    if (this.shouldUpdateHeaders()) {
      dashboard.header.showProjectHeader();
    }
  },

  /**
   * Updates the contents of the admin box for admins. We have no knowledge
   * here whether we're an admin, and depend on dashboard getting this right.
   */
  showAdmin: function() {
    dashboard.admin.showProjectAdmin();
  },

  showMinimalProjectHeader: function() {
    if (this.shouldUpdateHeaders()) {
      dashboard.header.showMinimalProjectHeader();
    }
  },

  showProjectLevelHeader: function() {
    if (this.shouldUpdateHeaders()) {
      dashboard.header.showProjectLevelHeader();
    }
  },
  setName: function(newName) {
    current = current || {};
    if (newName) {
      current.name = newName;
      this.setTitle(newName);
    }
  },
  setTitle: function(newName) {
    if (newName && appOptions.gameDisplayName) {
      document.title = newName + ' - ' + appOptions.gameDisplayName;
    }
  },

  //////////////////////////////////////////////////////////////////////
  // End of properties and callbacks.
  //////////////////////////////////////////////////////////////////////

  /**
   *
   * @param {Object} sourceHandler Object containing callbacks provided by caller.
   * @param {Function} sourceHandler.setInitialLevelHtml
   * @param {Function} sourceHandler.getLevelHtml
   * @param {Function} sourceHandler.setInitialLevelSource
   * @param {Function} sourceHandler.getLevelSource
   */
  init: function (sourceHandler) {
    this.sourceHandler = sourceHandler;
    if (redirectFromHashUrl() || redirectEditView()) {
      return;
    }

    if (this.isProjectLevel() || current) {
      if (currentSources.html) {
        sourceHandler.setInitialLevelHtml(currentSources.html);
      }

      if (isEditing) {
        if (current) {
          if (currentSources.source) {
            sourceHandler.setInitialLevelSource(currentSources.source);
          }
        } else {
          this.setName('My Project');
        }

        $(window).on(events.appModeChanged, function(event, callback) {
          this.save(callback);
        }.bind(this));

        // Autosave every AUTOSAVE_INTERVAL milliseconds
        $(window).on(events.appInitialized, function () {
          // Get the initial app code as a baseline
          currentSources.source = this.sourceHandler.getLevelSource(currentSources.source);
        }.bind(this));
        $(window).on(events.workspaceChange, function () {
          hasProjectChanged = true;
        });
        window.setInterval(this.autosave_.bind(this), AUTOSAVE_INTERVAL);

        if (!current.hidden) {
          if (current.isOwner || !parsePath().channelId) {
            this.showProjectHeader();
          } else {
            // Viewing someone else's project - set share mode
            this.showMinimalProjectHeader();
          }
        }
      } else if (current) {
        this.sourceHandler.setInitialLevelSource(currentSources.source);
        this.showMinimalProjectHeader();
      }
    } else if (appOptions.isLegacyShare && this.getStandaloneApp()) {
      this.setName('Untitled Project');
      this.showMinimalProjectHeader();
    }
    if (appOptions.noPadding) {
      $(".full_container").css({"padding":"0px"});
    }

    this.showAdmin();
  },
  projectChanged: function() {
    hasProjectChanged = true;
  },
  /**
   * @returns {string} The name of the standalone app capable of running
   * this project as a standalone project, or null if none exists.
   */
  getStandaloneApp: function () {
    switch (appOptions.app) {
      case 'applab':
        return 'applab';
      case 'turtle':
        return 'artist';
      case 'calc':
        return 'calc';
      case 'eval':
        return 'eval';
      case 'studio':
        if (appOptions.level.useContractEditor) {
          return 'algebra_game';
        } else if (appOptions.skinId === 'hoc2015' || appOptions.skinId === 'infinity') {
          return null;
        }
        return 'playlab';
      default:
        return null;
    }
  },
  /**
   * @returns {string} The path to the app capable of running
   * this project as a standalone app.
   * @throws {Error} If no standalone app exists.
   */
  appToProjectUrl: function () {
    var app = projects.getStandaloneApp();
    if (!app) {
      throw new Error('This type of project cannot be run as a standalone app.');
    }
    return '/projects/' + app;
  },
  /**
   * Explicitly clear the HTML, circumventing safety measures which prevent it from
   * being accidentally deleted.
   */
  clearHtml: function() {
    currentSources.html = '';
  },
  /**
   * Saves the project to the Channels API. Calls `callback` on success if a
   * callback function was provided.
   * @param {object?} sourceAndHtml Optional source to be provided, saving us another
   *   call to `sourceHandler.getLevelSource`.
   * @param {function} callback Function to be called after saving.
   * @param {boolean} forceNewVersion If true, explicitly create a new version.
   */
  save: function(sourceAndHtml, callback, forceNewVersion) {
    // Can't save a project if we're not the owner.
    if (current && current.isOwner === false) {
      return;
    }

    if (typeof arguments[0] === 'function' || !sourceAndHtml) {
      // If no source is provided, shift the arguments and ask for the source
      // ourselves.
      var args = Array.prototype.slice.apply(arguments);
      callback = args[0];
      forceNewVersion = args[1];

      sourceAndHtml = {
        source: this.sourceHandler.getLevelSource(),
        html: this.sourceHandler.getLevelHtml()
      };
    }

    if (forceNewVersion) {
      currentSourceVersionId = null;
    }

    $('.project_updated_at').text('Saving...');  // TODO (Josh) i18n
    var channelId = current.id;
    // TODO(dave): Remove this check and remove clearHtml() once all projects
    // have versioning: https://www.pivotaltracker.com/story/show/103347498
    if (currentSources.html && !sourceAndHtml.html) {
      throw new Error('Attempting to blow away existing levelHtml');
    }

    unpackSources(sourceAndHtml);
    if (this.getStandaloneApp()) {
      current.level = this.appToProjectUrl();
    }

    var filename = SOURCE_FILE + (currentSourceVersionId ? "?version=" + currentSourceVersionId : '');
    sources.put(channelId, packSources(), filename, function (err, response) {
      currentSourceVersionId = response.versionId;
      current.migratedToS3 = true;

      channels.update(channelId, current, function (err, data) {
        this.updateCurrentData_(err, data, false);
        executeCallback(callback, data);
      }.bind(this));
    }.bind(this));
  },
  updateCurrentData_: function (err, data, isNewChannel) {
    if (err) {
      $('.project_updated_at').text('Error saving project');  // TODO i18n
      return;
    }

    current = data;
    if (isNewChannel) {
      // We have a new channel, meaning either we had no channel before, or
      // we've changed channels. If we aren't at a /projects/<appname> link,
      // always do a redirect (i.e. we're remix from inside a script)
      if (isEditing && parsePath().appName) {
        if (window.history.pushState) {
          window.history.pushState(null, document.title, this.getPathName('edit'));
        }
      } else {
        // We're on a share page, and got a new channel id. Always do a redirect
        location.href = this.getPathName('edit');
      }
    }
    dashboard.header.updateTimestamp();
  },
  /**
   * Autosave the code if things have changed
   */
  autosave_: function () {
    // Bail if baseline code doesn't exist (app not yet initialized)
    if (currentSources.source === null) {
      return;
    }
    // `getLevelSource()` is expensive for Blockly so only call
    // after `workspaceChange` has fired
    if (!appOptions.droplet && !hasProjectChanged) {
      return;
    }

    if ($('#designModeViz .ui-draggable-dragging').length !== 0) {
      return;
    }

    var source = this.sourceHandler.getLevelSource();
    var html = this.sourceHandler.getLevelHtml();

    if (currentSources.source === source && currentSources.html === html) {
      hasProjectChanged = false;
      return;
    }

    this.save({source: source, html: html}, function () {
      hasProjectChanged = false;
    });
  },
  /**
   * Renames and saves the project.
   */
  rename: function(newName, callback) {
    this.setName(newName);
    this.save(callback);
  },
  /**
   * Freezes and saves the project. Also hides so that it's not available for deleting/renaming in the user's project list.
   */
  freeze: function(callback) {
    current.frozen = true;
    current.hidden = true;
    this.save(function(data) {
      executeCallback(callback, data);
      redirectEditView();
    });
  },
  /**
   * Creates a copy of the project, gives it the provided name, and sets the
   * copy as the current project.
   */
  copy: function(newName, callback) {
    var srcChannel = current.id;
    var wrappedCallback = this.copyAssets.bind(this, srcChannel, callback);
    delete current.id;
    delete current.hidden;
    this.setName(newName);
    channels.create(current, function (err, data) {
      this.updateCurrentData_(err, data, true);
      this.save(wrappedCallback);
    }.bind(this));
  },
  copyAssets: function (srcChannel, callback) {
    if (!srcChannel) {
      executeCallback(callback);
      return;
    }
    var destChannel = current.id;
    assets.copyAll(srcChannel, destChannel, function(err) {
      if (err) {
        $('.project_updated_at').text('Error copying files');  // TODO i18n
        return;
      }
      executeCallback(callback);
    });
  },
  serverSideRemix: function() {
    if (current && !current.name) {
      if (projects.appToProjectUrl() === '/projects/algebra_game') {
        this.setName('Big Game Template');
      } else if (projects.appToProjectUrl() === '/projects/applab') {
        this.setName('My Project');
      }
    }
    function redirectToRemix() {
      location.href = projects.getPathName('remix');
    }
    // If the user is the owner, save before remixing on the server.
    if (current.isOwner) {
      projects.save(redirectToRemix);
    } else {
      redirectToRemix();
    }
  },
  createNew: function() {
    projects.save(function () {
      location.href = projects.appToProjectUrl() + '/new';
    });
  },
  delete: function(callback) {
    var channelId = current.id;
    channels.delete(channelId, function(err, data) {
      executeCallback(callback, data);
    });
  },
  /**
   * @returns {jQuery.Deferred} A deferred which will resolve when the project loads.
   */
  load: function () {
    var deferred = new $.Deferred();
    if (projects.isProjectLevel()) {
      if (redirectFromHashUrl() || redirectEditView()) {
        deferred.resolve();
        return deferred;
      }
      var pathInfo = parsePath();

      if (pathInfo.channelId) {
        if (pathInfo.action === 'edit') {
          isEditing = true;
        } else {
          $('#betainfo').hide();
        }

        // Load the project ID, if one exists
        channels.fetch(pathInfo.channelId, function (err, data) {
          if (err) {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname.split('/')
              .slice(PathPart.START, PathPart.APP + 1).join('/');
          } else {
            fetchSource(data, function () {
              if (current.isOwner && pathInfo.action === 'view') {
                isEditing = true;
              }
              fetchAbuseScore(function () {
                deferred.resolve();
              });
            });
          }
        });
      } else {
        isEditing = true;
        deferred.resolve();
      }
    } else if (appOptions.isChannelBacked) {
      isEditing = true;
      channels.fetch(appOptions.channel, function(err, data) {
        if (err) {
          deferred.reject();
        } else {
          fetchSource(data, function () {
            projects.showProjectLevelHeader();
            fetchAbuseScore(function () {
              deferred.resolve();
            });
          });
        }
      });
    } else {
      deferred.resolve();
    }
    return deferred;
  },

  /**
   * Generates the url to perform the specified action for this project.
   * @param {string} action Action to perform.
   * @returns {string} Url to the specified action.
   * @throws {Error} If this type of project does not have a standalone app.
   */
  getPathName: function (action) {
    var pathName = this.appToProjectUrl() + '/' + this.getCurrentId();
    if (action) {
      pathName += '/' + action;
    }
    return pathName;
  }
};

/**
 * Given data from our channels api, updates current and gets sources from
 * sources api
 * @param {object} channelData Data we fetched from channels api
 * @param {function} callback
 */
function fetchSource(channelData, callback) {
  // Explicitly remove levelSource/levelHtml from channels
  delete channelData.levelSource;
  delete channelData.levelHtml;
  // Also clear out html, which we never should have been setting.
  delete channelData.html;

  // Update current
  current = channelData;

  projects.setTitle(current.name);
  if (channelData.migratedToS3) {
    sources.fetch(current.id + '/' + SOURCE_FILE, function (err, data) {
      unpackSources(data);
      callback();
    });
  } else {
    // It's possible that we created a channel, but failed to save anything to
    // S3. In this case, it's expected that html/levelSource are null.
    callback();
  }
}

function fetchAbuseScore(callback) {
  channels.fetch(current.id + '/abuse', function (err, data) {
    currentAbuseScore = (data && data.abuse_score) || currentAbuseScore;
    callback();
    if (err) {
      // Throw an error so that things like New Relic see this. This shouldn't
      // affect anything else
      throw err;
    }
  });
}

/**
 * Only execute the given argument if it is a function.
 * @param callback
 */
function executeCallback(callback, data) {
  if (typeof callback === 'function') {
    callback(data);
  }
}

/**
 * is the current project (if any) editable by the logged in user (if any)?
 */
function isEditable() {
  return (current && current.isOwner && !current.frozen);
}

/**
 * If the current user is the owner, we want to redirect from the readonly
 * /view route to /edit. If they are not the owner, we want to redirect from
 * /edit to /view
 */
function redirectEditView() {
  var parseInfo = parsePath();
  if (!parseInfo.action) {
    return;
  }
  // don't do any redirecting if we havent loaded a channel yet
  if (!current) {
    return;
  }
  var newUrl;
  if (parseInfo.action === 'view' && isEditable()) {
    // Redirect to /edit without a readonly workspace
    newUrl = location.href.replace(/(\/projects\/[^/]+\/[^/]+)\/view/, '$1/edit');
    appOptions.readonlyWorkspace = false;
    isEditing = true;
  } else if (parseInfo.action === 'edit' && !isEditable()) {
    // Redirect to /view with a readonly workspace
    newUrl = location.href.replace(/(\/projects\/[^/]+\/[^/]+)\/edit/, '$1/view');
    appOptions.readonlyWorkspace = true;
    isEditing = false;
  }

  // PushState to the new Url if we can, otherwise do nothing.
  if (newUrl && newUrl !== location.href && window.history.pushState) {
    window.history.pushState({modified: true}, document.title, newUrl);
  }
  return false;
}

/**
 * Does a hard redirect if we end up with a hash based projects url. This can
 * happen on IE9, when we save a new project for hte first time.
 * @returns {boolean} True if we did an actual redirect
 */
function redirectFromHashUrl() {
  var newUrl = location.href.replace('#', '/');
  if (newUrl === location.href) {
    // Nothing changed
    return false;
  }

  var pathInfo = parsePath();
  location.href = newUrl;
  return true;
}

/**
 * Extracts the channelId/action from the pathname, accounting for the fact
 * that we may have hash based route or not
 */
function parsePath() {
  var pathname = location.pathname;

  // We have a hash based route. Replace the hash with a slash, and append to
  // our existing path
  if (location.hash) {
    pathname += location.hash.replace('#', '/');
  }

  if (pathname.split('/')[PathPart.PROJECTS] !== 'p' &&
      pathname.split('/')[PathPart.PROJECTS] !== 'projects') {
    return {
      appName: null,
      channelId: null,
      action: null,
    };
  }

  return {
    appName: pathname.split('/')[PathPart.APP],
    channelId: pathname.split('/')[PathPart.CHANNEL_ID],
    action: pathname.split('/')[PathPart.ACTION]
  };
}

},{"./clientApi":2}],6:[function(require,module,exports){
/* global dashboard, React */

/**
 * Renders our AbuseExclamation component, and potentially updates admin box
 */
module.exports = function () {
  React.render(React.createElement(window.dashboard.AbuseExclamation, {
    i18n: {
      tos: window.dashboard.i18n.t('project.abuse.tos'),
      contact_us: window.dashboard.i18n.t('project.abuse.contact_us'),
      edit_project: window.dashboard.i18n.t('project.edit_project'),
      go_to_code_studio: window.dashboard.i18n.t('project.abuse.go_to_code_studio')
    },
    isOwner: dashboard.project.isOwner()
  }), document.getElementById('codeApp'));

  // update admin box (if it exists) with abuse info
  dashboard.admin.showProjectAdmin();
};

},{}],7:[function(require,module,exports){
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

},{}]},{},[3]);
