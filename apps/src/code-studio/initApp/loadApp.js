/* global dashboard, appOptions, addToHome */
import $ from 'jquery';
import { getStore } from '../redux';
import { disableBubbleColors } from '../progressRedux';
import experiments from '@cdo/apps/experiments';
import DisabledBubblesAlert from '../DisabledBubblesAlert';
import React from 'react';
import ReactDOM from 'react-dom';
var renderAbusive = require('./renderAbusive');
var userAgentParser = require('./userAgentParser');
var progress = require('../progress');
var clientState = require('../clientState');
var color = require('../../color');

import { activityCssClass, mergeActivityResult, LevelStatus } from '../activityUtils';

// Max milliseconds to wait for last attempt data from the server
var LAST_ATTEMPT_TIMEOUT = 5000;

function showDisabledButtonsAlert(isHocScript) {
  const div = $('<div>').css({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 45,
    zIndex: 1000
  });
  $(document.body).append(div);

  ReactDOM.render(<DisabledBubblesAlert isHocScript={isHocScript}/>, div[0]);
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
          var mergedResult = mergeActivityResult(clientProgress[levelId], serverProgress[levelId]);
          var status = activityCssClass(mergedResult);

          // Set the progress color
          var css = {backgroundColor: color[`level_${status}`] || color.level_not_tried};
          if (status && status !== LevelStatus.not_tried && status !== LevelStatus.attempted) {
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

        if (data.pairingDriver) {
          appOptions.level.pairingDriver = data.pairingDriver;
        }
      }

      if (progress.refreshStageProgress) {
        progress.refreshStageProgress();
      }

      const signedOutUser = Object.keys(data).length === 0;
      if (!signedOutUser && (data.disablePostMilestone ||
          experiments.isEnabled('postMilestoneDisabledUI'))) {
        getStore().dispatch(disableBubbleColors());
        showDisabledButtonsAlert(!!data.isHoc);
      }
    }).fail(loadLastAttemptFromSessionStorage);

    // Use this instead of a timeout on the AJAX request because we still want
    // the header progress data even if the last attempt data takes too long.
    // The progress dots can fade in at any time without impacting the user.
    setTimeout(loadLastAttemptFromSessionStorage, LAST_ATTEMPT_TIMEOUT);
  } else if (window.dashboard && dashboard.project) {
    dashboard.project.load().then(function () {
      if (dashboard.project.hideBecauseAbusive()) {
        renderAbusive(window.dashboard.i18n.t('project.abuse.tos'));
        return $.Deferred().reject();
      }
      if (dashboard.project.hideBecausePrivacyViolationOrProfane()) {
        renderAbusive(window.dashboard.i18n.t('project.abuse.policy_violation'));
        return $.Deferred().reject();
      }
    }).then(callback);
  } else {
    loadLastAttemptFromSessionStorage();
  }
};
