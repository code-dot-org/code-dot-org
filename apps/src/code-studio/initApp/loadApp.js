/* global addToHome trackEvent Applab Blockly */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { getStore } from '../redux';
import { setUserSignedIn, SignInState, mergeProgress } from '../progressRedux';
import { files } from '@cdo/apps/clientApi';
var renderAbusive = require('./renderAbusive');
var userAgentParser = require('./userAgentParser');
var progress = require('../progress');
var clientState = require('../clientState');
import getScriptData from '../../util/getScriptData';
import PlayZone from '@cdo/apps/code-studio/components/playzone';
var timing = require('@cdo/apps/code-studio/initApp/timing');
var chrome34Fix = require('@cdo/apps/code-studio/initApp/chrome34Fix');
var project = require('@cdo/apps/code-studio/initApp/project');
var createCallouts = require('@cdo/apps/code-studio/callouts');
var reporting = require('@cdo/apps/code-studio/reporting');
var LegacyDialog = require('@cdo/apps/code-studio/LegacyDialog');
var showVideoDialog = require('@cdo/apps/code-studio/videos').showVideoDialog;
import {
  lockContainedLevelAnswers,
  getContainedLevelId,
} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import queryString from 'query-string';
import { dataURIToFramedBlob } from '@cdo/apps/imageUtils';

// Max milliseconds to wait for last attempt data from the server
var LAST_ATTEMPT_TIMEOUT = 5000;

const SHARE_IMAGE_NAME = '_share_image.png';

/**
 * When we have a publicly cacheable script, the server does not send down the
 * user's levelProgress, and instead we get it asynchronously. This method adds
 * that progress to our redux store, and then also updates the clientState (i.e.
 * sessionStorage)
 * Note: A better approach to backing up progress in sessionStorage would likely
 * be to attach a listener to our redux store, and then update clientState whenever
 * levelProgress changes in the store.
 * @param {string} scriptName
 * @param {Object<number, number>} Mapping from levelId to TestResult
 */
function mergeProgressData(scriptName, serverProgress) {
  const store = getStore();
  store.dispatch(mergeProgress(serverProgress));

  Object.keys(serverProgress).forEach(levelId => {
    // Write down new progress in sessionStorage
    clientState.trackProgress(
      null,
      null,
      serverProgress[levelId],
      scriptName,
      levelId
    );
  });
}

