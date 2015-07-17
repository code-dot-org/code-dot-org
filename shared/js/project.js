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

module.exports = {
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
    if (redirectFromLegacyUrl() || redirectEditView()) {
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
    location.href = module.exports.getPathName('remix');
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
      if (redirectFromLegacyUrl() || redirectEditView()) {
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
 * Does a redirect to a non-hash based version of the URL. Does a hard redirect
 * if on legacy browsers (IE 9), or if we're going to an applab route that may
 * require login
 * @returns {boolean} True if we did an actual redirect
 */
function redirectFromLegacyUrl() {
  var newUrl = location.href.replace('#', '/').replace(/\/p\//, '/projects/');
  if (newUrl === location.href) {
    // Nothing changed
    return false;
  }

  var pathInfo = parsePath();
  var attemptPushState = true;
  // We require sign in for /p/applab and /p/applab#channel_id/edit, so we'll
  // want to actually do the redirect
  if (pathInfo.appName === 'applab') {
    attemptPushState = pathInfo.channelId && pathInfo.action !== 'edit';
  }

  return redirectToPath(newUrl, attemptPushState);
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
