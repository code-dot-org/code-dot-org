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
 * @property {number} script_id
 * @property {number} level_id
 * @property {string} hint_id
 * @property {string} hint_class
 * @property {string} hint_type
 *
 * @typedef {Object} UnfinishedHint
 * @augments HintData
 * @property {number} [prev_time]
 * @property {number} [prev_attempt]
 * @property {number} [prev_test_result]
 * @property {number} [prev_activity_id]
 * @property {number} [prev_level_source_id]
 *
 * @typedef {Object} FinishedHint
 * @augments UnfinishedHint
 * @property {number} next_time
 * @property {number} next_attempt
 * @property {number} next_test_result
 * @property {number} next_activity_id
 * @property {number} next_level_source_id
 *
 * @typedef {Object} FinalizedHint
 * @augments FinishedHint
 * @property {number} final_time
 * @property {number} final_attempt
 * @property {number} final_test_result
 * @property {number} final_activity_id
 * @property {number} final_level_source_id
 *
 * @typedef {Object} AttemptRecord
 * @property {number} time
 * @property {number} attempt
 * @property {number} test_result
 * @property {number} activity_id
 * @property {number} level_source_id
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
authoredHintUtils.getFinishedHints = function () {
  return authoredHintUtils.getFromLocalStorage_('finished_authored_hint_views', []);
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
  var finishedHintViews = authoredHintUtils.getFinishedHints();
  finishedHintViews = finishedHintViews.concat(hints);
  localStorage.setItem('finished_authored_hint_views', JSON.stringify(finishedHintViews));
};

authoredHintUtils.clearUnfinishedHints = function () {
  localStorage.setItem('unfinished_authored_hint_views', JSON.stringify([]));
};

authoredHintUtils.clearFinishedHints_ = function () {
  localStorage.setItem('finished_authored_hint_views', JSON.stringify([]));
};

/**
 * @return {FinalizedHints[]}
 */
authoredHintUtils.finalizeHints_ = function () {
  var finalAttemptRecord = authoredHintUtils.getLastAttemptRecord_();
  localStorage.removeItem('last_attempt_record');
  var hints = authoredHintUtils.getFinishedHints();
  if (finalAttemptRecord) {
    hints = hints.map(function(hint){
      hint = $.extend(hint, {
        final_time: finalAttemptRecord.time,
        final_attempt: finalAttemptRecord.attempt,
        final_test_result: finalAttemptRecord.test_result,
        final_activity_id: finalAttemptRecord.activity_id,
        final_level_source_id: finalAttemptRecord.level_source_id,
      });
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
    hint = $.extend(hint, {
      prev_time: lastAttemptRecord.time,
      prev_attempt: lastAttemptRecord.attempt,
      prev_test_result: lastAttemptRecord.test_result,
      prev_activity_id: lastAttemptRecord.activity_id,
      prev_level_source_id: lastAttemptRecord.level_source_id,
    });
  }
  var unfinishedHintViews = authoredHintUtils.getUnfinishedHints_();
  unfinishedHintViews.push(hint);
  localStorage.setItem('unfinished_authored_hint_views', JSON.stringify(unfinishedHintViews));
};

/**
 * @param {AttemptRecord} nextAttemptRecord
 */
authoredHintUtils.finishHints = function (nextAttemptRecord) {
  if (!nextAttemptRecord) {
    return;
  }
  localStorage.setItem('last_attempt_record', JSON.stringify(nextAttemptRecord));
  var unfinishedHintViews = authoredHintUtils.getUnfinishedHints_();
  authoredHintUtils.clearUnfinishedHints();
  var finishedHintViews = unfinishedHintViews.map(function(hint){
    hint = $.extend(hint, {
      next_time: nextAttemptRecord.time,
      next_attempt: nextAttemptRecord.attempt,
      next_test_result: nextAttemptRecord.test_result,
      next_activity_id: nextAttemptRecord.activity_id,
      next_level_source_id: nextAttemptRecord.level_source_id,
    });
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
      time: finalHint.prev_time,
      attempt: finalHint.prev_attempt,
      test_result: finalHint.prev_test_result,
      activity_id: finalHint.prev_activity_id,
      level_source_id: finalHint.prev_level_source_id,
    });
  }

  // then, finalize all hints
  var hints = authoredHintUtils.finalizeHints_();

  // now, all hints should be finished and finalized. So submit them all
  // if (hints && hints.length) {
  $.ajax({
    url: url,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({hints: hints}),
    complete: function () {
      authoredHintUtils.clearFinishedHints_();
    }
  });
};

