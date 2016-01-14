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
      appOptions.level.lastAttempt = dashboard.clientState.sourceForLevel(
          appOptions.scriptName, appOptions.serverLevelId);

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
            appOptions.level.lastAttempt = cachedProgram;
          } else if (source && source.length) {
            // Sever version is newer
            appOptions.level.lastAttempt = source;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaW5pdEFwcC9jaHJvbWUzNEZpeC5qcyIsInNyYy9qcy9pbml0QXBwL2NsaWVudEFwaS5qcyIsInNyYy9qcy9pbml0QXBwL2luaXRBcHAuanMiLCJzcmMvanMvaW5pdEFwcC9sb2FkQXBwLmpzIiwic3JjL2pzL2luaXRBcHAvcHJvamVjdC5qcyIsInNyYy9qcy9pbml0QXBwL3JlbmRlckFidXNpdmUuanMiLCJzcmMvanMvaW5pdEFwcC90aW1pbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3B3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIFdlYktpdE11dGF0aW9uT2JzZXJ2ZXIgKi9cblxuLyoqXG4gKiBXb3JrYXJvdW5kIGZvciBDaHJvbWUgMzQgU1ZHIGJ1ZyAjMzQ5NzAxXG4gKlxuICogQnVnIGRldGFpbHM6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zNDk3MDFcbiAqICAgdGw7ZHI6IG9ubHkgdGhlIGZpcnN0IGNsaXBwYXRoIGluIGEgZ2l2ZW4gc3ZnIGVsZW1lbnQgcmVuZGVyc1xuICpcbiAqIFdvcmthcm91bmQ6IHdyYXAgYWxsIGNsaXBwYXRoL2ltYWdlIHBhaXJzIGludG8gdGhlaXIgb3duIHN2ZyBlbGVtZW50c1xuICpcbiAqIDEuIFdyYXAgYW55IGV4aXN0aW5nIGNsaXBwYXRoL2ltYWdlIHBhaXJzIGluIGVtcHR5IHN2ZyBlbGVtZW50c1xuICogMi4gV3JhcCBuZXcgY2xpcHBhdGgvaW1hZ2UgcGFpcnMgb25jZSBhZGRlZCwgcmVtb3ZlIGVtcHR5IHdyYXBwZXJzIG9uY2UgcmVtb3ZlZFxuICogMy4gRmFybWVyIHNwZWNpYWwgY2FzZTogZ2l2ZSB0aGUgZmFybWVyJ3Mgd3JhcHBlciBzdmcgdGhlIFwicGVnbWFuLWxvY2F0aW9uXCIgYXR0cmlidXRlXG4gKi9cblxudmFyIFBFR01BTl9PUkRFUklOR19DTEFTUyA9ICdwZWdtYW4tbG9jYXRpb24nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZml4dXA6IGZ1bmN0aW9uICgpIHtcbiAgICB3cmFwRXhpc3RpbmdDbGlwUGF0aHMoKTtcbiAgICBoYW5kbGVDbGlwUGF0aENoYW5nZXMoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2xpcFBhdGhJREZvckltYWdlKGltYWdlKSB7XG4gIHZhciBjbGlwUGF0aCA9ICQoaW1hZ2UpLmF0dHIoJ2NsaXAtcGF0aCcpO1xuICByZXR1cm4gY2xpcFBhdGggPyBjbGlwUGF0aC5tYXRjaCgvXFwoXFwjKC4qKVxcKS8pWzFdIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiB3cmFwSW1hZ2VBbmRDbGlwUGF0aFdpdGhTVkcoaW1hZ2UsIHdyYXBwZXJDbGFzcykge1xuICB2YXIgc3ZnV3JhcHBlciA9ICQoJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiAvPicpO1xuICBpZiAod3JhcHBlckNsYXNzKSB7XG4gICAgc3ZnV3JhcHBlci5hdHRyKCdjbGFzcycsIHdyYXBwZXJDbGFzcyk7XG4gIH1cblxuICB2YXIgY2xpcFBhdGhJRCA9IGNsaXBQYXRoSURGb3JJbWFnZShpbWFnZSk7XG4gIHZhciBjbGlwUGF0aCA9ICQoJyMnICsgY2xpcFBhdGhJRCk7XG4gIGNsaXBQYXRoLmluc2VydEFmdGVyKGltYWdlKS5hZGQoaW1hZ2UpLndyYXBBbGwoc3ZnV3JhcHBlcik7XG59XG5cbi8vIEZpbmQgcGFpcnMgb2YgbmV3IGltYWdlcyBhbmQgY2xpcCBwYXRocywgd3JhcHBpbmcgdGhlbSBpbiBTVkcgdGFncyB3aGVuIGEgcGFpciBpcyBmb3VuZFxuZnVuY3Rpb24gaGFuZGxlQ2xpcFBhdGhDaGFuZ2VzKCkge1xuICB2YXIgaTtcbiAgdmFyIGNhbnZhcyA9ICQoJyN2aXN1YWxpemF0aW9uPnN2ZycpWzBdO1xuICBpZiAoIWNhbnZhcykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBuZXdJbWFnZXMgPSB7fTtcbiAgdmFyIG5ld0NsaXBQYXRocyA9IHt9O1xuXG4gIHZhciBvYnNlcnZlciA9IG5ldyBXZWJLaXRNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG11dGF0aW9uKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV3Tm9kZSA9IG11dGF0aW9uLmFkZGVkTm9kZXNbaV07XG4gICAgICAgIGlmIChuZXdOb2RlLm5vZGVOYW1lID09ICdpbWFnZScpIHsgbmV3SW1hZ2VzWyQobmV3Tm9kZSkuYXR0cignaWQnKV0gPSBuZXdOb2RlOyB9XG4gICAgICAgIGlmIChuZXdOb2RlLm5vZGVOYW1lID09ICdjbGlwUGF0aCcpIHsgbmV3Q2xpcFBhdGhzWyQobmV3Tm9kZSkuYXR0cignaWQnKV0gPSBuZXdOb2RlOyB9XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbXV0YXRpb24ucmVtb3ZlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZW1vdmVkTm9kZSA9IG11dGF0aW9uLnJlbW92ZWROb2Rlc1tpXTtcbiAgICAgICAgaWYgKHJlbW92ZWROb2RlLm5vZGVOYW1lID09ICdpbWFnZScgfHwgcmVtb3ZlZE5vZGUubm9kZU5hbWUgPT0gJ2NsaXBQYXRoJykge1xuICAgICAgICAgICQoJ3N2ZyA+IHN2ZzplbXB0eScpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkLmVhY2gobmV3SW1hZ2VzLCBmdW5jdGlvbihrZXksIGltYWdlKSB7XG4gICAgICB2YXIgY2xpcFBhdGhJRCA9IGNsaXBQYXRoSURGb3JJbWFnZShpbWFnZSk7XG4gICAgICBpZiAobmV3Q2xpcFBhdGhzLmhhc093blByb3BlcnR5KGNsaXBQYXRoSUQpKSB7XG4gICAgICAgIHdyYXBJbWFnZUFuZENsaXBQYXRoV2l0aFNWRyhpbWFnZSk7XG4gICAgICAgIGRlbGV0ZSBuZXdJbWFnZXNba2V5XTtcbiAgICAgICAgZGVsZXRlIG5ld0NsaXBQYXRoc1tjbGlwUGF0aElEXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgb2JzZXJ2ZXIub2JzZXJ2ZShjYW52YXMsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xufVxuXG5mdW5jdGlvbiB3cmFwRXhpc3RpbmdDbGlwUGF0aHMoKSB7XG4gICQoJ1tjbGlwLXBhdGhdJykuZWFjaChmdW5jdGlvbihpLCBpbWFnZSl7XG4gICAgaWYgKCQoaW1hZ2UpLmF0dHIoJ2NsYXNzJykgPT09IFBFR01BTl9PUkRFUklOR19DTEFTUykge1xuICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciBGYXJtZXIsIHdob3NlIGNsYXNzIGlzIHVzZWQgZm9yIGVsZW1lbnQgb3JkZXJpbmdcbiAgICAgICQoaW1hZ2UpLmF0dHIoJ2NsYXNzJywgJycpO1xuICAgICAgd3JhcEltYWdlQW5kQ2xpcFBhdGhXaXRoU1ZHKGltYWdlLCBQRUdNQU5fT1JERVJJTkdfQ0xBU1MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cmFwSW1hZ2VBbmRDbGlwUGF0aFdpdGhTVkcoaW1hZ2UpO1xuICAgIH1cbiAgfSk7XG59XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBBUEkgb2JqZWN0IHRoYXQgd3JhcHMgYXN5bmNocm9ub3VzIGNhbGxzIHRvIG91ciBkYXRhIEFQSXMuXG4gKi9cblxuLyoqXG4gKiBTdGFuZGFyZCBjYWxsYmFjayBmb3JtIGZvciBhc3luY2hyb25vdXMgb3BlcmF0aW9ucywgcG9wdWxhcml6ZWQgYnkgTm9kZS5cbiAqIEB0eXBlZGVmIHtmdW5jdGlvbn0gTm9kZVN0eWxlQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J8bnVsbH0gZXJyb3IgLSBudWxsIGlmIHRoZSBhc3luYyBvcGVyYXRpb24gd2FzIHN1Y2Nlc3NmdWwuXG4gKiBAcGFyYW0geyp9IHJlc3VsdCAtIHJldHVybiB2YWx1ZSBmb3IgYXN5bmMgb3BlcmF0aW9uLlxuICovXG5cbi8qKlxuICogQG5hbWUgQ2xpZW50QXBpXG4gKi9cbnZhciBiYXNlID0ge1xuICAvKipcbiAgICogQmFzZSBVUkwgZm9yIHRhcmdldCBBUEkuXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICBhcGlfYmFzZV91cmw6IFwiL3YzL2NoYW5uZWxzXCIsXG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgYWxsIGNvbGxlY3Rpb25zLlxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyBhbiBhcnJheSBvZlxuICAgKiAgICAgICAgY29sbGVjdGlvbiBvYmplY3RzLlxuICAgKi9cbiAgYWxsOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsLFxuICAgICAgdHlwZTogXCJnZXRcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEluc2VydCBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIGNvbGxlY3Rpb24gY29udGVudHMsIG11c3QgYmUgSlNPTi5zdHJpbmdpZnktYWJsZS5cbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2sgLSBFeHBlY3RlZCByZXN1bHQgaXMgdGhlIGNyZWF0ZWRcbiAgICogICAgICAgIGNvbGxlY3Rpb24gb2JqZWN0ICh3aGljaCB3aWxsIGluY2x1ZGUgYW4gYXNzaWduZWQgJ2lkJyBrZXkpLlxuICAgKi9cbiAgY3JlYXRlOiBmdW5jdGlvbih2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCxcbiAgICAgIHR5cGU6IFwicG9zdFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0KSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKHJlcXVlc3QsIHN0YXR1cywgZXJyb3IpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3N0YXR1czogJyArIHN0YXR1cyArICc7IGVycm9yOiAnICsgZXJyb3IpO1xuICAgICAgY2FsbGJhY2soZXJyLCB1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBjb2xsZWN0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2hpbGRQYXRoIFRoZSBwYXRoIHVuZGVybmVhdGggYXBpX2Jhc2VfdXJsXG4gICAqIEBwYXJhbSB7Tm9kZVN0eWxlQ2FsbGJhY2t9IGNhbGxiYWNrIC0gRXhwZWN0ZWQgcmVzdWx0IGlzIFRSVUUuXG4gICAqL1xuICBkZWxldGU6IGZ1bmN0aW9uKGNoaWxkUGF0aCwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgY2hpbGRQYXRoICsgXCIvZGVsZXRlXCIsXG4gICAgICB0eXBlOiBcInBvc3RcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgdHJ1ZSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgZmFsc2UpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGlsZFBhdGggVGhlIHBhdGggdW5kZXJuZWF0aCBhcGlfYmFzZV91cmxcbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2sgLSBFeHBlY3RlZCByZXN1bHQgaXMgdGhlIHJlcXVlc3RlZFxuICAgKiAgICAgICAgY29sbGVjdGlvbiBvYmplY3QuXG4gICAqL1xuICBmZXRjaDogZnVuY3Rpb24oY2hpbGRQYXRoLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBjaGlsZFBhdGgsXG4gICAgICB0eXBlOiBcImdldFwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgdW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBjb250ZW50cyBvZiBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGlsZFBhdGggVGhlIHBhdGggdW5kZXJuZWF0aCBhcGlfYmFzZV91cmxcbiAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIC0gVGhlIG5ldyBjb2xsZWN0aW9uIGNvbnRlbnRzLlxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyB0aGUgbmV3IGNvbGxlY3Rpb25cbiAgICogICAgICAgIG9iamVjdC5cbiAgICovXG4gIHVwZGF0ZTogZnVuY3Rpb24oY2hpbGRQYXRoLCB2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgY2hpbGRQYXRoLFxuICAgICAgdHlwZTogXCJwb3N0XCIsXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ29weSB0byB0aGUgZGVzdGluYXRpb24gY29sbGVjdGlvbiwgc2luY2Ugd2UgZXhwZWN0IHRoZSBkZXN0aW5hdGlvblxuICAgKiB0byBiZSBlbXB0eS4gQSB0cnVlIHJlc3QgQVBJIHdvdWxkIHJlcGxhY2UgdGhlIGRlc3RpbmF0aW9uIGNvbGxlY3Rpb246XG4gICAqIEBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVwcmVzZW50YXRpb25hbF9zdGF0ZV90cmFuc2ZlciNBcHBsaWVkX3RvX3dlYl9zZXJ2aWNlc1xuICAgKiBAcGFyYW0geyp9IHNyYyAtIFNvdXJjZSBjb2xsZWN0aW9uIGlkZW50aWZpZXIuXG4gICAqIEBwYXJhbSB7Kn0gZGVzdCAtIERlc3RpbmF0aW9uIGNvbGxlY3Rpb24gaWRlbnRpZmllci5cbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2tcbiAgICovXG4gIGNvcHlBbGw6IGZ1bmN0aW9uKHNyYywgZGVzdCwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgZGVzdCArICc/c3JjPScgKyBzcmMsXG4gICAgICB0eXBlOiBcInB1dFwiXG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0KSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKHJlcXVlc3QsIHN0YXR1cywgZXJyb3IpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3N0YXR1czogJyArIHN0YXR1cyArICc7IGVycm9yOiAnICsgZXJyb3IpO1xuICAgICAgY2FsbGJhY2soZXJyLCBmYWxzZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgdGhlIGNvbnRlbnRzIG9mIGFuIGFzc2V0IG9yIHNvdXJjZSBmaWxlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaWQgLSBUaGUgY29sbGVjdGlvbiBpZGVudGlmaWVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgLSBUaGUgbmV3IGZpbGUgY29udGVudHMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIGNyZWF0ZSBvciB1cGRhdGUuXG4gICAqIEBwYXJhbSB7Tm9kZVN0eWxlQ2FsbGJhY2t9IGNhbGxiYWNrIC0gRXhwZWN0ZWQgcmVzdWx0IGlzIHRoZSBuZXcgY29sbGVjdGlvblxuICAgKiAgICAgICAgb2JqZWN0LlxuICAgKi9cbiAgcHV0OiBmdW5jdGlvbihpZCwgdmFsdWUsIGZpbGVuYW1lLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBpZCArIFwiL1wiICsgZmlsZW5hbWUsXG4gICAgICB0eXBlOiBcInB1dFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogdmFsdWVcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogTW9kaWZ5IHRoZSBjb250ZW50cyBvZiBhIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkIC0gVGhlIGNvbGxlY3Rpb24gaWRlbnRpZmllci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5UGFyYW1zIC0gQW55IHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIC0gVGhlIHJlcXVlc3QgYm9keVxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyB0aGUgbmV3IGNvbGxlY3Rpb25cbiAgICogICAgICAgIG9iamVjdC5cbiAgICovXG4gIHBhdGNoQWxsOiBmdW5jdGlvbihpZCwgcXVlcnlQYXJhbXMsIHZhbHVlLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBpZCArIFwiLz9cIiArIHF1ZXJ5UGFyYW1zLFxuICAgICAgdHlwZTogXCJwYXRjaFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogdmFsdWVcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxufTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvKipcbiAgICogQ3JlYXRlIGEgQ2xpZW50QXBpIGluc3RhbmNlIHdpdGggdGhlIGdpdmVuIGJhc2UgVVJMLlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IHVybCAtIEN1c3RvbSBBUEkgYmFzZSB1cmwgKGUuZy4gJy92My9uZXRzaW0nKVxuICAgKiBAcmV0dXJucyB7Q2xpZW50QXBpfVxuICAgKi9cbiAgY3JlYXRlOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgcmV0dXJuICQuZXh0ZW5kKHt9LCBiYXNlLCB7XG4gICAgICBhcGlfYmFzZV91cmw6IHVybFxuICAgIH0pO1xuICB9XG59O1xuIiwiLy8gVE9ETyAoYnJlbnQpIC0gd2F5IHRvbyBtYW55IGdsb2JhbHNcbi8qIGdsb2JhbCBzY3JpcHRfcGF0aCwgRGlhbG9nLCBDRE9Tb3VuZHMsIGRhc2hib2FyZCwgYXBwT3B0aW9ucywgdHJhY2tFdmVudCwgQXBwbGFiLCBCbG9ja2x5LCBzZW5kUmVwb3J0LCBjYW5jZWxSZXBvcnQsIGxhc3RTZXJ2ZXJSZXNwb25zZSwgc2hvd1ZpZGVvRGlhbG9nLCBnYSwgZGlnZXN0TWFuaWZlc3QqL1xuXG52YXIgdGltaW5nID0gcmVxdWlyZSgnLi90aW1pbmcnKTtcbnZhciBjaHJvbWUzNEZpeCA9IHJlcXVpcmUoJy4vY2hyb21lMzRGaXgnKTtcbnZhciBsb2FkQXBwID0gcmVxdWlyZSgnLi9sb2FkQXBwJyk7XG52YXIgcHJvamVjdCA9IHJlcXVpcmUoJy4vcHJvamVjdCcpO1xuXG53aW5kb3cuYXBwcyA9IHtcbiAgLy8gTG9hZHMgdGhlIGRlcGVuZGVuY2llcyBmb3IgdGhlIGN1cnJlbnQgYXBwIGJhc2VkIG9uIHZhbHVlcyBpbiBgYXBwT3B0aW9uc2AuXG4gIC8vIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgb25jZSBkZXBlbmRlbmNpZXMgYXJlIHJlYWR5LlxuICBsb2FkOiBsb2FkQXBwLFxuICAvLyBMZWdhY3kgQmxvY2tseSBpbml0aWFsaXphdGlvbiB0aGF0IHdhcyBtb3ZlZCBoZXJlIGZyb20gX2Jsb2NrbHkuaHRtbC5oYW1sLlxuICAvLyBNb2RpZmllcyBgYXBwT3B0aW9uc2Agd2l0aCBzb21lIGRlZmF1bHQgdmFsdWVzIGluIGBiYXNlT3B0aW9uc2AuXG4gIC8vIFRPRE8oZGF2ZSk6IE1vdmUgYmxvY2tseS1zcGVjaWZpYyBzZXR1cCBmdW5jdGlvbiBvdXQgb2Ygc2hhcmVkIGFuZCBiYWNrIGludG8gZGFzaGJvYXJkLlxuICBzZXR1cEFwcDogZnVuY3Rpb24gKGFwcE9wdGlvbnMpIHtcblxuICAgIGlmICghd2luZG93LmRhc2hib2FyZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3N1bWUgZXhpc3RlbmNlIG9mIHdpbmRvdy5kYXNoYm9hcmQnKTtcbiAgICB9XG4gICAgZGFzaGJvYXJkLnByb2plY3QgPSBwcm9qZWN0O1xuXG4gICAgdGltaW5nLnN0YXJ0VGltaW5nKCdQdXp6bGUnLCBzY3JpcHRfcGF0aCwgJycpO1xuXG4gICAgdmFyIGxhc3RTYXZlZFByb2dyYW07XG5cbiAgICAvLyBTZXRzIHVwIGRlZmF1bHQgb3B0aW9ucyBhbmQgaW5pdGlhbGl6ZXMgYmxvY2tseVxuICAgIHZhciBiYXNlT3B0aW9ucyA9IHtcbiAgICAgIGNvbnRhaW5lcklkOiAnY29kZUFwcCcsXG4gICAgICBEaWFsb2c6IERpYWxvZyxcbiAgICAgIGNkb1NvdW5kczogQ0RPU291bmRzLFxuICAgICAgcG9zaXRpb246IHtibG9ja1lDb29yZGluYXRlSW50ZXJ2YWw6IDI1fSxcbiAgICAgIG9uSW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRhc2hib2FyZC5jcmVhdGVDYWxsb3V0cyh0aGlzLmxldmVsLmNhbGxvdXRzIHx8IHRoaXMuY2FsbG91dHMpO1xuICAgICAgICBpZiAod2luZG93LmRhc2hib2FyZC5pc0Nocm9tZTM0KSB7XG4gICAgICAgICAgY2hyb21lMzRGaXguZml4dXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXBwT3B0aW9ucy5sZXZlbC5wcm9qZWN0VGVtcGxhdGVMZXZlbE5hbWUgfHwgYXBwT3B0aW9ucy5hcHAgPT09ICdhcHBsYWInKSB7XG4gICAgICAgICAgJCgnI2NsZWFyLXB1enpsZS1oZWFkZXInKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI3ZlcnNpb25zLWhlYWRlcicpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdhcHBJbml0aWFsaXplZCcpO1xuICAgICAgfSxcbiAgICAgIG9uQXR0ZW1wdDogZnVuY3Rpb24ocmVwb3J0KSB7XG4gICAgICAgIGlmIChhcHBPcHRpb25zLmxldmVsLmlzUHJvamVjdExldmVsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcHBPcHRpb25zLmNoYW5uZWwpIHtcbiAgICAgICAgICAvLyBEb24ndCBzZW5kIHRoZSBsZXZlbFNvdXJjZSBvciBpbWFnZSB0byBEYXNoYm9hcmQgZm9yIGNoYW5uZWwtYmFja2VkIGxldmVscy5cbiAgICAgICAgICAvLyAoVGhlIGxldmVsU291cmNlIGlzIGFscmVhZHkgc3RvcmVkIGluIHRoZSBjaGFubmVscyBBUEkuKVxuICAgICAgICAgIGRlbGV0ZSByZXBvcnQucHJvZ3JhbTtcbiAgICAgICAgICBkZWxldGUgcmVwb3J0LmltYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE9ubHkgbG9jYWxseSBjYWNoZSBub24tY2hhbm5lbC1iYWNrZWQgbGV2ZWxzLiBVc2UgYSBjbGllbnQtZ2VuZXJhdGVkXG4gICAgICAgICAgLy8gdGltZXN0YW1wIGluaXRpYWxseSAoaXQgd2lsbCBiZSB1cGRhdGVkIHdpdGggYSB0aW1lc3RhbXAgZnJvbSB0aGUgc2VydmVyXG4gICAgICAgICAgLy8gaWYgd2UgZ2V0IGEgcmVzcG9uc2UuXG4gICAgICAgICAgbGFzdFNhdmVkUHJvZ3JhbSA9IGRlY29kZVVSSUNvbXBvbmVudChyZXBvcnQucHJvZ3JhbSk7XG4gICAgICAgICAgZGFzaGJvYXJkLmNsaWVudFN0YXRlLndyaXRlU291cmNlRm9yTGV2ZWwoYXBwT3B0aW9ucy5zY3JpcHROYW1lLCBhcHBPcHRpb25zLnNlcnZlckxldmVsSWQsICtuZXcgRGF0ZSgpLCBsYXN0U2F2ZWRQcm9ncmFtKTtcbiAgICAgICAgfVxuICAgICAgICByZXBvcnQuc2NyaXB0TmFtZSA9IGFwcE9wdGlvbnMuc2NyaXB0TmFtZTtcbiAgICAgICAgcmVwb3J0LmZhbGxiYWNrUmVzcG9uc2UgPSBhcHBPcHRpb25zLnJlcG9ydC5mYWxsYmFja19yZXNwb25zZTtcbiAgICAgICAgcmVwb3J0LmNhbGxiYWNrID0gYXBwT3B0aW9ucy5yZXBvcnQuY2FsbGJhY2s7XG4gICAgICAgIC8vIFRyYWNrIHB1enpsZSBhdHRlbXB0IGV2ZW50XG4gICAgICAgIHRyYWNrRXZlbnQoJ1B1enpsZScsICdBdHRlbXB0Jywgc2NyaXB0X3BhdGgsIHJlcG9ydC5wYXNzID8gMSA6IDApO1xuICAgICAgICBpZiAocmVwb3J0LnBhc3MpIHtcbiAgICAgICAgICB0cmFja0V2ZW50KCdQdXp6bGUnLCAnU3VjY2VzcycsIHNjcmlwdF9wYXRoLCByZXBvcnQuYXR0ZW1wdCk7XG4gICAgICAgICAgdGltaW5nLnN0b3BUaW1pbmcoJ1B1enpsZScsIHNjcmlwdF9wYXRoLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHJhY2tFdmVudCgnQWN0aXZpdHknLCAnTGluZXMgb2YgQ29kZScsIHNjcmlwdF9wYXRoLCByZXBvcnQubGluZXMpO1xuICAgICAgICBzZW5kUmVwb3J0KHJlcG9ydCk7XG4gICAgICB9LFxuICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmICghYXBwT3B0aW9ucy5jaGFubmVsKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBjYWNoZSB0aW1lc3RhbXAgd2l0aCB0aGUgKG1vcmUgYWNjdXJhdGUpIHZhbHVlIGZyb20gdGhlIHNlcnZlci5cbiAgICAgICAgICBkYXNoYm9hcmQuY2xpZW50U3RhdGUud3JpdGVTb3VyY2VGb3JMZXZlbChhcHBPcHRpb25zLnNjcmlwdE5hbWUsIGFwcE9wdGlvbnMuc2VydmVyTGV2ZWxJZCwgcmVzcG9uc2UudGltZXN0YW1wLCBsYXN0U2F2ZWRQcm9ncmFtKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uUmVzZXRQcmVzc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FuY2VsUmVwb3J0KCk7XG4gICAgICB9LFxuICAgICAgb25Db250aW51ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChsYXN0U2VydmVyUmVzcG9uc2UudmlkZW9JbmZvKSB7XG4gICAgICAgICAgc2hvd1ZpZGVvRGlhbG9nKGxhc3RTZXJ2ZXJSZXNwb25zZS52aWRlb0luZm8pO1xuICAgICAgICB9IGVsc2UgaWYgKGxhc3RTZXJ2ZXJSZXNwb25zZS5uZXh0UmVkaXJlY3QpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGxhc3RTZXJ2ZXJSZXNwb25zZS5uZXh0UmVkaXJlY3Q7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBiYWNrVG9QcmV2aW91c0xldmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGxhc3RTZXJ2ZXJSZXNwb25zZS5wcmV2aW91c0xldmVsUmVkaXJlY3QpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGxhc3RTZXJ2ZXJSZXNwb25zZS5wcmV2aW91c0xldmVsUmVkaXJlY3Q7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzaG93SW5zdHJ1Y3Rpb25zV3JhcHBlcjogZnVuY3Rpb24oc2hvd0luc3RydWN0aW9ucykge1xuICAgICAgICAvLyBBbHdheXMgc2tpcCBhbGwgcHJlLWxldmVsIHBvcHVwcyBvbiBzaGFyZSBsZXZlbHMgb3Igd2hlbiBjb25maWd1cmVkIHRodXNcbiAgICAgICAgaWYgKHRoaXMuc2hhcmUgfHwgYXBwT3B0aW9ucy5sZXZlbC5za2lwSW5zdHJ1Y3Rpb25zUG9wdXApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYWZ0ZXJWaWRlb0NhbGxiYWNrID0gc2hvd0luc3RydWN0aW9ucztcbiAgICAgICAgaWYgKGFwcE9wdGlvbnMubGV2ZWwuYWZ0ZXJWaWRlb0JlZm9yZUluc3RydWN0aW9uc0ZuKSB7XG4gICAgICAgICAgYWZ0ZXJWaWRlb0NhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXBwT3B0aW9ucy5sZXZlbC5hZnRlclZpZGVvQmVmb3JlSW5zdHJ1Y3Rpb25zRm4oc2hvd0luc3RydWN0aW9ucyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYXNWaWRlbyA9ICEhYXBwT3B0aW9ucy5hdXRvcGxheVZpZGVvO1xuICAgICAgICB2YXIgaGFzSW5zdHJ1Y3Rpb25zID0gISEoYXBwT3B0aW9ucy5sZXZlbC5pbnN0cnVjdGlvbnMgfHxcbiAgICAgICAgYXBwT3B0aW9ucy5sZXZlbC5hbmlHaWZVUkwpO1xuXG4gICAgICAgIGlmIChoYXNWaWRlbykge1xuICAgICAgICAgIGlmIChoYXNJbnN0cnVjdGlvbnMpIHtcbiAgICAgICAgICAgIGFwcE9wdGlvbnMuYXV0b3BsYXlWaWRlby5vbkNsb3NlID0gYWZ0ZXJWaWRlb0NhbGxiYWNrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzaG93VmlkZW9EaWFsb2coYXBwT3B0aW9ucy5hdXRvcGxheVZpZGVvKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNJbnN0cnVjdGlvbnMpIHtcbiAgICAgICAgICBhZnRlclZpZGVvQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgJC5leHRlbmQodHJ1ZSwgYXBwT3B0aW9ucywgYmFzZU9wdGlvbnMpO1xuXG4gICAgLy8gVHVybiBzdHJpbmcgdmFsdWVzIGludG8gZnVuY3Rpb25zIGZvciBrZXlzIHRoYXQgYmVnaW4gd2l0aCAnZm5fJyAoSlNPTiBjYW4ndCBjb250YWluIGZ1bmN0aW9uIGRlZmluaXRpb25zKVxuICAgIC8vIEUuZy4geyBmbl9leGFtcGxlOiAnZnVuY3Rpb24gKCkgeyByZXR1cm47IH0nIH0gYmVjb21lcyB7IGV4YW1wbGU6IGZ1bmN0aW9uICgpIHsgcmV0dXJuOyB9IH1cbiAgICAoZnVuY3Rpb24gZml4VXBGdW5jdGlvbnMobm9kZSkge1xuICAgICAgaWYgKHR5cGVvZiBub2RlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpIGluIG5vZGUpIHtcbiAgICAgICAgaWYgKC9eZm5fLy50ZXN0KGkpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbiAgICAgICAgICAgIG5vZGVbaS5yZXBsYWNlKC9eZm5fLywgJycpXSA9IGV2YWwoJygnICsgbm9kZVtpXSArICcpJyk7XG4gICAgICAgICAgICAvKiBqc2hpbnQgaWdub3JlOmVuZCAqL1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZml4VXBGdW5jdGlvbnMobm9kZVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KShhcHBPcHRpb25zLmxldmVsKTtcbiAgfSxcblxuICAvLyBTZXQgdXAgcHJvamVjdHMsIHNraXBwaW5nIGJsb2NrbHktc3BlY2lmaWMgc3RlcHMuIERlc2lnbmVkIGZvciB1c2VcbiAgLy8gYnkgbGV2ZWxzIG9mIHR5cGUgXCJleHRlcm5hbFwiLlxuICBzZXR1cFByb2plY3RzRXh0ZXJuYWw6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghd2luZG93LmRhc2hib2FyZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3N1bWUgZXhpc3RlbmNlIG9mIHdpbmRvdy5kYXNoYm9hcmQnKTtcbiAgICB9XG5cbiAgICBkYXNoYm9hcmQucHJvamVjdCA9IHByb2plY3Q7XG4gIH0sXG5cbiAgLy8gRGVmaW5lIGJsb2NrbHkvZHJvcGxldC1zcGVjaWZpYyBjYWxsYmFja3MgZm9yIHByb2plY3RzIHRvIGFjY2Vzc1xuICAvLyBsZXZlbCBzb3VyY2UsIEhUTUwgYW5kIGhlYWRlcnMuXG4gIC8vIFRPRE8oZGF2ZSk6IEV4dHJhY3QgYmxvY2tseS1zcGVjaWZpYyBoYW5kbGVyIGNvZGUgaW50byBfYmxvY2tseS5odG1sLmhhbWwuXG4gIHNvdXJjZUhhbmRsZXI6IHtcbiAgICBzZXRJbml0aWFsTGV2ZWxIdG1sOiBmdW5jdGlvbiAobGV2ZWxIdG1sKSB7XG4gICAgICBhcHBPcHRpb25zLmxldmVsLmxldmVsSHRtbCA9IGxldmVsSHRtbDtcbiAgICB9LFxuICAgIGdldExldmVsSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5BcHBsYWIgJiYgQXBwbGFiLmdldEh0bWwoKTtcbiAgICB9LFxuICAgIHNldEluaXRpYWxMZXZlbFNvdXJjZTogZnVuY3Rpb24gKGxldmVsU291cmNlKSB7XG4gICAgICBhcHBPcHRpb25zLmxldmVsLmxhc3RBdHRlbXB0ID0gbGV2ZWxTb3VyY2U7XG4gICAgfSxcbiAgICBnZXRMZXZlbFNvdXJjZTogZnVuY3Rpb24gKGN1cnJlbnRMZXZlbFNvdXJjZSkge1xuICAgICAgdmFyIHNvdXJjZTtcbiAgICAgIGlmICh3aW5kb3cuQmxvY2tseSkge1xuICAgICAgICAvLyBJZiB3ZSdyZSByZWFkT25seSwgc291cmNlIGhhc24ndCBjaGFuZ2VkIGF0IGFsbFxuICAgICAgICBzb3VyY2UgPSBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmlzUmVhZE9ubHkoKSA/IGN1cnJlbnRMZXZlbFNvdXJjZSA6XG4gICAgICAgICAgQmxvY2tseS5YbWwuZG9tVG9UZXh0KEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb3VyY2UgPSB3aW5kb3cuQXBwbGFiICYmIEFwcGxhYi5nZXRDb2RlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc291cmNlO1xuICAgIH0sXG4gIH0sXG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgQmxvY2tseSBvciBEcm9wbGV0IGFwcC5cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIGRhc2hib2FyZC5wcm9qZWN0LmluaXQod2luZG93LmFwcHMuc291cmNlSGFuZGxlcik7XG4gICAgd2luZG93W2FwcE9wdGlvbnMuYXBwICsgJ01haW4nXShhcHBPcHRpb25zKTtcbiAgfVxufTtcbiIsIi8qIGdsb2JhbCBkYXNoYm9hcmQsIGFwcE9wdGlvbnMgKi9cblxudmFyIHJlbmRlckFidXNpdmUgPSByZXF1aXJlKCcuL3JlbmRlckFidXNpdmUnKTtcblxuLy8gTWF4IG1pbGxpc2Vjb25kcyB0byB3YWl0IGZvciBsYXN0IGF0dGVtcHQgZGF0YSBmcm9tIHRoZSBzZXJ2ZXJcbnZhciBMQVNUX0FUVEVNUFRfVElNRU9VVCA9IDUwMDA7XG5cbi8vIExvYWRzIHRoZSBnaXZlbiBhcHAgc3R5bGVzaGVldC5cbmZ1bmN0aW9uIGxvYWRTdHlsZShuYW1lKSB7XG4gICQoJ2JvZHknKS5hcHBlbmQoJCgnPGxpbms+Jywge1xuICAgIHJlbDogJ3N0eWxlc2hlZXQnLFxuICAgIHR5cGU6ICd0ZXh0L2NzcycsXG4gICAgaHJlZjogYXBwT3B0aW9ucy5iYXNlVXJsICsgJ2Nzcy8nICsgbmFtZSArICcuY3NzJ1xuICB9KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIHZhciBsYXN0QXR0ZW1wdExvYWRlZCA9IGZhbHNlO1xuXG4gIHZhciBsb2FkTGFzdEF0dGVtcHRGcm9tU2Vzc2lvblN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFsYXN0QXR0ZW1wdExvYWRlZCkge1xuICAgICAgbGFzdEF0dGVtcHRMb2FkZWQgPSB0cnVlO1xuXG4gICAgICAvLyBMb2FkIHRoZSBsb2NhbGx5LWNhY2hlZCBsYXN0IGF0dGVtcHQgKGlmIG9uZSBleGlzdHMpXG4gICAgICBhcHBPcHRpb25zLmxldmVsLmxhc3RBdHRlbXB0ID0gZGFzaGJvYXJkLmNsaWVudFN0YXRlLnNvdXJjZUZvckxldmVsKFxuICAgICAgICAgIGFwcE9wdGlvbnMuc2NyaXB0TmFtZSwgYXBwT3B0aW9ucy5zZXJ2ZXJMZXZlbElkKTtcblxuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGlzVmlld2luZ1NvbHV0aW9uID0gKGRhc2hib2FyZC5jbGllbnRTdGF0ZS5xdWVyeVBhcmFtcygnc29sdXRpb24nKSA9PT0gJ3RydWUnKTtcbiAgdmFyIGlzVmlld2luZ1N0dWRlbnRBbnN3ZXIgPSAhIWRhc2hib2FyZC5jbGllbnRTdGF0ZS5xdWVyeVBhcmFtcygndXNlcl9pZCcpO1xuXG4gIGlmICghYXBwT3B0aW9ucy5jaGFubmVsICYmICFpc1ZpZXdpbmdTb2x1dGlvbiAmJiAhaXNWaWV3aW5nU3R1ZGVudEFuc3dlcikge1xuXG4gICAgaWYgKGFwcE9wdGlvbnMucHVibGljQ2FjaGluZykge1xuICAgICAgLy8gRGlzYWJsZSBzb2NpYWwgc2hhcmUgYnkgZGVmYXVsdCBvbiBwdWJsaWNseS1jYWNoZWQgcGFnZXMsIGJlY2F1c2Ugd2UgZG9uJ3Qga25vd1xuICAgICAgLy8gaWYgdGhlIHVzZXIgaXMgdW5kZXJhZ2UgdW50aWwgd2UgZ2V0IGRhdGEgYmFjayBmcm9tIC9hcGkvdXNlcl9wcm9ncmVzcy8gYW5kIHdlXG4gICAgICAvLyBzaG91bGQgZXJyIG9uIHRoZSBzaWRlIG9mIG5vdCBzaG93aW5nIHNvY2lhbCBsaW5rc1xuICAgICAgYXBwT3B0aW9ucy5kaXNhYmxlU29jaWFsU2hhcmUgPSB0cnVlO1xuICAgIH1cblxuICAgICQuYWpheCgnL2FwaS91c2VyX3Byb2dyZXNzLycgKyBhcHBPcHRpb25zLnNjcmlwdE5hbWUgKyAnLycgKyBhcHBPcHRpb25zLnN0YWdlUG9zaXRpb24gKyAnLycgKyBhcHBPcHRpb25zLmxldmVsUG9zaXRpb24pLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGFwcE9wdGlvbnMuZGlzYWJsZVNvY2lhbFNoYXJlID0gZGF0YS5kaXNhYmxlU29jaWFsU2hhcmU7XG5cbiAgICAgIC8vIE1lcmdlIHByb2dyZXNzIGZyb20gc2VydmVyIChsb2FkZWQgdmlhIEFKQVgpXG4gICAgICB2YXIgc2VydmVyUHJvZ3Jlc3MgPSBkYXRhLnByb2dyZXNzIHx8IHt9O1xuICAgICAgdmFyIGNsaWVudFByb2dyZXNzID0gZGFzaGJvYXJkLmNsaWVudFN0YXRlLmFsbExldmVsc1Byb2dyZXNzKClbYXBwT3B0aW9ucy5zY3JpcHROYW1lXSB8fCB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHNlcnZlclByb2dyZXNzKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbElkKSB7XG4gICAgICAgIGlmIChzZXJ2ZXJQcm9ncmVzc1tsZXZlbElkXSAhPT0gY2xpZW50UHJvZ3Jlc3NbbGV2ZWxJZF0pIHtcbiAgICAgICAgICB2YXIgc3RhdHVzID0gZGFzaGJvYXJkLnByb2dyZXNzLm1lcmdlZEFjdGl2aXR5Q3NzQ2xhc3MoY2xpZW50UHJvZ3Jlc3NbbGV2ZWxJZF0sIHNlcnZlclByb2dyZXNzW2xldmVsSWRdKTtcblxuICAgICAgICAgIC8vIENsZWFyIHRoZSBleGlzdGluZyBjbGFzcyBhbmQgcmVwbGFjZVxuICAgICAgICAgICQoJyNoZWFkZXItbGV2ZWwtJyArIGxldmVsSWQpLmF0dHIoJ2NsYXNzJywgJ2xldmVsX2xpbmsgJyArIHN0YXR1cyk7XG5cbiAgICAgICAgICAvLyBXcml0ZSBkb3duIG5ldyBwcm9ncmVzcyBpbiBzZXNzaW9uU3RvcmFnZVxuICAgICAgICAgIGRhc2hib2FyZC5jbGllbnRTdGF0ZS50cmFja1Byb2dyZXNzKG51bGwsIG51bGwsIHNlcnZlclByb2dyZXNzW2xldmVsSWRdLCBhcHBPcHRpb25zLnNjcmlwdE5hbWUsIGxldmVsSWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFsYXN0QXR0ZW1wdExvYWRlZCkge1xuICAgICAgICBpZiAoZGF0YS5sYXN0QXR0ZW1wdCkge1xuICAgICAgICAgIGxhc3RBdHRlbXB0TG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAgIHZhciB0aW1lc3RhbXAgPSBkYXRhLmxhc3RBdHRlbXB0LnRpbWVzdGFtcDtcbiAgICAgICAgICB2YXIgc291cmNlID0gZGF0YS5sYXN0QXR0ZW1wdC5zb3VyY2U7XG5cbiAgICAgICAgICB2YXIgY2FjaGVkUHJvZ3JhbSA9IGRhc2hib2FyZC5jbGllbnRTdGF0ZS5zb3VyY2VGb3JMZXZlbChcbiAgICAgICAgICAgICAgYXBwT3B0aW9ucy5zY3JpcHROYW1lLCBhcHBPcHRpb25zLnNlcnZlckxldmVsSWQsIHRpbWVzdGFtcCk7XG4gICAgICAgICAgaWYgKGNhY2hlZFByb2dyYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gQ2xpZW50IHZlcnNpb24gaXMgbmV3ZXJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMubGV2ZWwubGFzdEF0dGVtcHQgPSBjYWNoZWRQcm9ncmFtO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlICYmIHNvdXJjZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFNldmVyIHZlcnNpb24gaXMgbmV3ZXJcbiAgICAgICAgICAgIGFwcE9wdGlvbnMubGV2ZWwubGFzdEF0dGVtcHQgPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIC8vIFdyaXRlIGRvd24gdGhlIGxhc3RBdHRlbXB0IGZyb20gc2VydmVyIGluIHNlc3Npb25TdG9yYWdlXG4gICAgICAgICAgICBkYXNoYm9hcmQuY2xpZW50U3RhdGUud3JpdGVTb3VyY2VGb3JMZXZlbChhcHBPcHRpb25zLnNjcmlwdE5hbWUsXG4gICAgICAgICAgICAgICAgYXBwT3B0aW9ucy5zZXJ2ZXJMZXZlbElkLCB0aW1lc3RhbXAsIHNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEuZGlzYWJsZVBvc3RNaWxlc3RvbmUpIHtcbiAgICAgICAgJChcIiNwcm9ncmVzc3dhcm5pbmdcIikuc2hvdygpO1xuICAgICAgfVxuICAgIH0pLmZhaWwobG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlKTtcblxuICAgIC8vIFVzZSB0aGlzIGluc3RlYWQgb2YgYSB0aW1lb3V0IG9uIHRoZSBBSkFYIHJlcXVlc3QgYmVjYXVzZSB3ZSBzdGlsbCB3YW50XG4gICAgLy8gdGhlIGhlYWRlciBwcm9ncmVzcyBkYXRhIGV2ZW4gaWYgdGhlIGxhc3QgYXR0ZW1wdCBkYXRhIHRha2VzIHRvbyBsb25nLlxuICAgIC8vIFRoZSBwcm9ncmVzcyBkb3RzIGNhbiBmYWRlIGluIGF0IGFueSB0aW1lIHdpdGhvdXQgaW1wYWN0aW5nIHRoZSB1c2VyLlxuICAgIHNldFRpbWVvdXQobG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlLCBMQVNUX0FUVEVNUFRfVElNRU9VVCk7XG4gIH0gZWxzZSBpZiAod2luZG93LmRhc2hib2FyZCAmJiBkYXNoYm9hcmQucHJvamVjdCkge1xuICAgIGRhc2hib2FyZC5wcm9qZWN0LmxvYWQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChkYXNoYm9hcmQucHJvamVjdC5oaWRlQmVjYXVzZUFidXNpdmUoKSkge1xuICAgICAgICByZW5kZXJBYnVzaXZlKCk7XG4gICAgICAgIHJldHVybiAkLkRlZmVycmVkKCkucmVqZWN0KCk7XG4gICAgICB9XG4gICAgfSkudGhlbihjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgbG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlKCk7XG4gIH1cbn07XG4iLCIvKiBnbG9iYWwgZGFzaGJvYXJkLCBhcHBPcHRpb25zLCB0cmFja0V2ZW50ICovXG5cbi8vIEF0dGVtcHQgdG8gc2F2ZSBwcm9qZWN0cyBldmVyeSAzMCBzZWNvbmRzXG52YXIgQVVUT1NBVkVfSU5URVJWQUwgPSAzMCAqIDEwMDA7XG5cbnZhciBBQlVTRV9USFJFU0hPTEQgPSAxMDtcblxudmFyIGhhc1Byb2plY3RDaGFuZ2VkID0gZmFsc2U7XG5cbnZhciBhc3NldHMgPSByZXF1aXJlKCcuL2NsaWVudEFwaScpLmNyZWF0ZSgnL3YzL2Fzc2V0cycpO1xudmFyIHNvdXJjZXMgPSByZXF1aXJlKCcuL2NsaWVudEFwaScpLmNyZWF0ZSgnL3YzL3NvdXJjZXMnKTtcbnZhciBjaGFubmVscyA9IHJlcXVpcmUoJy4vY2xpZW50QXBpJykuY3JlYXRlKCcvdjMvY2hhbm5lbHMnKTtcblxuLy8gTmFtZSBvZiB0aGUgcGFja2VkIHNvdXJjZSBmaWxlXG52YXIgU09VUkNFX0ZJTEUgPSAnbWFpbi5qc29uJztcblxudmFyIGV2ZW50cyA9IHtcbiAgLy8gRmlyZWQgd2hlbiBydW4gc3RhdGUgY2hhbmdlcyBvciB3ZSBlbnRlci9leGl0IGRlc2lnbiBtb2RlXG4gIGFwcE1vZGVDaGFuZ2VkOiAnYXBwTW9kZUNoYW5nZWQnLFxuICBhcHBJbml0aWFsaXplZDogJ2FwcEluaXRpYWxpemVkJyxcbiAgd29ya3NwYWNlQ2hhbmdlOiAnd29ya3NwYWNlQ2hhbmdlJ1xufTtcblxuLyoqXG4gKiBIZWxwZXIgZm9yIHdoZW4gd2Ugc3BsaXQgb3VyIHBhdGhuYW1lIGJ5IC8uIGNoYW5uZWxfaWQgYW5kIGFjdGlvbiBtYXkgZW5kIHVwXG4gKiBiZWluZyB1bmRlZmluZWQuXG4gKiBFeGFtcGxlIHBhdGhzOlxuICogL3Byb2plY3RzL2FwcGxhYlxuICogL3Byb2plY3RzL3BsYXlsYWIvMVU1M3BZcFI4c3pEZ3RyR0lHNWxJZ1xuICogL3Byb2plY3RzL2FydGlzdC9WeVZPLWJRYUdRLUN5YjdEYnBhYk5RL2VkaXRcbiAqL1xudmFyIFBhdGhQYXJ0ID0ge1xuICBTVEFSVDogMCxcbiAgUFJPSkVDVFM6IDEsXG4gIEFQUDogMixcbiAgQ0hBTk5FTF9JRDogMyxcbiAgQUNUSU9OOiA0XG59O1xuXG4vKipcbiAqIEN1cnJlbnQgc3RhdGUgb2Ygb3VyIENoYW5uZWwgQVBJIG9iamVjdFxuICogQHR5cGVkZWYge09iamVjdH0gUHJvamVjdEluc3RhbmNlXG4gKiBAcHJvcGVydHkge3N0cmluZ30gaWRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBuYW1lXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbGV2ZWxIdG1sXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbGV2ZWxTb3VyY2VcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gaGlkZGVuIERvZXNuJ3Qgc2hvdyB1cCBpbiBwcm9qZWN0IGxpc3RcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gaXNPd25lciBQb3B1bGF0ZWQgYnkgb3VyIHVwZGF0ZS9jcmVhdGUgY2FsbGJhY2suXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdXBkYXRlZEF0IFN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIERhdGUuIFBvcHVsYXRlZCBieVxuICogICBvdXQgdXBkYXRlL2NyZWF0ZSBjYWxsYmFja1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGxldmVsIFBhdGggd2hlcmUgdGhpcyBwYXJ0aWN1bGFyIGFwcCB0eXBlIGlzIGhvc3RlZFxuICovXG52YXIgY3VycmVudDtcbnZhciBjdXJyZW50U291cmNlVmVyc2lvbklkO1xudmFyIGN1cnJlbnRBYnVzZVNjb3JlID0gMDtcbnZhciBpc0VkaXRpbmcgPSBmYWxzZTtcblxuLyoqXG4gKiBDdXJyZW50IHN0YXRlIG9mIG91ciBzb3VyY2VzIEFQSSBkYXRhXG4gKi9cbnZhciBjdXJyZW50U291cmNlcyA9IHtcbiAgc291cmNlOiBudWxsLFxuICBodG1sOiBudWxsXG59O1xuXG4vKipcbiAqIEdldCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2Ygb3VyIHNvdXJjZXMgQVBJIG9iamVjdCBmb3IgdXBsb2FkXG4gKi9cbmZ1bmN0aW9uIHBhY2tTb3VyY2VzKCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoY3VycmVudFNvdXJjZXMpO1xufVxuXG4vKipcbiAqIFBvcHVsYXRlIG91ciBjdXJyZW50IHNvdXJjZXMgQVBJIG9iamVjdCBiYXNlZCBvZmYgb2YgZ2l2ZW4gZGF0YVxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEuc291cmNlXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YS5odG1sXG4gKi9cbmZ1bmN0aW9uIHVucGFja1NvdXJjZXMoZGF0YSkge1xuICBjdXJyZW50U291cmNlcyA9IHtcbiAgICBzb3VyY2U6IGRhdGEuc291cmNlLFxuICAgIGh0bWw6IGRhdGEuaHRtbFxuICB9O1xufVxuXG52YXIgcHJvamVjdHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLyoqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGlkIG9mIHRoZSBjdXJyZW50IHByb2plY3QsIG9yIHVuZGVmaW5lZCBpZiB3ZSBkb24ndCBoYXZlXG4gICAqICAgYSBjdXJyZW50IHByb2plY3QuXG4gICAqL1xuICBnZXRDdXJyZW50SWQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnQuaWQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IG5hbWUgb2YgdGhlIGN1cnJlbnQgcHJvamVjdCwgb3IgdW5kZWZpbmVkIGlmIHdlIGRvbid0IGhhdmVcbiAgICogICBhIGN1cnJlbnQgcHJvamVjdFxuICAgKi9cbiAgZ2V0Q3VycmVudE5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnQubmFtZTtcbiAgfSxcblxuICBnZXRDdXJyZW50VGltZXN0YW1wOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50LnVwZGF0ZWRBdDtcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldEFidXNlU2NvcmU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY3VycmVudEFidXNlU2NvcmU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldHMgYWJ1c2Ugc2NvcmUgdG8gemVybywgc2F2ZXMgdGhlIHByb2plY3QsIGFuZCByZWxvYWRzIHRoZSBwYWdlXG4gICAqL1xuICBhZG1pblJlc2V0QWJ1c2VTY29yZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9IHRoaXMuZ2V0Q3VycmVudElkKCk7XG4gICAgaWYgKCFpZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjaGFubmVscy5kZWxldGUoaWQgKyAnL2FidXNlJywgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICAgIGFzc2V0cy5wYXRjaEFsbChpZCwgJ2FidXNlX3Njb3JlPTAnLCBudWxsLCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICAkKCcuYWRtaW4tYWJ1c2Utc2NvcmUnKS50ZXh0KDApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHdlJ3JlIGZyb3plblxuICAgKi9cbiAgaXNGcm96ZW46IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnQuZnJvemVuO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzT3duZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY3VycmVudCAmJiBjdXJyZW50LmlzT3duZXI7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHByb2plY3QgaGFzIGJlZW4gcmVwb3J0ZWQgZW5vdWdoIHRpbWVzIHRvXG4gICAqICAgZXhjZWVkIG91ciB0aHJlc2hvbGRcbiAgICovXG4gIGV4Y2VlZHNBYnVzZVRocmVzaG9sZDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjdXJyZW50QWJ1c2VTY29yZSA+PSBBQlVTRV9USFJFU0hPTEQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgd2Ugc2hvdWxkIHNob3cgb3VyIGFidXNlIGJveCBpbnN0ZWFkIG9mIHNob3dpbmdcbiAgICogICB0aGUgcHJvamVjdC5cbiAgICovXG4gIGhpZGVCZWNhdXNlQWJ1c2l2ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5leGNlZWRzQWJ1c2VUaHJlc2hvbGQoKSB8fCBhcHBPcHRpb25zLnNjcmlwdElkKSB7XG4gICAgICAvLyBOZXZlciB3YW50IHRvIGhpZGUgd2hlbiBpbiB0aGUgY29udGV4dCBvZiBhIHNjcmlwdCwgYXMgdGhpcyB3aWxsIGFsd2F5c1xuICAgICAgLy8gZWl0aGVyIGJlIG1lIG9yIG15IHRlYWNoZXIgdmlld2luZyBteSBsYXN0IHN1Ym1pc3Npb25cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBXaGVuIG93bmVycyBlZGl0IGEgcHJvamVjdCwgd2UgZG9uJ3Qgd2FudCB0byBoaWRlIGl0IGVudGlyZWx5LiBJbnN0ZWFkLFxuICAgIC8vIHdlJ2xsIGxvYWQgdGhlIHByb2plY3QgYW5kIHNob3cgdGhlbSBhIHNtYWxsIGFsZXJ0XG4gICAgdmFyIHBhZ2VBY3Rpb24gPSBwYXJzZVBhdGgoKS5hY3Rpb247XG5cbiAgICAvLyBOT1RFOiBhcHBPcHRpb25zLmlzQWRtaW4gaXMgbm90IGEgc2VjdXJpdHkgc2V0dGluZyBhcyBpdCBjYW4gYmUgbWFuaXB1bGF0ZWRcbiAgICAvLyBieSB0aGUgdXNlci4gSW4gdGhpcyBjYXNlIHRoYXQncyBva2F5LCBzaW5jZSBhbGwgdGhhdCBkb2VzIGlzIGFsbG93IHRoZW0gdG9cbiAgICAvLyB2aWV3IGEgcHJvamVjdCB0aGF0IHdhcyBtYXJrZWQgYXMgYWJ1c2l2ZS5cbiAgICBpZiAoKHRoaXMuaXNPd25lcigpIHx8IGFwcE9wdGlvbnMuaXNBZG1pbikgJiZcbiAgICAgICAgKHBhZ2VBY3Rpb24gPT09ICdlZGl0JyB8fCBwYWdlQWN0aW9uID09PSAndmlldycpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBQcm9wZXJ0aWVzIGFuZCBjYWxsYmFja3MuIFRoZXNlIGFyZSBhbGwgY2FuZGlkYXRlcyBmb3IgYmVpbmcgZXh0cmFjdGVkXG4gIC8vIGFzIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVycyB3aGljaCBhcmUgcGFzc2VkIGluIGJ5IHRoZSBjYWxsZXIuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBUT0RPKGRhdmUpOiBleHRyYWN0IGlzQXV0b3NhdmVFbmFibGVkIGFuZCBhbnkgYm9vbGVhbiBoZWxwZXJcbiAgLy8gZnVuY3Rpb25zIGJlbG93IHRvIGJlY29tZSBwcm9wZXJ0aWVzIG9uIGFwcE9wdGlvbnMucHJvamVjdC5cbiAgLy8gUHJvamVjdHMgYmVoYXZpb3Igc2hvdWxkIHVsdGltYXRlbHkgYmUgZnVsbHkgY29uZmlndXJhYmxlIGJ5XG4gIC8vIHByb3BlcnRpZXMgb24gYXBwT3B0aW9ucy5wcm9qZWN0LCByYXRoZXIgdGhhbiByZWFjaGluZyBvdXRcbiAgLy8gaW50byBnbG9iYWwgc3RhdGUgdG8gbWFrZSBkZWNpc2lvbnMuXG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHdlJ3JlIGVkaXRpbmdcbiAgICovXG4gIGlzRWRpdGluZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBpc0VkaXRpbmc7XG4gIH0sXG5cbiAgLy8gV2hldGhlciB0aGUgY3VycmVudCBsZXZlbCBpcyBhIHByb2plY3QgbGV2ZWwgKGkuZS4gYXQgdGhlIC9wcm9qZWN0cyB1cmwpLlxuICBpc1Byb2plY3RMZXZlbDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChhcHBPcHRpb25zLmxldmVsICYmIGFwcE9wdGlvbnMubGV2ZWwuaXNQcm9qZWN0TGV2ZWwpO1xuICB9LFxuXG4gIHNob3VsZFVwZGF0ZUhlYWRlcnM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhYXBwT3B0aW9ucy5pc0V4dGVybmFsUHJvamVjdExldmVsO1xuICB9LFxuXG4gIHNob3dQcm9qZWN0SGVhZGVyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaG91bGRVcGRhdGVIZWFkZXJzKCkpIHtcbiAgICAgIGRhc2hib2FyZC5oZWFkZXIuc2hvd1Byb2plY3RIZWFkZXIoKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBhZG1pbiBib3ggZm9yIGFkbWlucy4gV2UgaGF2ZSBubyBrbm93bGVkZ2VcbiAgICogaGVyZSB3aGV0aGVyIHdlJ3JlIGFuIGFkbWluLCBhbmQgZGVwZW5kIG9uIGRhc2hib2FyZCBnZXR0aW5nIHRoaXMgcmlnaHQuXG4gICAqL1xuICBzaG93QWRtaW46IGZ1bmN0aW9uKCkge1xuICAgIGRhc2hib2FyZC5hZG1pbi5zaG93UHJvamVjdEFkbWluKCk7XG4gIH0sXG5cbiAgc2hvd01pbmltYWxQcm9qZWN0SGVhZGVyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaG91bGRVcGRhdGVIZWFkZXJzKCkpIHtcbiAgICAgIGRhc2hib2FyZC5oZWFkZXIuc2hvd01pbmltYWxQcm9qZWN0SGVhZGVyKCk7XG4gICAgfVxuICB9LFxuXG4gIHNob3dTaGFyZVJlbWl4SGVhZGVyOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaG91bGRVcGRhdGVIZWFkZXJzKCkpIHtcbiAgICAgIGRhc2hib2FyZC5oZWFkZXIuc2hvd1NoYXJlUmVtaXhIZWFkZXIoKTtcbiAgICB9XG4gIH0sXG4gIHNldE5hbWU6IGZ1bmN0aW9uKG5ld05hbWUpIHtcbiAgICBjdXJyZW50ID0gY3VycmVudCB8fCB7fTtcbiAgICBpZiAobmV3TmFtZSkge1xuICAgICAgY3VycmVudC5uYW1lID0gbmV3TmFtZTtcbiAgICAgIHRoaXMuc2V0VGl0bGUobmV3TmFtZSk7XG4gICAgfVxuICB9LFxuICBzZXRUaXRsZTogZnVuY3Rpb24obmV3TmFtZSkge1xuICAgIGlmIChuZXdOYW1lICYmIGFwcE9wdGlvbnMuZ2FtZURpc3BsYXlOYW1lKSB7XG4gICAgICBkb2N1bWVudC50aXRsZSA9IG5ld05hbWUgKyAnIC0gJyArIGFwcE9wdGlvbnMuZ2FtZURpc3BsYXlOYW1lO1xuICAgIH1cbiAgfSxcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIEVuZCBvZiBwcm9wZXJ0aWVzIGFuZCBjYWxsYmFja3MuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZUhhbmRsZXIgT2JqZWN0IGNvbnRhaW5pbmcgY2FsbGJhY2tzIHByb3ZpZGVkIGJ5IGNhbGxlci5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gc291cmNlSGFuZGxlci5zZXRJbml0aWFsTGV2ZWxIdG1sXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHNvdXJjZUhhbmRsZXIuZ2V0TGV2ZWxIdG1sXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHNvdXJjZUhhbmRsZXIuc2V0SW5pdGlhbExldmVsU291cmNlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHNvdXJjZUhhbmRsZXIuZ2V0TGV2ZWxTb3VyY2VcbiAgICovXG4gIGluaXQ6IGZ1bmN0aW9uIChzb3VyY2VIYW5kbGVyKSB7XG4gICAgdGhpcy5zb3VyY2VIYW5kbGVyID0gc291cmNlSGFuZGxlcjtcbiAgICBpZiAocmVkaXJlY3RGcm9tSGFzaFVybCgpIHx8IHJlZGlyZWN0RWRpdFZpZXcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzUHJvamVjdExldmVsKCkgfHwgY3VycmVudCkge1xuICAgICAgaWYgKGN1cnJlbnRTb3VyY2VzLmh0bWwpIHtcbiAgICAgICAgc291cmNlSGFuZGxlci5zZXRJbml0aWFsTGV2ZWxIdG1sKGN1cnJlbnRTb3VyY2VzLmh0bWwpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFZGl0aW5nKSB7XG4gICAgICAgIGlmIChjdXJyZW50KSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnRTb3VyY2VzLnNvdXJjZSkge1xuICAgICAgICAgICAgc291cmNlSGFuZGxlci5zZXRJbml0aWFsTGV2ZWxTb3VyY2UoY3VycmVudFNvdXJjZXMuc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXROYW1lKCdNeSBQcm9qZWN0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAkKHdpbmRvdykub24oZXZlbnRzLmFwcE1vZGVDaGFuZ2VkLCBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICB0aGlzLnNhdmUoY2FsbGJhY2spO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIEF1dG9zYXZlIGV2ZXJ5IEFVVE9TQVZFX0lOVEVSVkFMIG1pbGxpc2Vjb25kc1xuICAgICAgICAkKHdpbmRvdykub24oZXZlbnRzLmFwcEluaXRpYWxpemVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBpbml0aWFsIGFwcCBjb2RlIGFzIGEgYmFzZWxpbmVcbiAgICAgICAgICBjdXJyZW50U291cmNlcy5zb3VyY2UgPSB0aGlzLnNvdXJjZUhhbmRsZXIuZ2V0TGV2ZWxTb3VyY2UoY3VycmVudFNvdXJjZXMuc291cmNlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgJCh3aW5kb3cpLm9uKGV2ZW50cy53b3Jrc3BhY2VDaGFuZ2UsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBoYXNQcm9qZWN0Q2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5hdXRvc2F2ZV8uYmluZCh0aGlzKSwgQVVUT1NBVkVfSU5URVJWQUwpO1xuXG4gICAgICAgIGlmIChjdXJyZW50LmhpZGRlbikge1xuICAgICAgICAgIGlmICghdGhpcy5pc0Zyb3plbigpKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dTaGFyZVJlbWl4SGVhZGVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjdXJyZW50LmlzT3duZXIgfHwgIXBhcnNlUGF0aCgpLmNoYW5uZWxJZCkge1xuICAgICAgICAgICAgdGhpcy5zaG93UHJvamVjdEhlYWRlcigpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBWaWV3aW5nIHNvbWVvbmUgZWxzZSdzIHByb2plY3QgLSBzZXQgc2hhcmUgbW9kZVxuICAgICAgICAgICAgdGhpcy5zaG93TWluaW1hbFByb2plY3RIZWFkZXIoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudCkge1xuICAgICAgICB0aGlzLnNvdXJjZUhhbmRsZXIuc2V0SW5pdGlhbExldmVsU291cmNlKGN1cnJlbnRTb3VyY2VzLnNvdXJjZSk7XG4gICAgICAgIHRoaXMuc2hvd01pbmltYWxQcm9qZWN0SGVhZGVyKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhcHBPcHRpb25zLmlzTGVnYWN5U2hhcmUgJiYgdGhpcy5nZXRTdGFuZGFsb25lQXBwKCkpIHtcbiAgICAgIHRoaXMuc2V0TmFtZSgnVW50aXRsZWQgUHJvamVjdCcpO1xuICAgICAgdGhpcy5zaG93TWluaW1hbFByb2plY3RIZWFkZXIoKTtcbiAgICB9XG4gICAgaWYgKGFwcE9wdGlvbnMubm9QYWRkaW5nKSB7XG4gICAgICAkKFwiLmZ1bGxfY29udGFpbmVyXCIpLmNzcyh7XCJwYWRkaW5nXCI6XCIwcHhcIn0pO1xuICAgIH1cblxuICAgIHRoaXMuc2hvd0FkbWluKCk7XG4gIH0sXG4gIHByb2plY3RDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICBoYXNQcm9qZWN0Q2hhbmdlZCA9IHRydWU7XG4gIH0sXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgc3RhbmRhbG9uZSBhcHAgY2FwYWJsZSBvZiBydW5uaW5nXG4gICAqIHRoaXMgcHJvamVjdCBhcyBhIHN0YW5kYWxvbmUgcHJvamVjdCwgb3IgbnVsbCBpZiBub25lIGV4aXN0cy5cbiAgICovXG4gIGdldFN0YW5kYWxvbmVBcHA6IGZ1bmN0aW9uICgpIHtcbiAgICBzd2l0Y2ggKGFwcE9wdGlvbnMuYXBwKSB7XG4gICAgICBjYXNlICdhcHBsYWInOlxuICAgICAgICByZXR1cm4gJ2FwcGxhYic7XG4gICAgICBjYXNlICd0dXJ0bGUnOlxuICAgICAgICByZXR1cm4gJ2FydGlzdCc7XG4gICAgICBjYXNlICdjYWxjJzpcbiAgICAgICAgcmV0dXJuICdjYWxjJztcbiAgICAgIGNhc2UgJ2V2YWwnOlxuICAgICAgICByZXR1cm4gJ2V2YWwnO1xuICAgICAgY2FzZSAnc3R1ZGlvJzpcbiAgICAgICAgaWYgKGFwcE9wdGlvbnMubGV2ZWwudXNlQ29udHJhY3RFZGl0b3IpIHtcbiAgICAgICAgICByZXR1cm4gJ2FsZ2VicmFfZ2FtZSc7XG4gICAgICAgIH0gZWxzZSBpZiAoYXBwT3B0aW9ucy5za2luSWQgPT09ICdob2MyMDE1JyB8fCBhcHBPcHRpb25zLnNraW5JZCA9PT0gJ2luZmluaXR5Jykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAncGxheWxhYic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcGF0aCB0byB0aGUgYXBwIGNhcGFibGUgb2YgcnVubmluZ1xuICAgKiB0aGlzIHByb2plY3QgYXMgYSBzdGFuZGFsb25lIGFwcC5cbiAgICogQHRocm93cyB7RXJyb3J9IElmIG5vIHN0YW5kYWxvbmUgYXBwIGV4aXN0cy5cbiAgICovXG4gIGFwcFRvUHJvamVjdFVybDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcHAgPSBwcm9qZWN0cy5nZXRTdGFuZGFsb25lQXBwKCk7XG4gICAgaWYgKCFhcHApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyB0eXBlIG9mIHByb2plY3QgY2Fubm90IGJlIHJ1biBhcyBhIHN0YW5kYWxvbmUgYXBwLicpO1xuICAgIH1cbiAgICByZXR1cm4gJy9wcm9qZWN0cy8nICsgYXBwO1xuICB9LFxuICAvKipcbiAgICogRXhwbGljaXRseSBjbGVhciB0aGUgSFRNTCwgY2lyY3VtdmVudGluZyBzYWZldHkgbWVhc3VyZXMgd2hpY2ggcHJldmVudCBpdCBmcm9tXG4gICAqIGJlaW5nIGFjY2lkZW50YWxseSBkZWxldGVkLlxuICAgKi9cbiAgY2xlYXJIdG1sOiBmdW5jdGlvbigpIHtcbiAgICBjdXJyZW50U291cmNlcy5odG1sID0gJyc7XG4gIH0sXG4gIC8qKlxuICAgKiBTYXZlcyB0aGUgcHJvamVjdCB0byB0aGUgQ2hhbm5lbHMgQVBJLiBDYWxscyBgY2FsbGJhY2tgIG9uIHN1Y2Nlc3MgaWYgYVxuICAgKiBjYWxsYmFjayBmdW5jdGlvbiB3YXMgcHJvdmlkZWQuXG4gICAqIEBwYXJhbSB7b2JqZWN0P30gc291cmNlQW5kSHRtbCBPcHRpb25hbCBzb3VyY2UgdG8gYmUgcHJvdmlkZWQsIHNhdmluZyB1cyBhbm90aGVyXG4gICAqICAgY2FsbCB0byBgc291cmNlSGFuZGxlci5nZXRMZXZlbFNvdXJjZWAuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciBzYXZpbmcuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VOZXdWZXJzaW9uIElmIHRydWUsIGV4cGxpY2l0bHkgY3JlYXRlIGEgbmV3IHZlcnNpb24uXG4gICAqL1xuICBzYXZlOiBmdW5jdGlvbihzb3VyY2VBbmRIdG1sLCBjYWxsYmFjaywgZm9yY2VOZXdWZXJzaW9uKSB7XG4gICAgLy8gQ2FuJ3Qgc2F2ZSBhIHByb2plY3QgaWYgd2UncmUgbm90IHRoZSBvd25lci5cbiAgICBpZiAoY3VycmVudCAmJiBjdXJyZW50LmlzT3duZXIgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbicgfHwgIXNvdXJjZUFuZEh0bWwpIHtcbiAgICAgIC8vIElmIG5vIHNvdXJjZSBpcyBwcm92aWRlZCwgc2hpZnQgdGhlIGFyZ3VtZW50cyBhbmQgYXNrIGZvciB0aGUgc291cmNlXG4gICAgICAvLyBvdXJzZWx2ZXMuXG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShhcmd1bWVudHMpO1xuICAgICAgY2FsbGJhY2sgPSBhcmdzWzBdO1xuICAgICAgZm9yY2VOZXdWZXJzaW9uID0gYXJnc1sxXTtcblxuICAgICAgc291cmNlQW5kSHRtbCA9IHtcbiAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZUhhbmRsZXIuZ2V0TGV2ZWxTb3VyY2UoKSxcbiAgICAgICAgaHRtbDogdGhpcy5zb3VyY2VIYW5kbGVyLmdldExldmVsSHRtbCgpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChmb3JjZU5ld1ZlcnNpb24pIHtcbiAgICAgIGN1cnJlbnRTb3VyY2VWZXJzaW9uSWQgPSBudWxsO1xuICAgIH1cblxuICAgICQoJy5wcm9qZWN0X3VwZGF0ZWRfYXQnKS50ZXh0KCdTYXZpbmcuLi4nKTsgIC8vIFRPRE8gKEpvc2gpIGkxOG5cbiAgICB2YXIgY2hhbm5lbElkID0gY3VycmVudC5pZDtcbiAgICAvLyBUT0RPKGRhdmUpOiBSZW1vdmUgdGhpcyBjaGVjayBhbmQgcmVtb3ZlIGNsZWFySHRtbCgpIG9uY2UgYWxsIHByb2plY3RzXG4gICAgLy8gaGF2ZSB2ZXJzaW9uaW5nOiBodHRwczovL3d3dy5waXZvdGFsdHJhY2tlci5jb20vc3Rvcnkvc2hvdy8xMDMzNDc0OThcbiAgICBpZiAoY3VycmVudFNvdXJjZXMuaHRtbCAmJiAhc291cmNlQW5kSHRtbC5odG1sKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRpbmcgdG8gYmxvdyBhd2F5IGV4aXN0aW5nIGxldmVsSHRtbCcpO1xuICAgIH1cblxuICAgIHVucGFja1NvdXJjZXMoc291cmNlQW5kSHRtbCk7XG4gICAgaWYgKHRoaXMuZ2V0U3RhbmRhbG9uZUFwcCgpKSB7XG4gICAgICBjdXJyZW50LmxldmVsID0gdGhpcy5hcHBUb1Byb2plY3RVcmwoKTtcbiAgICB9XG5cbiAgICB2YXIgZmlsZW5hbWUgPSBTT1VSQ0VfRklMRSArIChjdXJyZW50U291cmNlVmVyc2lvbklkID8gXCI/dmVyc2lvbj1cIiArIGN1cnJlbnRTb3VyY2VWZXJzaW9uSWQgOiAnJyk7XG4gICAgc291cmNlcy5wdXQoY2hhbm5lbElkLCBwYWNrU291cmNlcygpLCBmaWxlbmFtZSwgZnVuY3Rpb24gKGVyciwgcmVzcG9uc2UpIHtcbiAgICAgIGN1cnJlbnRTb3VyY2VWZXJzaW9uSWQgPSByZXNwb25zZS52ZXJzaW9uSWQ7XG4gICAgICBjdXJyZW50Lm1pZ3JhdGVkVG9TMyA9IHRydWU7XG5cbiAgICAgIGNoYW5uZWxzLnVwZGF0ZShjaGFubmVsSWQsIGN1cnJlbnQsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgICAgdGhpcy51cGRhdGVDdXJyZW50RGF0YV8oZXJyLCBkYXRhLCBmYWxzZSk7XG4gICAgICAgIGV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaywgZGF0YSk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG4gIHVwZGF0ZUN1cnJlbnREYXRhXzogZnVuY3Rpb24gKGVyciwgZGF0YSwgaXNOZXdDaGFubmVsKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgJCgnLnByb2plY3RfdXBkYXRlZF9hdCcpLnRleHQoJ0Vycm9yIHNhdmluZyBwcm9qZWN0Jyk7ICAvLyBUT0RPIGkxOG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjdXJyZW50ID0gZGF0YTtcbiAgICBpZiAoaXNOZXdDaGFubmVsKSB7XG4gICAgICAvLyBXZSBoYXZlIGEgbmV3IGNoYW5uZWwsIG1lYW5pbmcgZWl0aGVyIHdlIGhhZCBubyBjaGFubmVsIGJlZm9yZSwgb3JcbiAgICAgIC8vIHdlJ3ZlIGNoYW5nZWQgY2hhbm5lbHMuIElmIHdlIGFyZW4ndCBhdCBhIC9wcm9qZWN0cy88YXBwbmFtZT4gbGluayxcbiAgICAgIC8vIGFsd2F5cyBkbyBhIHJlZGlyZWN0IChpLmUuIHdlJ3JlIHJlbWl4IGZyb20gaW5zaWRlIGEgc2NyaXB0KVxuICAgICAgaWYgKGlzRWRpdGluZyAmJiBwYXJzZVBhdGgoKS5hcHBOYW1lKSB7XG4gICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgZG9jdW1lbnQudGl0bGUsIHRoaXMuZ2V0UGF0aE5hbWUoJ2VkaXQnKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdlJ3JlIG9uIGEgc2hhcmUgcGFnZSwgYW5kIGdvdCBhIG5ldyBjaGFubmVsIGlkLiBBbHdheXMgZG8gYSByZWRpcmVjdFxuICAgICAgICBsb2NhdGlvbi5ocmVmID0gdGhpcy5nZXRQYXRoTmFtZSgnZWRpdCcpO1xuICAgICAgfVxuICAgIH1cbiAgICBkYXNoYm9hcmQuaGVhZGVyLnVwZGF0ZVRpbWVzdGFtcCgpO1xuICB9LFxuICAvKipcbiAgICogQXV0b3NhdmUgdGhlIGNvZGUgaWYgdGhpbmdzIGhhdmUgY2hhbmdlZFxuICAgKi9cbiAgYXV0b3NhdmVfOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gQmFpbCBpZiBiYXNlbGluZSBjb2RlIGRvZXNuJ3QgZXhpc3QgKGFwcCBub3QgeWV0IGluaXRpYWxpemVkKVxuICAgIGlmIChjdXJyZW50U291cmNlcy5zb3VyY2UgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gYGdldExldmVsU291cmNlKClgIGlzIGV4cGVuc2l2ZSBmb3IgQmxvY2tseSBzbyBvbmx5IGNhbGxcbiAgICAvLyBhZnRlciBgd29ya3NwYWNlQ2hhbmdlYCBoYXMgZmlyZWRcbiAgICBpZiAoIWFwcE9wdGlvbnMuZHJvcGxldCAmJiAhaGFzUHJvamVjdENoYW5nZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoJCgnI2Rlc2lnbk1vZGVWaXogLnVpLWRyYWdnYWJsZS1kcmFnZ2luZycpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzb3VyY2UgPSB0aGlzLnNvdXJjZUhhbmRsZXIuZ2V0TGV2ZWxTb3VyY2UoKTtcbiAgICB2YXIgaHRtbCA9IHRoaXMuc291cmNlSGFuZGxlci5nZXRMZXZlbEh0bWwoKTtcblxuICAgIGlmIChjdXJyZW50U291cmNlcy5zb3VyY2UgPT09IHNvdXJjZSAmJiBjdXJyZW50U291cmNlcy5odG1sID09PSBodG1sKSB7XG4gICAgICBoYXNQcm9qZWN0Q2hhbmdlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2F2ZSh7c291cmNlOiBzb3VyY2UsIGh0bWw6IGh0bWx9LCBmdW5jdGlvbiAoKSB7XG4gICAgICBoYXNQcm9qZWN0Q2hhbmdlZCA9IGZhbHNlO1xuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogUmVuYW1lcyBhbmQgc2F2ZXMgdGhlIHByb2plY3QuXG4gICAqL1xuICByZW5hbWU6IGZ1bmN0aW9uKG5ld05hbWUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5zZXROYW1lKG5ld05hbWUpO1xuICAgIHRoaXMuc2F2ZShjYWxsYmFjayk7XG4gIH0sXG4gIC8qKlxuICAgKiBGcmVlemVzIGFuZCBzYXZlcyB0aGUgcHJvamVjdC4gQWxzbyBoaWRlcyBzbyB0aGF0IGl0J3Mgbm90IGF2YWlsYWJsZSBmb3IgZGVsZXRpbmcvcmVuYW1pbmcgaW4gdGhlIHVzZXIncyBwcm9qZWN0IGxpc3QuXG4gICAqL1xuICBmcmVlemU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgY3VycmVudC5mcm96ZW4gPSB0cnVlO1xuICAgIGN1cnJlbnQuaGlkZGVuID0gdHJ1ZTtcbiAgICB0aGlzLnNhdmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrLCBkYXRhKTtcbiAgICAgIHJlZGlyZWN0RWRpdFZpZXcoKTtcbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoZSBwcm9qZWN0LCBnaXZlcyBpdCB0aGUgcHJvdmlkZWQgbmFtZSwgYW5kIHNldHMgdGhlXG4gICAqIGNvcHkgYXMgdGhlIGN1cnJlbnQgcHJvamVjdC5cbiAgICovXG4gIGNvcHk6IGZ1bmN0aW9uKG5ld05hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNyY0NoYW5uZWwgPSBjdXJyZW50LmlkO1xuICAgIHZhciB3cmFwcGVkQ2FsbGJhY2sgPSB0aGlzLmNvcHlBc3NldHMuYmluZCh0aGlzLCBzcmNDaGFubmVsLCBjYWxsYmFjayk7XG4gICAgZGVsZXRlIGN1cnJlbnQuaWQ7XG4gICAgZGVsZXRlIGN1cnJlbnQuaGlkZGVuO1xuICAgIHRoaXMuc2V0TmFtZShuZXdOYW1lKTtcbiAgICBjaGFubmVscy5jcmVhdGUoY3VycmVudCwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAgdGhpcy51cGRhdGVDdXJyZW50RGF0YV8oZXJyLCBkYXRhLCB0cnVlKTtcbiAgICAgIHRoaXMuc2F2ZSh3cmFwcGVkQ2FsbGJhY2spO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG4gIGNvcHlBc3NldHM6IGZ1bmN0aW9uIChzcmNDaGFubmVsLCBjYWxsYmFjaykge1xuICAgIGlmICghc3JjQ2hhbm5lbCkge1xuICAgICAgZXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGRlc3RDaGFubmVsID0gY3VycmVudC5pZDtcbiAgICBhc3NldHMuY29weUFsbChzcmNDaGFubmVsLCBkZXN0Q2hhbm5lbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgICQoJy5wcm9qZWN0X3VwZGF0ZWRfYXQnKS50ZXh0KCdFcnJvciBjb3B5aW5nIGZpbGVzJyk7ICAvLyBUT0RPIGkxOG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfSxcbiAgc2VydmVyU2lkZVJlbWl4OiBmdW5jdGlvbigpIHtcbiAgICBpZiAoY3VycmVudCAmJiAhY3VycmVudC5uYW1lKSB7XG4gICAgICBpZiAocHJvamVjdHMuYXBwVG9Qcm9qZWN0VXJsKCkgPT09ICcvcHJvamVjdHMvYWxnZWJyYV9nYW1lJykge1xuICAgICAgICB0aGlzLnNldE5hbWUoJ0JpZyBHYW1lIFRlbXBsYXRlJyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2plY3RzLmFwcFRvUHJvamVjdFVybCgpID09PSAnL3Byb2plY3RzL2FwcGxhYicpIHtcbiAgICAgICAgdGhpcy5zZXROYW1lKCdNeSBQcm9qZWN0Jyk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlZGlyZWN0VG9SZW1peCgpIHtcbiAgICAgIGxvY2F0aW9uLmhyZWYgPSBwcm9qZWN0cy5nZXRQYXRoTmFtZSgncmVtaXgnKTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIHVzZXIgaXMgdGhlIG93bmVyLCBzYXZlIGJlZm9yZSByZW1peGluZyBvbiB0aGUgc2VydmVyLlxuICAgIGlmIChjdXJyZW50LmlzT3duZXIpIHtcbiAgICAgIHByb2plY3RzLnNhdmUocmVkaXJlY3RUb1JlbWl4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVkaXJlY3RUb1JlbWl4KCk7XG4gICAgfVxuICB9LFxuICBjcmVhdGVOZXc6IGZ1bmN0aW9uKCkge1xuICAgIHByb2plY3RzLnNhdmUoZnVuY3Rpb24gKCkge1xuICAgICAgbG9jYXRpb24uaHJlZiA9IHByb2plY3RzLmFwcFRvUHJvamVjdFVybCgpICsgJy9uZXcnO1xuICAgIH0pO1xuICB9LFxuICBkZWxldGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGNoYW5uZWxJZCA9IGN1cnJlbnQuaWQ7XG4gICAgY2hhbm5lbHMuZGVsZXRlKGNoYW5uZWxJZCwgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgICBleGVjdXRlQ2FsbGJhY2soY2FsbGJhY2ssIGRhdGEpO1xuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogQHJldHVybnMge2pRdWVyeS5EZWZlcnJlZH0gQSBkZWZlcnJlZCB3aGljaCB3aWxsIHJlc29sdmUgd2hlbiB0aGUgcHJvamVjdCBsb2Fkcy5cbiAgICovXG4gIGxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBuZXcgJC5EZWZlcnJlZCgpO1xuICAgIGlmIChwcm9qZWN0cy5pc1Byb2plY3RMZXZlbCgpKSB7XG4gICAgICBpZiAocmVkaXJlY3RGcm9tSGFzaFVybCgpIHx8IHJlZGlyZWN0RWRpdFZpZXcoKSkge1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZDtcbiAgICAgIH1cbiAgICAgIHZhciBwYXRoSW5mbyA9IHBhcnNlUGF0aCgpO1xuXG4gICAgICBpZiAocGF0aEluZm8uY2hhbm5lbElkKSB7XG4gICAgICAgIGlmIChwYXRoSW5mby5hY3Rpb24gPT09ICdlZGl0Jykge1xuICAgICAgICAgIGlzRWRpdGluZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJCgnI2JldGFpbmZvJykuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9hZCB0aGUgcHJvamVjdCBJRCwgaWYgb25lIGV4aXN0c1xuICAgICAgICBjaGFubmVscy5mZXRjaChwYXRoSW5mby5jaGFubmVsSWQsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAvLyBQcm9qZWN0IG5vdCBmb3VuZCwgcmVkaXJlY3QgdG8gdGhlIG5ldyBwcm9qZWN0IGV4cGVyaWVuY2UuXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVxuICAgICAgICAgICAgICAuc2xpY2UoUGF0aFBhcnQuU1RBUlQsIFBhdGhQYXJ0LkFQUCArIDEpLmpvaW4oJy8nKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmV0Y2hTb3VyY2UoZGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpZiAoY3VycmVudC5pc093bmVyICYmIHBhdGhJbmZvLmFjdGlvbiA9PT0gJ3ZpZXcnKSB7XG4gICAgICAgICAgICAgICAgaXNFZGl0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBmZXRjaEFidXNlU2NvcmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNFZGl0aW5nID0gdHJ1ZTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYXBwT3B0aW9ucy5pc0NoYW5uZWxCYWNrZWQpIHtcbiAgICAgIGlzRWRpdGluZyA9IHRydWU7XG4gICAgICBjaGFubmVscy5mZXRjaChhcHBPcHRpb25zLmNoYW5uZWwsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmV0Y2hTb3VyY2UoZGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHJvamVjdHMuc2hvd1NoYXJlUmVtaXhIZWFkZXIoKTtcbiAgICAgICAgICAgIGZldGNoQWJ1c2VTY29yZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyB0aGUgdXJsIHRvIHBlcmZvcm0gdGhlIHNwZWNpZmllZCBhY3Rpb24gZm9yIHRoaXMgcHJvamVjdC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbiBBY3Rpb24gdG8gcGVyZm9ybS5cbiAgICogQHJldHVybnMge3N0cmluZ30gVXJsIHRvIHRoZSBzcGVjaWZpZWQgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhpcyB0eXBlIG9mIHByb2plY3QgZG9lcyBub3QgaGF2ZSBhIHN0YW5kYWxvbmUgYXBwLlxuICAgKi9cbiAgZ2V0UGF0aE5hbWU6IGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICB2YXIgcGF0aE5hbWUgPSB0aGlzLmFwcFRvUHJvamVjdFVybCgpICsgJy8nICsgdGhpcy5nZXRDdXJyZW50SWQoKTtcbiAgICBpZiAoYWN0aW9uKSB7XG4gICAgICBwYXRoTmFtZSArPSAnLycgKyBhY3Rpb247XG4gICAgfVxuICAgIHJldHVybiBwYXRoTmFtZTtcbiAgfVxufTtcblxuLyoqXG4gKiBHaXZlbiBkYXRhIGZyb20gb3VyIGNoYW5uZWxzIGFwaSwgdXBkYXRlcyBjdXJyZW50IGFuZCBnZXRzIHNvdXJjZXMgZnJvbVxuICogc291cmNlcyBhcGlcbiAqIEBwYXJhbSB7b2JqZWN0fSBjaGFubmVsRGF0YSBEYXRhIHdlIGZldGNoZWQgZnJvbSBjaGFubmVscyBhcGlcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIGZldGNoU291cmNlKGNoYW5uZWxEYXRhLCBjYWxsYmFjaykge1xuICAvLyBFeHBsaWNpdGx5IHJlbW92ZSBsZXZlbFNvdXJjZS9sZXZlbEh0bWwgZnJvbSBjaGFubmVsc1xuICBkZWxldGUgY2hhbm5lbERhdGEubGV2ZWxTb3VyY2U7XG4gIGRlbGV0ZSBjaGFubmVsRGF0YS5sZXZlbEh0bWw7XG4gIC8vIEFsc28gY2xlYXIgb3V0IGh0bWwsIHdoaWNoIHdlIG5ldmVyIHNob3VsZCBoYXZlIGJlZW4gc2V0dGluZy5cbiAgZGVsZXRlIGNoYW5uZWxEYXRhLmh0bWw7XG5cbiAgLy8gVXBkYXRlIGN1cnJlbnRcbiAgY3VycmVudCA9IGNoYW5uZWxEYXRhO1xuXG4gIHByb2plY3RzLnNldFRpdGxlKGN1cnJlbnQubmFtZSk7XG4gIGlmIChjaGFubmVsRGF0YS5taWdyYXRlZFRvUzMpIHtcbiAgICBzb3VyY2VzLmZldGNoKGN1cnJlbnQuaWQgKyAnLycgKyBTT1VSQ0VfRklMRSwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAgdW5wYWNrU291cmNlcyhkYXRhKTtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gSXQncyBwb3NzaWJsZSB0aGF0IHdlIGNyZWF0ZWQgYSBjaGFubmVsLCBidXQgZmFpbGVkIHRvIHNhdmUgYW55dGhpbmcgdG9cbiAgICAvLyBTMy4gSW4gdGhpcyBjYXNlLCBpdCdzIGV4cGVjdGVkIHRoYXQgaHRtbC9sZXZlbFNvdXJjZSBhcmUgbnVsbC5cbiAgICBjYWxsYmFjaygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZldGNoQWJ1c2VTY29yZShjYWxsYmFjaykge1xuICBjaGFubmVscy5mZXRjaChjdXJyZW50LmlkICsgJy9hYnVzZScsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICBjdXJyZW50QWJ1c2VTY29yZSA9IChkYXRhICYmIGRhdGEuYWJ1c2Vfc2NvcmUpIHx8IGN1cnJlbnRBYnVzZVNjb3JlO1xuICAgIGNhbGxiYWNrKCk7XG4gICAgaWYgKGVycikge1xuICAgICAgLy8gVGhyb3cgYW4gZXJyb3Igc28gdGhhdCB0aGluZ3MgbGlrZSBOZXcgUmVsaWMgc2VlIHRoaXMuIFRoaXMgc2hvdWxkbid0XG4gICAgICAvLyBhZmZlY3QgYW55dGhpbmcgZWxzZVxuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogT25seSBleGVjdXRlIHRoZSBnaXZlbiBhcmd1bWVudCBpZiBpdCBpcyBhIGZ1bmN0aW9uLlxuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIGV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaywgZGF0YSkge1xuICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2soZGF0YSk7XG4gIH1cbn1cblxuLyoqXG4gKiBpcyB0aGUgY3VycmVudCBwcm9qZWN0IChpZiBhbnkpIGVkaXRhYmxlIGJ5IHRoZSBsb2dnZWQgaW4gdXNlciAoaWYgYW55KT9cbiAqL1xuZnVuY3Rpb24gaXNFZGl0YWJsZSgpIHtcbiAgcmV0dXJuIChjdXJyZW50ICYmIGN1cnJlbnQuaXNPd25lciAmJiAhY3VycmVudC5mcm96ZW4pO1xufVxuXG4vKipcbiAqIElmIHRoZSBjdXJyZW50IHVzZXIgaXMgdGhlIG93bmVyLCB3ZSB3YW50IHRvIHJlZGlyZWN0IGZyb20gdGhlIHJlYWRvbmx5XG4gKiAvdmlldyByb3V0ZSB0byAvZWRpdC4gSWYgdGhleSBhcmUgbm90IHRoZSBvd25lciwgd2Ugd2FudCB0byByZWRpcmVjdCBmcm9tXG4gKiAvZWRpdCB0byAvdmlld1xuICovXG5mdW5jdGlvbiByZWRpcmVjdEVkaXRWaWV3KCkge1xuICB2YXIgcGFyc2VJbmZvID0gcGFyc2VQYXRoKCk7XG4gIGlmICghcGFyc2VJbmZvLmFjdGlvbikge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBkb24ndCBkbyBhbnkgcmVkaXJlY3RpbmcgaWYgd2UgaGF2ZW50IGxvYWRlZCBhIGNoYW5uZWwgeWV0XG4gIGlmICghY3VycmVudCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbmV3VXJsO1xuICBpZiAocGFyc2VJbmZvLmFjdGlvbiA9PT0gJ3ZpZXcnICYmIGlzRWRpdGFibGUoKSkge1xuICAgIC8vIFJlZGlyZWN0IHRvIC9lZGl0IHdpdGhvdXQgYSByZWFkb25seSB3b3Jrc3BhY2VcbiAgICBuZXdVcmwgPSBsb2NhdGlvbi5ocmVmLnJlcGxhY2UoLyhcXC9wcm9qZWN0c1xcL1teL10rXFwvW14vXSspXFwvdmlldy8sICckMS9lZGl0Jyk7XG4gICAgYXBwT3B0aW9ucy5yZWFkb25seVdvcmtzcGFjZSA9IGZhbHNlO1xuICAgIGlzRWRpdGluZyA9IHRydWU7XG4gIH0gZWxzZSBpZiAocGFyc2VJbmZvLmFjdGlvbiA9PT0gJ2VkaXQnICYmICFpc0VkaXRhYmxlKCkpIHtcbiAgICAvLyBSZWRpcmVjdCB0byAvdmlldyB3aXRoIGEgcmVhZG9ubHkgd29ya3NwYWNlXG4gICAgbmV3VXJsID0gbG9jYXRpb24uaHJlZi5yZXBsYWNlKC8oXFwvcHJvamVjdHNcXC9bXi9dK1xcL1teL10rKVxcL2VkaXQvLCAnJDEvdmlldycpO1xuICAgIGFwcE9wdGlvbnMucmVhZG9ubHlXb3Jrc3BhY2UgPSB0cnVlO1xuICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICB9XG5cbiAgLy8gUHVzaFN0YXRlIHRvIHRoZSBuZXcgVXJsIGlmIHdlIGNhbiwgb3RoZXJ3aXNlIGRvIG5vdGhpbmcuXG4gIGlmIChuZXdVcmwgJiYgbmV3VXJsICE9PSBsb2NhdGlvbi5ocmVmICYmIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSkge1xuICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7bW9kaWZpZWQ6IHRydWV9LCBkb2N1bWVudC50aXRsZSwgbmV3VXJsKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogRG9lcyBhIGhhcmQgcmVkaXJlY3QgaWYgd2UgZW5kIHVwIHdpdGggYSBoYXNoIGJhc2VkIHByb2plY3RzIHVybC4gVGhpcyBjYW5cbiAqIGhhcHBlbiBvbiBJRTksIHdoZW4gd2Ugc2F2ZSBhIG5ldyBwcm9qZWN0IGZvciBodGUgZmlyc3QgdGltZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHdlIGRpZCBhbiBhY3R1YWwgcmVkaXJlY3RcbiAqL1xuZnVuY3Rpb24gcmVkaXJlY3RGcm9tSGFzaFVybCgpIHtcbiAgdmFyIG5ld1VybCA9IGxvY2F0aW9uLmhyZWYucmVwbGFjZSgnIycsICcvJyk7XG4gIGlmIChuZXdVcmwgPT09IGxvY2F0aW9uLmhyZWYpIHtcbiAgICAvLyBOb3RoaW5nIGNoYW5nZWRcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcGF0aEluZm8gPSBwYXJzZVBhdGgoKTtcbiAgbG9jYXRpb24uaHJlZiA9IG5ld1VybDtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIGNoYW5uZWxJZC9hY3Rpb24gZnJvbSB0aGUgcGF0aG5hbWUsIGFjY291bnRpbmcgZm9yIHRoZSBmYWN0XG4gKiB0aGF0IHdlIG1heSBoYXZlIGhhc2ggYmFzZWQgcm91dGUgb3Igbm90XG4gKi9cbmZ1bmN0aW9uIHBhcnNlUGF0aCgpIHtcbiAgdmFyIHBhdGhuYW1lID0gbG9jYXRpb24ucGF0aG5hbWU7XG5cbiAgLy8gV2UgaGF2ZSBhIGhhc2ggYmFzZWQgcm91dGUuIFJlcGxhY2UgdGhlIGhhc2ggd2l0aCBhIHNsYXNoLCBhbmQgYXBwZW5kIHRvXG4gIC8vIG91ciBleGlzdGluZyBwYXRoXG4gIGlmIChsb2NhdGlvbi5oYXNoKSB7XG4gICAgcGF0aG5hbWUgKz0gbG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJy8nKTtcbiAgfVxuXG4gIGlmIChwYXRobmFtZS5zcGxpdCgnLycpW1BhdGhQYXJ0LlBST0pFQ1RTXSAhPT0gJ3AnICYmXG4gICAgICBwYXRobmFtZS5zcGxpdCgnLycpW1BhdGhQYXJ0LlBST0pFQ1RTXSAhPT0gJ3Byb2plY3RzJykge1xuICAgIHJldHVybiB7XG4gICAgICBhcHBOYW1lOiBudWxsLFxuICAgICAgY2hhbm5lbElkOiBudWxsLFxuICAgICAgYWN0aW9uOiBudWxsLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFwcE5hbWU6IHBhdGhuYW1lLnNwbGl0KCcvJylbUGF0aFBhcnQuQVBQXSxcbiAgICBjaGFubmVsSWQ6IHBhdGhuYW1lLnNwbGl0KCcvJylbUGF0aFBhcnQuQ0hBTk5FTF9JRF0sXG4gICAgYWN0aW9uOiBwYXRobmFtZS5zcGxpdCgnLycpW1BhdGhQYXJ0LkFDVElPTl1cbiAgfTtcbn1cbiIsIi8qIGdsb2JhbCBkYXNoYm9hcmQsIFJlYWN0ICovXG5cbi8qKlxuICogUmVuZGVycyBvdXIgQWJ1c2VFeGNsYW1hdGlvbiBjb21wb25lbnQsIGFuZCBwb3RlbnRpYWxseSB1cGRhdGVzIGFkbWluIGJveFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQod2luZG93LmRhc2hib2FyZC5BYnVzZUV4Y2xhbWF0aW9uLCB7XG4gICAgaTE4bjoge1xuICAgICAgdG9zOiB3aW5kb3cuZGFzaGJvYXJkLmkxOG4udCgncHJvamVjdC5hYnVzZS50b3MnKSxcbiAgICAgIGNvbnRhY3RfdXM6IHdpbmRvdy5kYXNoYm9hcmQuaTE4bi50KCdwcm9qZWN0LmFidXNlLmNvbnRhY3RfdXMnKSxcbiAgICAgIGVkaXRfcHJvamVjdDogd2luZG93LmRhc2hib2FyZC5pMThuLnQoJ3Byb2plY3QuZWRpdF9wcm9qZWN0JyksXG4gICAgICBnb190b19jb2RlX3N0dWRpbzogd2luZG93LmRhc2hib2FyZC5pMThuLnQoJ3Byb2plY3QuYWJ1c2UuZ29fdG9fY29kZV9zdHVkaW8nKVxuICAgIH0sXG4gICAgaXNPd25lcjogZGFzaGJvYXJkLnByb2plY3QuaXNPd25lcigpXG4gIH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZUFwcCcpKTtcblxuICAvLyB1cGRhdGUgYWRtaW4gYm94IChpZiBpdCBleGlzdHMpIHdpdGggYWJ1c2UgaW5mb1xuICBkYXNoYm9hcmQuYWRtaW4uc2hvd1Byb2plY3RBZG1pbigpO1xufTtcbiIsIi8qIGdsb2JhbCBnYSAqL1xuXG52YXIgdXNlclRpbWluZ3MgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN0YXJ0VGltaW5nOiBmdW5jdGlvbiAoY2F0ZWdvcnksIHZhcmlhYmxlLCBsYWJlbCkge1xuICAgIHZhciBrZXkgPSBjYXRlZ29yeSArIHZhcmlhYmxlICsgbGFiZWw7XG4gICAgdXNlclRpbWluZ3Nba2V5XSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9LFxuXG4gIHN0b3BUaW1pbmc6IGZ1bmN0aW9uIChjYXRlZ29yeSwgdmFyaWFibGUsIGxhYmVsKSB7XG4gICAgdmFyIGtleSA9IGNhdGVnb3J5ICsgdmFyaWFibGUgKyBsYWJlbDtcbiAgICB2YXIgZW5kVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciBzdGFydFRpbWUgPSB1c2VyVGltaW5nc1trZXldO1xuICAgIHZhciB0aW1lRWxhcHNlZCA9IGVuZFRpbWUgLSBzdGFydFRpbWU7XG4gICAgZ2EoJ3NlbmQnLCAndGltaW5nJywgY2F0ZWdvcnksIHZhcmlhYmxlLCB0aW1lRWxhcHNlZCwgbGFiZWwpO1xuICB9XG59O1xuIl19
