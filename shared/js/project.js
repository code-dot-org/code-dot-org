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
