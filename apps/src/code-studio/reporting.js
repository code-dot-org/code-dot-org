import _ from 'lodash';
import { TestResults } from '@cdo/apps/constants';
import experiments from '../util/experiments';
var clientState = require('./clientState');
import { onUnload, beacon } from '@cdo/apps/utils';

var lastAjaxRequest;
var unloadListener;
var milestones = [];

var reporting = module.exports;

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
    typeIsValid = typeIsValid || (typeof value === type);
  }

  if (!typeIsValid) {
    console.error(`Expected ${key} to be of type '${type}'. Got '${typeof value}'`);
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
    const isContainedLevel = report.testResult === TestResults.CONTAINED_LEVEL_RESULT;

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
      case 'callback':
        validateType('callback', value, 'string');
        break;
      case 'app':
        validateType('app', value, 'string');
        break;
      case 'allowMultipleSends':
        validateType('allowMultipleSends', value, 'boolean');
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
        if (report.app === 'applab' || report.app === 'gamelab' || report.app === 'weblab') {
          validateType('submitted', value, 'boolean');
        } else {
          // In sendResultsCompletion this becomes either "true" (the string) or false (the boolean).
          // Would probably be better long term if it was always a string or always a boolean.
          if (value !== "true" && value !== false) {
            console.error('Expected submitted to be either string "true" or value false');
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
      case 'lines':
        validateType('lines', value, 'number');
        break;
      case 'save_to_gallery':
        validateType('save_to_gallery', value, 'boolean');
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
        console.error(`Unexpected report key '${key}' of type '${typeof report[key]}'`);
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
 * @property {?} submitted - ??
 * @property {?} time - ??
 * @property {?} save_to_gallery - ??
 * @property {?} attempt - ??
 * @property {?} image - ??
 * @property {boolean} pass - true if the attempt is passing.
 * @property {boolean} gamification_enabled - true if experiment is enabled.
 */

/**
 * @callback onComplete
 * @param {LiveMilestoneResponse} response
 */

/**
 * Notify the progression system of level attempt or completion.
 *
 * The client posts the progress JSON to the URL specified by
 * {@link MilestoneReport.callback} (e.g. /milestone).
 *
 * @param {MilestoneReport} report
 */
reporting.sendReport = function (report) {
  const appOptions = window.appOptions;
  appOptions.report.lastReport = report;
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
    'lines',
    'save_to_gallery',
    'attempt',
    'image'
  ];

  validateReport(report);

  const serverReport = _.pick(report, serverFields);

  // Tell the server about the current list of experiments (right now only Gamification has server-side changes)
  if (experiments.isEnabled('gamification')) {
    serverReport.gamification_enabled = true;
  }

  const progressUpdated = clientState.trackProgress(report.result, report.lines, report.testResult, appOptions.scriptName, report.serverLevelId || appOptions.serverLevelId);

  // Enable reports for this level iff the server tells us.
  // Check a second switch if we passed the last level of the script.
  // Keep this logic in sync with ActivitiesController#milestone on the server.
  if (appOptions.postMilestone ||
    (appOptions.postFinalMilestone && report.pass && appOptions.level.final_level)) {
    // Add report to the milestone queue.
    milestones.push(serverReport);

    console.log(`Queued ${milestones.length} milestones (${JSON.stringify(milestones).length} bytes)`);
    if (progressUpdated) {
      console.log("Progress updated, posting progress");
      beacon(report.callback, {milestones: milestones});
      milestones = [];
    } else if (!unloadListener) {
      unloadListener = onUnload(() => {
        unloadListener = null;
        if (milestones.length > 0) {
          console.log("Unloading page, posting progress");
          beacon(report.callback, {milestones: milestones});
          milestones = [];
        }
      });
    }
  }

  //There's a potential race condition here - we show the dialog after animation completion, but also after the report
  //is done posting. There is logic that says "don't show the dialog if we are animating" but if milestone posting
  //is disabled then we might show the dialog before the animation starts. Putting a 1-sec delay works around this
  setTimeout(function () {
    reportComplete(report);
  }, 1000);
};

reporting.cancelReport = function () {
  if (lastAjaxRequest) {
    lastAjaxRequest.abort();
  }
  lastAjaxRequest = null;
};

/**
 * @param {MilestoneReport} report
 * @param {LiveMilestoneResponse} response
 */
function reportComplete(report, response) {
  lastAjaxRequest = null;
  if (report.onComplete) {
    report.onComplete(response);
  }
}