// Legacy Blockly initialization that was moved here from _blockly.html.haml.
// Modifies `appOptions` with some default values in `baseOptions`.
// TODO(dave): Move blockly-specific setup function out of shared and back into dashboard.
export function setupApp(appOptions) {
  if (!window.dashboard) {
    throw new Error('Assume existence of window.dashboard');
  }
  timing.startTiming('Puzzle', window.script_path, '');

  var lastSavedProgram;

  if (appOptions.hasContainedLevels) {
    if (appOptions.readonlyWorkspace) {
      // Lock the contained levels if this is a teacher viewing student work:
      lockContainedLevelAnswers();
    }
    if (!appOptions.level.edit_blocks) {
      // Always mark the workspace as readonly when we have contained levels,
      // unless editing:
      appOptions.readonlyWorkspace = true;
    }
  }

  // Sets up default options and initializes blockly
  var baseOptions = {
    containerId: 'codeApp',
    position: {blockYCoordinateInterval: 25},
    onInitialize: function () {
      createCallouts(this.level.callouts || this.callouts);
      if (userAgentParser.isChrome34()) {
        chrome34Fix.fixup();
      }
      if (appOptions.level.projectTemplateLevelName || appOptions.app === 'applab' || appOptions.app === 'gamelab' || appOptions.app === 'weblab') {
        $('#clear-puzzle-header').hide();
        // Only show Version History button if the user owns this project
        if (project.isEditable()) {
          $('#versions-header').show();
        }
      }
      $(document).trigger('appInitialized');
    },
    onAttempt: function (report) {
      if (appOptions.level.isProjectLevel && !appOptions.level.edit_blocks) {
        const dataURI = `data:image/png;base64,${decodeURIComponent(report.image)}`;
        // Add the frame to the drawing.
        dataURIToFramedBlob(dataURI, blob => {
          files.putFile(SHARE_IMAGE_NAME, blob);
        });
        return;
      }
      if (appOptions.channel && !appOptions.level.edit_blocks &&
          !appOptions.hasContainedLevels) {
        // Unless we are actually editing blocks and not really completing a
        // level, or if this is a contained level, don't send the levelSource or
        // image to Dashboard for channel-backed levels (The levelSource is
        // already stored in the channels API.)
        delete report.program;
        delete report.image;
      } else {
        // Only locally cache non-channel-backed levels. Use a client-generated
        // timestamp initially (it will be updated with a timestamp from the server
        // if we get a response.
        lastSavedProgram = decodeURIComponent(report.program);

        // If the program is the result for a contained level, store it with
        // the contained level id
        const levelId = (appOptions.hasContainedLevels && !appOptions.level.edit_blocks) ?
          getContainedLevelId() :
          appOptions.serverLevelId;
        clientState.writeSourceForLevel(appOptions.scriptName, levelId,
            +new Date(), lastSavedProgram);
      }
      // report.callback will already have the correct milestone post URL in
      // the contained level case, unless we're editing blocks
      if (appOptions.level.edit_blocks || !appOptions.hasContainedLevels) {
        report.callback = appOptions.report.callback;
      }
      trackEvent('Activity', 'Lines of Code', window.script_path, report.lines);

      report.fallbackResponse = appOptions.report.fallback_response;
      // Track puzzle attempt event
      trackEvent('Puzzle', 'Attempt', window.script_path, report.pass ? 1 : 0);
      if (report.pass) {
        trackEvent('Puzzle', 'Success', window.script_path, report.attempt);
        timing.stopTiming('Puzzle', window.script_path, '');
      }
      reporting.sendReport(report);
    },
    onComplete: function (response) {
      if (!appOptions.channel && !appOptions.hasContainedLevels) {
        // Update the cache timestamp with the (more accurate) value from the server.
        clientState.writeSourceForLevel(appOptions.scriptName,
            appOptions.serverLevelId, response.timestamp, lastSavedProgram);
      }
    },
    onResetPressed: function () {
      reporting.cancelReport();
    },
    onContinue: function () {
      var lastServerResponse = reporting.getLastServerResponse();
      if (lastServerResponse.videoInfo) {
        showVideoDialog(lastServerResponse.videoInfo);
      } else if (lastServerResponse.endOfStageExperience) {
        const body = document.createElement('div');
        const stageInfo = lastServerResponse.previousStageInfo;
        const stageName = `${window.dashboard.i18n.t('stage')} ${stageInfo.position}: ${stageInfo.name}`;
        ReactDOM.render(
          <PlayZone
            stageName={stageName}
            onContinue={() => { dialog.hide(); }}
            i18n={window.dashboard.i18n}
          />,
          body
        );
        const dialog = new LegacyDialog({
          body: body,
          width: 800,
          redirect: lastServerResponse.nextRedirect
        });
        dialog.show();
      } else if (lastServerResponse.nextRedirect) {
        window.location.href = lastServerResponse.nextRedirect;
      }
    },
    backToPreviousLevel: function () {
      var lastServerResponse = reporting.getLastServerResponse();
      if (lastServerResponse.previousLevelRedirect) {
        window.location.href = lastServerResponse.previousLevelRedirect;
      }
    },
    showInstructionsWrapper: function (showInstructions) {
      // Always skip all pre-level popups on share levels or when configured thus
      if (this.share || appOptions.level.skipInstructionsPopup) {
        return;
      }

      var afterVideoCallback = showInstructions;
      if (appOptions.level.afterVideoBeforeInstructionsFn) {
        afterVideoCallback = function () {
          appOptions.level.afterVideoBeforeInstructionsFn(showInstructions);
        };
      }

      var hasVideo = !!appOptions.autoplayVideo;
      var hasInstructions = !!(appOptions.level.instructions ||
                               appOptions.level.aniGifURL);
      var noAutoplay = !!queryString.parse(location.search).noautoplay;

      if (hasVideo && !noAutoplay) {
        if (hasInstructions) {
          appOptions.autoplayVideo.onClose = afterVideoCallback;
        }
        showVideoDialog(appOptions.autoplayVideo);
      } else {
        if (hasVideo && noAutoplay) {
          clientState.recordVideoSeen(appOptions.autoplayVideo.key);
        }
        if (hasInstructions) {
          afterVideoCallback();
        }
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
          // eslint-disable-next-line no-eval
          node[i.replace(/^fn_/, '')] = eval('(' + node[i] + ')');
        } catch (e) {
        }
      } else {
        fixUpFunctions(node[i]);
      }
    }
  })(appOptions.level);

  // Previously, this was set by dashboard based on route and user agent. We
  // stopped being able to use the user agent on the server, and thus try
  // to have the same logic on the client.
  appOptions.noPadding = userAgentParser.isMobile();
}

