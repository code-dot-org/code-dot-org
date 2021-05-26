/* global appOptions */

import $ from 'jquery';
import _ from 'lodash';
import {TestResults} from '@cdo/apps/constants';
import {PostMilestoneMode} from '@cdo/apps/util/sharedConstants';
import {getContainedLevelId} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {getStore} from '@cdo/apps/redux';
import {mergeResults} from '@cdo/apps/code-studio/progressRedux';
var clientState = require('./clientState');

var lastAjaxRequest;
var lastServerResponse = {};

var reporting = module.exports;

reporting.getLastServerResponse = function() {
  return lastServerResponse;
};

/**
 * Validate that the provided field on our report object is one of the given
 * type
 * @param {string} key
 * @param {*} value
 * @param {string} type
 */
function validateType(key, value, type) {
  let typeIsValid = false;
  if (type === 'array') {
    typeIsValid = typeIsValid || Array.isArray(value);
  } else {
    typeIsValid = typeIsValid || typeof value === type;
  }

  if (!typeIsValid) {
    console.error(
      `Expected ${key} to be of type '${type}'. Got '${typeof value}'`
    );
  }
}

/**
 * Do some validation of our report object. Log console errors if we have any
 * unexpected fields, or fields with different data than we expect.
 * This is meant in part to serve as documentation of the existing behavior. In
 * cases where I believe the behavior should potentially be different going
 * forward, I've made notes.
 * @param {MilestoneReport} report
 */
function validateReport(report) {
  for (var key in report) {
    if (!report.hasOwnProperty(key)) {
      continue;
    }

    const inLevelGroup = report.allowMultipleSends === true;
    const isContainedLevel =
      report.testResult === TestResults.CONTAINED_LEVEL_RESULT;

    const value = report[key];
    switch (key) {
      case 'program':
        if (report.app === 'match') {
          validateType('program', value, 'array');
        } else if (report.app === 'multi' && isContainedLevel) {
          validateType('program', value, 'number');
        } else if (report.app === 'multi' && !inLevelGroup) {
          validateType('program', value, 'array');
        } else {
          validateType('program', value, 'string');
        }
        break;
      case 'fallbackResponse':
        // Sometimes we get an object, sometimes we get json for that object.
        // When each is true depends on whether it's a contained level or not,
        // whether it's in a script or not, and what type of level it is.
        // Attempts to describe when each happens have fallen up short. What
        // should likely happen is we consolidate around one, then make sure we
        // always use that.}
        break;
      case 'callback':
        if (value !== null) {
          validateType('callback', value, 'string');
        }
        break;
      case 'app':
        validateType('app', value, 'string');
        break;
      case 'allowMultipleSends':
        validateType('allowMultipleSends', value, 'boolean');
        break;
      case 'skipSuccessCallback':
        validateType('skipSuccessCallback', value, 'boolean');
        break;
      case 'level':
        if (value !== null) {
          if (report.app === 'level_group' || isContainedLevel) {
            // LevelGroups appear to report level as the position of this level
            // within the script, which seems wrong.
            validateType('level', value, 'number');
          } else {
            validateType('level', value, 'string');
          }
        }
        break;
      case 'result':
        if (inLevelGroup) {
          // A multi in an assessment seems to send an object here instead of a
          // boolean (which may well be a bug).
          validateType('result', value, 'object');
        } else {
          validateType('result', value, 'boolean');
        }
        break;
      case 'pass':
        if (inLevelGroup) {
          // A multi in an assessment seems to send an object here instead of a
          // boolean (which may well be a bug).
          validateType('pass', value, 'object');
        } else {
          validateType('pass', value, 'boolean');
        }
        break;
      case 'testResult':
        validateType('testResult', value, 'number');
        break;
      case 'submitted':
        if (
          report.app === 'applab' ||
          report.app === 'gamelab' ||
          report.app === 'spritelab' ||
          report.app === 'weblab'
        ) {
          validateType('submitted', value, 'boolean');
        } else {
          // In sendResultsCompletion this becomes either "true" (the string) or false (the boolean).
          // Would probably be better long term if it was always a string or always a boolean.
          if (value !== 'true' && value !== false) {
            console.error(
              'Expected submitted to be either string "true" or value false'
            );
          }
        }
        break;
      case 'onComplete':
        if (value !== undefined) {
          validateType('onComplete', value, 'function');
        }
        break;
      case 'time':
        validateType('time', value, 'number');
        break;
      case 'timeSinceLastMilestone':
        validateType('timeSinceLastMilestone', value, 'number');
        break;
      case 'lines':
        validateType('lines', value, 'number');
        break;
      case 'attempt':
        validateType('attempt', value, 'number');
        break;
      case 'image':
        if (value !== null) {
          validateType('image', value, 'string');
        }
        break;
      case 'containedLevelResultsInfo':
        validateType('containedLevelResultsInfo', value, 'object');
        break;
      case 'feedback':
        if (value) {
          validateType('feedback', value, 'string');
        }
        break;
      default:
        // Eventually we'd probably prefer to throw here, but I don't have enough
        // confidence that this validation is 100% correct to start breaking things
        // if it isnt.
        console.error(
          `Unexpected report key '${key}' of type '${typeof report[key]}'`
        );
        break;
    }
  }
}

