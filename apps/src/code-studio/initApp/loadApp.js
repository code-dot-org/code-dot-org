/* global addToHome Applab Blockly */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {getStore} from '../redux';
import {
  setAppLoadStarted,
  setAppLoaded
} from '@cdo/apps/code-studio/headerRedux';
import {files} from '@cdo/apps/clientApi';
var renderAbusive = require('./renderAbusive');
var userAgentParser = require('./userAgentParser');
var clientState = require('../clientState');
import getScriptData from '../../util/getScriptData';
import PlayZone from '@cdo/apps/code-studio/components/playzone';
var timing = require('@cdo/apps/code-studio/initApp/timing');
var chrome34Fix = require('@cdo/apps/code-studio/initApp/chrome34Fix');
var project = require('@cdo/apps/code-studio/initApp/project');
var createCallouts = require('@cdo/apps/code-studio/callouts').default;
var reporting = require('@cdo/apps/code-studio/reporting');
var LegacyDialog = require('@cdo/apps/code-studio/LegacyDialog');
var showVideoDialog = require('@cdo/apps/code-studio/videos').showVideoDialog;
import {lockContainedLevelAnswers} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import queryString from 'query-string';
import * as imageUtils from '@cdo/apps/imageUtils';
import trackEvent from '../../util/trackEvent';
import msg from '@cdo/locale';

const SHARE_IMAGE_NAME = '_share_image.png';

/**
 * Legacy Blockly initialization that was moved here from _blockly.html.haml.
 * Modifies `appOptions` with some default values in `baseOptions`.
 * TODO(dave): Move blockly-specific setup function out of shared and back into dashboard.
 * @param {AppOptionsConfig} appOptions
 */
