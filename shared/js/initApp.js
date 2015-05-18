// TODO (brent) - way too many globals
// TODO (brent) - I wonder if we should sub-namespace dashboard
/* global script_path, Dialog, CDOSounds, dashboard, appOptions, $, trackEvent, Blockly, Applab, sendReport, cancelReport, lastServerResponse, showVideoDialog, ga*/

// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;
var hasProjectChanged = false;

var channels = require('./client_api/channels');
var timing = require('./timing');
var chrome34Fix = require('./chrome34Fix');

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
    var hasInstructions = appOptions.level.instructions || appOptions.level.aniGifURL;
    if (!hasInstructions || this.share || appOptions.level.skipInstructionsPopup) {
      return;
    }

    if (appOptions.autoplayVideo) {
      showVideoDialog(appOptions.autoplayVideo);
      $('.video-modal').on('hidden.bs.modal', function () {
        showInstructions();
      });
    } else {
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
 * Only execute the given argument if it is a function.
 * @param callback
 */
function callbackSafe(callback, data) {
  if (typeof callback === 'function') {
    callback(data);
  }
}

dashboard.project.updateTimestamp = function() {
  if (dashboard.project.current.updatedAt) {
    // TODO i18n
    $('.project_updated_at').empty().append("Saved ")  // TODO i18n
        .append($('<span class="timestamp">').attr('title', dashboard.project.current.updatedAt)).show();
    $('.project_updated_at span.timestamp').timeago();
  } else {
    $('.project_updated_at').text("Not saved"); // TODO i18n
  }
};

dashboard.project.appToProjectUrl = function () {
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
};

/**
 * @returns {string} The serialized level source from the editor.
 */
dashboard.getEditorSource = function() {
  return window.Blockly ?
    Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)) :
    window.Applab && Applab.getCode();
};

/**
 * Saves the project to the Channels API. Calls `callback` on success if a
 * callback function was provided. If `overrideSource` is set it will save that
 * string instead of calling `dashboard.getEditorSource()`.
 */
dashboard.project.save = function(callback, overrideSource) {
  $('.project_updated_at').text('Saving...');  // TODO (Josh) i18n
  var channelId = dashboard.project.current.id;
  dashboard.project.current.levelSource = overrideSource || dashboard.getEditorSource();
  dashboard.project.current.levelHtml = window.Applab && Applab.getHtml();
  dashboard.project.current.level = dashboard.project.appToProjectUrl();
  if (channelId && dashboard.project.current.isOwner) {
    channels.update(channelId, dashboard.project.current, function(callback, data) {
      if (data) {
        dashboard.project.current = data;
        dashboard.project.updateTimestamp();
        callbackSafe(callback, data);
      }  else {
        $('.project_updated_at').text('Error saving project');  // TODO i18n
      }
    }.bind(this, callback));
  } else {
    channels.create(dashboard.project.current, function(callback, data) {
      if (data) {
        dashboard.project.current = data;
        location.href = dashboard.project.current.level + '#' + dashboard.project.current.id + '/edit';
        dashboard.project.updateTimestamp();
        callbackSafe(callback, data);
      } else {
        $('.project_updated_at').text('Error saving project');  // TODO i18n
      }
    }.bind(this, callback));
  }
};

dashboard.project.delete = function(callback) {
  var channelId = dashboard.project.current.id;
  if (channelId) {
    channels.delete(channelId, function(data) {
      callbackSafe(callback, data);
    });
  } else {
    callbackSafe(callback, false);
  }
};

