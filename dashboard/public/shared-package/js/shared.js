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
  },

  // Copy to the destination collection, since we expect the destination
  // to be empty. A true rest API would replace the destination collection:
  // https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services
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
/* global dashboard, appOptions, $ */

// Attempts to lookup the name in the digest hash, or returns the name if not found.
function tryDigest(name) {
  return (window.digestManifest || {})[name] || name;
}

/**
 * Returns a function which returns a $.Deferred instance. When executed, the
 * function loads the given app script.
 * @param name The name of the module to load.
 * @param cacheBust{Boolean?} If true, append a random query string to bypass the
 *   cache.
 * @returns {Function}
 */
function loadSource(name, cacheBust) {
  return function () {
    var deferred = new $.Deferred();
    var param = cacheBust ? '?' + Math.random() : '';
    document.body.appendChild($('<script>', {
      src: appOptions.baseUrl + tryDigest('js/' + name + '.js') + param
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

module.exports = function (callback) {
  loadStyle('common');
  loadStyle(appOptions.app);
  var promise = loadSource('manifest', true)();
  if (appOptions.droplet) {
    loadStyle('droplet/droplet.min');
    loadStyle('tooltipster/tooltipster.min');
    promise = promise.then(loadSource('jsinterpreter/acorn_interpreter'))
        .then(loadSource('marked/marked'))
        .then(loadSource('ace/ace'))
        .then(loadSource('ace/mode-javascript'))
        .then(loadSource('ace/ext-language_tools'))
        .then(loadSource('droplet/droplet-full'))
        .then(loadSource('tooltipster/jquery.tooltipster'));
  } else {
    promise = promise.then(loadSource('blockly'))
        .then(loadSource('marked/marked'))
        .then(loadSource(appOptions.locale + '/blockly_locale'));
  }

  if (window.dashboard && dashboard.project) {
    promise = promise.then(dashboard.project.load);
  }

  promise.then(loadSource('common' + appOptions.pretty))
      .then(loadSource(appOptions.locale + '/common_locale'))
      .then(loadSource(appOptions.locale + '/' + appOptions.app + '_locale'))
      .then(loadSource(appOptions.app + appOptions.pretty))
      .then(callback);
};

},{}],4:[function(require,module,exports){
/* global dashboard, appOptions, $, trackEvent, Applab, Blockly */

// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;
var hasProjectChanged = false;

var assets = require('./clientApi').create('/v3/assets');
var channels = require('./clientApi').create('/v3/channels');

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
 * @typedef {Object} ProjectInstance
 * @property {string} id
 * @property {string} name
 * @property {string} levelHtml
 * @property {string} levelSource
 * hidden // unclear when this ever gets set
 * @property {boolean} isOwner Populated by our update/create callback.
 * @property {string} updatedAt String representation of a Date. Populated by
 *   out update/create callback
 * @property {string} level Path where this particular app type is hosted
 */
var current;
var isEditing = false;

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
   * @returns {boolean} true if we're editing
   */
  isEditing: function () {
    return isEditing;
  },

  init: function () {
    if (redirectFromHashUrl || redirectEditView()) {
      return;
    }

    if (appOptions.level.isProjectLevel || current) {
      if (current && current.levelHtml) {
        appOptions.level.levelHtml = current.levelHtml;
      }

      if (isEditing) {
        if (current) {
          if (current.levelSource) {
            appOptions.level.lastAttempt = current.levelSource;
          }
        } else {
          current = {
            name: 'My Project'
          };
        }

        $(window).on(events.appModeChanged, function(event, callback) {
          this.save(callback);
        }.bind(this));

        // Autosave every AUTOSAVE_INTERVAL milliseconds
        $(window).on(events.appInitialized, function () {
          // Get the initial app code as a baseline
          current.levelSource = getEditorSource();
        }.bind(this));
        $(window).on(events.workspaceChange, function () {
          hasProjectChanged = true;
        });
        window.setInterval(this.autosave_.bind(this), AUTOSAVE_INTERVAL);

        if (!current.hidden) {
          if (current.isOwner || !parsePath().channelId) {
            dashboard.header.showProjectHeader();
          } else {
            // Viewing someone else's project - set share mode
            dashboard.header.showMinimalProjectHeader();
          }
        }
      } else if (current) {
        appOptions.level.lastAttempt = current.levelSource;
        dashboard.header.showMinimalProjectHeader();
      }
    } else if (appOptions.isLegacyShare && this.appToProjectUrl()) {
      current = {
        name: 'Untitled Project'
      };
      dashboard.header.showMinimalProjectHeader();
    }
    if (appOptions.noPadding) {
      $(".full_container").css({"padding":"0px"});
    }
  },
  appToProjectUrl: function () {
    switch (appOptions.app) {
      case 'applab':
        return '/projects/applab';
      case 'turtle':
        return '/projects/artist';
      case 'calc':
        return '/projects/calc';
      case 'eval':
        return '/projects/eval';
      case 'studio':
        if (appOptions.level.useContractEditor) {
          return '/projects/algebra_game';
        }
        return '/projects/playlab';
    }
  },
  /**
   * Saves the project to the Channels API. Calls `callback` on success if a
   * callback function was provided.
   * @param {string?} source Optional source to be provided, saving us another
   *   call to getEditorSource
   * @param {function} callback Fucntion to be called after saving
   */
  save: function(source, callback) {
    if (arguments.length === 1) {
      // If no source is provided, the only argument is our callback and we
      // ask for the source ourselves
      callback = arguments[0];
      source = getEditorSource();
    }
    $('.project_updated_at').text('Saving...');  // TODO (Josh) i18n
    var channelId = current.id;
    current.levelSource = source;
    current.levelHtml = getLevelHtml();
    current.level = this.appToProjectUrl();

    if (channelId && current.isOwner) {
      channels.update(channelId, current, function (err, data) {
        this.updateCurrentData_(err, data, false);
        executeCallback(callback, data);
      }.bind(this));
    } else {
      channels.create(current, function (err, data) {
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

    current = data;
    if (isNewChannel) {
      // We have a new channel, meaning either we had no channel before, or
      // we've changed channels. If we aren't at a /projects/<appname> link,
      // always do a redirect (i.e. we're remix from inside a script)
      if (isEditing && parsePath().appName) {
        if (location.hash || !window.history.pushState) {
          // We're using a hash route or don't support replace state. Use our hash
          // based route to ensure we don't have a page load.
          location.href = current.level + '#' + current.id + '/edit';
        } else {
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
    // Bail if a baseline levelSource doesn't exist (app not yet initialized)
    if (current.levelSource === undefined) {
      return;
    }
    // `getEditorSource()` is expensive for Blockly so only call
    // after `workspaceChange` has fired
    if (!appOptions.droplet && !hasProjectChanged) {
      return;
    }

    var source = getEditorSource();
    var html = getLevelHtml();

    if (current.levelSource === source && current.levelHtml === html) {
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
    current.name = newName;
    this.save(callback);
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
    current.name = newName;
    this.save(wrappedCallback);
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
    location.href = projects.getPathName('remix');
  },
  delete: function(callback) {
    var channelId = current.id;
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
      if (redirectFromHashUrl() || redirectEditView()) {
        return;
      }
      var pathInfo = parsePath();

      if (pathInfo.channelId) {
        if (pathInfo.action === 'edit') {
          isEditing = true;
        } else {
          $('#betainfo').hide();
        }

        // Load the project ID, if one exists
        deferred = new $.Deferred();
        channels.fetch(pathInfo.channelId, function (err, data) {
          if (err) {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname.split('/')
              .slice(PathPart.START, PathPart.APP + 1).join('/');
          } else {
            current = data;
            if (current.isOwner && pathInfo.action === 'view') {
              isEditing = true;
            }
            deferred.resolve();
          }
        });
        return deferred;
      } else {
        isEditing = true;
      }
    } else if (appOptions.level.projectTemplateLevelName || appOptions.app === 'applab') {
      // this is an embedded project
      isEditing = true;
      deferred = new $.Deferred();
      channels.fetch(appOptions.channel, function(err, data) {
        if (err) {
          deferred.reject();
        } else {
          current = data;
          if (!current.name && appOptions.level.projectTemplateLevelName) {
            current.name = appOptions.level.projectTemplateLevelName;
          }
          dashboard.header.showProjectLevelHeader();
          deferred.resolve();
        }
      });
      return deferred;
    }
  },

  getPathName: function (action) {
    var pathName = this.appToProjectUrl() + '/' + this.getCurrentId();
    if (action) {
      pathName += '/' + action;
    }
    return pathName;
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

/**
 * @returns {string} The serialized level source from the editor.
 */
function getEditorSource() {
  var source;
  if (window.Blockly) {
    // If we're readOnly, source hasn't changed at all
    source = Blockly.readOnly ? current.levelSource :
      Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
  } else {
    source = window.Applab && Applab.getCode();
  }
  return source;
}

function getLevelHtml() {
  return window.Applab && Applab.getHtml();
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
  var newUrl;
  if (parseInfo.action === 'view' && current && current.isOwner) {
    // Redirect to /edit without a readonly workspace
    newUrl = location.href.replace(/\/view$/, '/edit');
    appOptions.readonlyWorkspace = false;
  } else if (parseInfo.action === 'edit' && (!current || !current.isOwner)) {
    // Redirect to /view with a readonly workspace
    newUrl = location.href.replace(/\/edit$/, '/view');
    appOptions.readonlyWorkspace = true;
  }
  if (newUrl && newUrl !== location.href) {
    return redirectToPath(newUrl, true);
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
  return redirectToPath(newUrl, false);
}

/**
 * Does a redirect to the given path. If attemptPushState is true, it will
 * use pushState to just change the browser URL in browsers that support this.
 * @returns {boolean} True if we did a redirect (vs. pushState)
 */
function redirectToPath(path, attemptPushState) {
  if (attemptPushState && window.history.pushState) {
    // Right now I set modified just so that our UI tests can detect a dashboard
    // vs. JS redirect. Not sure whether there is a better way
    window.history.pushState({modified: true}, document.title, path);
    return false;
  } else {
    location.href = path;
    return true;
  }
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

},{"./clientApi":2}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
// TODO (brent) - way too many globals
// TODO (brent) - I wonder if we should sub-namespace dashboard
/* global script_path, Dialog, CDOSounds, dashboard, appOptions, $, trackEvent, Applab, sendReport, cancelReport, lastServerResponse, showVideoDialog, ga, digestManifest*/

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
  setup: function () {

    if (!window.dashboard) {
      throw new Error('Assume existence of window.dashboard');
    }
    dashboard.project = project;

    timing.startTiming('Puzzle', script_path, '');

    // Sets up default options and initializes blockly
    var baseOptions = {
      containerId: 'codeApp',
      Dialog: Dialog,
      cdoSounds: CDOSounds,
      position: {blockYCoordinateInterval: 25},
      onInitialize: function() {
        dashboard.createCallouts(this.callouts);
        if (window.dashboard.isChrome34) {
          chrome34Fix.fixup();
        }
        if (appOptions.level.projectTemplateLevelName) {
          $('#clear-puzzle-header').hide();
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
        var hasInstructions = !!(appOptions.level.instructions ||
        appOptions.level.aniGifURL);

        if (hasVideo) {
          showVideoDialog(appOptions.autoplayVideo);
          if (hasInstructions) {
            $('.video-modal').on('hidden.bs.modal', function() {
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
          } catch (e) {
          }
        } else {
          fixUpFunctions(node[i]);
        }
      }
    })(appOptions.level);
  },
  // Initialize the Blockly or Droplet app.
  init: function () {
    dashboard.project.init();
    window[appOptions.app + 'Main'](appOptions);
  }
};

},{"./chrome34Fix":1,"./loadApp":3,"./project":4,"./timing":5}]},{},[6]);
