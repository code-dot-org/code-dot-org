// Attempt to save projects every 30 seconds
var AUTOSAVE_INTERVAL = 30 * 1000;
var hasProjectChanged = false;

// Sets up default options and initializes blockly
startTiming('Puzzle', script_path, '');
var baseOptions = {
  containerId: 'codeApp',
  Dialog: Dialog,
  cdoSounds: CDOSounds,
  position: { blockYCoordinateInterval: 25 },
  onInitialize: function() {
    dashboard.createCallouts(this.callouts);
    if (window.wrapExistingClipPaths && window.handleClipPathChanges) {
      wrapExistingClipPaths();
      handleClipPathChanges();
    }
    $(document).trigger('appInitialized');
  },
  onAttempt: function(report) {
    if (appOptions.level.isProjectLevel) {
      return;
    }
    report.fallbackResponse = appOptions.report.fallback_response;
    report.callback = appOptions.report.callback;
    // Track puzzle attempt event
    trackEvent('Puzzle', 'Attempt', script_path, report.pass ? 1 : 0);
    if (report.pass) {
      trackEvent('Puzzle', 'Success', script_path, report.attempt);
      stopTiming('Puzzle', script_path, '');
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
  if (typeof node !== 'object') return;
  for (var i in node) {
    if (/^fn_/.test(i)) {
      try {
        node[i.replace(/^fn_/, '')] = eval('(' + node[i] + ')');
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

dashboard.updateTimestamp = function() {
  if (dashboard.currentApp.updatedAt) {
    // TODO i18n
    $('.project_updated_at').empty().append("Saved ")  // TODO i18n
        .append($('<span class="timestamp">').attr('title', dashboard.currentApp.updatedAt)).show();
    $('.project_updated_at span.timestamp').timeago();
  } else {
    $('.project_updated_at').text("Not saved"); // TODO i18n
  }
};

function appToProjectUrl() {
  switch (appOptions.app) {
    case 'applab':
      return '/p/applab';
    case 'turtle':
      return '/p/artist';
    case 'studio':
      if (appOptions.level.useContractEditor) {
        return '/p/algebra';
      }
      return '/p/playlab';
  }
}

/**
 * @returns {string} The serialized level source from the editor.
 */
dashboard.getEditorSource = function() {
  return window.Blockly
      ? Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace))
      : window.Applab && Applab.getCode();
};

/**
 * Saves the project to the Channels API. Calls `callback` on success if a
 * callback function was provided. If `overrideSource` is set it will save that
 * string instead of calling `dashboard.getEditorSource()`.
 */
dashboard.saveProject = function(callback, overrideSource) {
  $('.project_updated_at').text('Saving...');  // TODO (Josh) i18n
  var channelId = dashboard.currentApp.id;
  dashboard.currentApp.levelSource = overrideSource || dashboard.getEditorSource();
  dashboard.currentApp.levelHtml = window.Applab && Applab.getHtml();
  dashboard.currentApp.level = appToProjectUrl();
  if (channelId && dashboard.currentApp.isOwner) {
    channels().update(channelId, dashboard.currentApp, function(data) {
      if (data) {
        dashboard.currentApp = data;
        dashboard.updateTimestamp();
        callbackSafe(callback, data);
      }  else {
        $('.project_updated_at').text('Error saving project');  // TODO i18n
      }
    });
  } else {
    channels().create(dashboard.currentApp, function(data) {
      if (data) {
        dashboard.currentApp = data;
        location.href = dashboard.currentApp.level + '#' + dashboard.currentApp.id + '/edit';
        dashboard.updateTimestamp();
        callbackSafe(callback, data);
      } else {
        $('.project_updated_at').text('Error saving project');  // TODO i18n
      }
    });
  }
};

dashboard.deleteProject = function(callback) {
  var channelId = dashboard.currentApp.id;
  if (channelId) {
    channels().delete(channelId, function(data) {
      callbackSafe(callback, data);
    });
  } else {
    callbackSafe(callback, false);
  }
};

function initApp() {
  if (appOptions.level.isProjectLevel || dashboard.currentApp) {

    $(window).on('hashchange', function () {
      var hashData = parseHash();
      if ((dashboard.currentApp && hashData.channelId !== dashboard.currentApp.id)
          || hashData.isEditingProject !== dashboard.isEditingProject) {
        location.reload();
      }
    });

    if (dashboard.currentApp && dashboard.currentApp.levelHtml) {
      appOptions.level.levelHtml = dashboard.currentApp.levelHtml;
    }

    if (dashboard.isEditingProject) {
      if (dashboard.currentApp) {
        if (dashboard.currentApp.levelSource) {
          appOptions.level.lastAttempt = dashboard.currentApp.levelSource;
        }
      } else {
        dashboard.currentApp = {
          name: 'My Project'
        };
      }

      $(window).on('run_button_pressed', dashboard.saveProject);

      // Autosave every AUTOSAVE_INTERVAL milliseconds
      $(window).on('appInitialized', function () {
        // Get the initial app code as a baseline
        dashboard.currentApp.levelSource = dashboard.getEditorSource();
      });
      $(window).on('workspaceChange', function () {
        hasProjectChanged = true;
      });
      window.setInterval(function () {
        // Bail if a baseline levelSource doesn't exist (app not yet initialized)
        if (dashboard.currentApp.levelSource == undefined) {
          return;
        }
        // `dashboard.getEditorSource()` is expensive for Blockly so only call if `workspaceChange` fires
        if (appOptions.droplet || hasProjectChanged) {
          var source = dashboard.getEditorSource();
          if (dashboard.currentApp.levelSource !== source) {
            dashboard.saveProject(function() {
              hasProjectChanged = false;
            }, source);
          } else {
            hasProjectChanged = false;
          }
        }
      }, AUTOSAVE_INTERVAL);

      if (!dashboard.currentApp.hidden && (dashboard.currentApp.isOwner || location.hash === '')) {
        dashboard.showProjectHeader();
      }
    } else if (dashboard.currentApp && dashboard.currentApp.levelSource) {
      appOptions.level.lastAttempt = dashboard.currentApp.levelSource;
      appOptions.hideSource = true;
      appOptions.callouts = [];
      dashboard.showMinimalProjectHeader();
    }
  } else if (appOptions.isLegacyShare && appToProjectUrl()) {
    dashboard.currentApp = {
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
  }
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
  }
}

function loadProject(promise) {
  if (appOptions.level.isProjectLevel) {
    var hashData = parseHash();
    if (hashData.channelId) {
      if (hashData.isEditingProject) {
        dashboard.isEditingProject = true;
      } else {
        $('#betainfo').hide();
      }

      // Load the project ID, if one exists
      promise = promise.then(function () {
        var deferred = new $.Deferred();
        channels().fetch(hashData.channelId, function (data) {
          if (data) {
            dashboard.currentApp = data;
            deferred.resolve();
          } else {
            // Project not found, redirect to the new project experience.
            location.href = location.pathname;
          }
        });
        return deferred;
      });
    } else {
      dashboard.isEditingProject = true;
    }
  } else if (appOptions.level.projectTemplateLevelName) {
    // this is an embedded project
    dashboard.isEditingProject = true;
    promise = promise.then(function () {
      var deferred = new $.Deferred();
      channels().fetch(appOptions.channel, function(data) {
        if (data) {
          dashboard.currentApp = data;
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