function loadAppAsync(appOptions) {
  return new Promise((resolve, reject) => {
    setupApp(appOptions);

    let lastAttemptLoaded = false;

    const loadLastAttemptFromSessionStorage = () => {
      if (!lastAttemptLoaded) {
        lastAttemptLoaded = true;

        // Load the locally-cached last attempt (if one exists)
        appOptions.level.lastAttempt = clientState.sourceForLevel(
          appOptions.scriptName,
          appOptions.serverLevelId
        );

        resolve(appOptions);
      }
    };

    var isViewingSolution = (clientState.queryParams('solution') === 'true');
    var isViewingStudentAnswer = !!clientState.queryParams('user_id');

    if (appOptions.share && !window.navigator.standalone && userAgentParser.isSafari()) {
      // show a little instruction panel for how to add this app to your home screen
      // on an iPhone
      window.addEventListener(
        "load",
        () => addToHome.show(true),
        false
      );
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
      ).done(data => {
        appOptions.disableSocialShare = data.disableSocialShare;

        // Merge progress from server (loaded via AJAX)
        const serverProgress = data.progress || {};
        mergeProgressData(appOptions.scriptName, serverProgress);

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
            resolve(appOptions);
          } else {
            loadLastAttemptFromSessionStorage();
          }

          if (data.pairingDriver) {
            appOptions.level.pairingDriver = data.pairingDriver;
          }
        }

        const store = getStore();
        const signInState = store.getState().progress.signInState;
        if (signInState === SignInState.Unknown) {
          // if script was cached, we won't have signin state until we've made
          // our user_progress call
          // Depend on the fact that even if we have no levelProgress, our progress
          // data will have other keys
          const signedInUser = Object.keys(data).length > 0;
          store.dispatch(setUserSignedIn(signedInUser));
          clientState.cacheUserSignedIn(signedInUser);
          if (signedInUser) {
            progress.showDisabledBubblesAlert();
          }
        }
      }).fail(loadLastAttemptFromSessionStorage);

      // Use this instead of a timeout on the AJAX request because we still want
      // the header progress data even if the last attempt data takes too long.
      // The progress dots can fade in at any time without impacting the user.
      setTimeout(loadLastAttemptFromSessionStorage, LAST_ATTEMPT_TIMEOUT);
    } else if (window.dashboard && project) {
      project.load().then(function () {
        if (project.hideBecauseAbusive()) {
          renderAbusive(window.dashboard.i18n.t('project.abuse.tos'));
          return $.Deferred().reject();
        }
        if (project.hideBecausePrivacyViolationOrProfane()) {
          renderAbusive(window.dashboard.i18n.t('project.abuse.policy_violation'));
          return $.Deferred().reject();
        }
      }).then(() => resolve(appOptions));
    } else {
      loadLastAttemptFromSessionStorage();
    }
  });
}

