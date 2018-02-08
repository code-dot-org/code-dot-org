import $ from 'jquery';
import processMarkdown from 'marked';
import renderer, { makeRenderer } from "./util/StylelessRenderer";
import FeedbackBlocks from './feedbackBlocks';

import { trySetLocalStorage } from './utils';

var parseXmlElement = require('./xml').parseElement;
var msg = require('@cdo/locale');

/**
 * @overview A helper class for all actions associated with the Authored
 * Hint viewing and logging system.
 *
 * The general pattern for usage is straightforward:
 *
 * Every time a user requests to view a new hint, we log information
 * about that hint as well as the most recent attempt.
 *
 * Every time a user makes an "attempt" at the level and send an attempt
 * report, we save some information about that most recent attempt, and
 * add that information to all hint views from the previous attempt.
 *
 * Finally, when the user navigates to a new page (either by completing
 * the level and moving on or by leaving the level and coming back
 * later), we record for all hints the "final" attempt in that session
 * and post the results to the server.
 *
 * Thus, each hint has three attempt records by the end of the
 * lifecycle:
 *  1) a "previous" attempt (can be empty)
 *  2) a "next" attempt
 *  3) a "final" attempt
 */

/**
 * @typedef {Object} HintData
 * @property {number} scriptId
 * @property {number} levelId
 * @property {string} hintId
 * @property {string} hintClass
 * @property {string} hintType
 * @property {string} ttsUrl
 * @property {string} ttsMessage
 */
/**
 * @typedef {Object} UnfinishedHint
 * @augments HintData
 * @property {number} [prevTime]
 * @property {number} [prevAttempt]
 * @property {number} [prevTestResult]
 * @property {number} [prevActivityId]
 * @property {number} [prevLevelSourceId]
 */
/**
 * @typedef {Object} FinishedHint
 * @augments UnfinishedHint
 * @property {number} nextTime
 * @property {number} nextAttempt
 * @property {number} nextTestResult
 * @property {number} nextActivityId
 * @property {number} nextLevelSourceId
 */
/**
 * @typedef {Object} FinalizedHint
 * @augments FinishedHint
 * @property {number} finalTime
 * @property {number} finalAttempt
 * @property {number} finalTestResult
 * @property {number} finalActivityId
 * @property {number} finalLevelSourceId
 */
/**
 * @typedef {Object} AttemptRecord
 * @property {number} time
 * @property {number} attempt
 * @property {number} testResult
 * @property {number} activityId
 * @property {number} levelSourceId
 */

var authoredHintUtils = {};

module.exports = authoredHintUtils;

authoredHintUtils.getFromLocalStorage_ = function (key, defaultValue) {
  var result = localStorage.getItem(key);
  try {
    result = result ? JSON.parse(result) : defaultValue;
  } catch (e) {
    result = defaultValue;
  }
  return result;
};

/**
 * @return {UnfinishedHint[]}
 */
authoredHintUtils.getUnfinishedHints_ = function () {
  return authoredHintUtils.getFromLocalStorage_('unfinished_authored_hint_views', []);
};

/**
 * @return {FinishedHint[]}
 */
authoredHintUtils.getFinishedHints_ = function () {
  return authoredHintUtils.getFromLocalStorage_('finished_authored_hint_views', []);
};

/**
 * This only retrieves the hints stored in localStorage, which likely won't
 * include things from older sessions.
 *
 * TODO(ram): Grab *all* the old hint requests from the server, preferably on
 *   level load
 * @return {FinishedHint[]}
 */
authoredHintUtils.getOldFinishedHints = function () {
  return authoredHintUtils.getFromLocalStorage_('old_finished_authored_hint_views', []);
};

/**
 * @return {AttemptRecord}
 */
authoredHintUtils.getLastAttemptRecord_ = function () {
  return authoredHintUtils.getFromLocalStorage_('last_attempt_record', undefined);
};

/**
 * Appends the given hints to the array of existing FinishedHints
 * @param {FinishedHint[]} hints
 */
authoredHintUtils.recordFinishedHints_ = function (hints) {
  var finishedHintViews = authoredHintUtils.getFinishedHints_();
  finishedHintViews = finishedHintViews.concat(hints);
  trySetLocalStorage('finished_authored_hint_views', JSON.stringify(finishedHintViews));
};

authoredHintUtils.clearUnfinishedHints = function () {
  trySetLocalStorage('unfinished_authored_hint_views', JSON.stringify([]));
};

authoredHintUtils.clearFinishedHints_ = function () {
  trySetLocalStorage('finished_authored_hint_views', JSON.stringify([]));
};

/**
 * @return {FinalizedHint[]}
 */
authoredHintUtils.finalizeHints_ = function () {
  var finalAttemptRecord = authoredHintUtils.getLastAttemptRecord_();
  localStorage.removeItem('last_attempt_record');
  var hints = authoredHintUtils.getFinishedHints_();
  if (finalAttemptRecord) {
    hints = hints.map(function (hint) {
      hint = Object.assign({
        finalTime: finalAttemptRecord.time,
        finalAttempt: finalAttemptRecord.attempt,
        finalTestResult: finalAttemptRecord.testResult,
        finalActivityId: finalAttemptRecord.activityId,
        finalLevelSourceId: finalAttemptRecord.levelSourceId,
      }, hint);
      return hint;
    });
  }
  return hints;
};