export function setupApp(appOptions) {
  if (!window.dashboard) {
    throw new Error('Assume existence of window.dashboard');
  }
  timing.startTiming('Puzzle', window.script_path, '');

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
    onInitialize: function() {
      createCallouts(this.level.callouts || this.callouts);
      if (userAgentParser.isChrome34()) {
        chrome34Fix.fixup();
      }
      if (
        appOptions.level.projectTemplateLevelName ||
        appOptions.app === 'applab' ||
        appOptions.app === 'gamelab' ||
        appOptions.app === 'spritelab' ||
        appOptions.app === 'weblab'
      ) {
        $('#clear-puzzle-header').hide();
        // Only show Version History button if the user owns this project
        if (project.isEditable()) {
          $('#versions-header').show();
        }
      }
      $(document).trigger('appInitialized');
    },
    onAttempt: function(/*MilestoneReport*/ report) {
      if (appOptions.level.isProjectLevel && !appOptions.level.edit_blocks) {
        return tryToUploadShareImageToS3({
          image: report.image,
          level: appOptions.level
        });
      }

      if (
        appOptions.channel &&
        !appOptions.level.edit_blocks &&
        !appOptions.hasContainedLevels
      ) {
        // Unless we are actually editing blocks and not really completing a
        // level, or if this is a contained level, don't send the levelSource or
        // image to Dashboard for channel-backed levels (The levelSource is
        // already stored in the channels API.)
        delete report.program;
        delete report.image;
      }

      // Our report will already have the correct callback and program
      // in the contained level case, unless we're editing blocks.
      if (appOptions.level.edit_blocks || !appOptions.hasContainedLevels) {
        if (appOptions.hasContainedLevels) {
          var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
          report.program = Blockly.Xml.domToText(xml);
        }
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
    onResetPressed: function() {
      reporting.cancelReport();
    },
    onContinue: function() {
      var lastServerResponse = reporting.getLastServerResponse();
      if (lastServerResponse.videoInfo) {
        showVideoDialog(lastServerResponse.videoInfo);
      } else if (lastServerResponse.endOfStageExperience) {
        const body = document.createElement('div');
        const stageInfo = lastServerResponse.previousStageInfo;
        const stageName = `${msg.stage()} ${stageInfo.position}: ${
          stageInfo.name
        }`;
        ReactDOM.render(
          <PlayZone
            lessonName={stageName}
            onContinue={() => {
              dialog.hide();
            }}
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
    showInstructionsWrapper: function(showInstructions) {
      // Always skip all pre-level popups on share levels or when configured thus
      if (this.share || appOptions.level.skipInstructionsPopup) {
        return;
      }

      var afterVideoCallback = showInstructions;
      if (appOptions.level.afterVideoBeforeInstructionsFn) {
        afterVideoCallback = function() {
          appOptions.level.afterVideoBeforeInstructionsFn(showInstructions);
        };
      }

      var hasVideo = !!appOptions.autoplayVideo;
      var hasInstructions = !!(
        appOptions.level.shortInstructions || appOptions.level.aniGifURL
      );
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
        } catch (e) {}
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

/**
 * Store a share image preview to S3.
 * Used for artist projects, since they don't post to a milestone like other
 * artist levels do.
 *
 * Note: This is intentionally async with no callback - it's "fire and forget."
 *
 * @param {string} image - base64 encoded PNG image
 * @param {object} level - a level definition
 */
function tryToUploadShareImageToS3({image, level}) {
  if (level.disableSharing || !image) {
    return;
  }
  const dataURI = `data:image/png;base64,${decodeURIComponent(image)}`;
  // Add the frame to the drawing.
  imageUtils.dataURIToFramedBlob(dataURI, blob => {
    files.putFile(SHARE_IMAGE_NAME, blob);
  });
}

/**
 * Loads project and checks to see if it is abusive or if sharing is disabled
 * for the owner.
 * @returns {Promise.<AppOptionsConfig>} Resolves when project has loaded and is
 * not abusive. Never resolves if abusive.
 */
function loadProjectAndCheckAbuse(appOptions) {
  return new Promise((resolve, reject) => {
    project.load().then(() => {
      if (project.hideBecauseAbusive()) {
        renderAbusive(project, msg.tosLong({url: 'http://code.org/tos'}));
        return;
      }
      if (project.hideBecausePrivacyViolationOrProfane()) {
        renderAbusive(project, msg.policyViolation());
        return;
      }
      if (project.getSharingDisabled()) {
        renderAbusive(
          project,
          msg.sharingDisabled({
            sign_in_url: 'https://studio.code.org/users/sign_in'
          })
        );
        return;
      }
      resolve(appOptions);
    });
  });
}

/**
 * @param {AppOptionsConfig} appOptions
 * @return {Promise.<AppOptionsConfig>}
 */
function loadAppAsync(appOptions) {
  setupApp(appOptions);

  var isViewingSolution = clientState.queryParams('solution') === 'true';
  var isViewingStudentAnswer = !!clientState.queryParams('user_id');

  if (
    appOptions.share &&
    !window.navigator.standalone &&
    userAgentParser.isSafari()
  ) {
    // show a little instruction panel for how to add this app to your home screen
    // on an iPhone
    window.addEventListener('load', () => addToHome.show(true), false);
  }

  if (isViewingSolution) {
    return Promise.resolve(appOptions);
  }

  if (appOptions.channel || isViewingStudentAnswer) {
    return loadProjectAndCheckAbuse(appOptions);
  }

  return new Promise((resolve, reject) => {
    if (appOptions.publicCaching) {
      // Disable social share by default on publicly-cached pages, because we don't know
      // if the user is underage until we get data back from /api/user_progress/ and we
      // should err on the side of not showing social links
      appOptions.disableSocialShare = true;
    }

    $.ajax(
      `/api/user_progress` +
        `/${appOptions.scriptName}` +
        `/${appOptions.lessonPosition}` +
        `/${appOptions.levelPosition}` +
        `/${appOptions.serverLevelId}`
    )
      .done(data => {
        appOptions.disableSocialShare = data.disableSocialShare;

        // We do not need to process data.progress here because labs do not use
        // the level progress data directly. (The progress bubbles in the header
        // of the level pages are rendered by header.build in header.js.)

        if (data.lastAttempt) {
          appOptions.level.lastAttempt = data.lastAttempt.source;
        } else if (!data.signedIn) {
          // User is not signed in, load last attempt from session storage.
          appOptions.level.lastAttempt = clientState.sourceForLevel(
            appOptions.scriptName,
            appOptions.serverProjectLevelId || appOptions.serverLevelId
          );
        }

        if (data.pairingDriver) {
          appOptions.level.pairingDriver = data.pairingDriver;
          appOptions.level.pairingAttempt = data.pairingAttempt;
          appOptions.level.pairingChannelId = data.pairingChannelId;
        }

        resolve(appOptions);
      })
      .fail(() => {
        // TODO: Show an error to the user here? (LP-1815)
        console.error('Could not load user progress.');
        resolve(appOptions);
      });
  });
}

window.dashboard = window.dashboard || {};

// Define blockly/droplet-specific callbacks for projects to access
// level source, HTML and headers.
// Currently pixelation.js appears to be only place that defines a custom set
// of source handler methods.
const sourceHandler = {
  /**
   * NOTE: when adding a new method here, ensure that all other sourceHandlers
   * (e.g. in pixelation.js) have that same method defined.
   */
  setMakerAPIsEnabled(enableMakerAPIs) {
    getAppOptions().level.makerlabEnabled = enableMakerAPIs;
  },
  getMakerAPIsEnabled() {
    return getAppOptions().level.makerlabEnabled;
  },
  setSelectedSong(id) {
    getAppOptions().level.selectedSong = id;
  },
  getSelectedSong() {
    return getAppOptions().level.selectedSong;
  },
  setInitialLevelHtml(levelHtml) {
    getAppOptions().level.levelHtml = levelHtml;
  },
  getLevelHtml() {
    return window.Applab && Applab.getHtml();
  },
  setInitialLibrariesList(libraries) {
    getAppOptions().level.libraries = libraries;
  },
  getLibrariesList() {
    return getAppOptions().level.libraries;
  },
  setInitialLevelSource(levelSource) {
    getAppOptions().level.lastAttempt = levelSource;
  },
  // returns a Promise to the level source
  getLevelSource(currentLevelSource) {
    return new Promise((resolve, reject) => {
      let source;
      let appOptions = getAppOptions();
      if (window.Blockly && Blockly.mainBlockSpace) {
        // If we're readOnly, source hasn't changed at all
        source = Blockly.mainBlockSpace.isReadOnly()
          ? currentLevelSource
          : Blockly.Xml.domToText(
              Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)
            );
        resolve(source);
      } else if (appOptions.getCode) {
        source = appOptions.getCode();
        resolve(source);
      } else if (appOptions.getCodeAsync) {
        appOptions
          .getCodeAsync()
          .then(source => resolve(source))
          .catch(err => reject(err));
      }
    });
  },
  setInitialAnimationList(animationList) {
    getAppOptions().initialAnimationList = animationList;
  },
  getAnimationList(callback) {
    if (getAppOptions().getAnimationList) {
      getAppOptions().getAnimationList(callback);
    } else {
      callback({});
    }
  },
  setInitialGeneratedProperties(generatedProperties) {
    getAppOptions().initialGeneratedProperties = generatedProperties;
  },
  getGeneratedProperties() {
    const {getGeneratedProperties} = getAppOptions();
    return getGeneratedProperties && getGeneratedProperties();
  },
  prepareForRemix() {
    const {prepareForRemix} = getAppOptions();
    if (prepareForRemix) {
      return prepareForRemix();
    }
    return Promise.resolve(); // Return an insta-resolved promise.
  }
};

/** @type {AppOptionsConfig} */
let APP_OPTIONS;

/** @param {AppOptionsConfig} appOptions */
export function setAppOptions(appOptions) {
  APP_OPTIONS = appOptions;
  // ugh, a lot of code expects this to be on the window object pretty early on.
  // Don't override existing settings, for example on Multi levels with embedded
  // blocks.
  if (!appOptions.nonGlobal) {
    /** @type {AppOptionsConfig} */
    window.appOptions = appOptions;
  }
}

/** @return {AppOptionsConfig} */
export function getAppOptions() {
  if (!APP_OPTIONS) {
    throw new Error(
      'App Options have not been loaded yet! Did you forget to call loadAppOptions()?'
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
 * @return {Promise.<AppOptionsConfig>} a Promise object which resolves to the fully populated appOptions
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
      // when we just "embed" an app (i.e. via LevelsHelper#match_answer_as_iframe),
      // we don't need to load anything else onto appOptions, so just resolve
      // immediately
      resolve(appOptions);
    } else {
      getStore().dispatch(setAppLoadStarted());
      loadAppAsync(appOptions).then(appOptions => {
        project.init(sourceHandler);
        getStore().dispatch(setAppLoaded());
        resolve(appOptions);
      });
    }
  });
}
