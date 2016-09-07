// TODO (brent) - way too many globals
/* global script_path, CDOSounds, dashboard, appOptions, trackEvent, Applab, Blockly, ga*/
import $ from 'jquery';
import PlayZone from '../components/playzone';
import React from 'react';
import ReactDOM from 'react-dom';
var timing = require('./timing');
var chrome34Fix = require('./chrome34Fix');
var loadApp = require('./loadApp');
var project = require('./project');
var userAgentParser = require('./userAgentParser');
var clientState = require('../clientState');
var createCallouts = require('../callouts');
var reporting = require('../reporting');
var Dialog = require('../dialog');
var showVideoDialog = require('../videos').showVideoDialog;

window.dashboard = window.dashboard || {};
window.dashboard.project = project;

window.apps = {
  // Loads the dependencies for the current app based on values in `appOptions`.
  // This function takes a callback which is called once dependencies are ready.
  load: loadApp,
  // Legacy Blockly initialization that was moved here from _blockly.html.haml.
  // Modifies `appOptions` with some default values in `baseOptions`.
  // TODO(dave): Move blockly-specific setup function out of shared and back into dashboard.
  setupApp: function (appOptions) {

    if (!window.dashboard) {
      throw new Error('Assume existence of window.dashboard');
    }
    timing.startTiming('Puzzle', script_path, '');

    var lastSavedProgram;

    var containedLevelOps;
    if (appOptions.hasContainedLevels) {
      containedLevelOps = {
        registerAnswerChangedFn: function (answerChangedFn) {
          if (window.levelGroup) {
            window.levelGroup.answerChangedFn = answerChangedFn;
          }
        },
        lockAnswers: function () {
          for (var levelKey in window.levelGroup.levels) {
            var level = window.levelGroup.levels[levelKey];
            level.lockAnswers();
          }
        },
        getResults: function () {
          var results = [];
          for (var levelKey in window.levelGroup.levels) {
            var level = window.levelGroup.levels[levelKey];
            results.push({
              id: level.levelId,
              app: level.getAppName(),
              callback: appOptions.report.sublevelCallback + level.levelId,
              result: level.getResult(),
              feedback: level.getCurrentAnswerFeedback()
            });
          }
          return results;
        }
      };
      if (appOptions.readonlyWorkspace) {
        // Lock the contained levels if this is a teacher viewing student work:
        containedLevelOps.lockAnswers();
      }
      // Always mark the workspace as readonly when we have contained levels:
      appOptions.readonlyWorkspace = true;
    }

    // Sets up default options and initializes blockly
    var baseOptions = {
      containerId: 'codeApp',
      Dialog: Dialog,
      cdoSounds: CDOSounds,
      containedLevelOps: containedLevelOps,
      position: {blockYCoordinateInterval: 25},
      onInitialize: function () {
        createCallouts(this.level.callouts || this.callouts);
        if (userAgentParser.isChrome34()) {
          chrome34Fix.fixup();
        }
        if (appOptions.level.projectTemplateLevelName || appOptions.app === 'applab' || appOptions.app === 'gamelab') {
          $('#clear-puzzle-header').hide();
          // Only show Version History button if the user owns this project
          if (project.isEditable()) {
            $('#versions-header').show();
          }
        }
        $(document).trigger('appInitialized');
      },
      onAttempt: function (report) {
        if (appOptions.level.isProjectLevel) {
          return;
        }
        // or unless the program is actually the result for a contained level
        if (!appOptions.hasContainedLevels) {
          if (appOptions.channel && !appOptions.level.edit_blocks) {
            // Don't send the levelSource or image to Dashboard for channel-backed levels,
            // unless we are actually editing blocks and not really completing a level
            // (The levelSource is already stored in the channels API.)
            delete report.program;
            delete report.image;
          } else {
            // Only locally cache non-channel-backed levels. Use a client-generated
            // timestamp initially (it will be updated with a timestamp from the server
            // if we get a response.
            lastSavedProgram = decodeURIComponent(report.program);
            clientState.writeSourceForLevel(appOptions.scriptName, appOptions.serverLevelId, +new Date(), lastSavedProgram);
          }
          report.callback = appOptions.report.callback;
          trackEvent('Activity', 'Lines of Code', script_path, report.lines);
        }
        report.scriptName = appOptions.scriptName;
        report.fallbackResponse = appOptions.report.fallback_response;
        // Track puzzle attempt event
        trackEvent('Puzzle', 'Attempt', script_path, report.pass ? 1 : 0);
        if (report.pass) {
          trackEvent('Puzzle', 'Success', script_path, report.attempt);
          timing.stopTiming('Puzzle', script_path, '');
        }
        reporting.sendReport(report);
      },
      onComplete: function (response) {
        if (!appOptions.channel && !appOptions.hasContainedLevels) {
          // Update the cache timestamp with the (more accurate) value from the server.
          clientState.writeSourceForLevel(appOptions.scriptName, appOptions.serverLevelId, response.timestamp, lastSavedProgram);
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
          const dialog = new Dialog({
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

        if (hasVideo) {
          if (hasInstructions) {
            appOptions.autoplayVideo.onClose = afterVideoCallback;
          }
          showVideoDialog(appOptions.autoplayVideo);
        } else if (hasInstructions) {
          afterVideoCallback();
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
  },

  // Set up projects, skipping blockly-specific steps. Designed for use
  // by levels of type "external".
  setupProjectsExternal: function () {
    if (!window.dashboard) {
      throw new Error('Assume existence of window.dashboard');
    }
  },

  // Define blockly/droplet-specific callbacks for projects to access
  // level source, HTML and headers.
  // TODO(dave): Extract blockly-specific handler code into _blockly.html.haml.
  sourceHandler: {
    setInitialLevelHtml: function (levelHtml) {
      appOptions.level.levelHtml = levelHtml;
    },
    getLevelHtml: function () {
      return window.Applab && Applab.getHtml();
    },
    setInitialLevelSource: function (levelSource) {
      appOptions.level.lastAttempt = levelSource;
    },
    // returns a Promise to the level source
    getLevelSource: function (currentLevelSource) {
      return new Promise((resolve, reject) => {
        let source;
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
      appOptions.initialAnimationList = animationList;
    },
    getAnimationList: function (callback) {
      if (appOptions.getAnimationList) {
        appOptions.getAnimationList(callback);
      } else {
        callback({});
      }
    }
  },

  // Initialize the Blockly or Droplet app.
  init: function () {
    project.init(window.apps.sourceHandler);
    window[appOptions.app + 'Main'](appOptions);
  }
};