window.dashboard = window.dashboard || {};

window.apps = {

  // Set up projects, skipping blockly-specific steps. Designed for use
  // by levels of type "external".
  setupProjectsExternal: function () {
    if (!window.dashboard) {
      throw new Error('Assume existence of window.dashboard');
    }
  },

  // Define blockly/droplet-specific callbacks for projects to access
  // level source, HTML and headers.
  sourceHandler: {
    /**
     * NOTE: when adding a new method here, ensure that all other sourceHandlers
     * (e.g. in pixelation.js) have that same method defined.
     */
    setMakerAPIsEnabled: function (enableMakerAPIs) {
      getAppOptions().level.makerlabEnabled = enableMakerAPIs;
    },
    getMakerAPIsEnabled: function () {
      return getAppOptions().level.makerlabEnabled;
    },
    setInitialLevelHtml: function (levelHtml) {
      getAppOptions().level.levelHtml = levelHtml;
    },
    getLevelHtml: function () {
      return window.Applab && Applab.getHtml();
    },
    setInitialLevelSource: function (levelSource) {
      getAppOptions().level.lastAttempt = levelSource;
    },
    // returns a Promise to the level source
    getLevelSource: function (currentLevelSource) {
      return new Promise((resolve, reject) => {
        let source;
        let appOptions = getAppOptions();
        if (window.Blockly) {
          // If we're readOnly, source hasn't changed at all
          source = Blockly.mainBlockSpace.isReadOnly() ? currentLevelSource :
                   Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
          resolve(source);
        } else if (appOptions.getCode) {
          source = appOptions.getCode();
          resolve(source);
        } else if (appOptions.getCodeAsync) {
          appOptions.getCodeAsync().then((source) => {
            resolve(source);
          });
        }
      });
    },
    setInitialAnimationList: function (animationList) {
      getAppOptions().initialAnimationList = animationList;
    },
    getAnimationList: function (callback) {
      if (getAppOptions().getAnimationList) {
        getAppOptions().getAnimationList(callback);
      } else {
        callback({});
      }
    },
    prepareForRemix: function () {
      const {prepareForRemix} = getAppOptions();
      if (prepareForRemix) {
        return prepareForRemix();
      }
      return Promise.resolve(); // Return an insta-resolved promise.
    }
  },
};

let APP_OPTIONS;
export function setAppOptions(appOptions) {
  APP_OPTIONS = appOptions;
  // ugh, a lot of code expects this to be on the window object pretty early on.
  window.appOptions = appOptions;
}

export function getAppOptions() {
  if (!APP_OPTIONS) {
    throw new Error(
      "App Options have not been loaded yet! Did you forget to call loadAppOptions()?"
    );
  }
  return APP_OPTIONS;
}

/**
 * Loads the "appOptions" object from the dom and augments it with additional
 * information needed by apps to run.
 *
 * This should only be called once per page load, with appoptions specified as a
 * data attribute on the script tag.
 *
 * @returns a Promise object which resolves to the fully populated appOptions
 */
export default function loadAppOptions() {
  return new Promise((resolve, reject) => {
    try {
      setAppOptions(getScriptData('appoptions'));
    } catch (e) {
      reject(e);
      return;
    }
    const appOptions = getAppOptions();
    if (appOptions.embedded) {
      // when we just "embed" an app (i.e. via embed_blocks.html.erb),
      // we don't need to load anything else onto appOptions, so just resolve
      // immediately
      resolve(appOptions);
    } else {
      loadAppAsync(appOptions)
        .then((appOptions) => {
          project.init(window.apps.sourceHandler);
          resolve(appOptions);
        });
    }
  });
}
