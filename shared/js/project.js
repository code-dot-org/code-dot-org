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
  workspaceChange: 'workspaceChange',
    hashchange: 'hashchange'
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

  /**
   * @returns {boolean} true if we're editing
   */
  isEditing: function () {
    return isEditing;
  },

  init: function () {
    // TODO - can we do this reload sooner?
    if (location.href.indexOf('#') !== -1) {
      location.href = location.href.replace('#', '/');
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
          if (current.isOwner || location.hash === '') {
            dashboard.header.showProjectHeader();
          } else {
            // Viewing someone else's project - set share mode
            dashboard.header.showMinimalProjectHeader();
            // URL with /edit - set hideSource to false
            setAppOptionsForShareMode(false);
          }
        }
      } else if (current) {
        appOptions.level.lastAttempt = current.levelSource;
        dashboard.header.showMinimalProjectHeader();
        // URL without /edit - set hideSource to true
        setAppOptionsForShareMode(true);
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
  updateTimestamp: function () {
    if (current.updatedAt) {
      // TODO i18n
      $('.project_updated_at').empty().append("Saved ")  // TODO i18n
          .append($('<span class="timestamp">').attr('title', current.updatedAt)).show();
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
      location.href = current.level + '#' + current.id + '/edit';
    }
    this.updateTimestamp();
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
    var PathPart = {
      START: 0,
      P: 1,
      APP: 2,
      CHANNEL_ID: 3,
      ACTION: 4
    };

    var deferred;
    if (appOptions.level.isProjectLevel) {
      var channelId = location.pathname.split('/')[PathPart.CHANNEL_ID];
      var action = location.pathname.split('/')[PathPart.ACTION];

      if (channelId) {
        if (action === 'edit') {
          isEditing = true;
        } else {
          $('#betainfo').hide();
        }

        // Load the project ID, if one exists
        deferred = new $.Deferred();
        channels.fetch(channelId, function (err, data) {
          if (err) {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname.split('/')
              .slice(PathPart.START, PathPart.APP + 1).join('/')
          } else {
            current = data;
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
