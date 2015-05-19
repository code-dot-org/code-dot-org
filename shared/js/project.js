/* global dashboard, appOptions, $, trackEvent, Applab */

// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;
var hasProjectChanged = false;

var channels = require('./client_api/channels');

module.exports = {
  init: function () {
    if (appOptions.level.isProjectLevel || this.current) {

      $(window).on('hashchange', (function () {
        var hashData = parseHash();
        if ((this.current &&
            hashData.channelId !== this.current.id) ||
            hashData.isEditingProject !== this.isEditing) {
          location.reload();
        }
      }).bind(this));

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

        $(window).on('run_button_pressed', (function(event, callback) {
          this.save(callback);
        }).bind(this));

        // Autosave every AUTOSAVE_INTERVAL milliseconds
        $(window).on('appInitialized', (function () {
          // Get the initial app code as a baseline
          this.current.levelSource = dashboard.getEditorSource();
        }).bind(this));
        $(window).on('workspaceChange', function () {
          hasProjectChanged = true;
        });
        window.setInterval((function () {
          // Bail if a baseline levelSource doesn't exist (app not yet initialized)
          if (this.current.levelSource === undefined) {
            return;
          }
          // `dashboard.getEditorSource()` is expensive for Blockly so only call if `workspaceChange` fires
          if (appOptions.droplet || hasProjectChanged) {
            var source = dashboard.getEditorSource();
            if (this.current.levelSource !== source) {
              this.save(function() {
                hasProjectChanged = false;
              }, source);
            } else {
              hasProjectChanged = false;
            }
          }
        }).bind(this), AUTOSAVE_INTERVAL);

        if (!this.current.hidden) {
          if (this.current.isOwner || location.hash === '') {
            dashboard.showProjectHeader();
          } else {
            dashboard.showMinimalProjectHeader();
            appOptions.readonlyWorkspace = true;
            appOptions.callouts = [];
          }
        }
      } else if (this.current && this.current.levelSource) {
        appOptions.level.lastAttempt = this.current.levelSource;
        appOptions.hideSource = true;
        appOptions.callouts = [];
        dashboard.showMinimalProjectHeader();
      }
    } else if (appOptions.isLegacyShare && this.appToProjectUrl()) {
      this.current = {
        name: 'Untitled Project'
      };
      dashboard.showMinimalProjectHeader();
    }
  },
  updateTimestamp: function() {
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
   * callback function was provided. If `overrideSource` is set it will save that
   * string instead of calling `dashboard.getEditorSource()`.
   */
  save: function(callback, overrideSource) {
    $('.project_updated_at').text('Saving...');  // TODO (Josh) i18n
    var channelId = this.current.id;
    this.current.levelSource = overrideSource || dashboard.getEditorSource();
    this.current.levelHtml = window.Applab && Applab.getHtml();
    this.current.level = this.appToProjectUrl();
    if (channelId && this.current.isOwner) {
      channels.update(channelId, this.current, function(callback, data) {
        if (data) {
          this.current = data;
          this.updateTimestamp();
          callbackSafe(callback, data);
        }  else {
          $('.project_updated_at').text('Error saving project');  // TODO i18n
        }
      }.bind(this, callback));
    } else {
      channels.create(this.current, function(callback, data) {
        if (data) {
          this.current = data;
          location.href = this.current.level + '#' + this.current.id + '/edit';
          this.updateTimestamp();
          callbackSafe(callback, data);
        } else {
          $('.project_updated_at').text('Error saving project');  // TODO i18n
        }
      }.bind(this, callback));
    }
  },
  /**
   * Renames and saves the project.
   */
  rename: function(newName, callback) {
    dashboard.project.current.name = newName;
    dashboard.project.save(callback);
  },
  /**
   * Creates a copy of the project, gives it the provided name, and sets the
   * copy to the current project.
   */
  copy: function(newName, callback) {
    delete dashboard.project.current.id;
    delete dashboard.project.current.hidden;
    dashboard.project.current.name = newName;
    dashboard.project.save(callback);
  },
  delete: function(callback) {
    var channelId = this.current.id;
    if (channelId) {
      channels.delete(channelId, function(data) {
        callbackSafe(callback, data);
      });
    } else {
      callbackSafe(callback, false);
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
        channels.fetch(hashData.channelId, function (data) {
          if (data) {
            module.exports.current = data;
            deferred.resolve();
          } else {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname;
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
      channels.fetch(appOptions.channel, function(data) {
        if (data) {
          module.exports.current = data;
          dashboard.showProjectLevelHeader();
          deferred.resolve();
        } else {
          deferred.reject();
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
function callbackSafe(callback, data) {
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
