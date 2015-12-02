/* global dashboard, appOptions, mergedActivityCssClass */

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
  if (!appOptions.channel && appOptions.publicCaching) {
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

    $.ajax('/api/user_progress/' + appOptions.scriptName + '/' + appOptions.stagePosition + '/' + appOptions.levelPosition).done(function (data) {
      // Merge progress from server (loaded via AJAX)
      var serverProgress = data.progress;
      var clientProgress = dashboard.clientState.allLevelsProgress()[appOptions.scriptName] || {};
      Object.keys(serverProgress).forEach(function (levelId) {
        if (serverProgress[levelId] !== clientProgress[levelId]) {
          var status = mergedActivityCssClass(clientProgress[levelId], serverProgress[levelId]);

          // Clear the existing class and replace
          $('#header-level-' + levelId).attr('class', 'level_link ' + status);

          // Write down new progress in sessionStorage
          dashboard.clientState.trackProgress(null, null, serverProgress[levelId], appOptions.scriptName, levelId);
        }
      });

      if (data.lastAttempt && !lastAttemptLoaded) {
        lastAttemptLoaded = true;
        var timestamp = data.lastAttempt.timestamp;
        var source = data.lastAttempt.source;

        var cachedProgram = dashboard.clientState.sourceForLevel(
            appOptions.scriptName, appOptions.serverLevelId, timestamp);
        if (cachedProgram !== undefined) {
          setLastAttemptUnlessJigsaw(cachedProgram);
        } else if (source && source.length) {
          setLastAttemptUnlessJigsaw(source);
        }

        callback();
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
    callback();
  }
};

function setLastAttemptUnlessJigsaw(source) {
  if (appOptions.levelGameName !== 'Jigsaw') {
    appOptions.level.lastAttempt = source;
  }
}