/**
 * Adds a hint to the list of "unfinished" hints for the attempt
 * currently in progress. If this is not the first attempt of the
 * session, save along with the hint a record of the most recent
 * attempt.
 *
 * @param {HintData} hint
 */
authoredHintUtils.recordUnfinishedHint = function (hint) {
  var lastAttemptRecord = authoredHintUtils.getLastAttemptRecord_();
  if (lastAttemptRecord) {
    hint = Object.assign({
      prevTime: lastAttemptRecord.time,
      prevAttempt: lastAttemptRecord.attempt,
      prevTestResult: lastAttemptRecord.testResult,
      prevActivityId: lastAttemptRecord.activityId,
      prevLevelSourceId: lastAttemptRecord.levelSourceId,
    }, hint);
  }
  var unfinishedHintViews = authoredHintUtils.getUnfinishedHints_();
  unfinishedHintViews.push(hint);
  trySetLocalStorage('unfinished_authored_hint_views', JSON.stringify(unfinishedHintViews));
};

/**
 * @param {AttemptRecord} nextAttemptRecord
 */
authoredHintUtils.finishHints = function (nextAttemptRecord) {
  if (!nextAttemptRecord) {
    return;
  }
  trySetLocalStorage('last_attempt_record', JSON.stringify(nextAttemptRecord));
  var unfinishedHintViews = authoredHintUtils.getUnfinishedHints_();
  authoredHintUtils.clearUnfinishedHints();
  var finishedHintViews = unfinishedHintViews.map(function (hint) {
    hint = Object.assign({
      nextTime: nextAttemptRecord.time,
      nextAttempt: nextAttemptRecord.attempt,
      nextTestResult: nextAttemptRecord.testResult,
      nextActivityId: nextAttemptRecord.activityId,
      nextLevelSourceId: nextAttemptRecord.levelSourceId,
    }, hint);
    return hint;
  });
  authoredHintUtils.recordFinishedHints_(finishedHintViews);
};

/**
 * @param {string} url
 */
authoredHintUtils.submitHints = function (url) {
  // first, finish all unfinished hints
  var unfinishedHints = authoredHintUtils.getUnfinishedHints_();
  if (unfinishedHints && unfinishedHints.length) {
    var finalHint = unfinishedHints[unfinishedHints.length-1];
    authoredHintUtils.finishHints({
      time: finalHint.prevTime,
      attempt: finalHint.prevAttempt,
      testResult: finalHint.prevTestResult,
      activityId: finalHint.prevActivityId,
      levelSourceId: finalHint.prevLevelSourceId,
    });
  }

  // then, finalize all hints
  var hints = authoredHintUtils.finalizeHints_();

  // now, all hints should be finished and finalized. So submit them all
  if (hints && hints.length) {
    $.ajax({
      url: url,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({hints: hints}),
      complete: function () {
        authoredHintUtils.clearFinishedHints_();
      }
    });
  }
};

/**
 * Generates contextual hints as used by StudioApp from Blockly XML
 * @param {BlockHint[]} blocks An array of objects representing the
 *        missing recommended Blockly Blocks for which we want to
 *        create hints.
 * @return {AuthoredHint[]}
 */
authoredHintUtils.createContextualHintsFromBlocks = function (blocks) {
  var hints = blocks.map(function (block) {
    var xmlBlock = parseXmlElement(FeedbackBlocks.generateXMLForBlocks([block]));
    var blockType = xmlBlock.firstChild.getAttribute("type");
    return {
      content: processMarkdown(msg.recommendedBlockContextualHintTitle(),
          { renderer }),
      ttsMessage: msg.recommendedBlockContextualHintTitle(),
      block: xmlBlock,
      hintId: "recommended_block_" + blockType,
      hintClass: 'recommended',
      hintType: 'contextual',
      alreadySeen: block.alreadySeen
    };
  });
  return hints;
};

/**
 * Generates authored hints as used by StudioApp from levelbuilder JSON.
 * @param {string} levelBuilderAuthoredHints - JSON representing an array of hints
 * @return {AuthoredHint[]}
 */
authoredHintUtils.generateAuthoredHints = function (levelBuilderAuthoredHints) {
  /**
   * @type {{
   *   hint_markdown,
   *   hint_id,
   *   hint_class,
   *   hint_type,
   *   tts_url
   * }[]}
   */
  var hints;
  try {
    hints = JSON.parse(levelBuilderAuthoredHints);
  } catch (e) {
    hints = [];
  }
  return hints.map(function (hint) {
    return {
      content: processMarkdown(hint.hint_markdown, {
        renderer: makeRenderer({
          stripStyles: false,
          expandableImages: true,
        }),
      }),
      hintId: hint.hint_id,
      hintClass: hint.hint_class,
      hintType: hint.hint_type,
      hintPath: JSON.parse(hint.hint_path || '[]'),
      hintVideo: hint.hint_video,
      ttsUrl: hint.tts_url,
      alreadySeen: false
    };
  });
};

/**
 * @return {number} number of hints that the user has opened on the given level, but
 * haven't been reported to the server yet.
 */
authoredHintUtils.currentOpenedHintCount = function (levelId) {
  const unfinished = authoredHintUtils.getUnfinishedHints_();
  const finished = authoredHintUtils.getFinishedHints_();
  return unfinished.concat(finished).filter((hint) => {
    return hint.levelId === levelId;
  }).length;
};