/**
 * @typedef  {Object} MilestoneReport
 * @property {string} callback - The url where the report should be sent.
 *           For studioApp-based levels, this is provided on initialization as
 *           appOptions.report.callback.
 * @property {?} program - contents of submitted program.
 * @property {string} app - The app name, as defined by its model.
 * @property {string} level - The level name or number.  Maybe deprecated?
 * @property {number|boolean} result - Whether the attempt succeeded or failed.
 * @property {TestResult} testResult - Additional detail on the outcome of the attempt.
 * @property {onComplete} onComplete - Callback invoked when reporting is completed.
 * @property {boolean} allowMultipleSends - ??
 * @property {number} lines - number of lines of code written.
 * @property {number} serverLevelId - ??
 * @property {boolean} skipSuccessCallback - Whether we should ignore the success result from ajax
 * @property {?} submitted - ??
 * @property {?} time - ??
 * @property {number} timeSinceLastMilestone- The time since navigating to this page or since the last
 * milestone was recorded, whichever is more recent. It is used to calculated time spent on a level.
 * @property {?} attempt - ??
 * @property {?} image - ??
 * @property {boolean} pass - true if the attempt is passing.
 */

/**
 * @callback onComplete
 * @param {LiveMilestoneResponse} response
 */

/**
 * Notify the progression system of level attempt or completion.
 * All labs/activities should call this function to report progress, typically
 * when the "Run" or "Submit" button is clicked.
 *
 * Provides a response to a callback, which can provide a video to play
 * and next/previous level URLs.
 *
 * The client posts the progress JSON to the URL specified by
 * {@link MilestoneReport.callback} (e.g. /milestone).
 * In the event of a failure or timeout, the client relies on
 * report.fallbackResponse (if specified) to allow the user to progress.
 *
 * @param {MilestoneReport} report
 */
