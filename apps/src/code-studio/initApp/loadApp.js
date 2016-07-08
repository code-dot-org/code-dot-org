/* global dashboard, appOptions, addToHome */
import $ from 'jquery';
var renderAbusive = require('./renderAbusive');
var userAgentParser = require('./userAgentParser');
var progress = require('../progress');
var clientState = require('../clientState');
var color = require('../../color');

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
      appOptions.level.lastAttempt = clientState.sourceForLevel(
          appOptions.scriptName, appOptions.serverLevelId);

      callback();
    }
  };

  var isViewingSolution = (clientState.queryParams('solution') === 'true');
  var isViewingStudentAnswer = !!clientState.queryParams('user_id');

  if (appOptions.share && !window.navigator.standalone && userAgentParser.isSafari()) {
    window.addEventListener("load", function () {
      addToHome.show(true);
    }, false);
  }


  if (!appOptions.channel && !isViewingSolution && !isViewingStudentAnswer) {

    if (appOptions.publicCaching) {
      // Disable social share by default on publicly-cached pages, because we don't know
      // if the user is underage until we get data back from /api/user_progress/ and we
      // should err on the side of not showing social links
      appOptions.disableSocialShare = true;
    }

    $.ajax(
        `/api/user_progress` +
        `/${appOptions.scriptName}` +
        `/${appOptions.stagePosition}` +
        `/${appOptions.levelPosition}` +
        `/${appOptions.serverLevelId}`
    ).done(function (data) {
      appOptions.disableSocialShare = data.disableSocialShare;

      // Merge progress from server (loaded via AJAX)
      var serverProgress = data.progress || {};
      var clientProgress = clientState.allLevelsProgress()[appOptions.scriptName] || {};
      Object.keys(serverProgress).forEach(function (levelId) {
        if (serverProgress[levelId] !== clientProgress[levelId]) {
          var status = progress.mergedActivityCssClass(clientProgress[levelId], serverProgress[levelId]);

          // Set the progress color
          var css = {backgroundColor: color[`level_${status}`] || color.level_not_tried};
          if (status && status !== 'not_tried' && status !== 'attempted') {
            Object.assign(css, {color: color.white});
          }
          $('.level-' + levelId).css(css);

          // Write down new progress in sessionStorage
          clientState.trackProgress(null, null, serverProgress[levelId], appOptions.scriptName, levelId);
        }
      });

      if (!lastAttemptLoaded) {
        if (data.lastAttempt) {
          lastAttemptLoaded = true;

          var timestamp = data.lastAttempt.timestamp;
          var source = data.lastAttempt.source;

          var cachedProgram = clientState.sourceForLevel(
              appOptions.scriptName, appOptions.serverLevelId, timestamp);
          if (cachedProgram !== undefined) {
            // Client version is newer
            appOptions.level.lastAttempt = cachedProgram;
          } else if (source && source.length) {
            // Sever version is newer
            appOptions.level.lastAttempt = source;

            // Write down the lastAttempt from server in sessionStorage
            clientState.writeSourceForLevel(appOptions.scriptName,
                appOptions.serverLevelId, timestamp, source);
          }
          callback();
        } else {
          loadLastAttemptFromSessionStorage();
        }
      }

      if (progress.refreshStageProgress) {
        progress.refreshStageProgress();
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
