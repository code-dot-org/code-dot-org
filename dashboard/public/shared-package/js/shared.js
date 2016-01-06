require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({3:[function(require,module,exports){
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

},{"./chrome34Fix":1,"./loadApp":4,"./project":5,"./timing":7}],7:[function(require,module,exports){
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

},{"./clientApi":2}],4:[function(require,module,exports){
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

},{"./renderAbusive":6}],6:[function(require,module,exports){
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

},{}],1:[function(require,module,exports){
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbml0QXBwLmpzIiwidGltaW5nLmpzIiwicHJvamVjdC5qcyIsImxvYWRBcHAuanMiLCJyZW5kZXJBYnVzaXZlLmpzIiwiY2xpZW50QXBpLmpzIiwiY2hyb21lMzRGaXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwd0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gVE9ETyAoYnJlbnQpIC0gd2F5IHRvbyBtYW55IGdsb2JhbHNcbi8qIGdsb2JhbCBzY3JpcHRfcGF0aCwgRGlhbG9nLCBDRE9Tb3VuZHMsIGRhc2hib2FyZCwgYXBwT3B0aW9ucywgdHJhY2tFdmVudCwgQXBwbGFiLCBCbG9ja2x5LCBzZW5kUmVwb3J0LCBjYW5jZWxSZXBvcnQsIGxhc3RTZXJ2ZXJSZXNwb25zZSwgc2hvd1ZpZGVvRGlhbG9nLCBnYSwgZGlnZXN0TWFuaWZlc3QqL1xuXG52YXIgdGltaW5nID0gcmVxdWlyZSgnLi90aW1pbmcnKTtcbnZhciBjaHJvbWUzNEZpeCA9IHJlcXVpcmUoJy4vY2hyb21lMzRGaXgnKTtcbnZhciBsb2FkQXBwID0gcmVxdWlyZSgnLi9sb2FkQXBwJyk7XG52YXIgcHJvamVjdCA9IHJlcXVpcmUoJy4vcHJvamVjdCcpO1xuXG53aW5kb3cuYXBwcyA9IHtcbiAgLy8gTG9hZHMgdGhlIGRlcGVuZGVuY2llcyBmb3IgdGhlIGN1cnJlbnQgYXBwIGJhc2VkIG9uIHZhbHVlcyBpbiBgYXBwT3B0aW9uc2AuXG4gIC8vIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgb25jZSBkZXBlbmRlbmNpZXMgYXJlIHJlYWR5LlxuICBsb2FkOiBsb2FkQXBwLFxuICAvLyBMZWdhY3kgQmxvY2tseSBpbml0aWFsaXphdGlvbiB0aGF0IHdhcyBtb3ZlZCBoZXJlIGZyb20gX2Jsb2NrbHkuaHRtbC5oYW1sLlxuICAvLyBNb2RpZmllcyBgYXBwT3B0aW9uc2Agd2l0aCBzb21lIGRlZmF1bHQgdmFsdWVzIGluIGBiYXNlT3B0aW9uc2AuXG4gIC8vIFRPRE8oZGF2ZSk6IE1vdmUgYmxvY2tseS1zcGVjaWZpYyBzZXR1cCBmdW5jdGlvbiBvdXQgb2Ygc2hhcmVkIGFuZCBiYWNrIGludG8gZGFzaGJvYXJkLlxuICBzZXR1cEFwcDogZnVuY3Rpb24gKGFwcE9wdGlvbnMpIHtcblxuICAgIGlmICghd2luZG93LmRhc2hib2FyZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3N1bWUgZXhpc3RlbmNlIG9mIHdpbmRvdy5kYXNoYm9hcmQnKTtcbiAgICB9XG4gICAgZGFzaGJvYXJkLnByb2plY3QgPSBwcm9qZWN0O1xuXG4gICAgdGltaW5nLnN0YXJ0VGltaW5nKCdQdXp6bGUnLCBzY3JpcHRfcGF0aCwgJycpO1xuXG4gICAgdmFyIGxhc3RTYXZlZFByb2dyYW07XG5cbiAgICAvLyBTZXRzIHVwIGRlZmF1bHQgb3B0aW9ucyBhbmQgaW5pdGlhbGl6ZXMgYmxvY2tseVxuICAgIHZhciBiYXNlT3B0aW9ucyA9IHtcbiAgICAgIGNvbnRhaW5lcklkOiAnY29kZUFwcCcsXG4gICAgICBEaWFsb2c6IERpYWxvZyxcbiAgICAgIGNkb1NvdW5kczogQ0RPU291bmRzLFxuICAgICAgcG9zaXRpb246IHtibG9ja1lDb29yZGluYXRlSW50ZXJ2YWw6IDI1fSxcbiAgICAgIG9uSW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGRhc2hib2FyZC5jcmVhdGVDYWxsb3V0cyh0aGlzLmxldmVsLmNhbGxvdXRzIHx8IHRoaXMuY2FsbG91dHMpO1xuICAgICAgICBpZiAod2luZG93LmRhc2hib2FyZC5pc0Nocm9tZTM0KSB7XG4gICAgICAgICAgY2hyb21lMzRGaXguZml4dXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXBwT3B0aW9ucy5sZXZlbC5wcm9qZWN0VGVtcGxhdGVMZXZlbE5hbWUgfHwgYXBwT3B0aW9ucy5hcHAgPT09ICdhcHBsYWInKSB7XG4gICAgICAgICAgJCgnI2NsZWFyLXB1enpsZS1oZWFkZXInKS5oaWRlKCk7XG4gICAgICAgICAgJCgnI3ZlcnNpb25zLWhlYWRlcicpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdhcHBJbml0aWFsaXplZCcpO1xuICAgICAgfSxcbiAgICAgIG9uQXR0ZW1wdDogZnVuY3Rpb24ocmVwb3J0KSB7XG4gICAgICAgIGlmIChhcHBPcHRpb25zLmxldmVsLmlzUHJvamVjdExldmVsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcHBPcHRpb25zLmNoYW5uZWwpIHtcbiAgICAgICAgICAvLyBEb24ndCBzZW5kIHRoZSBsZXZlbFNvdXJjZSBvciBpbWFnZSB0byBEYXNoYm9hcmQgZm9yIGNoYW5uZWwtYmFja2VkIGxldmVscy5cbiAgICAgICAgICAvLyAoVGhlIGxldmVsU291cmNlIGlzIGFscmVhZHkgc3RvcmVkIGluIHRoZSBjaGFubmVscyBBUEkuKVxuICAgICAgICAgIGRlbGV0ZSByZXBvcnQucHJvZ3JhbTtcbiAgICAgICAgICBkZWxldGUgcmVwb3J0LmltYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE9ubHkgbG9jYWxseSBjYWNoZSBub24tY2hhbm5lbC1iYWNrZWQgbGV2ZWxzLiBVc2UgYSBjbGllbnQtZ2VuZXJhdGVkXG4gICAgICAgICAgLy8gdGltZXN0YW1wIGluaXRpYWxseSAoaXQgd2lsbCBiZSB1cGRhdGVkIHdpdGggYSB0aW1lc3RhbXAgZnJvbSB0aGUgc2VydmVyXG4gICAgICAgICAgLy8gaWYgd2UgZ2V0IGEgcmVzcG9uc2UuXG4gICAgICAgICAgbGFzdFNhdmVkUHJvZ3JhbSA9IGRlY29kZVVSSUNvbXBvbmVudChyZXBvcnQucHJvZ3JhbSk7XG4gICAgICAgICAgZGFzaGJvYXJkLmNsaWVudFN0YXRlLndyaXRlU291cmNlRm9yTGV2ZWwoYXBwT3B0aW9ucy5zY3JpcHROYW1lLCBhcHBPcHRpb25zLnNlcnZlckxldmVsSWQsICtuZXcgRGF0ZSgpLCBsYXN0U2F2ZWRQcm9ncmFtKTtcbiAgICAgICAgfVxuICAgICAgICByZXBvcnQuc2NyaXB0TmFtZSA9IGFwcE9wdGlvbnMuc2NyaXB0TmFtZTtcbiAgICAgICAgcmVwb3J0LmZhbGxiYWNrUmVzcG9uc2UgPSBhcHBPcHRpb25zLnJlcG9ydC5mYWxsYmFja19yZXNwb25zZTtcbiAgICAgICAgcmVwb3J0LmNhbGxiYWNrID0gYXBwT3B0aW9ucy5yZXBvcnQuY2FsbGJhY2s7XG4gICAgICAgIC8vIFRyYWNrIHB1enpsZSBhdHRlbXB0IGV2ZW50XG4gICAgICAgIHRyYWNrRXZlbnQoJ1B1enpsZScsICdBdHRlbXB0Jywgc2NyaXB0X3BhdGgsIHJlcG9ydC5wYXNzID8gMSA6IDApO1xuICAgICAgICBpZiAocmVwb3J0LnBhc3MpIHtcbiAgICAgICAgICB0cmFja0V2ZW50KCdQdXp6bGUnLCAnU3VjY2VzcycsIHNjcmlwdF9wYXRoLCByZXBvcnQuYXR0ZW1wdCk7XG4gICAgICAgICAgdGltaW5nLnN0b3BUaW1pbmcoJ1B1enpsZScsIHNjcmlwdF9wYXRoLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHJhY2tFdmVudCgnQWN0aXZpdHknLCAnTGluZXMgb2YgQ29kZScsIHNjcmlwdF9wYXRoLCByZXBvcnQubGluZXMpO1xuICAgICAgICBzZW5kUmVwb3J0KHJlcG9ydCk7XG4gICAgICB9LFxuICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmICghYXBwT3B0aW9ucy5jaGFubmVsKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBjYWNoZSB0aW1lc3RhbXAgd2l0aCB0aGUgKG1vcmUgYWNjdXJhdGUpIHZhbHVlIGZyb20gdGhlIHNlcnZlci5cbiAgICAgICAgICBkYXNoYm9hcmQuY2xpZW50U3RhdGUud3JpdGVTb3VyY2VGb3JMZXZlbChhcHBPcHRpb25zLnNjcmlwdE5hbWUsIGFwcE9wdGlvbnMuc2VydmVyTGV2ZWxJZCwgcmVzcG9uc2UudGltZXN0YW1wLCBsYXN0U2F2ZWRQcm9ncmFtKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uUmVzZXRQcmVzc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FuY2VsUmVwb3J0KCk7XG4gICAgICB9LFxuICAgICAgb25Db250aW51ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChsYXN0U2VydmVyUmVzcG9uc2UudmlkZW9JbmZvKSB7XG4gICAgICAgICAgc2hvd1ZpZGVvRGlhbG9nKGxhc3RTZXJ2ZXJSZXNwb25zZS52aWRlb0luZm8pO1xuICAgICAgICB9IGVsc2UgaWYgKGxhc3RTZXJ2ZXJSZXNwb25zZS5uZXh0UmVkaXJlY3QpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGxhc3RTZXJ2ZXJSZXNwb25zZS5uZXh0UmVkaXJlY3Q7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBiYWNrVG9QcmV2aW91c0xldmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGxhc3RTZXJ2ZXJSZXNwb25zZS5wcmV2aW91c0xldmVsUmVkaXJlY3QpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGxhc3RTZXJ2ZXJSZXNwb25zZS5wcmV2aW91c0xldmVsUmVkaXJlY3Q7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBzaG93SW5zdHJ1Y3Rpb25zV3JhcHBlcjogZnVuY3Rpb24oc2hvd0luc3RydWN0aW9ucykge1xuICAgICAgICAvLyBBbHdheXMgc2tpcCBhbGwgcHJlLWxldmVsIHBvcHVwcyBvbiBzaGFyZSBsZXZlbHMgb3Igd2hlbiBjb25maWd1cmVkIHRodXNcbiAgICAgICAgaWYgKHRoaXMuc2hhcmUgfHwgYXBwT3B0aW9ucy5sZXZlbC5za2lwSW5zdHJ1Y3Rpb25zUG9wdXApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYWZ0ZXJWaWRlb0NhbGxiYWNrID0gc2hvd0luc3RydWN0aW9ucztcbiAgICAgICAgaWYgKGFwcE9wdGlvbnMubGV2ZWwuYWZ0ZXJWaWRlb0JlZm9yZUluc3RydWN0aW9uc0ZuKSB7XG4gICAgICAgICAgYWZ0ZXJWaWRlb0NhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXBwT3B0aW9ucy5sZXZlbC5hZnRlclZpZGVvQmVmb3JlSW5zdHJ1Y3Rpb25zRm4oc2hvd0luc3RydWN0aW9ucyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYXNWaWRlbyA9ICEhYXBwT3B0aW9ucy5hdXRvcGxheVZpZGVvO1xuICAgICAgICB2YXIgaGFzSW5zdHJ1Y3Rpb25zID0gISEoYXBwT3B0aW9ucy5sZXZlbC5pbnN0cnVjdGlvbnMgfHxcbiAgICAgICAgYXBwT3B0aW9ucy5sZXZlbC5hbmlHaWZVUkwpO1xuXG4gICAgICAgIGlmIChoYXNWaWRlbykge1xuICAgICAgICAgIGlmIChoYXNJbnN0cnVjdGlvbnMpIHtcbiAgICAgICAgICAgIGFwcE9wdGlvbnMuYXV0b3BsYXlWaWRlby5vbkNsb3NlID0gYWZ0ZXJWaWRlb0NhbGxiYWNrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzaG93VmlkZW9EaWFsb2coYXBwT3B0aW9ucy5hdXRvcGxheVZpZGVvKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNJbnN0cnVjdGlvbnMpIHtcbiAgICAgICAgICBhZnRlclZpZGVvQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgJC5leHRlbmQodHJ1ZSwgYXBwT3B0aW9ucywgYmFzZU9wdGlvbnMpO1xuXG4gICAgLy8gVHVybiBzdHJpbmcgdmFsdWVzIGludG8gZnVuY3Rpb25zIGZvciBrZXlzIHRoYXQgYmVnaW4gd2l0aCAnZm5fJyAoSlNPTiBjYW4ndCBjb250YWluIGZ1bmN0aW9uIGRlZmluaXRpb25zKVxuICAgIC8vIEUuZy4geyBmbl9leGFtcGxlOiAnZnVuY3Rpb24gKCkgeyByZXR1cm47IH0nIH0gYmVjb21lcyB7IGV4YW1wbGU6IGZ1bmN0aW9uICgpIHsgcmV0dXJuOyB9IH1cbiAgICAoZnVuY3Rpb24gZml4VXBGdW5jdGlvbnMobm9kZSkge1xuICAgICAgaWYgKHR5cGVvZiBub2RlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpIGluIG5vZGUpIHtcbiAgICAgICAgaWYgKC9eZm5fLy50ZXN0KGkpKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbiAgICAgICAgICAgIG5vZGVbaS5yZXBsYWNlKC9eZm5fLywgJycpXSA9IGV2YWwoJygnICsgbm9kZVtpXSArICcpJyk7XG4gICAgICAgICAgICAvKiBqc2hpbnQgaWdub3JlOmVuZCAqL1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZml4VXBGdW5jdGlvbnMobm9kZVtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KShhcHBPcHRpb25zLmxldmVsKTtcbiAgfSxcblxuICAvLyBTZXQgdXAgcHJvamVjdHMsIHNraXBwaW5nIGJsb2NrbHktc3BlY2lmaWMgc3RlcHMuIERlc2lnbmVkIGZvciB1c2VcbiAgLy8gYnkgbGV2ZWxzIG9mIHR5cGUgXCJleHRlcm5hbFwiLlxuICBzZXR1cFByb2plY3RzRXh0ZXJuYWw6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghd2luZG93LmRhc2hib2FyZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3N1bWUgZXhpc3RlbmNlIG9mIHdpbmRvdy5kYXNoYm9hcmQnKTtcbiAgICB9XG5cbiAgICBkYXNoYm9hcmQucHJvamVjdCA9IHByb2plY3Q7XG4gIH0sXG5cbiAgLy8gRGVmaW5lIGJsb2NrbHkvZHJvcGxldC1zcGVjaWZpYyBjYWxsYmFja3MgZm9yIHByb2plY3RzIHRvIGFjY2Vzc1xuICAvLyBsZXZlbCBzb3VyY2UsIEhUTUwgYW5kIGhlYWRlcnMuXG4gIC8vIFRPRE8oZGF2ZSk6IEV4dHJhY3QgYmxvY2tseS1zcGVjaWZpYyBoYW5kbGVyIGNvZGUgaW50byBfYmxvY2tseS5odG1sLmhhbWwuXG4gIHNvdXJjZUhhbmRsZXI6IHtcbiAgICBzZXRJbml0aWFsTGV2ZWxIdG1sOiBmdW5jdGlvbiAobGV2ZWxIdG1sKSB7XG4gICAgICBhcHBPcHRpb25zLmxldmVsLmxldmVsSHRtbCA9IGxldmVsSHRtbDtcbiAgICB9LFxuICAgIGdldExldmVsSHRtbDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5BcHBsYWIgJiYgQXBwbGFiLmdldEh0bWwoKTtcbiAgICB9LFxuICAgIHNldEluaXRpYWxMZXZlbFNvdXJjZTogZnVuY3Rpb24gKGxldmVsU291cmNlKSB7XG4gICAgICBhcHBPcHRpb25zLmxldmVsLmxhc3RBdHRlbXB0ID0gbGV2ZWxTb3VyY2U7XG4gICAgfSxcbiAgICBnZXRMZXZlbFNvdXJjZTogZnVuY3Rpb24gKGN1cnJlbnRMZXZlbFNvdXJjZSkge1xuICAgICAgdmFyIHNvdXJjZTtcbiAgICAgIGlmICh3aW5kb3cuQmxvY2tseSkge1xuICAgICAgICAvLyBJZiB3ZSdyZSByZWFkT25seSwgc291cmNlIGhhc24ndCBjaGFuZ2VkIGF0IGFsbFxuICAgICAgICBzb3VyY2UgPSBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmlzUmVhZE9ubHkoKSA/IGN1cnJlbnRMZXZlbFNvdXJjZSA6XG4gICAgICAgICAgQmxvY2tseS5YbWwuZG9tVG9UZXh0KEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb3VyY2UgPSB3aW5kb3cuQXBwbGFiICYmIEFwcGxhYi5nZXRDb2RlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc291cmNlO1xuICAgIH0sXG4gIH0sXG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgQmxvY2tseSBvciBEcm9wbGV0IGFwcC5cbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIGRhc2hib2FyZC5wcm9qZWN0LmluaXQod2luZG93LmFwcHMuc291cmNlSGFuZGxlcik7XG4gICAgd2luZG93W2FwcE9wdGlvbnMuYXBwICsgJ01haW4nXShhcHBPcHRpb25zKTtcbiAgfVxufTtcbiIsIi8qIGdsb2JhbCBnYSAqL1xuXG52YXIgdXNlclRpbWluZ3MgPSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN0YXJ0VGltaW5nOiBmdW5jdGlvbiAoY2F0ZWdvcnksIHZhcmlhYmxlLCBsYWJlbCkge1xuICAgIHZhciBrZXkgPSBjYXRlZ29yeSArIHZhcmlhYmxlICsgbGFiZWw7XG4gICAgdXNlclRpbWluZ3Nba2V5XSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9LFxuXG4gIHN0b3BUaW1pbmc6IGZ1bmN0aW9uIChjYXRlZ29yeSwgdmFyaWFibGUsIGxhYmVsKSB7XG4gICAgdmFyIGtleSA9IGNhdGVnb3J5ICsgdmFyaWFibGUgKyBsYWJlbDtcbiAgICB2YXIgZW5kVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciBzdGFydFRpbWUgPSB1c2VyVGltaW5nc1trZXldO1xuICAgIHZhciB0aW1lRWxhcHNlZCA9IGVuZFRpbWUgLSBzdGFydFRpbWU7XG4gICAgZ2EoJ3NlbmQnLCAndGltaW5nJywgY2F0ZWdvcnksIHZhcmlhYmxlLCB0aW1lRWxhcHNlZCwgbGFiZWwpO1xuICB9XG59O1xuIiwiLyogZ2xvYmFsIGRhc2hib2FyZCwgYXBwT3B0aW9ucywgdHJhY2tFdmVudCAqL1xuXG4vLyBBdHRlbXB0IHRvIHNhdmUgcHJvamVjdHMgZXZlcnkgMzAgc2Vjb25kc1xudmFyIEFVVE9TQVZFX0lOVEVSVkFMID0gMzAgKiAxMDAwO1xuXG52YXIgQUJVU0VfVEhSRVNIT0xEID0gMTA7XG5cbnZhciBoYXNQcm9qZWN0Q2hhbmdlZCA9IGZhbHNlO1xuXG52YXIgYXNzZXRzID0gcmVxdWlyZSgnLi9jbGllbnRBcGknKS5jcmVhdGUoJy92My9hc3NldHMnKTtcbnZhciBzb3VyY2VzID0gcmVxdWlyZSgnLi9jbGllbnRBcGknKS5jcmVhdGUoJy92My9zb3VyY2VzJyk7XG52YXIgY2hhbm5lbHMgPSByZXF1aXJlKCcuL2NsaWVudEFwaScpLmNyZWF0ZSgnL3YzL2NoYW5uZWxzJyk7XG5cbi8vIE5hbWUgb2YgdGhlIHBhY2tlZCBzb3VyY2UgZmlsZVxudmFyIFNPVVJDRV9GSUxFID0gJ21haW4uanNvbic7XG5cbnZhciBldmVudHMgPSB7XG4gIC8vIEZpcmVkIHdoZW4gcnVuIHN0YXRlIGNoYW5nZXMgb3Igd2UgZW50ZXIvZXhpdCBkZXNpZ24gbW9kZVxuICBhcHBNb2RlQ2hhbmdlZDogJ2FwcE1vZGVDaGFuZ2VkJyxcbiAgYXBwSW5pdGlhbGl6ZWQ6ICdhcHBJbml0aWFsaXplZCcsXG4gIHdvcmtzcGFjZUNoYW5nZTogJ3dvcmtzcGFjZUNoYW5nZSdcbn07XG5cbi8qKlxuICogSGVscGVyIGZvciB3aGVuIHdlIHNwbGl0IG91ciBwYXRobmFtZSBieSAvLiBjaGFubmVsX2lkIGFuZCBhY3Rpb24gbWF5IGVuZCB1cFxuICogYmVpbmcgdW5kZWZpbmVkLlxuICogRXhhbXBsZSBwYXRoczpcbiAqIC9wcm9qZWN0cy9hcHBsYWJcbiAqIC9wcm9qZWN0cy9wbGF5bGFiLzFVNTNwWXBSOHN6RGd0ckdJRzVsSWdcbiAqIC9wcm9qZWN0cy9hcnRpc3QvVnlWTy1iUWFHUS1DeWI3RGJwYWJOUS9lZGl0XG4gKi9cbnZhciBQYXRoUGFydCA9IHtcbiAgU1RBUlQ6IDAsXG4gIFBST0pFQ1RTOiAxLFxuICBBUFA6IDIsXG4gIENIQU5ORUxfSUQ6IDMsXG4gIEFDVElPTjogNFxufTtcblxuLyoqXG4gKiBDdXJyZW50IHN0YXRlIG9mIG91ciBDaGFubmVsIEFQSSBvYmplY3RcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFByb2plY3RJbnN0YW5jZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IGlkXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbmFtZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IGxldmVsSHRtbFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGxldmVsU291cmNlXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGhpZGRlbiBEb2Vzbid0IHNob3cgdXAgaW4gcHJvamVjdCBsaXN0XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGlzT3duZXIgUG9wdWxhdGVkIGJ5IG91ciB1cGRhdGUvY3JlYXRlIGNhbGxiYWNrLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IHVwZGF0ZWRBdCBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBEYXRlLiBQb3B1bGF0ZWQgYnlcbiAqICAgb3V0IHVwZGF0ZS9jcmVhdGUgY2FsbGJhY2tcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBsZXZlbCBQYXRoIHdoZXJlIHRoaXMgcGFydGljdWxhciBhcHAgdHlwZSBpcyBob3N0ZWRcbiAqL1xudmFyIGN1cnJlbnQ7XG52YXIgY3VycmVudFNvdXJjZVZlcnNpb25JZDtcbnZhciBjdXJyZW50QWJ1c2VTY29yZSA9IDA7XG52YXIgaXNFZGl0aW5nID0gZmFsc2U7XG5cbi8qKlxuICogQ3VycmVudCBzdGF0ZSBvZiBvdXIgc291cmNlcyBBUEkgZGF0YVxuICovXG52YXIgY3VycmVudFNvdXJjZXMgPSB7XG4gIHNvdXJjZTogbnVsbCxcbiAgaHRtbDogbnVsbFxufTtcblxuLyoqXG4gKiBHZXQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIG91ciBzb3VyY2VzIEFQSSBvYmplY3QgZm9yIHVwbG9hZFxuICovXG5mdW5jdGlvbiBwYWNrU291cmNlcygpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGN1cnJlbnRTb3VyY2VzKTtcbn1cblxuLyoqXG4gKiBQb3B1bGF0ZSBvdXIgY3VycmVudCBzb3VyY2VzIEFQSSBvYmplY3QgYmFzZWQgb2ZmIG9mIGdpdmVuIGRhdGFcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhLnNvdXJjZVxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEuaHRtbFxuICovXG5mdW5jdGlvbiB1bnBhY2tTb3VyY2VzKGRhdGEpIHtcbiAgY3VycmVudFNvdXJjZXMgPSB7XG4gICAgc291cmNlOiBkYXRhLnNvdXJjZSxcbiAgICBodG1sOiBkYXRhLmh0bWxcbiAgfTtcbn1cblxudmFyIHByb2plY3RzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBpZCBvZiB0aGUgY3VycmVudCBwcm9qZWN0LCBvciB1bmRlZmluZWQgaWYgd2UgZG9uJ3QgaGF2ZVxuICAgKiAgIGEgY3VycmVudCBwcm9qZWN0LlxuICAgKi9cbiAgZ2V0Q3VycmVudElkOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50LmlkO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBuYW1lIG9mIHRoZSBjdXJyZW50IHByb2plY3QsIG9yIHVuZGVmaW5lZCBpZiB3ZSBkb24ndCBoYXZlXG4gICAqICAgYSBjdXJyZW50IHByb2plY3RcbiAgICovXG4gIGdldEN1cnJlbnROYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50Lm5hbWU7XG4gIH0sXG5cbiAgZ2V0Q3VycmVudFRpbWVzdGFtcDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghY3VycmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudC51cGRhdGVkQXQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXRBYnVzZVNjb3JlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRBYnVzZVNjb3JlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZXRzIGFidXNlIHNjb3JlIHRvIHplcm8sIHNhdmVzIHRoZSBwcm9qZWN0LCBhbmQgcmVsb2FkcyB0aGUgcGFnZVxuICAgKi9cbiAgYWRtaW5SZXNldEFidXNlU2NvcmU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSB0aGlzLmdldEN1cnJlbnRJZCgpO1xuICAgIGlmICghaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY2hhbm5lbHMuZGVsZXRlKGlkICsgJy9hYnVzZScsIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgICBhc3NldHMucGF0Y2hBbGwoaWQsICdhYnVzZV9zY29yZT0wJywgbnVsbCwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgJCgnLmFkbWluLWFidXNlLXNjb3JlJykudGV4dCgwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB3ZSdyZSBmcm96ZW5cbiAgICovXG4gIGlzRnJvemVuOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50LmZyb3plbjtcbiAgfSxcblxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc093bmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnQgJiYgY3VycmVudC5pc093bmVyO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBwcm9qZWN0IGhhcyBiZWVuIHJlcG9ydGVkIGVub3VnaCB0aW1lcyB0b1xuICAgKiAgIGV4Y2VlZCBvdXIgdGhyZXNob2xkXG4gICAqL1xuICBleGNlZWRzQWJ1c2VUaHJlc2hvbGQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY3VycmVudEFidXNlU2NvcmUgPj0gQUJVU0VfVEhSRVNIT0xEO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHdlIHNob3VsZCBzaG93IG91ciBhYnVzZSBib3ggaW5zdGVhZCBvZiBzaG93aW5nXG4gICAqICAgdGhlIHByb2plY3QuXG4gICAqL1xuICBoaWRlQmVjYXVzZUFidXNpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuZXhjZWVkc0FidXNlVGhyZXNob2xkKCkgfHwgYXBwT3B0aW9ucy5zY3JpcHRJZCkge1xuICAgICAgLy8gTmV2ZXIgd2FudCB0byBoaWRlIHdoZW4gaW4gdGhlIGNvbnRleHQgb2YgYSBzY3JpcHQsIGFzIHRoaXMgd2lsbCBhbHdheXNcbiAgICAgIC8vIGVpdGhlciBiZSBtZSBvciBteSB0ZWFjaGVyIHZpZXdpbmcgbXkgbGFzdCBzdWJtaXNzaW9uXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gV2hlbiBvd25lcnMgZWRpdCBhIHByb2plY3QsIHdlIGRvbid0IHdhbnQgdG8gaGlkZSBpdCBlbnRpcmVseS4gSW5zdGVhZCxcbiAgICAvLyB3ZSdsbCBsb2FkIHRoZSBwcm9qZWN0IGFuZCBzaG93IHRoZW0gYSBzbWFsbCBhbGVydFxuICAgIHZhciBwYWdlQWN0aW9uID0gcGFyc2VQYXRoKCkuYWN0aW9uO1xuXG4gICAgLy8gTk9URTogYXBwT3B0aW9ucy5pc0FkbWluIGlzIG5vdCBhIHNlY3VyaXR5IHNldHRpbmcgYXMgaXQgY2FuIGJlIG1hbmlwdWxhdGVkXG4gICAgLy8gYnkgdGhlIHVzZXIuIEluIHRoaXMgY2FzZSB0aGF0J3Mgb2theSwgc2luY2UgYWxsIHRoYXQgZG9lcyBpcyBhbGxvdyB0aGVtIHRvXG4gICAgLy8gdmlldyBhIHByb2plY3QgdGhhdCB3YXMgbWFya2VkIGFzIGFidXNpdmUuXG4gICAgaWYgKCh0aGlzLmlzT3duZXIoKSB8fCBhcHBPcHRpb25zLmlzQWRtaW4pICYmXG4gICAgICAgIChwYWdlQWN0aW9uID09PSAnZWRpdCcgfHwgcGFnZUFjdGlvbiA9PT0gJ3ZpZXcnKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gUHJvcGVydGllcyBhbmQgY2FsbGJhY2tzLiBUaGVzZSBhcmUgYWxsIGNhbmRpZGF0ZXMgZm9yIGJlaW5nIGV4dHJhY3RlZFxuICAvLyBhcyBjb25maWd1cmF0aW9uIHBhcmFtZXRlcnMgd2hpY2ggYXJlIHBhc3NlZCBpbiBieSB0aGUgY2FsbGVyLlxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8gVE9ETyhkYXZlKTogZXh0cmFjdCBpc0F1dG9zYXZlRW5hYmxlZCBhbmQgYW55IGJvb2xlYW4gaGVscGVyXG4gIC8vIGZ1bmN0aW9ucyBiZWxvdyB0byBiZWNvbWUgcHJvcGVydGllcyBvbiBhcHBPcHRpb25zLnByb2plY3QuXG4gIC8vIFByb2plY3RzIGJlaGF2aW9yIHNob3VsZCB1bHRpbWF0ZWx5IGJlIGZ1bGx5IGNvbmZpZ3VyYWJsZSBieVxuICAvLyBwcm9wZXJ0aWVzIG9uIGFwcE9wdGlvbnMucHJvamVjdCwgcmF0aGVyIHRoYW4gcmVhY2hpbmcgb3V0XG4gIC8vIGludG8gZ2xvYmFsIHN0YXRlIHRvIG1ha2UgZGVjaXNpb25zLlxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB3ZSdyZSBlZGl0aW5nXG4gICAqL1xuICBpc0VkaXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gaXNFZGl0aW5nO1xuICB9LFxuXG4gIC8vIFdoZXRoZXIgdGhlIGN1cnJlbnQgbGV2ZWwgaXMgYSBwcm9qZWN0IGxldmVsIChpLmUuIGF0IHRoZSAvcHJvamVjdHMgdXJsKS5cbiAgaXNQcm9qZWN0TGV2ZWw6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoYXBwT3B0aW9ucy5sZXZlbCAmJiBhcHBPcHRpb25zLmxldmVsLmlzUHJvamVjdExldmVsKTtcbiAgfSxcblxuICBzaG91bGRVcGRhdGVIZWFkZXJzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gIWFwcE9wdGlvbnMuaXNFeHRlcm5hbFByb2plY3RMZXZlbDtcbiAgfSxcblxuICBzaG93UHJvamVjdEhlYWRlcjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2hvdWxkVXBkYXRlSGVhZGVycygpKSB7XG4gICAgICBkYXNoYm9hcmQuaGVhZGVyLnNob3dQcm9qZWN0SGVhZGVyKCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjb250ZW50cyBvZiB0aGUgYWRtaW4gYm94IGZvciBhZG1pbnMuIFdlIGhhdmUgbm8ga25vd2xlZGdlXG4gICAqIGhlcmUgd2hldGhlciB3ZSdyZSBhbiBhZG1pbiwgYW5kIGRlcGVuZCBvbiBkYXNoYm9hcmQgZ2V0dGluZyB0aGlzIHJpZ2h0LlxuICAgKi9cbiAgc2hvd0FkbWluOiBmdW5jdGlvbigpIHtcbiAgICBkYXNoYm9hcmQuYWRtaW4uc2hvd1Byb2plY3RBZG1pbigpO1xuICB9LFxuXG4gIHNob3dNaW5pbWFsUHJvamVjdEhlYWRlcjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2hvdWxkVXBkYXRlSGVhZGVycygpKSB7XG4gICAgICBkYXNoYm9hcmQuaGVhZGVyLnNob3dNaW5pbWFsUHJvamVjdEhlYWRlcigpO1xuICAgIH1cbiAgfSxcblxuICBzaG93U2hhcmVSZW1peEhlYWRlcjogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2hvdWxkVXBkYXRlSGVhZGVycygpKSB7XG4gICAgICBkYXNoYm9hcmQuaGVhZGVyLnNob3dTaGFyZVJlbWl4SGVhZGVyKCk7XG4gICAgfVxuICB9LFxuICBzZXROYW1lOiBmdW5jdGlvbihuZXdOYW1lKSB7XG4gICAgY3VycmVudCA9IGN1cnJlbnQgfHwge307XG4gICAgaWYgKG5ld05hbWUpIHtcbiAgICAgIGN1cnJlbnQubmFtZSA9IG5ld05hbWU7XG4gICAgICB0aGlzLnNldFRpdGxlKG5ld05hbWUpO1xuICAgIH1cbiAgfSxcbiAgc2V0VGl0bGU6IGZ1bmN0aW9uKG5ld05hbWUpIHtcbiAgICBpZiAobmV3TmFtZSAmJiBhcHBPcHRpb25zLmdhbWVEaXNwbGF5TmFtZSkge1xuICAgICAgZG9jdW1lbnQudGl0bGUgPSBuZXdOYW1lICsgJyAtICcgKyBhcHBPcHRpb25zLmdhbWVEaXNwbGF5TmFtZTtcbiAgICB9XG4gIH0sXG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBFbmQgb2YgcHJvcGVydGllcyBhbmQgY2FsbGJhY2tzLlxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2VIYW5kbGVyIE9iamVjdCBjb250YWluaW5nIGNhbGxiYWNrcyBwcm92aWRlZCBieSBjYWxsZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHNvdXJjZUhhbmRsZXIuc2V0SW5pdGlhbExldmVsSHRtbFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzb3VyY2VIYW5kbGVyLmdldExldmVsSHRtbFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzb3VyY2VIYW5kbGVyLnNldEluaXRpYWxMZXZlbFNvdXJjZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzb3VyY2VIYW5kbGVyLmdldExldmVsU291cmNlXG4gICAqL1xuICBpbml0OiBmdW5jdGlvbiAoc291cmNlSGFuZGxlcikge1xuICAgIHRoaXMuc291cmNlSGFuZGxlciA9IHNvdXJjZUhhbmRsZXI7XG4gICAgaWYgKHJlZGlyZWN0RnJvbUhhc2hVcmwoKSB8fCByZWRpcmVjdEVkaXRWaWV3KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1Byb2plY3RMZXZlbCgpIHx8IGN1cnJlbnQpIHtcbiAgICAgIGlmIChjdXJyZW50U291cmNlcy5odG1sKSB7XG4gICAgICAgIHNvdXJjZUhhbmRsZXIuc2V0SW5pdGlhbExldmVsSHRtbChjdXJyZW50U291cmNlcy5odG1sKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRWRpdGluZykge1xuICAgICAgICBpZiAoY3VycmVudCkge1xuICAgICAgICAgIGlmIChjdXJyZW50U291cmNlcy5zb3VyY2UpIHtcbiAgICAgICAgICAgIHNvdXJjZUhhbmRsZXIuc2V0SW5pdGlhbExldmVsU291cmNlKGN1cnJlbnRTb3VyY2VzLnNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0TmFtZSgnTXkgUHJvamVjdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKGV2ZW50cy5hcHBNb2RlQ2hhbmdlZCwgZnVuY3Rpb24oZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgdGhpcy5zYXZlKGNhbGxiYWNrKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvLyBBdXRvc2F2ZSBldmVyeSBBVVRPU0FWRV9JTlRFUlZBTCBtaWxsaXNlY29uZHNcbiAgICAgICAgJCh3aW5kb3cpLm9uKGV2ZW50cy5hcHBJbml0aWFsaXplZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIEdldCB0aGUgaW5pdGlhbCBhcHAgY29kZSBhcyBhIGJhc2VsaW5lXG4gICAgICAgICAgY3VycmVudFNvdXJjZXMuc291cmNlID0gdGhpcy5zb3VyY2VIYW5kbGVyLmdldExldmVsU291cmNlKGN1cnJlbnRTb3VyY2VzLnNvdXJjZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICQod2luZG93KS5vbihldmVudHMud29ya3NwYWNlQ2hhbmdlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaGFzUHJvamVjdENoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LnNldEludGVydmFsKHRoaXMuYXV0b3NhdmVfLmJpbmQodGhpcyksIEFVVE9TQVZFX0lOVEVSVkFMKTtcblxuICAgICAgICBpZiAoY3VycmVudC5oaWRkZW4pIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaXNGcm96ZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5zaG93U2hhcmVSZW1peEhlYWRlcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY3VycmVudC5pc093bmVyIHx8ICFwYXJzZVBhdGgoKS5jaGFubmVsSWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1Byb2plY3RIZWFkZXIoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVmlld2luZyBzb21lb25lIGVsc2UncyBwcm9qZWN0IC0gc2V0IHNoYXJlIG1vZGVcbiAgICAgICAgICAgIHRoaXMuc2hvd01pbmltYWxQcm9qZWN0SGVhZGVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgdGhpcy5zb3VyY2VIYW5kbGVyLnNldEluaXRpYWxMZXZlbFNvdXJjZShjdXJyZW50U291cmNlcy5zb3VyY2UpO1xuICAgICAgICB0aGlzLnNob3dNaW5pbWFsUHJvamVjdEhlYWRlcigpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYXBwT3B0aW9ucy5pc0xlZ2FjeVNoYXJlICYmIHRoaXMuZ2V0U3RhbmRhbG9uZUFwcCgpKSB7XG4gICAgICB0aGlzLnNldE5hbWUoJ1VudGl0bGVkIFByb2plY3QnKTtcbiAgICAgIHRoaXMuc2hvd01pbmltYWxQcm9qZWN0SGVhZGVyKCk7XG4gICAgfVxuICAgIGlmIChhcHBPcHRpb25zLm5vUGFkZGluZykge1xuICAgICAgJChcIi5mdWxsX2NvbnRhaW5lclwiKS5jc3Moe1wicGFkZGluZ1wiOlwiMHB4XCJ9KTtcbiAgICB9XG5cbiAgICB0aGlzLnNob3dBZG1pbigpO1xuICB9LFxuICBwcm9qZWN0Q2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgaGFzUHJvamVjdENoYW5nZWQgPSB0cnVlO1xuICB9LFxuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIHN0YW5kYWxvbmUgYXBwIGNhcGFibGUgb2YgcnVubmluZ1xuICAgKiB0aGlzIHByb2plY3QgYXMgYSBzdGFuZGFsb25lIHByb2plY3QsIG9yIG51bGwgaWYgbm9uZSBleGlzdHMuXG4gICAqL1xuICBnZXRTdGFuZGFsb25lQXBwOiBmdW5jdGlvbiAoKSB7XG4gICAgc3dpdGNoIChhcHBPcHRpb25zLmFwcCkge1xuICAgICAgY2FzZSAnYXBwbGFiJzpcbiAgICAgICAgcmV0dXJuICdhcHBsYWInO1xuICAgICAgY2FzZSAndHVydGxlJzpcbiAgICAgICAgcmV0dXJuICdhcnRpc3QnO1xuICAgICAgY2FzZSAnY2FsYyc6XG4gICAgICAgIHJldHVybiAnY2FsYyc7XG4gICAgICBjYXNlICdldmFsJzpcbiAgICAgICAgcmV0dXJuICdldmFsJztcbiAgICAgIGNhc2UgJ3N0dWRpbyc6XG4gICAgICAgIGlmIChhcHBPcHRpb25zLmxldmVsLnVzZUNvbnRyYWN0RWRpdG9yKSB7XG4gICAgICAgICAgcmV0dXJuICdhbGdlYnJhX2dhbWUnO1xuICAgICAgICB9IGVsc2UgaWYgKGFwcE9wdGlvbnMuc2tpbklkID09PSAnaG9jMjAxNScgfHwgYXBwT3B0aW9ucy5za2luSWQgPT09ICdpbmZpbml0eScpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ3BsYXlsYWInO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9LFxuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHBhdGggdG8gdGhlIGFwcCBjYXBhYmxlIG9mIHJ1bm5pbmdcbiAgICogdGhpcyBwcm9qZWN0IGFzIGEgc3RhbmRhbG9uZSBhcHAuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiBubyBzdGFuZGFsb25lIGFwcCBleGlzdHMuXG4gICAqL1xuICBhcHBUb1Byb2plY3RVcmw6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXBwID0gcHJvamVjdHMuZ2V0U3RhbmRhbG9uZUFwcCgpO1xuICAgIGlmICghYXBwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgdHlwZSBvZiBwcm9qZWN0IGNhbm5vdCBiZSBydW4gYXMgYSBzdGFuZGFsb25lIGFwcC4nKTtcbiAgICB9XG4gICAgcmV0dXJuICcvcHJvamVjdHMvJyArIGFwcDtcbiAgfSxcbiAgLyoqXG4gICAqIEV4cGxpY2l0bHkgY2xlYXIgdGhlIEhUTUwsIGNpcmN1bXZlbnRpbmcgc2FmZXR5IG1lYXN1cmVzIHdoaWNoIHByZXZlbnQgaXQgZnJvbVxuICAgKiBiZWluZyBhY2NpZGVudGFsbHkgZGVsZXRlZC5cbiAgICovXG4gIGNsZWFySHRtbDogZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudFNvdXJjZXMuaHRtbCA9ICcnO1xuICB9LFxuICAvKipcbiAgICogU2F2ZXMgdGhlIHByb2plY3QgdG8gdGhlIENoYW5uZWxzIEFQSS4gQ2FsbHMgYGNhbGxiYWNrYCBvbiBzdWNjZXNzIGlmIGFcbiAgICogY2FsbGJhY2sgZnVuY3Rpb24gd2FzIHByb3ZpZGVkLlxuICAgKiBAcGFyYW0ge29iamVjdD99IHNvdXJjZUFuZEh0bWwgT3B0aW9uYWwgc291cmNlIHRvIGJlIHByb3ZpZGVkLCBzYXZpbmcgdXMgYW5vdGhlclxuICAgKiAgIGNhbGwgdG8gYHNvdXJjZUhhbmRsZXIuZ2V0TGV2ZWxTb3VyY2VgLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYWZ0ZXIgc2F2aW5nLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlTmV3VmVyc2lvbiBJZiB0cnVlLCBleHBsaWNpdGx5IGNyZWF0ZSBhIG5ldyB2ZXJzaW9uLlxuICAgKi9cbiAgc2F2ZTogZnVuY3Rpb24oc291cmNlQW5kSHRtbCwgY2FsbGJhY2ssIGZvcmNlTmV3VmVyc2lvbikge1xuICAgIC8vIENhbid0IHNhdmUgYSBwcm9qZWN0IGlmIHdlJ3JlIG5vdCB0aGUgb3duZXIuXG4gICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC5pc093bmVyID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnZnVuY3Rpb24nIHx8ICFzb3VyY2VBbmRIdG1sKSB7XG4gICAgICAvLyBJZiBubyBzb3VyY2UgaXMgcHJvdmlkZWQsIHNoaWZ0IHRoZSBhcmd1bWVudHMgYW5kIGFzayBmb3IgdGhlIHNvdXJjZVxuICAgICAgLy8gb3Vyc2VsdmVzLlxuICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYXJndW1lbnRzKTtcbiAgICAgIGNhbGxiYWNrID0gYXJnc1swXTtcbiAgICAgIGZvcmNlTmV3VmVyc2lvbiA9IGFyZ3NbMV07XG5cbiAgICAgIHNvdXJjZUFuZEh0bWwgPSB7XG4gICAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2VIYW5kbGVyLmdldExldmVsU291cmNlKCksXG4gICAgICAgIGh0bWw6IHRoaXMuc291cmNlSGFuZGxlci5nZXRMZXZlbEh0bWwoKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoZm9yY2VOZXdWZXJzaW9uKSB7XG4gICAgICBjdXJyZW50U291cmNlVmVyc2lvbklkID0gbnVsbDtcbiAgICB9XG5cbiAgICAkKCcucHJvamVjdF91cGRhdGVkX2F0JykudGV4dCgnU2F2aW5nLi4uJyk7ICAvLyBUT0RPIChKb3NoKSBpMThuXG4gICAgdmFyIGNoYW5uZWxJZCA9IGN1cnJlbnQuaWQ7XG4gICAgLy8gVE9ETyhkYXZlKTogUmVtb3ZlIHRoaXMgY2hlY2sgYW5kIHJlbW92ZSBjbGVhckh0bWwoKSBvbmNlIGFsbCBwcm9qZWN0c1xuICAgIC8vIGhhdmUgdmVyc2lvbmluZzogaHR0cHM6Ly93d3cucGl2b3RhbHRyYWNrZXIuY29tL3N0b3J5L3Nob3cvMTAzMzQ3NDk4XG4gICAgaWYgKGN1cnJlbnRTb3VyY2VzLmh0bWwgJiYgIXNvdXJjZUFuZEh0bWwuaHRtbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0aW5nIHRvIGJsb3cgYXdheSBleGlzdGluZyBsZXZlbEh0bWwnKTtcbiAgICB9XG5cbiAgICB1bnBhY2tTb3VyY2VzKHNvdXJjZUFuZEh0bWwpO1xuICAgIGlmICh0aGlzLmdldFN0YW5kYWxvbmVBcHAoKSkge1xuICAgICAgY3VycmVudC5sZXZlbCA9IHRoaXMuYXBwVG9Qcm9qZWN0VXJsKCk7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVuYW1lID0gU09VUkNFX0ZJTEUgKyAoY3VycmVudFNvdXJjZVZlcnNpb25JZCA/IFwiP3ZlcnNpb249XCIgKyBjdXJyZW50U291cmNlVmVyc2lvbklkIDogJycpO1xuICAgIHNvdXJjZXMucHV0KGNoYW5uZWxJZCwgcGFja1NvdXJjZXMoKSwgZmlsZW5hbWUsIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlKSB7XG4gICAgICBjdXJyZW50U291cmNlVmVyc2lvbklkID0gcmVzcG9uc2UudmVyc2lvbklkO1xuICAgICAgY3VycmVudC5taWdyYXRlZFRvUzMgPSB0cnVlO1xuXG4gICAgICBjaGFubmVscy51cGRhdGUoY2hhbm5lbElkLCBjdXJyZW50LCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQ3VycmVudERhdGFfKGVyciwgZGF0YSwgZmFsc2UpO1xuICAgICAgICBleGVjdXRlQ2FsbGJhY2soY2FsbGJhY2ssIGRhdGEpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuICB1cGRhdGVDdXJyZW50RGF0YV86IGZ1bmN0aW9uIChlcnIsIGRhdGEsIGlzTmV3Q2hhbm5lbCkge1xuICAgIGlmIChlcnIpIHtcbiAgICAgICQoJy5wcm9qZWN0X3VwZGF0ZWRfYXQnKS50ZXh0KCdFcnJvciBzYXZpbmcgcHJvamVjdCcpOyAgLy8gVE9ETyBpMThuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY3VycmVudCA9IGRhdGE7XG4gICAgaWYgKGlzTmV3Q2hhbm5lbCkge1xuICAgICAgLy8gV2UgaGF2ZSBhIG5ldyBjaGFubmVsLCBtZWFuaW5nIGVpdGhlciB3ZSBoYWQgbm8gY2hhbm5lbCBiZWZvcmUsIG9yXG4gICAgICAvLyB3ZSd2ZSBjaGFuZ2VkIGNoYW5uZWxzLiBJZiB3ZSBhcmVuJ3QgYXQgYSAvcHJvamVjdHMvPGFwcG5hbWU+IGxpbmssXG4gICAgICAvLyBhbHdheXMgZG8gYSByZWRpcmVjdCAoaS5lLiB3ZSdyZSByZW1peCBmcm9tIGluc2lkZSBhIHNjcmlwdClcbiAgICAgIGlmIChpc0VkaXRpbmcgJiYgcGFyc2VQYXRoKCkuYXBwTmFtZSkge1xuICAgICAgICBpZiAod2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSB7XG4gICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsIGRvY3VtZW50LnRpdGxlLCB0aGlzLmdldFBhdGhOYW1lKCdlZGl0JykpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSdyZSBvbiBhIHNoYXJlIHBhZ2UsIGFuZCBnb3QgYSBuZXcgY2hhbm5lbCBpZC4gQWx3YXlzIGRvIGEgcmVkaXJlY3RcbiAgICAgICAgbG9jYXRpb24uaHJlZiA9IHRoaXMuZ2V0UGF0aE5hbWUoJ2VkaXQnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZGFzaGJvYXJkLmhlYWRlci51cGRhdGVUaW1lc3RhbXAoKTtcbiAgfSxcbiAgLyoqXG4gICAqIEF1dG9zYXZlIHRoZSBjb2RlIGlmIHRoaW5ncyBoYXZlIGNoYW5nZWRcbiAgICovXG4gIGF1dG9zYXZlXzogZnVuY3Rpb24gKCkge1xuICAgIC8vIEJhaWwgaWYgYmFzZWxpbmUgY29kZSBkb2Vzbid0IGV4aXN0IChhcHAgbm90IHlldCBpbml0aWFsaXplZClcbiAgICBpZiAoY3VycmVudFNvdXJjZXMuc291cmNlID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGBnZXRMZXZlbFNvdXJjZSgpYCBpcyBleHBlbnNpdmUgZm9yIEJsb2NrbHkgc28gb25seSBjYWxsXG4gICAgLy8gYWZ0ZXIgYHdvcmtzcGFjZUNoYW5nZWAgaGFzIGZpcmVkXG4gICAgaWYgKCFhcHBPcHRpb25zLmRyb3BsZXQgJiYgIWhhc1Byb2plY3RDaGFuZ2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCQoJyNkZXNpZ25Nb2RlVml6IC51aS1kcmFnZ2FibGUtZHJhZ2dpbmcnKS5sZW5ndGggIT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc291cmNlID0gdGhpcy5zb3VyY2VIYW5kbGVyLmdldExldmVsU291cmNlKCk7XG4gICAgdmFyIGh0bWwgPSB0aGlzLnNvdXJjZUhhbmRsZXIuZ2V0TGV2ZWxIdG1sKCk7XG5cbiAgICBpZiAoY3VycmVudFNvdXJjZXMuc291cmNlID09PSBzb3VyY2UgJiYgY3VycmVudFNvdXJjZXMuaHRtbCA9PT0gaHRtbCkge1xuICAgICAgaGFzUHJvamVjdENoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNhdmUoe3NvdXJjZTogc291cmNlLCBodG1sOiBodG1sfSwgZnVuY3Rpb24gKCkge1xuICAgICAgaGFzUHJvamVjdENoYW5nZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIFJlbmFtZXMgYW5kIHNhdmVzIHRoZSBwcm9qZWN0LlxuICAgKi9cbiAgcmVuYW1lOiBmdW5jdGlvbihuZXdOYW1lLCBjYWxsYmFjaykge1xuICAgIHRoaXMuc2V0TmFtZShuZXdOYW1lKTtcbiAgICB0aGlzLnNhdmUoY2FsbGJhY2spO1xuICB9LFxuICAvKipcbiAgICogRnJlZXplcyBhbmQgc2F2ZXMgdGhlIHByb2plY3QuIEFsc28gaGlkZXMgc28gdGhhdCBpdCdzIG5vdCBhdmFpbGFibGUgZm9yIGRlbGV0aW5nL3JlbmFtaW5nIGluIHRoZSB1c2VyJ3MgcHJvamVjdCBsaXN0LlxuICAgKi9cbiAgZnJlZXplOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGN1cnJlbnQuZnJvemVuID0gdHJ1ZTtcbiAgICBjdXJyZW50LmhpZGRlbiA9IHRydWU7XG4gICAgdGhpcy5zYXZlKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjaywgZGF0YSk7XG4gICAgICByZWRpcmVjdEVkaXRWaWV3KCk7XG4gICAgfSk7XG4gIH0sXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGUgcHJvamVjdCwgZ2l2ZXMgaXQgdGhlIHByb3ZpZGVkIG5hbWUsIGFuZCBzZXRzIHRoZVxuICAgKiBjb3B5IGFzIHRoZSBjdXJyZW50IHByb2plY3QuXG4gICAqL1xuICBjb3B5OiBmdW5jdGlvbihuZXdOYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBzcmNDaGFubmVsID0gY3VycmVudC5pZDtcbiAgICB2YXIgd3JhcHBlZENhbGxiYWNrID0gdGhpcy5jb3B5QXNzZXRzLmJpbmQodGhpcywgc3JjQ2hhbm5lbCwgY2FsbGJhY2spO1xuICAgIGRlbGV0ZSBjdXJyZW50LmlkO1xuICAgIGRlbGV0ZSBjdXJyZW50LmhpZGRlbjtcbiAgICB0aGlzLnNldE5hbWUobmV3TmFtZSk7XG4gICAgY2hhbm5lbHMuY3JlYXRlKGN1cnJlbnQsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgIHRoaXMudXBkYXRlQ3VycmVudERhdGFfKGVyciwgZGF0YSwgdHJ1ZSk7XG4gICAgICB0aGlzLnNhdmUod3JhcHBlZENhbGxiYWNrKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuICBjb3B5QXNzZXRzOiBmdW5jdGlvbiAoc3JjQ2hhbm5lbCwgY2FsbGJhY2spIHtcbiAgICBpZiAoIXNyY0NoYW5uZWwpIHtcbiAgICAgIGV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBkZXN0Q2hhbm5lbCA9IGN1cnJlbnQuaWQ7XG4gICAgYXNzZXRzLmNvcHlBbGwoc3JjQ2hhbm5lbCwgZGVzdENoYW5uZWwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICAkKCcucHJvamVjdF91cGRhdGVkX2F0JykudGV4dCgnRXJyb3IgY29weWluZyBmaWxlcycpOyAgLy8gVE9ETyBpMThuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGV4ZWN1dGVDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgfSk7XG4gIH0sXG4gIHNlcnZlclNpZGVSZW1peDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKGN1cnJlbnQgJiYgIWN1cnJlbnQubmFtZSkge1xuICAgICAgaWYgKHByb2plY3RzLmFwcFRvUHJvamVjdFVybCgpID09PSAnL3Byb2plY3RzL2FsZ2VicmFfZ2FtZScpIHtcbiAgICAgICAgdGhpcy5zZXROYW1lKCdCaWcgR2FtZSBUZW1wbGF0ZScpO1xuICAgICAgfSBlbHNlIGlmIChwcm9qZWN0cy5hcHBUb1Byb2plY3RVcmwoKSA9PT0gJy9wcm9qZWN0cy9hcHBsYWInKSB7XG4gICAgICAgIHRoaXMuc2V0TmFtZSgnTXkgUHJvamVjdCcpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZWRpcmVjdFRvUmVtaXgoKSB7XG4gICAgICBsb2NhdGlvbi5ocmVmID0gcHJvamVjdHMuZ2V0UGF0aE5hbWUoJ3JlbWl4Jyk7XG4gICAgfVxuICAgIC8vIElmIHRoZSB1c2VyIGlzIHRoZSBvd25lciwgc2F2ZSBiZWZvcmUgcmVtaXhpbmcgb24gdGhlIHNlcnZlci5cbiAgICBpZiAoY3VycmVudC5pc093bmVyKSB7XG4gICAgICBwcm9qZWN0cy5zYXZlKHJlZGlyZWN0VG9SZW1peCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZGlyZWN0VG9SZW1peCgpO1xuICAgIH1cbiAgfSxcbiAgY3JlYXRlTmV3OiBmdW5jdGlvbigpIHtcbiAgICBwcm9qZWN0cy5zYXZlKGZ1bmN0aW9uICgpIHtcbiAgICAgIGxvY2F0aW9uLmhyZWYgPSBwcm9qZWN0cy5hcHBUb1Byb2plY3RVcmwoKSArICcvbmV3JztcbiAgICB9KTtcbiAgfSxcbiAgZGVsZXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBjaGFubmVsSWQgPSBjdXJyZW50LmlkO1xuICAgIGNoYW5uZWxzLmRlbGV0ZShjaGFubmVsSWQsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgICAgZXhlY3V0ZUNhbGxiYWNrKGNhbGxiYWNrLCBkYXRhKTtcbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIEByZXR1cm5zIHtqUXVlcnkuRGVmZXJyZWR9IEEgZGVmZXJyZWQgd2hpY2ggd2lsbCByZXNvbHZlIHdoZW4gdGhlIHByb2plY3QgbG9hZHMuXG4gICAqL1xuICBsb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRlZmVycmVkID0gbmV3ICQuRGVmZXJyZWQoKTtcbiAgICBpZiAocHJvamVjdHMuaXNQcm9qZWN0TGV2ZWwoKSkge1xuICAgICAgaWYgKHJlZGlyZWN0RnJvbUhhc2hVcmwoKSB8fCByZWRpcmVjdEVkaXRWaWV3KCkpIHtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XG4gICAgICB9XG4gICAgICB2YXIgcGF0aEluZm8gPSBwYXJzZVBhdGgoKTtcblxuICAgICAgaWYgKHBhdGhJbmZvLmNoYW5uZWxJZCkge1xuICAgICAgICBpZiAocGF0aEluZm8uYWN0aW9uID09PSAnZWRpdCcpIHtcbiAgICAgICAgICBpc0VkaXRpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQoJyNiZXRhaW5mbycpLmhpZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvYWQgdGhlIHByb2plY3QgSUQsIGlmIG9uZSBleGlzdHNcbiAgICAgICAgY2hhbm5lbHMuZmV0Y2gocGF0aEluZm8uY2hhbm5lbElkLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgLy8gUHJvamVjdCBub3QgZm91bmQsIHJlZGlyZWN0IHRvIHRoZSBuZXcgcHJvamVjdCBleHBlcmllbmNlLlxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylcbiAgICAgICAgICAgICAgLnNsaWNlKFBhdGhQYXJ0LlNUQVJULCBQYXRoUGFydC5BUFAgKyAxKS5qb2luKCcvJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZldGNoU291cmNlKGRhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnQuaXNPd25lciAmJiBwYXRoSW5mby5hY3Rpb24gPT09ICd2aWV3Jykge1xuICAgICAgICAgICAgICAgIGlzRWRpdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZmV0Y2hBYnVzZVNjb3JlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzRWRpdGluZyA9IHRydWU7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFwcE9wdGlvbnMuaXNDaGFubmVsQmFja2VkKSB7XG4gICAgICBpc0VkaXRpbmcgPSB0cnVlO1xuICAgICAgY2hhbm5lbHMuZmV0Y2goYXBwT3B0aW9ucy5jaGFubmVsLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZldGNoU291cmNlKGRhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHByb2plY3RzLnNob3dTaGFyZVJlbWl4SGVhZGVyKCk7XG4gICAgICAgICAgICBmZXRjaEFidXNlU2NvcmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgdGhlIHVybCB0byBwZXJmb3JtIHRoZSBzcGVjaWZpZWQgYWN0aW9uIGZvciB0aGlzIHByb2plY3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb24gQWN0aW9uIHRvIHBlcmZvcm0uXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFVybCB0byB0aGUgc3BlY2lmaWVkIGFjdGlvbi5cbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoaXMgdHlwZSBvZiBwcm9qZWN0IGRvZXMgbm90IGhhdmUgYSBzdGFuZGFsb25lIGFwcC5cbiAgICovXG4gIGdldFBhdGhOYW1lOiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgdmFyIHBhdGhOYW1lID0gdGhpcy5hcHBUb1Byb2plY3RVcmwoKSArICcvJyArIHRoaXMuZ2V0Q3VycmVudElkKCk7XG4gICAgaWYgKGFjdGlvbikge1xuICAgICAgcGF0aE5hbWUgKz0gJy8nICsgYWN0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aE5hbWU7XG4gIH1cbn07XG5cbi8qKlxuICogR2l2ZW4gZGF0YSBmcm9tIG91ciBjaGFubmVscyBhcGksIHVwZGF0ZXMgY3VycmVudCBhbmQgZ2V0cyBzb3VyY2VzIGZyb21cbiAqIHNvdXJjZXMgYXBpXG4gKiBAcGFyYW0ge29iamVjdH0gY2hhbm5lbERhdGEgRGF0YSB3ZSBmZXRjaGVkIGZyb20gY2hhbm5lbHMgYXBpXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBmZXRjaFNvdXJjZShjaGFubmVsRGF0YSwgY2FsbGJhY2spIHtcbiAgLy8gRXhwbGljaXRseSByZW1vdmUgbGV2ZWxTb3VyY2UvbGV2ZWxIdG1sIGZyb20gY2hhbm5lbHNcbiAgZGVsZXRlIGNoYW5uZWxEYXRhLmxldmVsU291cmNlO1xuICBkZWxldGUgY2hhbm5lbERhdGEubGV2ZWxIdG1sO1xuICAvLyBBbHNvIGNsZWFyIG91dCBodG1sLCB3aGljaCB3ZSBuZXZlciBzaG91bGQgaGF2ZSBiZWVuIHNldHRpbmcuXG4gIGRlbGV0ZSBjaGFubmVsRGF0YS5odG1sO1xuXG4gIC8vIFVwZGF0ZSBjdXJyZW50XG4gIGN1cnJlbnQgPSBjaGFubmVsRGF0YTtcblxuICBwcm9qZWN0cy5zZXRUaXRsZShjdXJyZW50Lm5hbWUpO1xuICBpZiAoY2hhbm5lbERhdGEubWlncmF0ZWRUb1MzKSB7XG4gICAgc291cmNlcy5mZXRjaChjdXJyZW50LmlkICsgJy8nICsgU09VUkNFX0ZJTEUsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgIHVucGFja1NvdXJjZXMoZGF0YSk7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIEl0J3MgcG9zc2libGUgdGhhdCB3ZSBjcmVhdGVkIGEgY2hhbm5lbCwgYnV0IGZhaWxlZCB0byBzYXZlIGFueXRoaW5nIHRvXG4gICAgLy8gUzMuIEluIHRoaXMgY2FzZSwgaXQncyBleHBlY3RlZCB0aGF0IGh0bWwvbGV2ZWxTb3VyY2UgYXJlIG51bGwuXG4gICAgY2FsbGJhY2soKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmZXRjaEFidXNlU2NvcmUoY2FsbGJhY2spIHtcbiAgY2hhbm5lbHMuZmV0Y2goY3VycmVudC5pZCArICcvYWJ1c2UnLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgY3VycmVudEFidXNlU2NvcmUgPSAoZGF0YSAmJiBkYXRhLmFidXNlX3Njb3JlKSB8fCBjdXJyZW50QWJ1c2VTY29yZTtcbiAgICBjYWxsYmFjaygpO1xuICAgIGlmIChlcnIpIHtcbiAgICAgIC8vIFRocm93IGFuIGVycm9yIHNvIHRoYXQgdGhpbmdzIGxpa2UgTmV3IFJlbGljIHNlZSB0aGlzLiBUaGlzIHNob3VsZG4ndFxuICAgICAgLy8gYWZmZWN0IGFueXRoaW5nIGVsc2VcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE9ubHkgZXhlY3V0ZSB0aGUgZ2l2ZW4gYXJndW1lbnQgaWYgaXQgaXMgYSBmdW5jdGlvbi5cbiAqIEBwYXJhbSBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBleGVjdXRlQ2FsbGJhY2soY2FsbGJhY2ssIGRhdGEpIHtcbiAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrKGRhdGEpO1xuICB9XG59XG5cbi8qKlxuICogaXMgdGhlIGN1cnJlbnQgcHJvamVjdCAoaWYgYW55KSBlZGl0YWJsZSBieSB0aGUgbG9nZ2VkIGluIHVzZXIgKGlmIGFueSk/XG4gKi9cbmZ1bmN0aW9uIGlzRWRpdGFibGUoKSB7XG4gIHJldHVybiAoY3VycmVudCAmJiBjdXJyZW50LmlzT3duZXIgJiYgIWN1cnJlbnQuZnJvemVuKTtcbn1cblxuLyoqXG4gKiBJZiB0aGUgY3VycmVudCB1c2VyIGlzIHRoZSBvd25lciwgd2Ugd2FudCB0byByZWRpcmVjdCBmcm9tIHRoZSByZWFkb25seVxuICogL3ZpZXcgcm91dGUgdG8gL2VkaXQuIElmIHRoZXkgYXJlIG5vdCB0aGUgb3duZXIsIHdlIHdhbnQgdG8gcmVkaXJlY3QgZnJvbVxuICogL2VkaXQgdG8gL3ZpZXdcbiAqL1xuZnVuY3Rpb24gcmVkaXJlY3RFZGl0VmlldygpIHtcbiAgdmFyIHBhcnNlSW5mbyA9IHBhcnNlUGF0aCgpO1xuICBpZiAoIXBhcnNlSW5mby5hY3Rpb24pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZG9uJ3QgZG8gYW55IHJlZGlyZWN0aW5nIGlmIHdlIGhhdmVudCBsb2FkZWQgYSBjaGFubmVsIHlldFxuICBpZiAoIWN1cnJlbnQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5ld1VybDtcbiAgaWYgKHBhcnNlSW5mby5hY3Rpb24gPT09ICd2aWV3JyAmJiBpc0VkaXRhYmxlKCkpIHtcbiAgICAvLyBSZWRpcmVjdCB0byAvZWRpdCB3aXRob3V0IGEgcmVhZG9ubHkgd29ya3NwYWNlXG4gICAgbmV3VXJsID0gbG9jYXRpb24uaHJlZi5yZXBsYWNlKC8oXFwvcHJvamVjdHNcXC9bXi9dK1xcL1teL10rKVxcL3ZpZXcvLCAnJDEvZWRpdCcpO1xuICAgIGFwcE9wdGlvbnMucmVhZG9ubHlXb3Jrc3BhY2UgPSBmYWxzZTtcbiAgICBpc0VkaXRpbmcgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHBhcnNlSW5mby5hY3Rpb24gPT09ICdlZGl0JyAmJiAhaXNFZGl0YWJsZSgpKSB7XG4gICAgLy8gUmVkaXJlY3QgdG8gL3ZpZXcgd2l0aCBhIHJlYWRvbmx5IHdvcmtzcGFjZVxuICAgIG5ld1VybCA9IGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvKFxcL3Byb2plY3RzXFwvW14vXStcXC9bXi9dKylcXC9lZGl0LywgJyQxL3ZpZXcnKTtcbiAgICBhcHBPcHRpb25zLnJlYWRvbmx5V29ya3NwYWNlID0gdHJ1ZTtcbiAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIFB1c2hTdGF0ZSB0byB0aGUgbmV3IFVybCBpZiB3ZSBjYW4sIG90aGVyd2lzZSBkbyBub3RoaW5nLlxuICBpZiAobmV3VXJsICYmIG5ld1VybCAhPT0gbG9jYXRpb24uaHJlZiAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe21vZGlmaWVkOiB0cnVlfSwgZG9jdW1lbnQudGl0bGUsIG5ld1VybCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIERvZXMgYSBoYXJkIHJlZGlyZWN0IGlmIHdlIGVuZCB1cCB3aXRoIGEgaGFzaCBiYXNlZCBwcm9qZWN0cyB1cmwuIFRoaXMgY2FuXG4gKiBoYXBwZW4gb24gSUU5LCB3aGVuIHdlIHNhdmUgYSBuZXcgcHJvamVjdCBmb3IgaHRlIGZpcnN0IHRpbWUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB3ZSBkaWQgYW4gYWN0dWFsIHJlZGlyZWN0XG4gKi9cbmZ1bmN0aW9uIHJlZGlyZWN0RnJvbUhhc2hVcmwoKSB7XG4gIHZhciBuZXdVcmwgPSBsb2NhdGlvbi5ocmVmLnJlcGxhY2UoJyMnLCAnLycpO1xuICBpZiAobmV3VXJsID09PSBsb2NhdGlvbi5ocmVmKSB7XG4gICAgLy8gTm90aGluZyBjaGFuZ2VkXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHBhdGhJbmZvID0gcGFyc2VQYXRoKCk7XG4gIGxvY2F0aW9uLmhyZWYgPSBuZXdVcmw7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBjaGFubmVsSWQvYWN0aW9uIGZyb20gdGhlIHBhdGhuYW1lLCBhY2NvdW50aW5nIGZvciB0aGUgZmFjdFxuICogdGhhdCB3ZSBtYXkgaGF2ZSBoYXNoIGJhc2VkIHJvdXRlIG9yIG5vdFxuICovXG5mdW5jdGlvbiBwYXJzZVBhdGgoKSB7XG4gIHZhciBwYXRobmFtZSA9IGxvY2F0aW9uLnBhdGhuYW1lO1xuXG4gIC8vIFdlIGhhdmUgYSBoYXNoIGJhc2VkIHJvdXRlLiBSZXBsYWNlIHRoZSBoYXNoIHdpdGggYSBzbGFzaCwgYW5kIGFwcGVuZCB0b1xuICAvLyBvdXIgZXhpc3RpbmcgcGF0aFxuICBpZiAobG9jYXRpb24uaGFzaCkge1xuICAgIHBhdGhuYW1lICs9IGxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcvJyk7XG4gIH1cblxuICBpZiAocGF0aG5hbWUuc3BsaXQoJy8nKVtQYXRoUGFydC5QUk9KRUNUU10gIT09ICdwJyAmJlxuICAgICAgcGF0aG5hbWUuc3BsaXQoJy8nKVtQYXRoUGFydC5QUk9KRUNUU10gIT09ICdwcm9qZWN0cycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYXBwTmFtZTogbnVsbCxcbiAgICAgIGNoYW5uZWxJZDogbnVsbCxcbiAgICAgIGFjdGlvbjogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhcHBOYW1lOiBwYXRobmFtZS5zcGxpdCgnLycpW1BhdGhQYXJ0LkFQUF0sXG4gICAgY2hhbm5lbElkOiBwYXRobmFtZS5zcGxpdCgnLycpW1BhdGhQYXJ0LkNIQU5ORUxfSURdLFxuICAgIGFjdGlvbjogcGF0aG5hbWUuc3BsaXQoJy8nKVtQYXRoUGFydC5BQ1RJT05dXG4gIH07XG59XG4iLCIvKiBnbG9iYWwgZGFzaGJvYXJkLCBhcHBPcHRpb25zICovXG5cbnZhciByZW5kZXJBYnVzaXZlID0gcmVxdWlyZSgnLi9yZW5kZXJBYnVzaXZlJyk7XG5cbi8vIE1heCBtaWxsaXNlY29uZHMgdG8gd2FpdCBmb3IgbGFzdCBhdHRlbXB0IGRhdGEgZnJvbSB0aGUgc2VydmVyXG52YXIgTEFTVF9BVFRFTVBUX1RJTUVPVVQgPSA1MDAwO1xuXG4vLyBMb2FkcyB0aGUgZ2l2ZW4gYXBwIHN0eWxlc2hlZXQuXG5mdW5jdGlvbiBsb2FkU3R5bGUobmFtZSkge1xuICAkKCdib2R5JykuYXBwZW5kKCQoJzxsaW5rPicsIHtcbiAgICByZWw6ICdzdHlsZXNoZWV0JyxcbiAgICB0eXBlOiAndGV4dC9jc3MnLFxuICAgIGhyZWY6IGFwcE9wdGlvbnMuYmFzZVVybCArICdjc3MvJyArIG5hbWUgKyAnLmNzcydcbiAgfSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICB2YXIgbGFzdEF0dGVtcHRMb2FkZWQgPSBmYWxzZTtcblxuICB2YXIgbG9hZExhc3RBdHRlbXB0RnJvbVNlc3Npb25TdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghbGFzdEF0dGVtcHRMb2FkZWQpIHtcbiAgICAgIGxhc3RBdHRlbXB0TG9hZGVkID0gdHJ1ZTtcblxuICAgICAgLy8gTG9hZCB0aGUgbG9jYWxseS1jYWNoZWQgbGFzdCBhdHRlbXB0IChpZiBvbmUgZXhpc3RzKVxuICAgICAgc2V0TGFzdEF0dGVtcHRVbmxlc3NKaWdzYXcoZGFzaGJvYXJkLmNsaWVudFN0YXRlLnNvdXJjZUZvckxldmVsKFxuICAgICAgICAgIGFwcE9wdGlvbnMuc2NyaXB0TmFtZSwgYXBwT3B0aW9ucy5zZXJ2ZXJMZXZlbElkKSk7XG5cbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBpc1ZpZXdpbmdTb2x1dGlvbiA9IChkYXNoYm9hcmQuY2xpZW50U3RhdGUucXVlcnlQYXJhbXMoJ3NvbHV0aW9uJykgPT09ICd0cnVlJyk7XG4gIHZhciBpc1ZpZXdpbmdTdHVkZW50QW5zd2VyID0gISFkYXNoYm9hcmQuY2xpZW50U3RhdGUucXVlcnlQYXJhbXMoJ3VzZXJfaWQnKTtcblxuICBpZiAoIWFwcE9wdGlvbnMuY2hhbm5lbCAmJiAhaXNWaWV3aW5nU29sdXRpb24gJiYgIWlzVmlld2luZ1N0dWRlbnRBbnN3ZXIpIHtcblxuICAgIGlmIChhcHBPcHRpb25zLnB1YmxpY0NhY2hpbmcpIHtcbiAgICAgIC8vIERpc2FibGUgc29jaWFsIHNoYXJlIGJ5IGRlZmF1bHQgb24gcHVibGljbHktY2FjaGVkIHBhZ2VzLCBiZWNhdXNlIHdlIGRvbid0IGtub3dcbiAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIHVuZGVyYWdlIHVudGlsIHdlIGdldCBkYXRhIGJhY2sgZnJvbSAvYXBpL3VzZXJfcHJvZ3Jlc3MvIGFuZCB3ZVxuICAgICAgLy8gc2hvdWxkIGVyciBvbiB0aGUgc2lkZSBvZiBub3Qgc2hvd2luZyBzb2NpYWwgbGlua3NcbiAgICAgIGFwcE9wdGlvbnMuZGlzYWJsZVNvY2lhbFNoYXJlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAkLmFqYXgoJy9hcGkvdXNlcl9wcm9ncmVzcy8nICsgYXBwT3B0aW9ucy5zY3JpcHROYW1lICsgJy8nICsgYXBwT3B0aW9ucy5zdGFnZVBvc2l0aW9uICsgJy8nICsgYXBwT3B0aW9ucy5sZXZlbFBvc2l0aW9uKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBhcHBPcHRpb25zLmRpc2FibGVTb2NpYWxTaGFyZSA9IGRhdGEuZGlzYWJsZVNvY2lhbFNoYXJlO1xuXG4gICAgICAvLyBNZXJnZSBwcm9ncmVzcyBmcm9tIHNlcnZlciAobG9hZGVkIHZpYSBBSkFYKVxuICAgICAgdmFyIHNlcnZlclByb2dyZXNzID0gZGF0YS5wcm9ncmVzcyB8fCB7fTtcbiAgICAgIHZhciBjbGllbnRQcm9ncmVzcyA9IGRhc2hib2FyZC5jbGllbnRTdGF0ZS5hbGxMZXZlbHNQcm9ncmVzcygpW2FwcE9wdGlvbnMuc2NyaXB0TmFtZV0gfHwge307XG4gICAgICBPYmplY3Qua2V5cyhzZXJ2ZXJQcm9ncmVzcykuZm9yRWFjaChmdW5jdGlvbiAobGV2ZWxJZCkge1xuICAgICAgICBpZiAoc2VydmVyUHJvZ3Jlc3NbbGV2ZWxJZF0gIT09IGNsaWVudFByb2dyZXNzW2xldmVsSWRdKSB7XG4gICAgICAgICAgdmFyIHN0YXR1cyA9IGRhc2hib2FyZC5wcm9ncmVzcy5tZXJnZWRBY3Rpdml0eUNzc0NsYXNzKGNsaWVudFByb2dyZXNzW2xldmVsSWRdLCBzZXJ2ZXJQcm9ncmVzc1tsZXZlbElkXSk7XG5cbiAgICAgICAgICAvLyBDbGVhciB0aGUgZXhpc3RpbmcgY2xhc3MgYW5kIHJlcGxhY2VcbiAgICAgICAgICAkKCcjaGVhZGVyLWxldmVsLScgKyBsZXZlbElkKS5hdHRyKCdjbGFzcycsICdsZXZlbF9saW5rICcgKyBzdGF0dXMpO1xuXG4gICAgICAgICAgLy8gV3JpdGUgZG93biBuZXcgcHJvZ3Jlc3MgaW4gc2Vzc2lvblN0b3JhZ2VcbiAgICAgICAgICBkYXNoYm9hcmQuY2xpZW50U3RhdGUudHJhY2tQcm9ncmVzcyhudWxsLCBudWxsLCBzZXJ2ZXJQcm9ncmVzc1tsZXZlbElkXSwgYXBwT3B0aW9ucy5zY3JpcHROYW1lLCBsZXZlbElkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghbGFzdEF0dGVtcHRMb2FkZWQpIHtcbiAgICAgICAgaWYgKGRhdGEubGFzdEF0dGVtcHQpIHtcbiAgICAgICAgICBsYXN0QXR0ZW1wdExvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICB2YXIgdGltZXN0YW1wID0gZGF0YS5sYXN0QXR0ZW1wdC50aW1lc3RhbXA7XG4gICAgICAgICAgdmFyIHNvdXJjZSA9IGRhdGEubGFzdEF0dGVtcHQuc291cmNlO1xuXG4gICAgICAgICAgdmFyIGNhY2hlZFByb2dyYW0gPSBkYXNoYm9hcmQuY2xpZW50U3RhdGUuc291cmNlRm9yTGV2ZWwoXG4gICAgICAgICAgICAgIGFwcE9wdGlvbnMuc2NyaXB0TmFtZSwgYXBwT3B0aW9ucy5zZXJ2ZXJMZXZlbElkLCB0aW1lc3RhbXApO1xuICAgICAgICAgIGlmIChjYWNoZWRQcm9ncmFtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIENsaWVudCB2ZXJzaW9uIGlzIG5ld2VyXG4gICAgICAgICAgICBzZXRMYXN0QXR0ZW1wdFVubGVzc0ppZ3NhdyhjYWNoZWRQcm9ncmFtKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZSAmJiBzb3VyY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBTZXZlciB2ZXJzaW9uIGlzIG5ld2VyXG4gICAgICAgICAgICBzZXRMYXN0QXR0ZW1wdFVubGVzc0ppZ3Nhdyhzb3VyY2UpO1xuXG4gICAgICAgICAgICAvLyBXcml0ZSBkb3duIHRoZSBsYXN0QXR0ZW1wdCBmcm9tIHNlcnZlciBpbiBzZXNzaW9uU3RvcmFnZVxuICAgICAgICAgICAgZGFzaGJvYXJkLmNsaWVudFN0YXRlLndyaXRlU291cmNlRm9yTGV2ZWwoYXBwT3B0aW9ucy5zY3JpcHROYW1lLFxuICAgICAgICAgICAgICAgIGFwcE9wdGlvbnMuc2VydmVyTGV2ZWxJZCwgdGltZXN0YW1wLCBzb3VyY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvYWRMYXN0QXR0ZW1wdEZyb21TZXNzaW9uU3RvcmFnZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmRpc2FibGVQb3N0TWlsZXN0b25lKSB7XG4gICAgICAgICQoXCIjcHJvZ3Jlc3N3YXJuaW5nXCIpLnNob3coKTtcbiAgICAgIH1cbiAgICB9KS5mYWlsKGxvYWRMYXN0QXR0ZW1wdEZyb21TZXNzaW9uU3RvcmFnZSk7XG5cbiAgICAvLyBVc2UgdGhpcyBpbnN0ZWFkIG9mIGEgdGltZW91dCBvbiB0aGUgQUpBWCByZXF1ZXN0IGJlY2F1c2Ugd2Ugc3RpbGwgd2FudFxuICAgIC8vIHRoZSBoZWFkZXIgcHJvZ3Jlc3MgZGF0YSBldmVuIGlmIHRoZSBsYXN0IGF0dGVtcHQgZGF0YSB0YWtlcyB0b28gbG9uZy5cbiAgICAvLyBUaGUgcHJvZ3Jlc3MgZG90cyBjYW4gZmFkZSBpbiBhdCBhbnkgdGltZSB3aXRob3V0IGltcGFjdGluZyB0aGUgdXNlci5cbiAgICBzZXRUaW1lb3V0KGxvYWRMYXN0QXR0ZW1wdEZyb21TZXNzaW9uU3RvcmFnZSwgTEFTVF9BVFRFTVBUX1RJTUVPVVQpO1xuICB9IGVsc2UgaWYgKHdpbmRvdy5kYXNoYm9hcmQgJiYgZGFzaGJvYXJkLnByb2plY3QpIHtcbiAgICBkYXNoYm9hcmQucHJvamVjdC5sb2FkKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoZGFzaGJvYXJkLnByb2plY3QuaGlkZUJlY2F1c2VBYnVzaXZlKCkpIHtcbiAgICAgICAgcmVuZGVyQWJ1c2l2ZSgpO1xuICAgICAgICByZXR1cm4gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgfVxuICAgIH0pLnRoZW4oY2FsbGJhY2spO1xuICB9IGVsc2Uge1xuICAgIGxvYWRMYXN0QXR0ZW1wdEZyb21TZXNzaW9uU3RvcmFnZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBzZXRMYXN0QXR0ZW1wdFVubGVzc0ppZ3Nhdyhzb3VyY2UpIHtcbiAgaWYgKGFwcE9wdGlvbnMubGV2ZWxHYW1lTmFtZSAhPT0gJ0ppZ3NhdycpIHtcbiAgICBhcHBPcHRpb25zLmxldmVsLmxhc3RBdHRlbXB0ID0gc291cmNlO1xuICB9XG59XG4iLCIvKiBnbG9iYWwgZGFzaGJvYXJkLCBSZWFjdCAqL1xuXG4vKipcbiAqIFJlbmRlcnMgb3VyIEFidXNlRXhjbGFtYXRpb24gY29tcG9uZW50LCBhbmQgcG90ZW50aWFsbHkgdXBkYXRlcyBhZG1pbiBib3hcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KHdpbmRvdy5kYXNoYm9hcmQuQWJ1c2VFeGNsYW1hdGlvbiwge1xuICAgIGkxOG46IHtcbiAgICAgIHRvczogd2luZG93LmRhc2hib2FyZC5pMThuLnQoJ3Byb2plY3QuYWJ1c2UudG9zJyksXG4gICAgICBjb250YWN0X3VzOiB3aW5kb3cuZGFzaGJvYXJkLmkxOG4udCgncHJvamVjdC5hYnVzZS5jb250YWN0X3VzJyksXG4gICAgICBlZGl0X3Byb2plY3Q6IHdpbmRvdy5kYXNoYm9hcmQuaTE4bi50KCdwcm9qZWN0LmVkaXRfcHJvamVjdCcpLFxuICAgICAgZ29fdG9fY29kZV9zdHVkaW86IHdpbmRvdy5kYXNoYm9hcmQuaTE4bi50KCdwcm9qZWN0LmFidXNlLmdvX3RvX2NvZGVfc3R1ZGlvJylcbiAgICB9LFxuICAgIGlzT3duZXI6IGRhc2hib2FyZC5wcm9qZWN0LmlzT3duZXIoKVxuICB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGVBcHAnKSk7XG5cbiAgLy8gdXBkYXRlIGFkbWluIGJveCAoaWYgaXQgZXhpc3RzKSB3aXRoIGFidXNlIGluZm9cbiAgZGFzaGJvYXJkLmFkbWluLnNob3dQcm9qZWN0QWRtaW4oKTtcbn07XG4iLCIvKipcbiAqIEBmaWxlIEhlbHBlciBBUEkgb2JqZWN0IHRoYXQgd3JhcHMgYXN5bmNocm9ub3VzIGNhbGxzIHRvIG91ciBkYXRhIEFQSXMuXG4gKi9cblxuLyoqXG4gKiBTdGFuZGFyZCBjYWxsYmFjayBmb3JtIGZvciBhc3luY2hyb25vdXMgb3BlcmF0aW9ucywgcG9wdWxhcml6ZWQgYnkgTm9kZS5cbiAqIEB0eXBlZGVmIHtmdW5jdGlvbn0gTm9kZVN0eWxlQ2FsbGJhY2tcbiAqIEBwYXJhbSB7RXJyb3J8bnVsbH0gZXJyb3IgLSBudWxsIGlmIHRoZSBhc3luYyBvcGVyYXRpb24gd2FzIHN1Y2Nlc3NmdWwuXG4gKiBAcGFyYW0geyp9IHJlc3VsdCAtIHJldHVybiB2YWx1ZSBmb3IgYXN5bmMgb3BlcmF0aW9uLlxuICovXG5cbi8qKlxuICogQG5hbWUgQ2xpZW50QXBpXG4gKi9cbnZhciBiYXNlID0ge1xuICAvKipcbiAgICogQmFzZSBVUkwgZm9yIHRhcmdldCBBUEkuXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICBhcGlfYmFzZV91cmw6IFwiL3YzL2NoYW5uZWxzXCIsXG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgYWxsIGNvbGxlY3Rpb25zLlxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyBhbiBhcnJheSBvZlxuICAgKiAgICAgICAgY29sbGVjdGlvbiBvYmplY3RzLlxuICAgKi9cbiAgYWxsOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsLFxuICAgICAgdHlwZTogXCJnZXRcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEluc2VydCBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSAtIGNvbGxlY3Rpb24gY29udGVudHMsIG11c3QgYmUgSlNPTi5zdHJpbmdpZnktYWJsZS5cbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2sgLSBFeHBlY3RlZCByZXN1bHQgaXMgdGhlIGNyZWF0ZWRcbiAgICogICAgICAgIGNvbGxlY3Rpb24gb2JqZWN0ICh3aGljaCB3aWxsIGluY2x1ZGUgYW4gYXNzaWduZWQgJ2lkJyBrZXkpLlxuICAgKi9cbiAgY3JlYXRlOiBmdW5jdGlvbih2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCxcbiAgICAgIHR5cGU6IFwicG9zdFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0KSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKHJlcXVlc3QsIHN0YXR1cywgZXJyb3IpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3N0YXR1czogJyArIHN0YXR1cyArICc7IGVycm9yOiAnICsgZXJyb3IpO1xuICAgICAgY2FsbGJhY2soZXJyLCB1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBjb2xsZWN0aW9uLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2hpbGRQYXRoIFRoZSBwYXRoIHVuZGVybmVhdGggYXBpX2Jhc2VfdXJsXG4gICAqIEBwYXJhbSB7Tm9kZVN0eWxlQ2FsbGJhY2t9IGNhbGxiYWNrIC0gRXhwZWN0ZWQgcmVzdWx0IGlzIFRSVUUuXG4gICAqL1xuICBkZWxldGU6IGZ1bmN0aW9uKGNoaWxkUGF0aCwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgY2hpbGRQYXRoICsgXCIvZGVsZXRlXCIsXG4gICAgICB0eXBlOiBcInBvc3RcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgdHJ1ZSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgZmFsc2UpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGlsZFBhdGggVGhlIHBhdGggdW5kZXJuZWF0aCBhcGlfYmFzZV91cmxcbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2sgLSBFeHBlY3RlZCByZXN1bHQgaXMgdGhlIHJlcXVlc3RlZFxuICAgKiAgICAgICAgY29sbGVjdGlvbiBvYmplY3QuXG4gICAqL1xuICBmZXRjaDogZnVuY3Rpb24oY2hpbGRQYXRoLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBjaGlsZFBhdGgsXG4gICAgICB0eXBlOiBcImdldFwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSwgdGV4dCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihyZXF1ZXN0LCBzdGF0dXMsIGVycm9yKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzdGF0dXM6ICcgKyBzdGF0dXMgKyAnOyBlcnJvcjogJyArIGVycm9yKTtcbiAgICAgIGNhbGxiYWNrKGVyciwgdW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBjb250ZW50cyBvZiBhIGNvbGxlY3Rpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjaGlsZFBhdGggVGhlIHBhdGggdW5kZXJuZWF0aCBhcGlfYmFzZV91cmxcbiAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIC0gVGhlIG5ldyBjb2xsZWN0aW9uIGNvbnRlbnRzLlxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyB0aGUgbmV3IGNvbGxlY3Rpb25cbiAgICogICAgICAgIG9iamVjdC5cbiAgICovXG4gIHVwZGF0ZTogZnVuY3Rpb24oY2hpbGRQYXRoLCB2YWx1ZSwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgY2hpbGRQYXRoLFxuICAgICAgdHlwZTogXCJwb3N0XCIsXG4gICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ29weSB0byB0aGUgZGVzdGluYXRpb24gY29sbGVjdGlvbiwgc2luY2Ugd2UgZXhwZWN0IHRoZSBkZXN0aW5hdGlvblxuICAgKiB0byBiZSBlbXB0eS4gQSB0cnVlIHJlc3QgQVBJIHdvdWxkIHJlcGxhY2UgdGhlIGRlc3RpbmF0aW9uIGNvbGxlY3Rpb246XG4gICAqIEBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVwcmVzZW50YXRpb25hbF9zdGF0ZV90cmFuc2ZlciNBcHBsaWVkX3RvX3dlYl9zZXJ2aWNlc1xuICAgKiBAcGFyYW0geyp9IHNyYyAtIFNvdXJjZSBjb2xsZWN0aW9uIGlkZW50aWZpZXIuXG4gICAqIEBwYXJhbSB7Kn0gZGVzdCAtIERlc3RpbmF0aW9uIGNvbGxlY3Rpb24gaWRlbnRpZmllci5cbiAgICogQHBhcmFtIHtOb2RlU3R5bGVDYWxsYmFja30gY2FsbGJhY2tcbiAgICovXG4gIGNvcHlBbGw6IGZ1bmN0aW9uKHNyYywgZGVzdCwgY2FsbGJhY2spIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLmFwaV9iYXNlX3VybCArIFwiL1wiICsgZGVzdCArICc/c3JjPScgKyBzcmMsXG4gICAgICB0eXBlOiBcInB1dFwiXG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0KSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICB9KS5mYWlsKGZ1bmN0aW9uKHJlcXVlc3QsIHN0YXR1cywgZXJyb3IpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3N0YXR1czogJyArIHN0YXR1cyArICc7IGVycm9yOiAnICsgZXJyb3IpO1xuICAgICAgY2FsbGJhY2soZXJyLCBmYWxzZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgdGhlIGNvbnRlbnRzIG9mIGFuIGFzc2V0IG9yIHNvdXJjZSBmaWxlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaWQgLSBUaGUgY29sbGVjdGlvbiBpZGVudGlmaWVyLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgLSBUaGUgbmV3IGZpbGUgY29udGVudHMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBmaWxlIHRvIGNyZWF0ZSBvciB1cGRhdGUuXG4gICAqIEBwYXJhbSB7Tm9kZVN0eWxlQ2FsbGJhY2t9IGNhbGxiYWNrIC0gRXhwZWN0ZWQgcmVzdWx0IGlzIHRoZSBuZXcgY29sbGVjdGlvblxuICAgKiAgICAgICAgb2JqZWN0LlxuICAgKi9cbiAgcHV0OiBmdW5jdGlvbihpZCwgdmFsdWUsIGZpbGVuYW1lLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBpZCArIFwiL1wiICsgZmlsZW5hbWUsXG4gICAgICB0eXBlOiBcInB1dFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogdmFsdWVcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogTW9kaWZ5IHRoZSBjb250ZW50cyBvZiBhIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkIC0gVGhlIGNvbGxlY3Rpb24gaWRlbnRpZmllci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5UGFyYW1zIC0gQW55IHF1ZXJ5IHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIC0gVGhlIHJlcXVlc3QgYm9keVxuICAgKiBAcGFyYW0ge05vZGVTdHlsZUNhbGxiYWNrfSBjYWxsYmFjayAtIEV4cGVjdGVkIHJlc3VsdCBpcyB0aGUgbmV3IGNvbGxlY3Rpb25cbiAgICogICAgICAgIG9iamVjdC5cbiAgICovXG4gIHBhdGNoQWxsOiBmdW5jdGlvbihpZCwgcXVlcnlQYXJhbXMsIHZhbHVlLCBjYWxsYmFjaykge1xuICAgICQuYWpheCh7XG4gICAgICB1cmw6IHRoaXMuYXBpX2Jhc2VfdXJsICsgXCIvXCIgKyBpZCArIFwiLz9cIiArIHF1ZXJ5UGFyYW1zLFxuICAgICAgdHlwZTogXCJwYXRjaFwiLFxuICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiLFxuICAgICAgZGF0YTogdmFsdWVcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEsIHRleHQpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24ocmVxdWVzdCwgc3RhdHVzLCBlcnJvcikge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignc3RhdHVzOiAnICsgc3RhdHVzICsgJzsgZXJyb3I6ICcgKyBlcnJvcik7XG4gICAgICBjYWxsYmFjayhlcnIsIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxufTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvKipcbiAgICogQ3JlYXRlIGEgQ2xpZW50QXBpIGluc3RhbmNlIHdpdGggdGhlIGdpdmVuIGJhc2UgVVJMLlxuICAgKiBAcGFyYW0geyFzdHJpbmd9IHVybCAtIEN1c3RvbSBBUEkgYmFzZSB1cmwgKGUuZy4gJy92My9uZXRzaW0nKVxuICAgKiBAcmV0dXJucyB7Q2xpZW50QXBpfVxuICAgKi9cbiAgY3JlYXRlOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgcmV0dXJuICQuZXh0ZW5kKHt9LCBiYXNlLCB7XG4gICAgICBhcGlfYmFzZV91cmw6IHVybFxuICAgIH0pO1xuICB9XG59O1xuIiwiLyogZ2xvYmFsIFdlYktpdE11dGF0aW9uT2JzZXJ2ZXIgKi9cblxuLyoqXG4gKiBXb3JrYXJvdW5kIGZvciBDaHJvbWUgMzQgU1ZHIGJ1ZyAjMzQ5NzAxXG4gKlxuICogQnVnIGRldGFpbHM6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0zNDk3MDFcbiAqICAgdGw7ZHI6IG9ubHkgdGhlIGZpcnN0IGNsaXBwYXRoIGluIGEgZ2l2ZW4gc3ZnIGVsZW1lbnQgcmVuZGVyc1xuICpcbiAqIFdvcmthcm91bmQ6IHdyYXAgYWxsIGNsaXBwYXRoL2ltYWdlIHBhaXJzIGludG8gdGhlaXIgb3duIHN2ZyBlbGVtZW50c1xuICpcbiAqIDEuIFdyYXAgYW55IGV4aXN0aW5nIGNsaXBwYXRoL2ltYWdlIHBhaXJzIGluIGVtcHR5IHN2ZyBlbGVtZW50c1xuICogMi4gV3JhcCBuZXcgY2xpcHBhdGgvaW1hZ2UgcGFpcnMgb25jZSBhZGRlZCwgcmVtb3ZlIGVtcHR5IHdyYXBwZXJzIG9uY2UgcmVtb3ZlZFxuICogMy4gRmFybWVyIHNwZWNpYWwgY2FzZTogZ2l2ZSB0aGUgZmFybWVyJ3Mgd3JhcHBlciBzdmcgdGhlIFwicGVnbWFuLWxvY2F0aW9uXCIgYXR0cmlidXRlXG4gKi9cblxudmFyIFBFR01BTl9PUkRFUklOR19DTEFTUyA9ICdwZWdtYW4tbG9jYXRpb24nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZml4dXA6IGZ1bmN0aW9uICgpIHtcbiAgICB3cmFwRXhpc3RpbmdDbGlwUGF0aHMoKTtcbiAgICBoYW5kbGVDbGlwUGF0aENoYW5nZXMoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2xpcFBhdGhJREZvckltYWdlKGltYWdlKSB7XG4gIHZhciBjbGlwUGF0aCA9ICQoaW1hZ2UpLmF0dHIoJ2NsaXAtcGF0aCcpO1xuICByZXR1cm4gY2xpcFBhdGggPyBjbGlwUGF0aC5tYXRjaCgvXFwoXFwjKC4qKVxcKS8pWzFdIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiB3cmFwSW1hZ2VBbmRDbGlwUGF0aFdpdGhTVkcoaW1hZ2UsIHdyYXBwZXJDbGFzcykge1xuICB2YXIgc3ZnV3JhcHBlciA9ICQoJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiAvPicpO1xuICBpZiAod3JhcHBlckNsYXNzKSB7XG4gICAgc3ZnV3JhcHBlci5hdHRyKCdjbGFzcycsIHdyYXBwZXJDbGFzcyk7XG4gIH1cblxuICB2YXIgY2xpcFBhdGhJRCA9IGNsaXBQYXRoSURGb3JJbWFnZShpbWFnZSk7XG4gIHZhciBjbGlwUGF0aCA9ICQoJyMnICsgY2xpcFBhdGhJRCk7XG4gIGNsaXBQYXRoLmluc2VydEFmdGVyKGltYWdlKS5hZGQoaW1hZ2UpLndyYXBBbGwoc3ZnV3JhcHBlcik7XG59XG5cbi8vIEZpbmQgcGFpcnMgb2YgbmV3IGltYWdlcyBhbmQgY2xpcCBwYXRocywgd3JhcHBpbmcgdGhlbSBpbiBTVkcgdGFncyB3aGVuIGEgcGFpciBpcyBmb3VuZFxuZnVuY3Rpb24gaGFuZGxlQ2xpcFBhdGhDaGFuZ2VzKCkge1xuICB2YXIgaTtcbiAgdmFyIGNhbnZhcyA9ICQoJyN2aXN1YWxpemF0aW9uPnN2ZycpWzBdO1xuICBpZiAoIWNhbnZhcykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBuZXdJbWFnZXMgPSB7fTtcbiAgdmFyIG5ld0NsaXBQYXRocyA9IHt9O1xuXG4gIHZhciBvYnNlcnZlciA9IG5ldyBXZWJLaXRNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG11dGF0aW9uKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV3Tm9kZSA9IG11dGF0aW9uLmFkZGVkTm9kZXNbaV07XG4gICAgICAgIGlmIChuZXdOb2RlLm5vZGVOYW1lID09ICdpbWFnZScpIHsgbmV3SW1hZ2VzWyQobmV3Tm9kZSkuYXR0cignaWQnKV0gPSBuZXdOb2RlOyB9XG4gICAgICAgIGlmIChuZXdOb2RlLm5vZGVOYW1lID09ICdjbGlwUGF0aCcpIHsgbmV3Q2xpcFBhdGhzWyQobmV3Tm9kZSkuYXR0cignaWQnKV0gPSBuZXdOb2RlOyB9XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbXV0YXRpb24ucmVtb3ZlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZW1vdmVkTm9kZSA9IG11dGF0aW9uLnJlbW92ZWROb2Rlc1tpXTtcbiAgICAgICAgaWYgKHJlbW92ZWROb2RlLm5vZGVOYW1lID09ICdpbWFnZScgfHwgcmVtb3ZlZE5vZGUubm9kZU5hbWUgPT0gJ2NsaXBQYXRoJykge1xuICAgICAgICAgICQoJ3N2ZyA+IHN2ZzplbXB0eScpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkLmVhY2gobmV3SW1hZ2VzLCBmdW5jdGlvbihrZXksIGltYWdlKSB7XG4gICAgICB2YXIgY2xpcFBhdGhJRCA9IGNsaXBQYXRoSURGb3JJbWFnZShpbWFnZSk7XG4gICAgICBpZiAobmV3Q2xpcFBhdGhzLmhhc093blByb3BlcnR5KGNsaXBQYXRoSUQpKSB7XG4gICAgICAgIHdyYXBJbWFnZUFuZENsaXBQYXRoV2l0aFNWRyhpbWFnZSk7XG4gICAgICAgIGRlbGV0ZSBuZXdJbWFnZXNba2V5XTtcbiAgICAgICAgZGVsZXRlIG5ld0NsaXBQYXRoc1tjbGlwUGF0aElEXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgb2JzZXJ2ZXIub2JzZXJ2ZShjYW52YXMsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xufVxuXG5mdW5jdGlvbiB3cmFwRXhpc3RpbmdDbGlwUGF0aHMoKSB7XG4gICQoJ1tjbGlwLXBhdGhdJykuZWFjaChmdW5jdGlvbihpLCBpbWFnZSl7XG4gICAgaWYgKCQoaW1hZ2UpLmF0dHIoJ2NsYXNzJykgPT09IFBFR01BTl9PUkRFUklOR19DTEFTUykge1xuICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciBGYXJtZXIsIHdob3NlIGNsYXNzIGlzIHVzZWQgZm9yIGVsZW1lbnQgb3JkZXJpbmdcbiAgICAgICQoaW1hZ2UpLmF0dHIoJ2NsYXNzJywgJycpO1xuICAgICAgd3JhcEltYWdlQW5kQ2xpcFBhdGhXaXRoU1ZHKGltYWdlLCBQRUdNQU5fT1JERVJJTkdfQ0xBU1MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cmFwSW1hZ2VBbmRDbGlwUGF0aFdpdGhTVkcoaW1hZ2UpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=