reporting.sendReport = function(report) {
  // The list of report fields we want to send to the server
  const serverFields = [
    'program',
    'app',
    'allowMultipleSends',
    'level',
    'result',
    'testResult',
    'submitted',
    'time',
    'timeSinceLastMilestone',
    'lines',
    'attempt',
    'image'
  ];

  validateReport(report);

  // Update Redux
  const store = getStore();
  store.dispatch(mergeResults({[appOptions.serverLevelId]: report.testResult}));

  // If progress is not being saved in the database, save it locally.
  // (Note: Either way, we still send a milestone report to the server so we can
  // get information from the response.)
  if (!store.getState().progress.usingDbProgress) {
    saveReportLocally(report);
  }

  // jQuery can do this implicitly, but when url-encoding it, jQuery calls a method that
  // shows the result dialog immediately
  var queryItems = [];
  const serverReport = _.pick(report, serverFields);
  for (var key in serverReport) {
    queryItems.push(key + '=' + report[key]);
  }
  const queryString = queryItems.join('&');

  // Post milestone iff the server tells us.
  // Check a second switch if we passed the last level of the script.
  // Keep this logic in sync with ActivitiesController#milestone on the server.
  const postMilestoneMode =
    appOptions.postMilestoneMode || PostMilestoneMode.all;
  let postMilestone;

  switch (postMilestoneMode) {
    case PostMilestoneMode.all:
      postMilestone = true;
      break;
    case PostMilestoneMode.successful_runs_and_final_level_only:
      postMilestone = report.pass || appOptions.level.final_level;
      break;
    case PostMilestoneMode.final_level_only:
      postMilestone = appOptions.level.final_level;
      break;
    default:
      console.error('Unexpected postMilestoneMode ' + postMilestoneMode);
      postMilestone = true;
      break;
  }

  if (postMilestone) {
    var onNoSuccess = xhr => {
      if (!report.allowMultipleSends && thisAjax !== lastAjaxRequest) {
        return;
      }
      report.error = xhr.responseText;
      reportComplete(report, getFallbackResponse(report));
    };

    var thisAjax = $.ajax({
      type: 'POST',
      url: report.callback,
      contentType: 'application/x-www-form-urlencoded',
      // Set a timeout of fifteen seconds so the user will get the fallback
      // response even if the server is hung and unresponsive.
      timeout: 15000,
      data: queryString,
      dataType: 'json',
      jsonp: false,
      beforeSend: function(xhr) {
        xhr.setRequestHeader(
          'X-CSRF-Token',
          $('meta[name="csrf-token"]').attr('content')
        );
      },
      success: function(response) {
        if (report.skipSuccessCallback === true) {
          onNoSuccess(response);
          return;
        }
        if (appOptions.hasContainedLevels && !response.redirect) {
          // for contained levels, we want to allow the user to Continue even
          // if the answer was incorrect and nextRedirect was not supplied, so
          // populate nextRedirect from the fallback if necessary
          report.pass = true;
          var fallback = getFallbackResponse(report) || {};
          response.redirect = fallback.redirect;
        }
        if (appOptions.isBonusLevel) {
          // Bonus levels might have to take students back to a different lesson,
          // ignore the redirect in response and use the url from appOptions
          // instead
          response.redirect = appOptions.nextLevelUrl;
        }
        reportComplete(report, response);
      },
      error: xhr => onNoSuccess(xhr)
    });

    lastAjaxRequest = thisAjax;
  } else {
    //There's a potential race condition here - we show the dialog after animation completion, but also after the report
    //is done posting. There is logic that says "don't show the dialog if we are animating" but if milestone posting
    //is disabled then we might show the dialog before the animation starts. Putting a 1-sec delay works around this
    setTimeout(function() {
      reportComplete(report, getFallbackResponse(report));
    }, 1000);
  }
};

/**
 * Save information in milestone report to session storage.
 * @param report
 */
function saveReportLocally(report) {
  clientState.trackLines(report.result, report.lines);
  clientState.trackProgress(
    appOptions.scriptName,
    appOptions.serverLevelId,
    report.testResult
  );

  if (report.program && report.testResult !== TestResults.SKIPPED) {
    const program = decodeURIComponent(report.program);

    // If the program is the result for a contained level, store it with
    // the contained level id
    const levelId =
      appOptions.hasContainedLevels && !appOptions.level.edit_blocks
        ? getContainedLevelId()
        : appOptions.serverProjectLevelId || appOptions.serverLevelId;

    clientState.writeSourceForLevel(
      appOptions.scriptName,
      levelId,
      +new Date(),
      program
    );
  }
}

reporting.cancelReport = function() {
  if (lastAjaxRequest) {
    lastAjaxRequest.abort();
  }
  lastAjaxRequest = null;
};

function getFallbackResponse(report) {
  var fallbackResponse = maybeParse(report.fallbackResponse);
  if (!fallbackResponse) {
    return null;
  }
  return report.pass ? fallbackResponse.success : fallbackResponse.failure;
}

// TODO: sometimes fallback response is a string, not a parsed object
function maybeParse(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  return data;
}

function reportComplete(report, response) {
  lastAjaxRequest = null;
  if (response) {
    lastServerResponse.report_error = report.error;
    lastServerResponse.nextRedirect = response.redirect;
    lastServerResponse.videoInfo = response.video_info;
    lastServerResponse.endOfStageExperience = response.end_of_stage_experience;
    lastServerResponse.previousStageInfo =
      response.stage_changing && response.stage_changing.previous;
  }
  if (report.onComplete) {
    report.onComplete(response);
  }
}