function initApp() {
  if (appOptions.level.isProjectLevel || dashboard.project.current) {

    $(window).on('hashchange', function () {
      var hashData = parseHash();
      if ((dashboard.project.current &&
          hashData.channelId !== dashboard.project.current.id) ||
          hashData.isEditingProject !== dashboard.project.isEditing) {
        location.reload();
      }
    });

    if (dashboard.project.current && dashboard.project.current.levelHtml) {
      appOptions.level.levelHtml = dashboard.project.current.levelHtml;
    }

    if (dashboard.project.isEditing) {
      if (dashboard.project.current) {
        if (dashboard.project.current.levelSource) {
          appOptions.level.lastAttempt = dashboard.project.current.levelSource;
        }
      } else {
        dashboard.project.current = {
          name: 'My Project'
        };
      }

      $(window).on('run_button_pressed', function(event, callback) {
        dashboard.project.save(callback);
      });

      // Autosave every AUTOSAVE_INTERVAL milliseconds
      $(window).on('appInitialized', function () {
        // Get the initial app code as a baseline
        dashboard.project.current.levelSource = dashboard.getEditorSource();
      });
      $(window).on('workspaceChange', function () {
        hasProjectChanged = true;
      });
      window.setInterval(function () {
        // Bail if a baseline levelSource doesn't exist (app not yet initialized)
        if (dashboard.project.current.levelSource === undefined) {
          return;
        }
        // `dashboard.getEditorSource()` is expensive for Blockly so only call if `workspaceChange` fires
        if (appOptions.droplet || hasProjectChanged) {
          var source = dashboard.getEditorSource();
          if (dashboard.project.current.levelSource !== source) {
            dashboard.project.save(function() {
              hasProjectChanged = false;
            }, source);
          } else {
            hasProjectChanged = false;
          }
        }
      }, AUTOSAVE_INTERVAL);

      if (!dashboard.project.current.hidden) {
        if (dashboard.project.current.isOwner || location.hash === '') {
          dashboard.showProjectHeader();
        } else {
          dashboard.showMinimalProjectHeader();
          appOptions.readonlyWorkspace = true;
          appOptions.callouts = [];
        }
      }
    } else if (dashboard.project.current && dashboard.project.current.levelSource) {
      appOptions.level.lastAttempt = dashboard.project.current.levelSource;
      appOptions.hideSource = true;
      appOptions.callouts = [];
      dashboard.showMinimalProjectHeader();
    }
  } else if (appOptions.isLegacyShare && dashboard.project.appToProjectUrl()) {
    dashboard.project.current = {
      name: 'Untitled Project'
    };
    dashboard.showMinimalProjectHeader();
  }
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

function loadProject(promise) {
  if (appOptions.level.isProjectLevel) {
    var hashData = parseHash();
    if (hashData.channelId) {
      if (hashData.isEditingProject) {
        dashboard.project.isEditing = true;
      } else {
        $('#betainfo').hide();
      }

      // Load the project ID, if one exists
      promise = promise.then(function () {
        var deferred = new $.Deferred();
        channels.fetch(hashData.channelId, function (data) {
          if (data) {
            dashboard.project.current = data;
            deferred.resolve();
          } else {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname;
          }
        });
        return deferred;
      });
    } else {
      dashboard.project.isEditing = true;
    }
  } else if (appOptions.level.projectTemplateLevelName || appOptions.app === 'applab') {
    // this is an embedded project
    dashboard.project.isEditing = true;
    promise = promise.then(function () {
      var deferred = new $.Deferred();
      channels.fetch(appOptions.channel, function(data) {
        if (data) {
          dashboard.project.current = data;
          deferred.resolve();
        } else {
          deferred.reject();
        }
      });
      return deferred;
    });
    dashboard.showProjectLevelHeader();
  }
  return promise;
}

loadStyle('common');
loadStyle(appOptions.app);
var promise;
if (appOptions.droplet) {
  loadStyle('droplet/droplet.min');
  loadStyle('tooltipster/tooltipster.min');
  promise = loadSource('jsinterpreter/acorn_interpreter')()
      .then(loadSource('requirejs/require'))
      .then(loadSource('ace/ace'))
      .then(loadSource('ace/mode-javascript'))
      .then(loadSource('ace/ext-language_tools'))
      .then(loadSource('droplet/droplet-full'))
      .then(loadSource('tooltipster/jquery.tooltipster'));
  promise = loadProject(promise);
} else {
  promise = loadSource('blockly')()
    .then(loadSource(appOptions.locale + '/blockly_locale'));
  promise = loadProject(promise);
}
promise = promise.then(loadSource('common' + appOptions.pretty))
  .then(loadSource(appOptions.locale + '/common_locale'))
  .then(loadSource(appOptions.locale + '/' + appOptions.app + '_locale'))
  .then(loadSource(appOptions.app + appOptions.pretty))
  .then(initApp);
