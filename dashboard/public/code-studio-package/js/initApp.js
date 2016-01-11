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
        source = Blockly.mainBlockSpace.isReadOnly() ? currentLevelSource :
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
/* global dashboard, appOptions */

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

    if (appOptions.publicCaching) {
      // Disable social share by default on publicly-cached pages, because we don't know
      // if the user is underage until we get data back from /api/user_progress/ and we
      // should err on the side of not showing social links
      appOptions.disableSocialShare = true;
    }

    $.ajax('/api/user_progress/' + appOptions.scriptName + '/' + appOptions.stagePosition + '/' + appOptions.levelPosition).done(function (data) {
      appOptions.disableSocialShare = data.disableSocialShare;

      // Merge progress from server (loaded via AJAX)
      var serverProgress = data.progress || {};
      var clientProgress = dashboard.clientState.allLevelsProgress()[appOptions.scriptName] || {};
      Object.keys(serverProgress).forEach(function (levelId) {
        if (serverProgress[levelId] !== clientProgress[levelId]) {
          var status = dashboard.progress.mergedActivityCssClass(clientProgress[levelId], serverProgress[levelId]);

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

      if (data.disablePostMilestone) {
        $("#progresswarning").show();
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
 * @property {string} levelHtml
 * @property {string} levelSource
 * @property {boolean} hidden Doesn't show up in project list
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

  showShareRemixHeader: function() {
    if (this.shouldUpdateHeaders()) {
      dashboard.header.showShareRemixHeader();
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

        if (current.hidden) {
          if (!this.isFrozen()) {
            this.showShareRemixHeader();
          }
        } else {
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
            projects.showShareRemixHeader();
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaW5pdEFwcC9jaHJvbWUzNEZpeC5qcyIsInNyYy9qcy9pbml0QXBwL2NsaWVudEFwaS5qcyIsInNyYy9qcy9pbml0QXBwL2luaXRBcHAuanMiLCJzcmMvanMvaW5pdEFwcC9sb2FkQXBwLmpzIiwic3JjL2pzL2luaXRBcHAvcHJvamVjdC5qcyIsInNyYy9qcy9pbml0QXBwL3JlbmRlckFidXNpdmUuanMiLCJzcmMvanMvaW5pdEFwcC90aW1pbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3B3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIFdlYktpdE11dGF0aW9uT2JzZXJ2ZXIgKi9cblxuLyoqXG4gKiBXb3JrYXJvdW5kIGZvciBDaHJvbWUgMzQgU1ZHIGJ1ZyAjMzQ5NzAxXG4gKlxuICogQnVnIGRldGFpbHM6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zNDk3MDFcbiAqICAgdGw7ZHI6IG9ubHkgdGhlIGZpcnN0IGNsaXBwYXRoIGluIGEgZ2l2ZW4gc3ZnIGVsZW1lbnQgcmVuZGVyc1xuICpcbiAqIFdvcmthcm91bmQ6IHdyYXAgYWxsIGNsaXBwYXRoL2ltYWdlIHBhaXJzIGludG8gdGhlaXIgb3duIHN2ZyBlbGVtZW50c1xuICpcbiAqIDEuIFdyYXAgYW55IGV4aXN0aW5nIGNsaXBwYXRoL2ltYWdlIHBhaXJzIGluIGVtcHR5IHN2ZyBlbGVtZW50c1xuICogMi4gV3JhcCBuZXcgY2xpcHBhdGgvaW1hZ2UgcGFpcnMgb25jZSBhZGRlZCwgcmVtb3ZlIGVtcHR5IHdyYXBwZXJzIG9uY2UgcmVtb3ZlZFxuICogMy4gRmFybWVyIHNwZWNpYWwgY2FzZTogZ2l2ZSB0aGUgZmFybWVyJ3Mgd3JhcHBlciBzdmcgdGhlIFwicGVnbWFuLWxvY2F0aW9uXCIgYXR0cmlidXRlXG4gKi9cblxudmFyIFBFR01BTl9PUkRFUklOR19DTEFTUyA9ICdwZWdtYW4tbG9jYXRpb24nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZml4dXA6IGZ1bmN0aW9uICgpIHtcbiAgICB3cmFwRXhpc3RpbmdDbGlwUGF0aHMoKTtcbiAgICBoYW5kbGVDbGlwUGF0aENoYW5nZXMoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2xpcFBhdGhJREZvckltYWdlKGltYWdlKSB7XG4gIHZhciBjbGlwUGF0aCA9ICQoaW1hZ2UpLmF0dHIoJ2NsaXAtcGF0aCcpO1xuICByZXR1cm4gY2xpcFBhdGggPyBjbGlwUGF0aC5tYXRjaCgvXFwoXFwjKC4qKVxcKS8pWzFdIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiB3cmFwSW1hZ2VBbmRDbGlwUGF0aFdpdGhTVkcoaW1hZ2UsIHdyYXBwZXJDbGFzcykge1xuICB2YXIgc3ZnV3JhcHBlciA9ICQoJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiAvPicpO1xuICBpZiAod3JhcHBlckNsYXNzKSB7XG4gICAgc3ZnV3JhcHBlci5hdHRyKCdjbGFzcycsIHdyYXBwZXJDbGFzcyk7XG4gIH1cblxuICB2YXIgY2xpcFBhdGhJRCA9IGNsaXBQYXRoSURGb3JJbWFnZShpbWFnZSk7XG4gIHZhciBjbGlwUGF0aCA9ICQoJyMnICsgY2xpcFBhdGhJRCk7XG4gIGNsaXBQYXRoLmluc2VydEFmdGVyKGltYWdlKS5hZGQoaW1hZ2UpLndyYXBBbGwoc3ZnV3JhcHBlcik7XG59XG5cbi8vIEZpbmQgcGFpcnMgb2YgbmV3IGltYWdlcyBhbmQgY2xpcCBwYXRocywgd3JhcHBpbmcgdGhlbSBpbiBTVkcgdGFncyB3aGVuIGEgcGFpciBpcyBmb3VuZFxuZnVuY3Rpb24gaGFuZGxlQ2xpcFBhdGhDaGFuZ2VzKCkge1xuICB2YXIgaTtcbiAgdmFyIGNhbnZhcyA9ICQoJyN2aXN1YWxpemF0aW9uPnN2ZycpWzBdO1xuICBpZiAoIWNhbnZhcykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBuZXdJbWFnZXMgPSB7fTtcbiAgdmFyIG5ld0NsaXBQYXRocyA9IHt9O1xuXG4gIHZhciBvYnNlcnZlciA9IG5ldyBXZWJLaXRNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG11dGF0aW9uKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV3Tm9kZSA9IG11dGF0aW9uLmFkZGVkTm9kZXNbaV07XG4gICAgICAgIGlmIChuZXdOb2RlLm5vZGVOYW1lID09ICdpbWFnZScpIHsgbmV3SW1hZ2VzWyQobmV3Tm9kZSkuYXR0cignaWQnKV0gPSBuZXdOb2RlOyB9XG4gICAgICAgIGlmIChuZXdOb2RlLm5vZGVOYW1lID09ICdjbGlwUGF0aCcpIHsgbmV3Q2xpcFBhdGhzWyQobmV3Tm9kZSkuYXR0cignaWQnKV0gPSBuZXdOb2RlOyB9XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbXV0YXRpb24ucmVtb3ZlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZW1vdmVkTm9kZSA9IG11dGF0aW9uLnJlbW92ZWROb2Rlc1tpXTtcbiAgICAgICAgaWYgKHJlbW92ZWROb2RlLm5vZGVOYW1lID09ICdpbWFnZScgfHwgcmVtb3ZlZE5vZGUubm9kZU5hbWUgPT0gJ2NsaXBQYXRoJykge1xuICAgICAgICAgICQoJ3N2ZyA+IHN2ZzplbXB0eScpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkLmVhY2gobmV3SW1hZ2VzLCBmdW5jdGlvbihrZXksIGltYWdlKSB7XG4gICAgICB2YXIgY2xpcFBhdGhJRCA9IGNsaXBQYXRoSURGb3JJbWFnZShpbWFnZSk7XG4gICAgICBpZiAobmV3Q2xpcFBhdGhzLmhhc093blByb3BlcnR5KGNsaXBQYXRoSUQpKSB7XG4gICAgICAgIHdyYXBJbWFnZUFuZENsaXBQYXRoV2l0aFNWRyhpbWFnZSk7XG4gICAgICAgIGRlbGV0ZSBuZXdJbWFnZXNba2V5XTtcbiAgICAgICAgZGVsZXRlIG5ld0NsaXBQYXRoc1tjbGlwUGF0aElEXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgb2JzZXJ2ZXIub2JzZXJ2ZShjYW52YXMsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xufVxuXG5mdW5jdGlvbiB3cmFwRXhpc3RpbmdDbGlwUGF0aHMoKSB7XG4gICQoJ1tjbGlwLXBhdGhdJykuZWFjaChmdW5jdGlvbihpLCBpbWFnZSl7XG4gICAgaWYgKCQoaW1hZ2UpLmF0dHIoJ2NsYXNzJykgPT09IFBFR01BTl9PUkRFUklOR19DTEFTUykge1xuICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciBGYXJtZXIsIHdob3NlIGNsYXNzIGlzIHVzZWQgZm9yIGVsZW1lbnQgb3JkZXJpbmdcbiAgICAgICQoaW1hZ2UpLmF0dHIoJ2NsYXNzJywgJycpO1xuICAgICAgd3JhcEltYWdlQW5kQ2xpcFBhdGhXaXRoU1ZHKGltYWdlLCBQRUdNQU5fT1JERVJJTkdfQ0xBU1MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cmFwSW1hZ2VBbmRDbGlwUGF0aFdpdGhTVkcoaW1hZ2UpO1xuICAgIH1cbiAgfSk7XG59XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBBUEkgb2JqZWN0IHRoYXQgd3JhcHMgYXN5bmNocm9ub3VzIGNhbGxzIHRvIG91ciBkYXRhIEFQSXMuXG4gKi9cblxuLyoqXG4gKiBTdGFuZGFyZCBjYWxsYmFjayBmb3JtIGZvciBhc3luY2hyb25vdXMgb3BlcmF0aW9ucywgcG9wdWxhcml6ZWQgYnkgTm9kZS5cbiAqIEB0eXBlZGVmIHtmdW5jdGlvbn0gTm9kZVN0eWxlQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J8bnVsbH0gZXJyb3IgLSBudWxsIGlmIHRoZSBhc3luYyBvcGVyYXRpb24gd2FzIHN1Y2Nlc3NmdWwuXG4gKiBAcGFyYW0geyp9IHJlc3VsdCAtIHJldHVybiB2YWx1ZSBmb3IgYXN5bmMgb3BlcmF0aW9uLlxuICovXG5cbi8qKlxuICogQG5hbWUgQ2xpZW50QXBpXG4gKi9cbnZhciBiYXNlID0ge1xuICAvKipcbiAgICogQmFzZSBVUkwgZm9yIHRhcmdldCBBUEkuXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICBhcGlfYmFzZV91cmw6IFwiL3YzL2NoYW5uZWxzXCIsXG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgYWxsIGNvbGxlY3Rpb25zLlxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyBhbiBhcnJheSBvZlxuICAgKiAgICAgICAgY29sbGVjdGlvbiBvYmplY3RzLlxuICAgKi9cbiAgYWxsOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsLFxuICAgICAgdHlwZTogXCJnZXRcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEluc2VydCBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIGNvbGxlY3Rpb24gY29udGVudHMsIG11c3QgYmUgSlNPTi5zdHJpbmdpZnktYWJsZS5cbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2sgLSBFeHBlY3RlZCByZXN1bHQgaXMgdGhlIGNyZWF0ZWRcbiAgICogICAgICAgIGNvbGxlY3Rpb24gb2JqZWN0ICh3aGljaCB3aWxsIGluY2x1ZGUgYW4gYXNzaWduZWQgJ2lkJyBrZXkpLlxuICAgKi9cbiAgY3JlYXRlOiBmdW5jdGlvbih2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCxcbiAgICAgIHR5cGU6IFwicG9zdFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0KSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKHJlcXVlc3QsIHN0YXR1cywgZXJyb3IpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3N0YXR1czogJyArIHN0YXR1cyArICc7IGVycm9yOiAnICsgZXJyb3IpO1xuICAgICAgY2FsbGJhY2soZXJyLCB1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBjb2xsZWN0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2hpbGRQYXRoIFRoZSBwYXRoIHVuZGVybmVhdGggYXBpX2Jhc2VfdXJsXG4gICAqIEBwYXJhbSB7Tm9kZVN0eWxlQ2FsbGJhY2t9IGNhbGxiYWNrIC0gRXhwZWN0ZWQgcmVzdWx0IGlzIFRSVUUuXG4gICAqL1xuICBkZWxldGU6IGZ1bmN0aW9uKGNoaWxkUGF0aCwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgY2hpbGRQYXRoICsgXCIvZGVsZXRlXCIsXG4gICAgICB0eXBlOiBcInBvc3RcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgdHJ1ZSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgZmFsc2UpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGlsZFBhdGggVGhlIHBhdGggdW5kZXJuZWF0aCBhcGlfYmFzZV91cmxcbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2sgLSBFeHBlY3RlZCByZXN1bHQgaXMgdGhlIHJlcXVlc3RlZFxuICAgKiAgICAgICAgY29sbGVjdGlvbiBvYmplY3QuXG4gICAqL1xuICBmZXRjaDogZnVuY3Rpb24oY2hpbGRQYXRoLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBjaGlsZFBhdGgsXG4gICAgICB0eXBlOiBcImdldFwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgdW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBjb250ZW50cyBvZiBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGlsZFBhdGggVGhlIHBhdGggdW5kZXJuZWF0aCBhcGlfYmFzZV91cmxcbiAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIC0gVGhlIG5ldyBjb2xsZWN0aW9uIGNvbnRlbnRzLlxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyB0aGUgbmV3IGNvbGxlY3Rpb25cbiAgICogICAgICAgIG9iamVjdC5cbiAgICovXG4gIHVwZGF0ZTogZnVuY3Rpb24oY2hpbGRQYXRoLCB2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgY2hpbGRQYXRoLFxuICAgICAgdHlwZTogXCJwb3N0XCIsXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ29weSB0byB0aGUgZGVzdGluYXRpb24gY29sbGVjdGlvbiwgc2luY2Ugd2UgZXhwZWN0IHRoZSBkZXN0aW5hdGlvblxuICAgKiB0byBiZSBlbXB0eS4gQSB0cnVlIHJlc3QgQVBJIHdvdWxkIHJlcGxhY2UgdGhlIGRlc3RpbmF0aW9uIGNvbGxlY3Rpb246XG4gICAqIEBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVwcmVzZW50YXRpb25hbF9zdGF0ZV90cmFuc2ZlciNBcHBsaWVkX3RvX3dlYl9zZXJ2aWNlc1xuICAgKiBAcGFyYW0geyp9IHNyYyAtIFNvdXJjZSBjb2xsZWN0aW9uIGlkZW50aWZpZXIuXG4gICAqIEBwYXJhbSB7Kn0gZGVzdCAtIERlc3RpbmF0aW9uIGNvbGxlY3Rpb24gaWRlbnRpZmllci5cbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2tcbiAgICovXG4gIGNvcHlBbGw6IGZ1bmN0aW9uKHNyYywgZGVzdCwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgZGVzdCArICc/c3JjPScgKyBzcmMsXG4gICAgICB0eXBlOiBcInB1dFwiXG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0KSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKHJlcXVlc3QsIHN0YXR1cywgZXJyb3IpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3N0YXR1czogJyArIHN0YXR1cyArICc7IGVycm9yOiAnICsgZXJyb3IpO1xuICAgICAgY2FsbGJhY2soZXJyLCBmYWxzZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgdGhlIGNvbnRlbnRzIG9mIGFuIGFzc2V0IG9yIHNvdXJjZSBmaWxlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaWQgLSBUaGUgY29sbGVjdGlvbiBpZGVudGlmaWVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgLSBUaGUgbmV3IGZpbGUgY29udGVudHMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIGNyZWF0ZSBvciB1cGRhdGUuXG4gICAqIEBwYXJhbSB7Tm9kZVN0eWxlQ2FsbGJhY2t9IGNhbGxiYWNrIC0gRXhwZWN0ZWQgcmVzdWx0IGlzIHRoZSBuZXcgY29sbGVjdGlvblxuICAgKiAgICAgICAgb2JqZWN0LlxuICAgKi9cbiAgcHV0OiBmdW5jdGlvbihpZCwgdmFsdWUsIGZpbGVuYW1lLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBpZCArIFwiL1wiICsgZmlsZW5hbWUsXG4gICAgICB0eXBlOiBcInB1dFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogdmFsdWVcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogTW9kaWZ5IHRoZSBjb250ZW50cyBvZiBhIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkIC0gVGhlIGNvbGxlY3Rpb24gaWRlbnRpZmllci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5UGFyYW1zIC0gQW55IHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIC0gVGhlIHJlcXVlc3QgYm9keVxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyB0aGUgbmV3IGNvbGxlY3Rpb25cbiAgICogICAgICAgIG9iamVjdC5cbiAgICovXG4gIHBhdGNoQWxsOiBmdW5jdGlvbihpZCwgcXVlcnlQYXJhbXMsIHZhbHVlLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBpZCArIFwiLz9cIiArIHF1ZXJ5UGFyYW1zLFxuICAgICAgdHlwZTogXCJwYXRjaFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogdmFsdWVcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxufTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvKipcbiAgICogQ3JlYXRlIGEgQ2xpZW50QXBpIGluc3RhbmNlIHdpdGggdGhlIGdpdmVuIGJhc2UgVVJMLlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IHVybCAtIEN1c3RvbSBBUEkgYmFzZSB1cmwgKGUuZy4gJy92My9uZXRzaW0nKVxuICAgKiBAcmV0dXJucyB7Q2xpZW50QXBpfVxuICAgKi9cbiAgY3JlYXRlOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgcmV0dXJuICQuZXh0ZW5kKHt9LCBiYXNlLCB7XG4gICAgICBhcGlfYmFzZV91cmw6IHVybFxuICAgIH0pO1xuICB9XG59O1xuIiwiLy8gVE9ETyAoYnJlbnQpIC0gd2F5IHRvbyBtYW55IGdsb2JhbHNcbi8qIGdsb2JhbCBzY3JpcHRfcGF0aCwgRGlhbG9nLCBDRE9Tb3VuZHMsIGRhc2hib2FyZCwgYXBwT3B0aW9ucywgdHJhY2tFdmVudCwgQXBwbGFiLCBCbG9ja2x5LCBzZW5kUmVwb3J0LCBjYW5jZWxSZXBvcnQsIGxhc3RTZXJ2ZXJSZXNwb25zZSwgc2hvd1ZpZGVvRGlhbG9nLCBnYSwgZGlnZXN0TWFuaWZlc3QqL1xuXG52YXIgdGltaW5nID0gcmVxdWlyZSgnLi90aW1pbmcnKTtcbnZhciBjaHJvbWUzNEZpeCA9IHJlcXVpcmUoJy4vY2hyb21lMzRGaXgnKTtcbnZhciBsb2FkQXBwID0gcmVxdWlyZSgnLi9sb2FkQXBwJyk7XG52YXIgcHJvamVjdCA9IHJlcXVpcmUoJy4vcHJvamVjdCcpO1xuXG53aW5kb3cuYXBwcyA9IHtcbiAgLy8gTG9hZHMgdGhlIGRlcGVuZGVuY2llcyBmb3IgdGhlIGN1cnJlbnQgYXBwIGJhc2VkIG9uIHZhbHVlcyBpbiBgYXBwT3B0aW9uc2AuXG4gIC8vIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgb25jZSBkZXBlbmRlbmNpZXMgYXJlIHJlYWR5LlxuICBsb2FkOiBsb2FkQXBwLFxuICAvLyBMZWdhY3kgQmxvY2tseSBpbml0aWFsaXphdGlvbiB0aGF0IHdhcyBtb3ZlZCBoZXJlIGZyb20gX2Jsb2NrbHkuaHRtbC5oYW1sLlxuICAvLyBNb2RpZmllcyBgYXBwT3B0aW9uc2Agd2l0aCBzb21lIGRlZmF1bHQgdmFsdWVzIGluIGBiYXNlT3B0aW9uc2AuXG4gIC8vIFRPRE8oZGF2ZSk6IE1vdmUgYmxvY2tseS1zcGVjaWZpYyBzZXR1cCBmdW5jdGlvbiBvdXQgb2Ygc2hhcmVkIGFuZCBiYWNrIGludG8gZGFzaGJvYXJkLlxuICBzZXR1cEFwcDogZnVuY3Rpb24gKGFwcE9wdGlvbnMpIHtcblxuICAgIGlmICghd2luZG93LmRhc2hib2FyZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3N1bWUgZXhpc3RlbmNlIG9mIHdpbmRvdy5kYXNoYm9hcmQnKTtcbiAgICB9XG4gICAgZGFzaGJvYXJkLnByb2plY3QgPSBwcm9qZWN0O1xuXG4gICAgdGltaW5nLnN0YXJ0VGltaW5nKCdQdXp6bGUnLCBzY3JpcHRfcGF0aCwgJycpO1xuXG4gICAgdmFyIGxhc3RTYXZlZFByb2dyYW07XG5cbiAgICAvLyBTZXRzIHVwIGRlZmF1bHQgb3B0aW9ucyBhbmQgaW5pdGlhbGl6ZXMgYmxvY2tseVxuICAgIHZhciBiYXNlT3B0aW9ucyA9IHtcbiAgICAgIGNvbnRhaW5lcklkOiAnY29kZUFwcCcsXG4gICAgICBEaWFsb2c6IERpYWxvZyxcbiAgICAgIGNkb1NvdW5kczogQ0RPU291bmRzLFxuICAgICAgcG9zaXRpb246IHtibG9ja1lDb29yZGluYXRlSW50ZXJ2YWw6IDI1fSxcbiAgICAgIG9uSW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRhc2hib2FyZC5jcmVhdGVDYWxsb3V0cyh0aGlzLmxldmVsLmNhbGxvdXRzIHx8IHRoaXMuY2FsbG91dHMpO1xuICAgICAgICBpZiAod2luZG93LmRhc2hib2FyZC5pc0Nocm9tZTM0KSB7XG4gICAgICAgICAgY2hyb21lMzRGaXguZml4dXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXBwT3B0aW9ucy5sZXZlbC5wcm9qZWN0VGVtcGxhdGVMZXZlbE5hbWUgfHwgYXBwT3B0aW9ucy5hcHAgPT09ICdhcHBsYWInKSB7XG4gICAgICAgICAgJCgnI2NsZWFyLXB1enpsZS1oZWFkZXInKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI3ZlcnNpb25zLWhlYWRlcicpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdhcHBJbml0aWFsaXplZCcpO1xuICAgICAgfSxcbiAgICAgIG9uQXR0ZW1wdDogZnVuY3Rpb24ocmVwb3J0KSB7XG4gICAgICAgIGlmIChhcHBPcHRpb25zLmxldmVsLmlzUHJvamVjdExldmVsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcHBPcHRpb25zLmNoYW5uZWwpIHtcbiAgICAgICAgICAvLyBEb24ndCBzZW5kIHRoZSBsZXZlbFNvdXJjZSBvciBpbWFnZSB0byBEYXNoYm9hcmQgZm9yIGNoYW5uZWwtYmFja2VkIGxldmVscy5cbiAgICAgICAgICAvLyAoVGhlIGxldmVsU291cmNlIGlzIGFscmVhZHkgc3RvcmVkIGluIHRoZSBjaGFubmVscyBBUEkuKVxuICAgICAgICAgIGRlbGV0ZSByZXBvcnQucHJvZ3JhbTtcbiAgICAgICAgICBkZWxldGUgcmVwb3J0LmltYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE9ubHkgbG9jYWxseSBjYWNoZSBub24tY2hhbm5lbC1iYWNrZWQgbGV2ZWxzLiBVc2UgYSBjbGllbnQtZ2VuZXJhdGVkXG4gICAgICAgICAgLy8gdGltZXN0YW1wIGluaXRpYWxseSAoaXQgd2lsbCBiZSB1cGRhdGVkIHdpdGggYSB0aW1lc3RhbXAgZnJvbSB0aGUgc2VydmVyXG4gICAgICAgICAgLy8gaWYgd2UgZ2V0IGEgcmVzcG9uc2UuXG4gICAgICAgICAgbGFzdFNhdmVkUHJvZ3JhbSA9IGRlY29kZVVSSUNvbXBvbmVudChyZXBvcnQucHJvZ3JhbSk7XG4gICAgICAgICAgZGFzaGJvYXJkLmNsaWVudFN0YXRlLndyaXRlU291cmNlRm9yTGV2ZWwoYXBwT3B0aW9ucy5zY3JpcHROYW1lLCBhcHBPcHRpb25zLnNlcnZlckxldmVsSWQsICtuZXcgRGF0ZSgpLCBsYXN0U2F2ZWRQcm9ncmFtKTtcbiAgICAgICAgfVxuICAgICAgICByZXBvcnQuc2NyaXB0TmFtZSA9IGFwcE9wdGlvbnMuc2NyaXB0TmFtZTtcbiAgICAgICAgcmVwb3J0LmZhbGxiYWNrUmVzcG9uc2UgPSBhcHBPcHRpb25zLnJlcG9ydC5mYWxsYmFja19yZXNwb25zZTtcbiAgICAgICAgcmVwb3J0LmNhbGxiYWNrID0gYXBwT3B0aW9ucy5yZXBvcnQuY2FsbGJhY2s7XG4gICAgICAgIC8vIFRyYWNrIHB1enpsZSBhdHRlbXB0IGV2ZW50XG4gICAgICAgIHRyYWNrRXZlbnQoJ1B1enpsZScsICdBdHRlbXB0Jywgc2NyaXB0X3BhdGgsIHJlcG9ydC5wYXNzID8gMSA6IDApO1xuICAgICAgICBpZiAocmVwb3J0LnBhc3MpIHtcbiAgICAgICAgICB0cmFja0V2ZW50KCdQdXp6bGUnLCAnU3VjY2VzcycsIHNjcmlwdF9wYXRoLCByZXBvcnQuYXR0ZW1wdCk7XG4gICAgICAgICAgdGltaW5nLnN0b3BUaW1pbmcoJ1B1enpsZScsIHNjcmlwdF9wYXRoLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHJhY2tFdmVudCgnQWN0aXZpdHknLCAnTGluZXMgb2YgQ29kZScsIHNjcmlwdF9wYXRoLCByZXBvcnQubGluZXMpO1xuICAgICAgICBzZW5kUmVwb3J0KHJlcG9ydCk7XG4gICAgICB9LFxuICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmICghYXBwT3B0aW9ucy5jaGFubmVsKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBjYWNoZSB0aW1lc3RhbXAgd2l0aCB0aGUgKG1vcmUgYWNjdXJhdGUpIHZhbHVlIGZyb20gdGhlIHNlcnZlci5cbiAgICAgICAgICBkYXNoYm9hcmQuY2xpZW50U3RhdGUud3JpdGVTb3VyY2VGb3JMZXZlbChhcHBPcHRpb25zLnNjcmlwdE5hbWUsIGFwcE9wdGlvbnMuc2VydmVyTGV2ZWxJZCwgcmVzcG9uc2UudGltZXN0YW1wLCBsYXN0U2F2ZWRQcm9ncmFtKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uUmVzZXRQcmVzc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FuY2VsUmVwb3J0KCk7XG4gICAgICB9LFxuICAgICAgb25Db250aW51ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChsYXN0U2VydmVyUmVzcG9uc2UudmlkZW9JbmZvKSB7XG4gICAgICAgICAgc2hvd1ZpZGVvRGlhbG9nKGxhc3RTZXJ2ZXJSZXNwb25zZS52aWRlb0luZm8pO1xuICAgICAgICB9IGVsc2UgaWYgKGxhc3RTZXJ2ZXJSZXNwb25zZS5uZXh0UmVkaXJlY3QpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGxhc3RTZXJ2ZXJSZXNwb25zZS5uZXh0UmVkaXJlY3Q7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBiYWNrVG9QcmV2aW91c0xldmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGxhc3RTZXJ2ZXJSZXNwb25zZS5wcmV2aW91c0xldmVsUmVkaXJlY3QpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGxhc3RTZXJ2ZXJSZXNwb25zZS5wcmV2aW91c0xldmVsUmVkaXJlY3Q7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzaG93SW5zdHJ1Y3Rpb25zV3JhcHBlcjogZnVuY3Rpb24oc2hvd0luc3RydWN0aW9ucykge1xuICAgICAgICAvLyBBbHdheXMgc2tpcCBhbGwgcHJlLWxldmVsIHBvcHVwcyBvbiBzaGFyZSBsZXZlbHMgb3Igd2hlbiBjb25maWd1cmVkIHRodXNcbiAgICAgICAgaWYgKHRoaXMuc2hhcmUgfHwgYXBwT3B0aW9ucy5sZXZlbC5za2lwSW5zdHJ1Y3Rpb25zUG9wdXApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYWZ0ZXJWaWRlb0NhbGxiYWNrID0gc2hvd0luc3RydWN0aW9ucztcbiAgICAgICAgaWYgKGFwcE9wdGlvbnMubGV2ZWwuYWZ0ZXJWaWRlb0JlZm9yZUluc3RydWN0aW9uc0ZuKSB7XG4gICAgICAgICAgYWZ0ZXJWaWRlb0NhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXBwT3B0aW9ucy5sZXZlbC5hZnRlclZpZGVvQmVmb3JlSW5zdHJ1Y3Rpb25zRm4oc2hvd0luc3RydWN0aW9ucyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYXNWaWRlbyA9ICEhYXBwT3B0aW9ucy5hdXRvcGxheVZpZGVvO1xuICAgICAgICB2YXIgaGFzSW5zdHJ1Y3Rpb25zID0gISEoYXBwT3B0aW9ucy5sZXZlbC5pbnN0cnVjdGlvbnMgfHxcbiAgICAgICAgYXBwT3B0aW9ucy5sZXZlbC5hbmlHaWZVUkwpO1xuXG4gICAgICAgIGlmIChoYXNWaWRlbykge1xuICAgICAgICAgIGlmIChoYXNJbnN0cnVjdGlvbnMpIHtcbiAgICAgICAgICAgIGFwcE9wdGlvbnMuYXV0b3BsYXlWaWRlby5vbkNsb3NlID0gYWZ0ZXJWaWRlb0NhbGxiYWNrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzaG93VmlkZW9EaWFsb2coYXBwT3B0aW9ucy5hdXRvcGxheVZpZGVvKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNJbnN0cnVjdGlvbnMpIHtcbiAgICAgICAgICBhZnRlclZpZGVvQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgJC5leHRlbmQodHJ1ZSwgYXBwT3B0aW9ucywgYmFzZU9wdGlvbnMpO1xuXG4gICAgLy8gVHVybiBzdHJpbmcgdmFsdWVzIGludG8gZnVuY3Rpb25zIGZvciBrZXlzIHRoYXQgYmVnaW4gd2l0aCAnZm5fJyAoSlNPTiBjYW4ndCBjb250YWluIGZ1bmN0aW9uIGRlZmluaXRpb25zKVxuICAgIC8vIEUuZy4geyBmbl9leGFtcGxlOiAnZnVuY3Rpb24gKCkgeyByZXR1cm47IH0nIH0gYmVjb21lcyB7IGV4YW1wbGU6IGZ1bmN0aW9uICgpIHsgcmV0dXJuOyB9IH1cbiAgICAoZnVuY3Rpb24gZml4VXBGdW5jdGlvbnMobm9kZSkge1xuICAgICAgaWYgKHR5cGVvZiBub2RlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpIGluIG5vZGUpIHtcbiAgICAgICAgaWYgKC9eZm5fLy50ZXN0KGkpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbiAgICAgICAgICAgIG5vZGVbaS5yZXBsYWNlKC9eZm5fLywgJycpXSA9IGV2YWwoJygnICsgbm9kZVtpXSArICcpJyk7XG4gICAgICAgICAgICAvKiBqc2hpbnQgaWdub3JlOmVuZCAqL1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZml4VXBGdW5jdGlvbnMobm9kZVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KShhcHBPcHRpb25zLmxldmVsKTtcbiAgfSxcblxuICAvLyBTZXQgdXAgcHJvamVjdHMsIHNraXBwaW5nIGJsb2NrbHktc3BlY2lmaWMgc3RlcHMuIERlc2lnbmVkIGZvciB1c2VcbiAgLy8gYnkgbGV2ZWxzIG9mIHR5cGUgXCJleHRlcm5hbFwiLlxuICBzZXR1cFByb2plY3RzRXh0ZXJuYWw6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghd2luZG93LmRhc2hib2FyZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3N1bWUgZXhpc3RlbmNlIG9mIHdpbmRvdy5kYXNoYm9hcmQnKTtcbiAgICB9XG5cbiAgICBkYXNoYm9hcmQucHJvamVjdCA9IHByb2plY3Q7XG4gIH0sXG5cbiAgLy8gRGVmaW5lIGJsb2NrbHkvZHJvcGxldC1zcGVjaWZpYyBjYWxsYmFja3MgZm9yIHByb2plY3RzIHRvIGFjY2Vzc1xuICAvLyBsZXZlbCBzb3VyY2UsIEhUTUwgYW5kIGhlYWRlcnMuXG4gIC8vIFRPRE8oZGF2ZSk6IEV4dHJhY3QgYmxvY2tseS1zcGVjaWZpYyBoYW5kbGVyIGNvZGUgaW50byBfYmxvY2tseS5odG1sLmhhbWwuXG4gIHNvdXJjZUhhbmRsZXI6IHtcbiAgICBzZXRJbml0aWFsTGV2ZWxIdG1sOiBmdW5jdGlvbiAobGV2ZWxIdG1sKSB7XG4gICAgICBhcHBPcHRpb25zLmxldmVsLmxldmVsSHRtbCA9IGxldmVsSHRtbDtcbiAgICB9LFxuICAgIGdldExldmVsSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5BcHBsYWIgJiYgQXBwbGFiLmdldEh0bWwoKTtcbiAgICB9LFxuICAgIHNldEluaXRpYWxMZXZlbFNvdXJjZTogZnVuY3Rpb24gKGxldmVsU291cmNlKSB7XG4gICAgICBhcHBPcHRpb25zLmxldmVsLmxhc3RBdHRlbXB0ID0gbGV2ZWxTb3VyY2U7XG4gICAgfSxcbiAgICBnZXRMZXZlbFNvdXJjZTogZnVuY3Rpb24gKGN1cnJlbnRMZXZlbFNvdXJjZSkge1xuICAgICAgdmFyIHNvdXJjZTtcbiAgICAgIGlmICh3aW5kb3cuQmxvY2tseSkge1xuICAgICAgICAvLyBJZiB3ZSdyZSByZWFkT25seSwgc291cmNlIGhhc24ndCBjaGFuZ2VkIGF0IGFsbFxuICAgICAgICBzb3VyY2UgPSBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmlzUmVhZE9ubHkoKSA/IGN1cnJlbnRMZXZlbFNvdXJjZSA6XG4gICAgICAgICAgQmxvY2tseS5YbWwuZG9tVG9UZXh0KEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb3VyY2UgPSB3aW5kb3cuQXBwbGFiICYmIEFwcGxhYi5nZXRDb2RlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc291cmNlO1xuICAgIH0sXG4gIH0sXG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgQmxvY2tseSBvciBEcm9wbGV0IGFwcC5cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIGRhc2hib2FyZC5wcm9qZWN0LmluaXQod2luZG93LmFwcHMuc291cmNlSGFuZGxlcik7XG4gICAgd2luZG93W2FwcE9wdGlvbnMuYXBwICsgJ01haW4nXShhcHBPcHRpb25zKTtcbiAgfVxufTtcbiIsIi8qIGdsb2JhbCBkYXNoYm9hcmQsIGFwcE9wdGlvbnMgKi9cblxudmFyIHJlbmRlckFidXNpdmUgPSByZXF1aXJlKCcuL3JlbmRlckFidXNpdmUnKTtcblxuLy8gTWF4IG1pbGxpc2Vjb25kcyB0byB3YWl0IGZvciBsYXN0IGF0dGVtcHQgZGF0YSBmcm9tIHRoZSBzZXJ2ZXJcbnZhciBMQVNUX0FUVEVNUFRfVElNRU9VVCA9IDUwMDA7XG5cbi8vIExvYWRzIHRoZSBnaXZlbiBhcHAgc3R5bGVzaGVldC5cbmZ1bmN0aW9uIGxvYWRTdHlsZShuYW1lKSB7XG4gICQoJ2JvZHknKS5hcHBlbmQoJCgnPGxpbms+Jywge1xuICAgIHJlbDogJ3N0eWxlc2hlZXQnLFxuICAgIHR5cGU6ICd0ZXh0L2NzcycsXG4gICAgaHJlZjogYXBwT3B0aW9ucy5iYXNlVXJsICsgJ2Nzcy8nICsgbmFtZSArICcuY3NzJ1xuICB9KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIHZhciBsYXN0QXR0ZW1wdExvYWRlZCA9IGZhbHNlO1xuXG4gIHZhciBsb2FkTGFzdEF0dGVtcHRGcm9tU2Vzc2lvblN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFsYXN0QXR0ZW1wdExvYWRlZCkge1xuICAgICAgbGFzdEF0dGVtcHRMb2FkZWQgPSB0cnVlO1xuXG4gICAgICAvLyBMb2FkIHRoZSBsb2NhbGx5LWNhY2hlZCBsYXN0IGF0dGVtcHQgKGlmIG9uZSBleGlzdHMpXG4gICAgICBzZXRMYXN0QXR0ZW1wdFVubGVzc0ppZ3NhdyhkYXNoYm9hcmQuY2xpZW50U3RhdGUuc291cmNlRm9yTGV2ZWwoXG4gICAgICAgICAgYXBwT3B0aW9ucy5zY3JpcHROYW1lLCBhcHBPcHRpb25zLnNlcnZlckxldmVsSWQpKTtcblxuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGlzVmlld2luZ1NvbHV0aW9uID0gKGRhc2hib2FyZC5jbGllbnRTdGF0ZS5xdWVyeVBhcmFtcygnc29sdXRpb24nKSA9PT0gJ3RydWUnKTtcbiAgdmFyIGlzVmlld2luZ1N0dWRlbnRBbnN3ZXIgPSAhIWRhc2hib2FyZC5jbGllbnRTdGF0ZS5xdWVyeVBhcmFtcygndXNlcl9pZCcpO1xuXG4gIGlmICghYXBwT3B0aW9ucy5jaGFubmVsICYmICFpc1ZpZXdpbmdTb2x1dGlvbiAmJiAhaXNWaWV3aW5nU3R1ZGVudEFuc3dlcikge1xuXG4gICAgaWYgKGFwcE9wdGlvbnMucHVibGljQ2FjaGluZykge1xuICAgICAgLy8gRGlzYWJsZSBzb2NpYWwgc2hhcmUgYnkgZGVmYXVsdCBvbiBwdWJsaWNseS1jYWNoZWQgcGFnZXMsIGJlY2F1c2Ugd2UgZG9uJ3Qga25vd1xuICAgICAgLy8gaWYgdGhlIHVzZXIgaXMgdW5kZXJhZ2UgdW50aWwgd2UgZ2V0IGRhdGEgYmFjayBmcm9tIC9hcGkvdXNlcl9wcm9ncmVzcy8gYW5kIHdlXG4gICAgICAvLyBzaG91bGQgZXJyIG9uIHRoZSBzaWRlIG9mIG5vdCBzaG93aW5nIHNvY2lhbCBsaW5rc1xuICAgICAgYXBwT3B0aW9ucy5kaXNhYmxlU29jaWFsU2hhcmUgPSB0cnVlO1xuICAgIH1cblxuICAgICQuYWpheCgnL2FwaS91c2VyX3Byb2dyZXNzLycgKyBhcHBPcHRpb25zLnNjcmlwdE5hbWUgKyAnLycgKyBhcHBPcHRpb25zLnN0YWdlUG9zaXRpb24gKyAnLycgKyBhcHBPcHRpb25zLmxldmVsUG9zaXRpb24pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGFwcE9wdGlvbnMuZGlzYWJsZVNvY2lhbFNoYXJlID0gZGF0YS5kaXNhYmxlU29jaWFsU2hhcmU7XG5cbiAgICAgIC8vIE1lcmdlIHByb2dyZXNzIGZyb20gc2VydmVyIChsb2FkZWQgdmlhIEFKQVgpXG4gICAgICB2YXIgc2VydmVyUHJvZ3Jlc3MgPSBkYXRhLnByb2dyZXNzIHx8IHt9O1xuICAgICAgdmFyIGNsaWVudFByb2dyZXNzID0gZGFzaGJvYXJkLmNsaWVudFN0YXRlLmFsbExldmVsc1Byb2dyZXNzKClbYXBwT3B0aW9ucy5zY3JpcHROYW1lXSB8fCB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHNlcnZlclByb2dyZXNzKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbElkKSB7XG4gICAgICAgIGlmIChzZXJ2ZXJQcm9ncmVzc1tsZXZlbElkXSAhPT0gY2xpZW50UHJvZ3Jlc3NbbGV2ZWxJZF0pIHtcbiAgICAgICAgICB2YXIgc3RhdHVzID0gZGFzaGJvYXJkLnByb2dyZXNzLm1lcmdlZEFjdGl2aXR5Q3NzQ2xhc3MoY2xpZW50UHJvZ3Jlc3NbbGV2ZWxJZF0sIHNlcnZlclByb2dyZXNzW2xldmVsSWRdKTtcblxuICAgICAgICAgIC8vIENsZWFyIHRoZSBleGlzdGluZyBjbGFzcyBhbmQgcmVwbGFjZVxuICAgICAgICAgICQoJyNoZWFkZXItbGV2ZWwtJyArIGxldmVsSWQpLmF0dHIoJ2NsYXNzJywgJ2xldmVsX2xpbmsgJyArIHN0YXR1cyk7XG5cbiAgICAgICAgICAvLyBXcml0ZSBkb3duIG5ldyBwcm9ncmVzcyBpbiBzZXNzaW9uU3RvcmFnZVxuICAgICAgICAgIGRhc2hib2FyZC5jbGllbnRTdGF0ZS50cmFja1Byb2dyZXNzKG51bGwsIG51bGwsIHNlcnZlclByb2dyZXNzW2xldmVsSWRdLCBhcHBPcHRpb25zLnNjcmlwdE5hbWUsIGxldmVsSWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFsYXN0QXR0ZW1wdExvYWRlZCkge1xuICAgICAgICBpZiAoZGF0YS5sYXN0QXR0ZW1wdCkge1xuICAgICAgICAgIGxhc3RBdHRlbXB0TG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAgIHZhciB0aW1lc3RhbXAgPSBkYXRhLmxhc3RBdHRlbXB0LnRpbWVzdGFtcDtcbiAgICAgICAgICB2YXIgc291cmNlID0gZGF0YS5sYXN0QXR0ZW1wdC5zb3VyY2U7XG5cbiAgICAgICAgICB2YXIgY2FjaGVkUHJvZ3JhbSA9IGRhc2hib2FyZC5jbGllbnRTdGF0ZS5zb3VyY2VGb3JMZXZlbChcbiAgICAgICAgICAgICAgYXBwT3B0aW9ucy5zY3JpcHROYW1lLCBhcHBPcHRpb25zLnNlcnZlckxldmVsSWQsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgaWYgKGNhY2hlZFByb2dyYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gQ2xpZW50IHZlcnNpb24gaXMgbmV3ZXJcbiAgICAgICAgICAgIHNldExhc3RBdHRlbXB0VW5sZXNzSmlnc2F3KGNhY2hlZFByb2dyYW0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlICYmIHNvdXJjZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFNldmVyIHZlcnNpb24gaXMgbmV3ZXJcbiAgICAgICAgICAgIHNldExhc3RBdHRlbXB0VW5sZXNzSmlnc2F3KHNvdXJjZSk7XG5cbiAgICAgICAgICAgIC8vIFdyaXRlIGRvd24gdGhlIGxhc3RBdHRlbXB0IGZyb20gc2VydmVyIGluIHNlc3Npb25TdG9yYWdlXG4gICAgICAgICAgICBkYXNoYm9hcmQuY2xpZW50U3RhdGUud3JpdGVTb3VyY2VGb3JMZXZlbChhcHBPcHRpb25zLnNjcmlwdE5hbWUsXG4gICAgICAgICAgICAgICAgYXBwT3B0aW9ucy5zZXJ2ZXJMZXZlbElkLCB0aW1lc3RhbXAsIHNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEuZGlzYWJsZVBvc3RNaWxlc3RvbmUpIHtcbiAgICAgICAgJChcIiNwcm9ncmVzc3dhcm5pbmdcIikuc2hvdygpO1xuICAgICAgfVxuICAgIH0pLmZhaWwobG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlKTtcblxuICAgIC8vIFVzZSB0aGlzIGluc3RlYWQgb2YgYSB0aW1lb3V0IG9uIHRoZSBBSkFYIHJlcXVlc3QgYmVjYXVzZSB3ZSBzdGlsbCB3YW50XG4gICAgLy8gdGhlIGhlYWRlciBwcm9ncmVzcyBkYXRhIGV2ZW4gaWYgdGhlIGxhc3QgYXR0ZW1wdCBkYXRhIHRha2VzIHRvbyBsb25nLlxuICAgIC8vIFRoZSBwcm9ncmVzcyBkb3RzIGNhbiBmYWRlIGluIGF0IGFueSB0aW1lIHdpdGhvdXQgaW1wYWN0aW5nIHRoZSB1c2VyLlxuICAgIHNldFRpbWVvdXQobG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlLCBMQVNUX0FUVEVNUFRfVElNRU9VVCk7XG4gIH0gZWxzZSBpZiAod2luZG93LmRhc2hib2FyZCAmJiBkYXNoYm9hcmQucHJvamVjdCkge1xuICAgIGRhc2hib2FyZC5wcm9qZWN0LmxvYWQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChkYXNoYm9hcmQucHJvamVjdC5oaWRlQmVjYXVzZUFidXNpdmUoKSkge1xuICAgICAgICByZW5kZXJBYnVzaXZlKCk7XG4gICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVqZWN0KCk7XG4gICAgICB9XG4gICAgfSkudGhlbihjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgbG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNldExhc3RBdHRlbXB0VW5sZXNzSmlnc2F3KHNvdXJjZSkge1xuICBpZiAoYXBwT3B0aW9ucy5sZXZlbEdhbWVOYW1lICE9PSAnSmlnc2F3Jykge1xuICAgIGFwcE9wdGlvbnMubGV2ZWwubGFzdEF0dGVtcHQgPSBzb3VyY2U7XG4gIH1cbn1cbiIsIi8qIGdsb2JhbCBkYXNoYm9hcmQsIGFwcE9wdGlvbnMsIHRyYWNrRXZlbnQgKi9cblxuLy8gQXR0ZW1wdCB0byBzYXZlIHByb2plY3RzIGV2ZXJ5IDMwIHNlY29uZHNcbnZhciBBVVRPU0FWRV9JTlRFUlZBTCA9IDMwICogMTAwMDtcblxudmFyIEFCVVNFX1RIUkVTSE9MRCA9IDEwO1xuXG52YXIgaGFzUHJvamVjdENoYW5nZWQgPSBmYWxzZTtcblxudmFyIGFzc2V0cyA9IHJlcXVpcmUoJy4vY2xpZW50QXBpJykuY3JlYXRlKCcvdjMvYXNzZXRzJyk7XG52YXIgc291cmNlcyA9IHJlcXVpcmUoJy4vY2xpZW50QXBpJykuY3JlYXRlKCcvdjMvc291cmNlcycpO1xudmFyIGNoYW5uZWxzID0gcmVxdWlyZSgnLi9jbGllbnRBcGknKS5jcmVhdGUoJy92My9jaGFubmVscycpO1xuXG4vLyBOYW1lIG9mIHRoZSBwYWNrZWQgc291cmNlIGZpbGVcbnZhciBTT1VSQ0VfRklMRSA9ICdtYWluLmpzb24nO1xuXG52YXIgZXZlbnRzID0ge1xuICAvLyBGaXJlZCB3aGVuIHJ1biBzdGF0ZSBjaGFuZ2VzIG9yIHdlIGVudGVyL2V4aXQgZGVzaWduIG1vZGVcbiAgYXBwTW9kZUNoYW5nZWQ6ICdhcHBNb2RlQ2hhbmdlZCcsXG4gIGFwcEluaXRpYWxpemVkOiAnYXBwSW5pdGlhbGl6ZWQnLFxuICB3b3Jrc3BhY2VDaGFuZ2U6ICd3b3Jrc3BhY2VDaGFuZ2UnXG59O1xuXG4vKipcbiAqIEhlbHBlciBmb3Igd2hlbiB3ZSBzcGxpdCBvdXIgcGF0aG5hbWUgYnkgLy4gY2hhbm5lbF9pZCBhbmQgYWN0aW9uIG1heSBlbmQgdXBcbiAqIGJlaW5nIHVuZGVmaW5lZC5cbiAqIEV4YW1wbGUgcGF0aHM6XG4gKiAvcHJvamVjdHMvYXBwbGFiXG4gKiAvcHJvamVjdHMvcGxheWxhYi8xVTUzcFlwUjhzekRndHJHSUc1bElnXG4gKiAvcHJvamVjdHMvYXJ0aXN0L1Z5Vk8tYlFhR1EtQ3liN0RicGFiTlEvZWRpdFxuICovXG52YXIgUGF0aFBhcnQgPSB7XG4gIFNUQVJUOiAwLFxuICBQUk9KRUNUUzogMSxcbiAgQVBQOiAyLFxuICBDSEFOTkVMX0lEOiAzLFxuICBBQ1RJT046IDRcbn07XG5cbi8qKlxuICogQ3VycmVudCBzdGF0ZSBvZiBvdXIgQ2hhbm5lbCBBUEkgb2JqZWN0XG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBQcm9qZWN0SW5zdGFuY2VcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IG5hbWVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBsZXZlbEh0bWxcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBsZXZlbFNvdXJjZVxuICogQHByb3BlcnR5IHtib29sZWFufSBoaWRkZW4gRG9lc24ndCBzaG93IHVwIGluIHByb2plY3QgbGlzdFxuICogQHByb3BlcnR5IHtib29sZWFufSBpc093bmVyIFBvcHVsYXRlZCBieSBvdXIgdXBkYXRlL2NyZWF0ZSBjYWxsYmFjay5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB1cGRhdGVkQXQgU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgRGF0ZS4gUG9wdWxhdGVkIGJ5XG4gKiAgIG91dCB1cGRhdGUvY3JlYXRlIGNhbGxiYWNrXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbGV2ZWwgUGF0aCB3aGVyZSB0aGlzIHBhcnRpY3VsYXIgYXBwIHR5cGUgaXMgaG9zdGVkXG4gKi9cbnZhciBjdXJyZW50O1xudmFyIGN1cnJlbnRTb3VyY2VWZXJzaW9uSWQ7XG52YXIgY3VycmVudEFidXNlU2NvcmUgPSAwO1xudmFyIGlzRWRpdGluZyA9IGZhbHNlO1xuXG4vKipcbiAqIEN1cnJlbnQgc3RhdGUgb2Ygb3VyIHNvdXJjZXMgQVBJIGRhdGFcbiAqL1xudmFyIGN1cnJlbnRTb3VyY2VzID0ge1xuICBzb3VyY2U6IG51bGwsXG4gIGh0bWw6IG51bGxcbn07XG5cbi8qKlxuICogR2V0IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBvdXIgc291cmNlcyBBUEkgb2JqZWN0IGZvciB1cGxvYWRcbiAqL1xuZnVuY3Rpb24gcGFja1NvdXJjZXMoKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShjdXJyZW50U291cmNlcyk7XG59XG5cbi8qKlxuICogUG9wdWxhdGUgb3VyIGN1cnJlbnQgc291cmNlcyBBUEkgb2JqZWN0IGJhc2VkIG9mZiBvZiBnaXZlbiBkYXRhXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YS5zb3VyY2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhLmh0bWxcbiAqL1xuZnVuY3Rpb24gdW5wYWNrU291cmNlcyhkYXRhKSB7XG4gIGN1cnJlbnRTb3VyY2VzID0ge1xuICAgIHNvdXJjZTogZGF0YS5zb3VyY2UsXG4gICAgaHRtbDogZGF0YS5odG1sXG4gIH07XG59XG5cbnZhciBwcm9qZWN0cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ30gaWQgb2YgdGhlIGN1cnJlbnQgcHJvamVjdCwgb3IgdW5kZWZpbmVkIGlmIHdlIGRvbid0IGhhdmVcbiAgICogICBhIGN1cnJlbnQgcHJvamVjdC5cbiAgICovXG4gIGdldEN1cnJlbnRJZDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghY3VycmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudC5pZDtcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ30gbmFtZSBvZiB0aGUgY3VycmVudCBwcm9qZWN0LCBvciB1bmRlZmluZWQgaWYgd2UgZG9uJ3QgaGF2ZVxuICAgKiAgIGEgY3VycmVudCBwcm9qZWN0XG4gICAqL1xuICBnZXRDdXJyZW50TmFtZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghY3VycmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudC5uYW1lO1xuICB9LFxuXG4gIGdldEN1cnJlbnRUaW1lc3RhbXA6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnQudXBkYXRlZEF0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0QWJ1c2VTY29yZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjdXJyZW50QWJ1c2VTY29yZTtcbiAgfSxcblxuICAvKipcbiAgICogU2V0cyBhYnVzZSBzY29yZSB0byB6ZXJvLCBzYXZlcyB0aGUgcHJvamVjdCwgYW5kIHJlbG9hZHMgdGhlIHBhZ2VcbiAgICovXG4gIGFkbWluUmVzZXRBYnVzZVNjb3JlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gdGhpcy5nZXRDdXJyZW50SWQoKTtcbiAgICBpZiAoIWlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNoYW5uZWxzLmRlbGV0ZShpZCArICcvYWJ1c2UnLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgICAgYXNzZXRzLnBhdGNoQWxsKGlkLCAnYWJ1c2Vfc2NvcmU9MCcsIG51bGwsIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgICQoJy5hZG1pbi1hYnVzZS1zY29yZScpLnRleHQoMCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgd2UncmUgZnJvemVuXG4gICAqL1xuICBpc0Zyb3plbjogZnVuY3Rpb24gKCkge1xuICAgIGlmICghY3VycmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudC5mcm96ZW47XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNPd25lcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjdXJyZW50ICYmIGN1cnJlbnQuaXNPd25lcjtcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgcHJvamVjdCBoYXMgYmVlbiByZXBvcnRlZCBlbm91Z2ggdGltZXMgdG9cbiAgICogICBleGNlZWQgb3VyIHRocmVzaG9sZFxuICAgKi9cbiAgZXhjZWVkc0FidXNlVGhyZXNob2xkOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRBYnVzZVNjb3JlID49IEFCVVNFX1RIUkVTSE9MRDtcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB3ZSBzaG91bGQgc2hvdyBvdXIgYWJ1c2UgYm94IGluc3RlYWQgb2Ygc2hvd2luZ1xuICAgKiAgIHRoZSBwcm9qZWN0LlxuICAgKi9cbiAgaGlkZUJlY2F1c2VBYnVzaXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmV4Y2VlZHNBYnVzZVRocmVzaG9sZCgpIHx8IGFwcE9wdGlvbnMuc2NyaXB0SWQpIHtcbiAgICAgIC8vIE5ldmVyIHdhbnQgdG8gaGlkZSB3aGVuIGluIHRoZSBjb250ZXh0IG9mIGEgc2NyaXB0LCBhcyB0aGlzIHdpbGwgYWx3YXlzXG4gICAgICAvLyBlaXRoZXIgYmUgbWUgb3IgbXkgdGVhY2hlciB2aWV3aW5nIG15IGxhc3Qgc3VibWlzc2lvblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFdoZW4gb3duZXJzIGVkaXQgYSBwcm9qZWN0LCB3ZSBkb24ndCB3YW50IHRvIGhpZGUgaXQgZW50aXJlbHkuIEluc3RlYWQsXG4gICAgLy8gd2UnbGwgbG9hZCB0aGUgcHJvamVjdCBhbmQgc2hvdyB0aGVtIGEgc21hbGwgYWxlcnRcbiAgICB2YXIgcGFnZUFjdGlvbiA9IHBhcnNlUGF0aCgpLmFjdGlvbjtcblxuICAgIC8vIE5PVEU6IGFwcE9wdGlvbnMuaXNBZG1pbiBpcyBub3QgYSBzZWN1cml0eSBzZXR0aW5nIGFzIGl0IGNhbiBiZSBtYW5pcHVsYXRlZFxuICAgIC8vIGJ5IHRoZSB1c2VyLiBJbiB0aGlzIGNhc2UgdGhhdCdzIG9rYXksIHNpbmNlIGFsbCB0aGF0IGRvZXMgaXMgYWxsb3cgdGhlbSB0b1xuICAgIC8vIHZpZXcgYSBwcm9qZWN0IHRoYXQgd2FzIG1hcmtlZCBhcyBhYnVzaXZlLlxuICAgIGlmICgodGhpcy5pc093bmVyKCkgfHwgYXBwT3B0aW9ucy5pc0FkbWluKSAmJlxuICAgICAgICAocGFnZUFjdGlvbiA9PT0gJ2VkaXQnIHx8IHBhZ2VBY3Rpb24gPT09ICd2aWV3JykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIFByb3BlcnRpZXMgYW5kIGNhbGxiYWNrcy4gVGhlc2UgYXJlIGFsbCBjYW5kaWRhdGVzIGZvciBiZWluZyBleHRyYWN0ZWRcbiAgLy8gYXMgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXJzIHdoaWNoIGFyZSBwYXNzZWQgaW4gYnkgdGhlIGNhbGxlci5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIC8vIFRPRE8oZGF2ZSk6IGV4dHJhY3QgaXNBdXRvc2F2ZUVuYWJsZWQgYW5kIGFueSBib29sZWFuIGhlbHBlclxuICAvLyBmdW5jdGlvbnMgYmVsb3cgdG8gYmVjb21lIHByb3BlcnRpZXMgb24gYXBwT3B0aW9ucy5wcm9qZWN0LlxuICAvLyBQcm9qZWN0cyBiZWhhdmlvciBzaG91bGQgdWx0aW1hdGVseSBiZSBmdWxseSBjb25maWd1cmFibGUgYnlcbiAgLy8gcHJvcGVydGllcyBvbiBhcHBPcHRpb25zLnByb2plY3QsIHJhdGhlciB0aGFuIHJlYWNoaW5nIG91dFxuICAvLyBpbnRvIGdsb2JhbCBzdGF0ZSB0byBtYWtlIGRlY2lzaW9ucy5cblxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgd2UncmUgZWRpdGluZ1xuICAgKi9cbiAgaXNFZGl0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGlzRWRpdGluZztcbiAgfSxcblxuICAvLyBXaGV0aGVyIHRoZSBjdXJyZW50IGxldmVsIGlzIGEgcHJvamVjdCBsZXZlbCAoaS5lLiBhdCB0aGUgL3Byb2plY3RzIHVybCkuXG4gIGlzUHJvamVjdExldmVsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGFwcE9wdGlvbnMubGV2ZWwgJiYgYXBwT3B0aW9ucy5sZXZlbC5pc1Byb2plY3RMZXZlbCk7XG4gIH0sXG5cbiAgc2hvdWxkVXBkYXRlSGVhZGVyczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICFhcHBPcHRpb25zLmlzRXh0ZXJuYWxQcm9qZWN0TGV2ZWw7XG4gIH0sXG5cbiAgc2hvd1Byb2plY3RIZWFkZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNob3VsZFVwZGF0ZUhlYWRlcnMoKSkge1xuICAgICAgZGFzaGJvYXJkLmhlYWRlci5zaG93UHJvamVjdEhlYWRlcigpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY29udGVudHMgb2YgdGhlIGFkbWluIGJveCBmb3IgYWRtaW5zLiBXZSBoYXZlIG5vIGtub3dsZWRnZVxuICAgKiBoZXJlIHdoZXRoZXIgd2UncmUgYW4gYWRtaW4sIGFuZCBkZXBlbmQgb24gZGFzaGJvYXJkIGdldHRpbmcgdGhpcyByaWdodC5cbiAgICovXG4gIHNob3dBZG1pbjogZnVuY3Rpb24oKSB7XG4gICAgZGFzaGJvYXJkLmFkbWluLnNob3dQcm9qZWN0QWRtaW4oKTtcbiAgfSxcblxuICBzaG93TWluaW1hbFByb2plY3RIZWFkZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNob3VsZFVwZGF0ZUhlYWRlcnMoKSkge1xuICAgICAgZGFzaGJvYXJkLmhlYWRlci5zaG93TWluaW1hbFByb2plY3RIZWFkZXIoKTtcbiAgICB9XG4gIH0sXG5cbiAgc2hvd1NoYXJlUmVtaXhIZWFkZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNob3VsZFVwZGF0ZUhlYWRlcnMoKSkge1xuICAgICAgZGFzaGJvYXJkLmhlYWRlci5zaG93U2hhcmVSZW1peEhlYWRlcigpO1xuICAgIH1cbiAgfSxcbiAgc2V0TmFtZTogZnVuY3Rpb24obmV3TmFtZSkge1xuICAgIGN1cnJlbnQgPSBjdXJyZW50IHx8IHt9O1xuICAgIGlmIChuZXdOYW1lKSB7XG4gICAgICBjdXJyZW50Lm5hbWUgPSBuZXdOYW1lO1xuICAgICAgdGhpcy5zZXRUaXRsZShuZXdOYW1lKTtcbiAgICB9XG4gIH0sXG4gIHNldFRpdGxlOiBmdW5jdGlvbihuZXdOYW1lKSB7XG4gICAgaWYgKG5ld05hbWUgJiYgYXBwT3B0aW9ucy5nYW1lRGlzcGxheU5hbWUpIHtcbiAgICAgIGRvY3VtZW50LnRpdGxlID0gbmV3TmFtZSArICcgLSAnICsgYXBwT3B0aW9ucy5nYW1lRGlzcGxheU5hbWU7XG4gICAgfVxuICB9LFxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gRW5kIG9mIHByb3BlcnRpZXMgYW5kIGNhbGxiYWNrcy5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gc291cmNlSGFuZGxlciBPYmplY3QgY29udGFpbmluZyBjYWxsYmFja3MgcHJvdmlkZWQgYnkgY2FsbGVyLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzb3VyY2VIYW5kbGVyLnNldEluaXRpYWxMZXZlbEh0bWxcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gc291cmNlSGFuZGxlci5nZXRMZXZlbEh0bWxcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gc291cmNlSGFuZGxlci5zZXRJbml0aWFsTGV2ZWxTb3VyY2VcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gc291cmNlSGFuZGxlci5nZXRMZXZlbFNvdXJjZVxuICAgKi9cbiAgaW5pdDogZnVuY3Rpb24gKHNvdXJjZUhhbmRsZXIpIHtcbiAgICB0aGlzLnNvdXJjZUhhbmRsZXIgPSBzb3VyY2VIYW5kbGVyO1xuICAgIGlmIChyZWRpcmVjdEZyb21IYXNoVXJsKCkgfHwgcmVkaXJlY3RFZGl0VmlldygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNQcm9qZWN0TGV2ZWwoKSB8fCBjdXJyZW50KSB7XG4gICAgICBpZiAoY3VycmVudFNvdXJjZXMuaHRtbCkge1xuICAgICAgICBzb3VyY2VIYW5kbGVyLnNldEluaXRpYWxMZXZlbEh0bWwoY3VycmVudFNvdXJjZXMuaHRtbCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0VkaXRpbmcpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgICBpZiAoY3VycmVudFNvdXJjZXMuc291cmNlKSB7XG4gICAgICAgICAgICBzb3VyY2VIYW5kbGVyLnNldEluaXRpYWxMZXZlbFNvdXJjZShjdXJyZW50U291cmNlcy5zb3VyY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldE5hbWUoJ015IFByb2plY3QnKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQod2luZG93KS5vbihldmVudHMuYXBwTW9kZUNoYW5nZWQsIGZ1bmN0aW9uKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICAgIHRoaXMuc2F2ZShjYWxsYmFjayk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy8gQXV0b3NhdmUgZXZlcnkgQVVUT1NBVkVfSU5URVJWQUwgbWlsbGlzZWNvbmRzXG4gICAgICAgICQod2luZG93KS5vbihldmVudHMuYXBwSW5pdGlhbGl6ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIGluaXRpYWwgYXBwIGNvZGUgYXMgYSBiYXNlbGluZVxuICAgICAgICAgIGN1cnJlbnRTb3VyY2VzLnNvdXJjZSA9IHRoaXMuc291cmNlSGFuZGxlci5nZXRMZXZlbFNvdXJjZShjdXJyZW50U291cmNlcy5zb3VyY2UpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAkKHdpbmRvdykub24oZXZlbnRzLndvcmtzcGFjZUNoYW5nZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGhhc1Byb2plY3RDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLmF1dG9zYXZlXy5iaW5kKHRoaXMpLCBBVVRPU0FWRV9JTlRFUlZBTCk7XG5cbiAgICAgICAgaWYgKGN1cnJlbnQuaGlkZGVuKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmlzRnJvemVuKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NoYXJlUmVtaXhIZWFkZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnQuaXNPd25lciB8fCAhcGFyc2VQYXRoKCkuY2hhbm5lbElkKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dQcm9qZWN0SGVhZGVyKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFZpZXdpbmcgc29tZW9uZSBlbHNlJ3MgcHJvamVjdCAtIHNldCBzaGFyZSBtb2RlXG4gICAgICAgICAgICB0aGlzLnNob3dNaW5pbWFsUHJvamVjdEhlYWRlcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjdXJyZW50KSB7XG4gICAgICAgIHRoaXMuc291cmNlSGFuZGxlci5zZXRJbml0aWFsTGV2ZWxTb3VyY2UoY3VycmVudFNvdXJjZXMuc291cmNlKTtcbiAgICAgICAgdGhpcy5zaG93TWluaW1hbFByb2plY3RIZWFkZXIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFwcE9wdGlvbnMuaXNMZWdhY3lTaGFyZSAmJiB0aGlzLmdldFN0YW5kYWxvbmVBcHAoKSkge1xuICAgICAgdGhpcy5zZXROYW1lKCdVbnRpdGxlZCBQcm9qZWN0Jyk7XG4gICAgICB0aGlzLnNob3dNaW5pbWFsUHJvamVjdEhlYWRlcigpO1xuICAgIH1cbiAgICBpZiAoYXBwT3B0aW9ucy5ub1BhZGRpbmcpIHtcbiAgICAgICQoXCIuZnVsbF9jb250YWluZXJcIikuY3NzKHtcInBhZGRpbmdcIjpcIjBweFwifSk7XG4gICAgfVxuXG4gICAgdGhpcy5zaG93QWRtaW4oKTtcbiAgfSxcbiAgcHJvamVjdENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgIGhhc1Byb2plY3RDaGFuZ2VkID0gdHJ1ZTtcbiAgfSxcbiAgLyoqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBzdGFuZGFsb25lIGFwcCBjYXBhYmxlIG9mIHJ1bm5pbmdcbiAgICogdGhpcyBwcm9qZWN0IGFzIGEgc3RhbmRhbG9uZSBwcm9qZWN0LCBvciBudWxsIGlmIG5vbmUgZXhpc3RzLlxuICAgKi9cbiAgZ2V0U3RhbmRhbG9uZUFwcDogZnVuY3Rpb24gKCkge1xuICAgIHN3aXRjaCAoYXBwT3B0aW9ucy5hcHApIHtcbiAgICAgIGNhc2UgJ2FwcGxhYic6XG4gICAgICAgIHJldHVybiAnYXBwbGFiJztcbiAgICAgIGNhc2UgJ3R1cnRsZSc6XG4gICAgICAgIHJldHVybiAnYXJ0aXN0JztcbiAgICAgIGNhc2UgJ2NhbGMnOlxuICAgICAgICByZXR1cm4gJ2NhbGMnO1xuICAgICAgY2FzZSAnZXZhbCc6XG4gICAgICAgIHJldHVybiAnZXZhbCc7XG4gICAgICBjYXNlICdzdHVkaW8nOlxuICAgICAgICBpZiAoYXBwT3B0aW9ucy5sZXZlbC51c2VDb250cmFjdEVkaXRvcikge1xuICAgICAgICAgIHJldHVybiAnYWxnZWJyYV9nYW1lJztcbiAgICAgICAgfSBlbHNlIGlmIChhcHBPcHRpb25zLnNraW5JZCA9PT0gJ2hvYzIwMTUnIHx8IGFwcE9wdGlvbnMuc2tpbklkID09PSAnaW5maW5pdHknKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdwbGF5bGFiJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSxcbiAgLyoqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBwYXRoIHRvIHRoZSBhcHAgY2FwYWJsZSBvZiBydW5uaW5nXG4gICAqIHRoaXMgcHJvamVjdCBhcyBhIHN0YW5kYWxvbmUgYXBwLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgbm8gc3RhbmRhbG9uZSBhcHAgZXhpc3RzLlxuICAgKi9cbiAgYXBwVG9Qcm9qZWN0VXJsOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFwcCA9IHByb2plY3RzLmdldFN0YW5kYWxvbmVBcHAoKTtcbiAgICBpZiAoIWFwcCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHR5cGUgb2YgcHJvamVjdCBjYW5ub3QgYmUgcnVuIGFzIGEgc3RhbmRhbG9uZSBhcHAuJyk7XG4gICAgfVxuICAgIHJldHVybiAnL3Byb2plY3RzLycgKyBhcHA7XG4gIH0sXG4gIC8qKlxuICAgKiBFeHBsaWNpdGx5IGNsZWFyIHRoZSBIVE1MLCBjaXJjdW12ZW50aW5nIHNhZmV0eSBtZWFzdXJlcyB3aGljaCBwcmV2ZW50IGl0IGZyb21cbiAgICogYmVpbmcgYWNjaWRlbnRhbGx5IGRlbGV0ZWQuXG4gICAqL1xuICBjbGVhckh0bWw6IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRTb3VyY2VzLmh0bWwgPSAnJztcbiAgfSxcbiAgLyoqXG4gICAqIFNhdmVzIHRoZSBwcm9qZWN0IHRvIHRoZSBDaGFubmVscyBBUEkuIENhbGxzIGBjYWxsYmFja2Agb24gc3VjY2VzcyBpZiBhXG4gICAqIGNhbGxiYWNrIGZ1bmN0aW9uIHdhcyBwcm92aWRlZC5cbiAgICogQHBhcmFtIHtvYmplY3Q/fSBzb3VyY2VBbmRIdG1sIE9wdGlvbmFsIHNvdXJjZSB0byBiZSBwcm92aWRlZCwgc2F2aW5nIHVzIGFub3RoZXJcbiAgICogICBjYWxsIHRvIGBzb3VyY2VIYW5kbGVyLmdldExldmVsU291cmNlYC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHNhdmluZy5cbiAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZU5ld1ZlcnNpb24gSWYgdHJ1ZSwgZXhwbGljaXRseSBjcmVhdGUgYSBuZXcgdmVyc2lvbi5cbiAgICovXG4gIHNhdmU6IGZ1bmN0aW9uKHNvdXJjZUFuZEh0bWwsIGNhbGxiYWNrLCBmb3JjZU5ld1ZlcnNpb24pIHtcbiAgICAvLyBDYW4ndCBzYXZlIGEgcHJvamVjdCBpZiB3ZSdyZSBub3QgdGhlIG93bmVyLlxuICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQuaXNPd25lciA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ2Z1bmN0aW9uJyB8fCAhc291cmNlQW5kSHRtbCkge1xuICAgICAgLy8gSWYgbm8gc291cmNlIGlzIHByb3ZpZGVkLCBzaGlmdCB0aGUgYXJndW1lbnRzIGFuZCBhc2sgZm9yIHRoZSBzb3VyY2VcbiAgICAgIC8vIG91cnNlbHZlcy5cbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFyZ3VtZW50cyk7XG4gICAgICBjYWxsYmFjayA9IGFyZ3NbMF07XG4gICAgICBmb3JjZU5ld1ZlcnNpb24gPSBhcmdzWzFdO1xuXG4gICAgICBzb3VyY2VBbmRIdG1sID0ge1xuICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlSGFuZGxlci5nZXRMZXZlbFNvdXJjZSgpLFxuICAgICAgICBodG1sOiB0aGlzLnNvdXJjZUhhbmRsZXIuZ2V0TGV2ZWxIdG1sKClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGZvcmNlTmV3VmVyc2lvbikge1xuICAgICAgY3VycmVudFNvdXJjZVZlcnNpb25JZCA9IG51bGw7XG4gICAgfVxuXG4gICAgJCgnLnByb2plY3RfdXBkYXRlZF9hdCcpLnRleHQoJ1NhdmluZy4uLicpOyAgLy8gVE9ETyAoSm9zaCkgaTE4blxuICAgIHZhciBjaGFubmVsSWQgPSBjdXJyZW50LmlkO1xuICAgIC8vIFRPRE8oZGF2ZSk6IFJlbW92ZSB0aGlzIGNoZWNrIGFuZCByZW1vdmUgY2xlYXJIdG1sKCkgb25jZSBhbGwgcHJvamVjdHNcbiAgICAvLyBoYXZlIHZlcnNpb25pbmc6IGh0dHBzOi8vd3d3LnBpdm90YWx0cmFja2VyLmNvbS9zdG9yeS9zaG93LzEwMzM0NzQ5OFxuICAgIGlmIChjdXJyZW50U291cmNlcy5odG1sICYmICFzb3VyY2VBbmRIdG1sLmh0bWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXR0ZW1wdGluZyB0byBibG93IGF3YXkgZXhpc3RpbmcgbGV2ZWxIdG1sJyk7XG4gICAgfVxuXG4gICAgdW5wYWNrU291cmNlcyhzb3VyY2VBbmRIdG1sKTtcbiAgICBpZiAodGhpcy5nZXRTdGFuZGFsb25lQXBwKCkpIHtcbiAgICAgIGN1cnJlbnQubGV2ZWwgPSB0aGlzLmFwcFRvUHJvamVjdFVybCgpO1xuICAgIH1cblxuICAgIHZhciBmaWxlbmFtZSA9IFNPVVJDRV9GSUxFICsgKGN1cnJlbnRTb3VyY2VWZXJzaW9uSWQgPyBcIj92ZXJzaW9uPVwiICsgY3VycmVudFNvdXJjZVZlcnNpb25JZCA6ICcnKTtcbiAgICBzb3VyY2VzLnB1dChjaGFubmVsSWQsIHBhY2tTb3VyY2VzKCksIGZpbGVuYW1lLCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSkge1xuICAgICAgY3VycmVudFNvdXJjZVZlcnNpb25JZCA9IHJlc3BvbnNlLnZlcnNpb25JZDtcbiAgICAgIGN1cnJlbnQubWlncmF0ZWRUb1MzID0gdHJ1ZTtcblxuICAgICAgY2hhbm5lbHMudXBkYXRlKGNoYW5uZWxJZCwgY3VycmVudCwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAgICB0aGlzLnVwZGF0ZUN1cnJlbnREYXRhXyhlcnIsIGRhdGEsIGZhbHNlKTtcbiAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrLCBkYXRhKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcbiAgdXBkYXRlQ3VycmVudERhdGFfOiBmdW5jdGlvbiAoZXJyLCBkYXRhLCBpc05ld0NoYW5uZWwpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICAkKCcucHJvamVjdF91cGRhdGVkX2F0JykudGV4dCgnRXJyb3Igc2F2aW5nIHByb2plY3QnKTsgIC8vIFRPRE8gaTE4blxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGN1cnJlbnQgPSBkYXRhO1xuICAgIGlmIChpc05ld0NoYW5uZWwpIHtcbiAgICAgIC8vIFdlIGhhdmUgYSBuZXcgY2hhbm5lbCwgbWVhbmluZyBlaXRoZXIgd2UgaGFkIG5vIGNoYW5uZWwgYmVmb3JlLCBvclxuICAgICAgLy8gd2UndmUgY2hhbmdlZCBjaGFubmVscy4gSWYgd2UgYXJlbid0IGF0IGEgL3Byb2plY3RzLzxhcHBuYW1lPiBsaW5rLFxuICAgICAgLy8gYWx3YXlzIGRvIGEgcmVkaXJlY3QgKGkuZS4gd2UncmUgcmVtaXggZnJvbSBpbnNpZGUgYSBzY3JpcHQpXG4gICAgICBpZiAoaXNFZGl0aW5nICYmIHBhcnNlUGF0aCgpLmFwcE5hbWUpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSkge1xuICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBkb2N1bWVudC50aXRsZSwgdGhpcy5nZXRQYXRoTmFtZSgnZWRpdCcpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2UncmUgb24gYSBzaGFyZSBwYWdlLCBhbmQgZ290IGEgbmV3IGNoYW5uZWwgaWQuIEFsd2F5cyBkbyBhIHJlZGlyZWN0XG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSB0aGlzLmdldFBhdGhOYW1lKCdlZGl0Jyk7XG4gICAgICB9XG4gICAgfVxuICAgIGRhc2hib2FyZC5oZWFkZXIudXBkYXRlVGltZXN0YW1wKCk7XG4gIH0sXG4gIC8qKlxuICAgKiBBdXRvc2F2ZSB0aGUgY29kZSBpZiB0aGluZ3MgaGF2ZSBjaGFuZ2VkXG4gICAqL1xuICBhdXRvc2F2ZV86IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBCYWlsIGlmIGJhc2VsaW5lIGNvZGUgZG9lc24ndCBleGlzdCAoYXBwIG5vdCB5ZXQgaW5pdGlhbGl6ZWQpXG4gICAgaWYgKGN1cnJlbnRTb3VyY2VzLnNvdXJjZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBgZ2V0TGV2ZWxTb3VyY2UoKWAgaXMgZXhwZW5zaXZlIGZvciBCbG9ja2x5IHNvIG9ubHkgY2FsbFxuICAgIC8vIGFmdGVyIGB3b3Jrc3BhY2VDaGFuZ2VgIGhhcyBmaXJlZFxuICAgIGlmICghYXBwT3B0aW9ucy5kcm9wbGV0ICYmICFoYXNQcm9qZWN0Q2hhbmdlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgkKCcjZGVzaWduTW9kZVZpeiAudWktZHJhZ2dhYmxlLWRyYWdnaW5nJykubGVuZ3RoICE9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHNvdXJjZSA9IHRoaXMuc291cmNlSGFuZGxlci5nZXRMZXZlbFNvdXJjZSgpO1xuICAgIHZhciBodG1sID0gdGhpcy5zb3VyY2VIYW5kbGVyLmdldExldmVsSHRtbCgpO1xuXG4gICAgaWYgKGN1cnJlbnRTb3VyY2VzLnNvdXJjZSA9PT0gc291cmNlICYmIGN1cnJlbnRTb3VyY2VzLmh0bWwgPT09IGh0bWwpIHtcbiAgICAgIGhhc1Byb2plY3RDaGFuZ2VkID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zYXZlKHtzb3VyY2U6IHNvdXJjZSwgaHRtbDogaHRtbH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIGhhc1Byb2plY3RDaGFuZ2VkID0gZmFsc2U7XG4gICAgfSk7XG4gIH0sXG4gIC8qKlxuICAgKiBSZW5hbWVzIGFuZCBzYXZlcyB0aGUgcHJvamVjdC5cbiAgICovXG4gIHJlbmFtZTogZnVuY3Rpb24obmV3TmFtZSwgY2FsbGJhY2spIHtcbiAgICB0aGlzLnNldE5hbWUobmV3TmFtZSk7XG4gICAgdGhpcy5zYXZlKGNhbGxiYWNrKTtcbiAgfSxcbiAgLyoqXG4gICAqIEZyZWV6ZXMgYW5kIHNhdmVzIHRoZSBwcm9qZWN0LiBBbHNvIGhpZGVzIHNvIHRoYXQgaXQncyBub3QgYXZhaWxhYmxlIGZvciBkZWxldGluZy9yZW5hbWluZyBpbiB0aGUgdXNlcidzIHByb2plY3QgbGlzdC5cbiAgICovXG4gIGZyZWV6ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBjdXJyZW50LmZyb3plbiA9IHRydWU7XG4gICAgY3VycmVudC5oaWRkZW4gPSB0cnVlO1xuICAgIHRoaXMuc2F2ZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICBleGVjdXRlQ2FsbGJhY2soY2FsbGJhY2ssIGRhdGEpO1xuICAgICAgcmVkaXJlY3RFZGl0VmlldygpO1xuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhlIHByb2plY3QsIGdpdmVzIGl0IHRoZSBwcm92aWRlZCBuYW1lLCBhbmQgc2V0cyB0aGVcbiAgICogY29weSBhcyB0aGUgY3VycmVudCBwcm9qZWN0LlxuICAgKi9cbiAgY29weTogZnVuY3Rpb24obmV3TmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgc3JjQ2hhbm5lbCA9IGN1cnJlbnQuaWQ7XG4gICAgdmFyIHdyYXBwZWRDYWxsYmFjayA9IHRoaXMuY29weUFzc2V0cy5iaW5kKHRoaXMsIHNyY0NoYW5uZWwsIGNhbGxiYWNrKTtcbiAgICBkZWxldGUgY3VycmVudC5pZDtcbiAgICBkZWxldGUgY3VycmVudC5oaWRkZW47XG4gICAgdGhpcy5zZXROYW1lKG5ld05hbWUpO1xuICAgIGNoYW5uZWxzLmNyZWF0ZShjdXJyZW50LCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICB0aGlzLnVwZGF0ZUN1cnJlbnREYXRhXyhlcnIsIGRhdGEsIHRydWUpO1xuICAgICAgdGhpcy5zYXZlKHdyYXBwZWRDYWxsYmFjayk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcbiAgY29weUFzc2V0czogZnVuY3Rpb24gKHNyY0NoYW5uZWwsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFzcmNDaGFubmVsKSB7XG4gICAgICBleGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZGVzdENoYW5uZWwgPSBjdXJyZW50LmlkO1xuICAgIGFzc2V0cy5jb3B5QWxsKHNyY0NoYW5uZWwsIGRlc3RDaGFubmVsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgJCgnLnByb2plY3RfdXBkYXRlZF9hdCcpLnRleHQoJ0Vycm9yIGNvcHlpbmcgZmlsZXMnKTsgIC8vIFRPRE8gaTE4blxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBleGVjdXRlQ2FsbGJhY2soY2FsbGJhY2spO1xuICAgIH0pO1xuICB9LFxuICBzZXJ2ZXJTaWRlUmVtaXg6IGZ1bmN0aW9uKCkge1xuICAgIGlmIChjdXJyZW50ICYmICFjdXJyZW50Lm5hbWUpIHtcbiAgICAgIGlmIChwcm9qZWN0cy5hcHBUb1Byb2plY3RVcmwoKSA9PT0gJy9wcm9qZWN0cy9hbGdlYnJhX2dhbWUnKSB7XG4gICAgICAgIHRoaXMuc2V0TmFtZSgnQmlnIEdhbWUgVGVtcGxhdGUnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvamVjdHMuYXBwVG9Qcm9qZWN0VXJsKCkgPT09ICcvcHJvamVjdHMvYXBwbGFiJykge1xuICAgICAgICB0aGlzLnNldE5hbWUoJ015IFByb2plY3QnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVkaXJlY3RUb1JlbWl4KCkge1xuICAgICAgbG9jYXRpb24uaHJlZiA9IHByb2plY3RzLmdldFBhdGhOYW1lKCdyZW1peCcpO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgdXNlciBpcyB0aGUgb3duZXIsIHNhdmUgYmVmb3JlIHJlbWl4aW5nIG9uIHRoZSBzZXJ2ZXIuXG4gICAgaWYgKGN1cnJlbnQuaXNPd25lcikge1xuICAgICAgcHJvamVjdHMuc2F2ZShyZWRpcmVjdFRvUmVtaXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWRpcmVjdFRvUmVtaXgoKTtcbiAgICB9XG4gIH0sXG4gIGNyZWF0ZU5ldzogZnVuY3Rpb24oKSB7XG4gICAgcHJvamVjdHMuc2F2ZShmdW5jdGlvbiAoKSB7XG4gICAgICBsb2NhdGlvbi5ocmVmID0gcHJvamVjdHMuYXBwVG9Qcm9qZWN0VXJsKCkgKyAnL25ldyc7XG4gICAgfSk7XG4gIH0sXG4gIGRlbGV0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgY2hhbm5lbElkID0gY3VycmVudC5pZDtcbiAgICBjaGFubmVscy5kZWxldGUoY2hhbm5lbElkLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgIGV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaywgZGF0YSk7XG4gICAgfSk7XG4gIH0sXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7alF1ZXJ5LkRlZmVycmVkfSBBIGRlZmVycmVkIHdoaWNoIHdpbGwgcmVzb2x2ZSB3aGVuIHRoZSBwcm9qZWN0IGxvYWRzLlxuICAgKi9cbiAgbG9hZDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkZWZlcnJlZCA9IG5ldyAkLkRlZmVycmVkKCk7XG4gICAgaWYgKHByb2plY3RzLmlzUHJvamVjdExldmVsKCkpIHtcbiAgICAgIGlmIChyZWRpcmVjdEZyb21IYXNoVXJsKCkgfHwgcmVkaXJlY3RFZGl0VmlldygpKSB7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xuICAgICAgfVxuICAgICAgdmFyIHBhdGhJbmZvID0gcGFyc2VQYXRoKCk7XG5cbiAgICAgIGlmIChwYXRoSW5mby5jaGFubmVsSWQpIHtcbiAgICAgICAgaWYgKHBhdGhJbmZvLmFjdGlvbiA9PT0gJ2VkaXQnKSB7XG4gICAgICAgICAgaXNFZGl0aW5nID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKCcjYmV0YWluZm8nKS5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIHRoZSBwcm9qZWN0IElELCBpZiBvbmUgZXhpc3RzXG4gICAgICAgIGNoYW5uZWxzLmZldGNoKHBhdGhJbmZvLmNoYW5uZWxJZCwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIC8vIFByb2plY3Qgbm90IGZvdW5kLCByZWRpcmVjdCB0byB0aGUgbmV3IHByb2plY3QgZXhwZXJpZW5jZS5cbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpXG4gICAgICAgICAgICAgIC5zbGljZShQYXRoUGFydC5TVEFSVCwgUGF0aFBhcnQuQVBQICsgMSkuam9pbignLycpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmZXRjaFNvdXJjZShkYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmIChjdXJyZW50LmlzT3duZXIgJiYgcGF0aEluZm8uYWN0aW9uID09PSAndmlldycpIHtcbiAgICAgICAgICAgICAgICBpc0VkaXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGZldGNoQWJ1c2VTY29yZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0VkaXRpbmcgPSB0cnVlO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhcHBPcHRpb25zLmlzQ2hhbm5lbEJhY2tlZCkge1xuICAgICAgaXNFZGl0aW5nID0gdHJ1ZTtcbiAgICAgIGNoYW5uZWxzLmZldGNoKGFwcE9wdGlvbnMuY2hhbm5lbCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmZXRjaFNvdXJjZShkYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwcm9qZWN0cy5zaG93U2hhcmVSZW1peEhlYWRlcigpO1xuICAgICAgICAgICAgZmV0Y2hBYnVzZVNjb3JlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZDtcbiAgfSxcblxuICAvKipcbiAgICogR2VuZXJhdGVzIHRoZSB1cmwgdG8gcGVyZm9ybSB0aGUgc3BlY2lmaWVkIGFjdGlvbiBmb3IgdGhpcyBwcm9qZWN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uIEFjdGlvbiB0byBwZXJmb3JtLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBVcmwgdG8gdGhlIHNwZWNpZmllZCBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGlzIHR5cGUgb2YgcHJvamVjdCBkb2VzIG5vdCBoYXZlIGEgc3RhbmRhbG9uZSBhcHAuXG4gICAqL1xuICBnZXRQYXRoTmFtZTogZnVuY3Rpb24gKGFjdGlvbikge1xuICAgIHZhciBwYXRoTmFtZSA9IHRoaXMuYXBwVG9Qcm9qZWN0VXJsKCkgKyAnLycgKyB0aGlzLmdldEN1cnJlbnRJZCgpO1xuICAgIGlmIChhY3Rpb24pIHtcbiAgICAgIHBhdGhOYW1lICs9ICcvJyArIGFjdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhOYW1lO1xuICB9XG59O1xuXG4vKipcbiAqIEdpdmVuIGRhdGEgZnJvbSBvdXIgY2hhbm5lbHMgYXBpLCB1cGRhdGVzIGN1cnJlbnQgYW5kIGdldHMgc291cmNlcyBmcm9tXG4gKiBzb3VyY2VzIGFwaVxuICogQHBhcmFtIHtvYmplY3R9IGNoYW5uZWxEYXRhIERhdGEgd2UgZmV0Y2hlZCBmcm9tIGNoYW5uZWxzIGFwaVxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gZmV0Y2hTb3VyY2UoY2hhbm5lbERhdGEsIGNhbGxiYWNrKSB7XG4gIC8vIEV4cGxpY2l0bHkgcmVtb3ZlIGxldmVsU291cmNlL2xldmVsSHRtbCBmcm9tIGNoYW5uZWxzXG4gIGRlbGV0ZSBjaGFubmVsRGF0YS5sZXZlbFNvdXJjZTtcbiAgZGVsZXRlIGNoYW5uZWxEYXRhLmxldmVsSHRtbDtcbiAgLy8gQWxzbyBjbGVhciBvdXQgaHRtbCwgd2hpY2ggd2UgbmV2ZXIgc2hvdWxkIGhhdmUgYmVlbiBzZXR0aW5nLlxuICBkZWxldGUgY2hhbm5lbERhdGEuaHRtbDtcblxuICAvLyBVcGRhdGUgY3VycmVudFxuICBjdXJyZW50ID0gY2hhbm5lbERhdGE7XG5cbiAgcHJvamVjdHMuc2V0VGl0bGUoY3VycmVudC5uYW1lKTtcbiAgaWYgKGNoYW5uZWxEYXRhLm1pZ3JhdGVkVG9TMykge1xuICAgIHNvdXJjZXMuZmV0Y2goY3VycmVudC5pZCArICcvJyArIFNPVVJDRV9GSUxFLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICB1bnBhY2tTb3VyY2VzKGRhdGEpO1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgd2UgY3JlYXRlZCBhIGNoYW5uZWwsIGJ1dCBmYWlsZWQgdG8gc2F2ZSBhbnl0aGluZyB0b1xuICAgIC8vIFMzLiBJbiB0aGlzIGNhc2UsIGl0J3MgZXhwZWN0ZWQgdGhhdCBodG1sL2xldmVsU291cmNlIGFyZSBudWxsLlxuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmV0Y2hBYnVzZVNjb3JlKGNhbGxiYWNrKSB7XG4gIGNoYW5uZWxzLmZldGNoKGN1cnJlbnQuaWQgKyAnL2FidXNlJywgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgIGN1cnJlbnRBYnVzZVNjb3JlID0gKGRhdGEgJiYgZGF0YS5hYnVzZV9zY29yZSkgfHwgY3VycmVudEFidXNlU2NvcmU7XG4gICAgY2FsbGJhY2soKTtcbiAgICBpZiAoZXJyKSB7XG4gICAgICAvLyBUaHJvdyBhbiBlcnJvciBzbyB0aGF0IHRoaW5ncyBsaWtlIE5ldyBSZWxpYyBzZWUgdGhpcy4gVGhpcyBzaG91bGRuJ3RcbiAgICAgIC8vIGFmZmVjdCBhbnl0aGluZyBlbHNlXG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBPbmx5IGV4ZWN1dGUgdGhlIGdpdmVuIGFyZ3VtZW50IGlmIGl0IGlzIGEgZnVuY3Rpb24uXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrLCBkYXRhKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayhkYXRhKTtcbiAgfVxufVxuXG4vKipcbiAqIGlzIHRoZSBjdXJyZW50IHByb2plY3QgKGlmIGFueSkgZWRpdGFibGUgYnkgdGhlIGxvZ2dlZCBpbiB1c2VyIChpZiBhbnkpP1xuICovXG5mdW5jdGlvbiBpc0VkaXRhYmxlKCkge1xuICByZXR1cm4gKGN1cnJlbnQgJiYgY3VycmVudC5pc093bmVyICYmICFjdXJyZW50LmZyb3plbik7XG59XG5cbi8qKlxuICogSWYgdGhlIGN1cnJlbnQgdXNlciBpcyB0aGUgb3duZXIsIHdlIHdhbnQgdG8gcmVkaXJlY3QgZnJvbSB0aGUgcmVhZG9ubHlcbiAqIC92aWV3IHJvdXRlIHRvIC9lZGl0LiBJZiB0aGV5IGFyZSBub3QgdGhlIG93bmVyLCB3ZSB3YW50IHRvIHJlZGlyZWN0IGZyb21cbiAqIC9lZGl0IHRvIC92aWV3XG4gKi9cbmZ1bmN0aW9uIHJlZGlyZWN0RWRpdFZpZXcoKSB7XG4gIHZhciBwYXJzZUluZm8gPSBwYXJzZVBhdGgoKTtcbiAgaWYgKCFwYXJzZUluZm8uYWN0aW9uKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGRvbid0IGRvIGFueSByZWRpcmVjdGluZyBpZiB3ZSBoYXZlbnQgbG9hZGVkIGEgY2hhbm5lbCB5ZXRcbiAgaWYgKCFjdXJyZW50KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuZXdVcmw7XG4gIGlmIChwYXJzZUluZm8uYWN0aW9uID09PSAndmlldycgJiYgaXNFZGl0YWJsZSgpKSB7XG4gICAgLy8gUmVkaXJlY3QgdG8gL2VkaXQgd2l0aG91dCBhIHJlYWRvbmx5IHdvcmtzcGFjZVxuICAgIG5ld1VybCA9IGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvKFxcL3Byb2plY3RzXFwvW14vXStcXC9bXi9dKylcXC92aWV3LywgJyQxL2VkaXQnKTtcbiAgICBhcHBPcHRpb25zLnJlYWRvbmx5V29ya3NwYWNlID0gZmFsc2U7XG4gICAgaXNFZGl0aW5nID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChwYXJzZUluZm8uYWN0aW9uID09PSAnZWRpdCcgJiYgIWlzRWRpdGFibGUoKSkge1xuICAgIC8vIFJlZGlyZWN0IHRvIC92aWV3IHdpdGggYSByZWFkb25seSB3b3Jrc3BhY2VcbiAgICBuZXdVcmwgPSBsb2NhdGlvbi5ocmVmLnJlcGxhY2UoLyhcXC9wcm9qZWN0c1xcL1teL10rXFwvW14vXSspXFwvZWRpdC8sICckMS92aWV3Jyk7XG4gICAgYXBwT3B0aW9ucy5yZWFkb25seVdvcmtzcGFjZSA9IHRydWU7XG4gICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gIH1cblxuICAvLyBQdXNoU3RhdGUgdG8gdGhlIG5ldyBVcmwgaWYgd2UgY2FuLCBvdGhlcndpc2UgZG8gbm90aGluZy5cbiAgaWYgKG5ld1VybCAmJiBuZXdVcmwgIT09IGxvY2F0aW9uLmhyZWYgJiYgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSB7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHttb2RpZmllZDogdHJ1ZX0sIGRvY3VtZW50LnRpdGxlLCBuZXdVcmwpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBEb2VzIGEgaGFyZCByZWRpcmVjdCBpZiB3ZSBlbmQgdXAgd2l0aCBhIGhhc2ggYmFzZWQgcHJvamVjdHMgdXJsLiBUaGlzIGNhblxuICogaGFwcGVuIG9uIElFOSwgd2hlbiB3ZSBzYXZlIGEgbmV3IHByb2plY3QgZm9yIGh0ZSBmaXJzdCB0aW1lLlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgd2UgZGlkIGFuIGFjdHVhbCByZWRpcmVjdFxuICovXG5mdW5jdGlvbiByZWRpcmVjdEZyb21IYXNoVXJsKCkge1xuICB2YXIgbmV3VXJsID0gbG9jYXRpb24uaHJlZi5yZXBsYWNlKCcjJywgJy8nKTtcbiAgaWYgKG5ld1VybCA9PT0gbG9jYXRpb24uaHJlZikge1xuICAgIC8vIE5vdGhpbmcgY2hhbmdlZFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwYXRoSW5mbyA9IHBhcnNlUGF0aCgpO1xuICBsb2NhdGlvbi5ocmVmID0gbmV3VXJsO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgY2hhbm5lbElkL2FjdGlvbiBmcm9tIHRoZSBwYXRobmFtZSwgYWNjb3VudGluZyBmb3IgdGhlIGZhY3RcbiAqIHRoYXQgd2UgbWF5IGhhdmUgaGFzaCBiYXNlZCByb3V0ZSBvciBub3RcbiAqL1xuZnVuY3Rpb24gcGFyc2VQYXRoKCkge1xuICB2YXIgcGF0aG5hbWUgPSBsb2NhdGlvbi5wYXRobmFtZTtcblxuICAvLyBXZSBoYXZlIGEgaGFzaCBiYXNlZCByb3V0ZS4gUmVwbGFjZSB0aGUgaGFzaCB3aXRoIGEgc2xhc2gsIGFuZCBhcHBlbmQgdG9cbiAgLy8gb3VyIGV4aXN0aW5nIHBhdGhcbiAgaWYgKGxvY2F0aW9uLmhhc2gpIHtcbiAgICBwYXRobmFtZSArPSBsb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnLycpO1xuICB9XG5cbiAgaWYgKHBhdGhuYW1lLnNwbGl0KCcvJylbUGF0aFBhcnQuUFJPSkVDVFNdICE9PSAncCcgJiZcbiAgICAgIHBhdGhuYW1lLnNwbGl0KCcvJylbUGF0aFBhcnQuUFJPSkVDVFNdICE9PSAncHJvamVjdHMnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFwcE5hbWU6IG51bGwsXG4gICAgICBjaGFubmVsSWQ6IG51bGwsXG4gICAgICBhY3Rpb246IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYXBwTmFtZTogcGF0aG5hbWUuc3BsaXQoJy8nKVtQYXRoUGFydC5BUFBdLFxuICAgIGNoYW5uZWxJZDogcGF0aG5hbWUuc3BsaXQoJy8nKVtQYXRoUGFydC5DSEFOTkVMX0lEXSxcbiAgICBhY3Rpb246IHBhdGhuYW1lLnNwbGl0KCcvJylbUGF0aFBhcnQuQUNUSU9OXVxuICB9O1xufVxuIiwiLyogZ2xvYmFsIGRhc2hib2FyZCwgUmVhY3QgKi9cblxuLyoqXG4gKiBSZW5kZXJzIG91ciBBYnVzZUV4Y2xhbWF0aW9uIGNvbXBvbmVudCwgYW5kIHBvdGVudGlhbGx5IHVwZGF0ZXMgYWRtaW4gYm94XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudCh3aW5kb3cuZGFzaGJvYXJkLkFidXNlRXhjbGFtYXRpb24sIHtcbiAgICBpMThuOiB7XG4gICAgICB0b3M6IHdpbmRvdy5kYXNoYm9hcmQuaTE4bi50KCdwcm9qZWN0LmFidXNlLnRvcycpLFxuICAgICAgY29udGFjdF91czogd2luZG93LmRhc2hib2FyZC5pMThuLnQoJ3Byb2plY3QuYWJ1c2UuY29udGFjdF91cycpLFxuICAgICAgZWRpdF9wcm9qZWN0OiB3aW5kb3cuZGFzaGJvYXJkLmkxOG4udCgncHJvamVjdC5lZGl0X3Byb2plY3QnKSxcbiAgICAgIGdvX3RvX2NvZGVfc3R1ZGlvOiB3aW5kb3cuZGFzaGJvYXJkLmkxOG4udCgncHJvamVjdC5hYnVzZS5nb190b19jb2RlX3N0dWRpbycpXG4gICAgfSxcbiAgICBpc093bmVyOiBkYXNoYm9hcmQucHJvamVjdC5pc093bmVyKClcbiAgfSksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlQXBwJykpO1xuXG4gIC8vIHVwZGF0ZSBhZG1pbiBib3ggKGlmIGl0IGV4aXN0cykgd2l0aCBhYnVzZSBpbmZvXG4gIGRhc2hib2FyZC5hZG1pbi5zaG93UHJvamVjdEFkbWluKCk7XG59O1xuIiwiLyogZ2xvYmFsIGdhICovXG5cbnZhciB1c2VyVGltaW5ncyA9IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RhcnRUaW1pbmc6IGZ1bmN0aW9uIChjYXRlZ29yeSwgdmFyaWFibGUsIGxhYmVsKSB7XG4gICAgdmFyIGtleSA9IGNhdGVnb3J5ICsgdmFyaWFibGUgKyBsYWJlbDtcbiAgICB1c2VyVGltaW5nc1trZXldID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH0sXG5cbiAgc3RvcFRpbWluZzogZnVuY3Rpb24gKGNhdGVnb3J5LCB2YXJpYWJsZSwgbGFiZWwpIHtcbiAgICB2YXIga2V5ID0gY2F0ZWdvcnkgKyB2YXJpYWJsZSArIGxhYmVsO1xuICAgIHZhciBlbmRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdmFyIHN0YXJ0VGltZSA9IHVzZXJUaW1pbmdzW2tleV07XG4gICAgdmFyIHRpbWVFbGFwc2VkID0gZW5kVGltZSAtIHN0YXJ0VGltZTtcbiAgICBnYSgnc2VuZCcsICd0aW1pbmcnLCBjYXRlZ29yeSwgdmFyaWFibGUsIHRpbWVFbGFwc2VkLCBsYWJlbCk7XG4gIH1cbn07XG4iXX0=
