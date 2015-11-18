var authoredHintUtils = {};

module.exports = authoredHintUtils;

authoredHintUtils.getFromLocalStorage = function (key, defaultValue) {
  var result = localStorage.getItem(key);
  try {
    result = result ? JSON.parse(result) : defaultValue;
  } catch (e) {
    result = defaultValue;
  }
  return result;
};

authoredHintUtils.getUnfinishedHints = function () {
  return authoredHintUtils.getFromLocalStorage('unfinished_authored_hint_views', []);
};

authoredHintUtils.getFinishedHints = function () {
  return authoredHintUtils.getFromLocalStorage('finished_authored_hint_views', []);
};

authoredHintUtils.getLastAttemptRecord = function () {
  return authoredHintUtils.getFromLocalStorage('last_attempt_record', undefined);
};

authoredHintUtils.recordUnfinishedHint = function (hint) {
  var lastAttemptRecord = authoredHintUtils.getLastAttemptRecord();
  if (lastAttemptRecord) {
    hint = $.extend(hint, {
      prev_time: lastAttemptRecord.time,
      prev_attempt: lastAttemptRecord.attempt,
      prev_test_result: lastAttemptRecord.test_result,
      prev_activity_id: lastAttemptRecord.activity_id,
      prev_level_source_id: lastAttemptRecord.level_source_id,
    });
  }
  var unfinishedHintViews = authoredHintUtils.getUnfinishedHints();
  unfinishedHintViews.push(hint);
  localStorage.setItem('unfinished_authored_hint_views', JSON.stringify(unfinishedHintViews));
};

authoredHintUtils.recordFinishedHints = function (hints) {
  var finishedHintViews = authoredHintUtils.getFinishedHints();
  finishedHintViews = finishedHintViews.concat(hints);
  localStorage.setItem('finished_authored_hint_views', JSON.stringify(finishedHintViews));
};

authoredHintUtils.clearUnfinishedHints = function () {
  localStorage.setItem('unfinished_authored_hint_views', JSON.stringify([]));
};

authoredHintUtils.clearFinishedHints = function () {
  localStorage.setItem('finished_authored_hint_views', JSON.stringify([]));
};
authoredHintUtils.finishHints = function (nextAttemptRecord) {
  if (!nextAttemptRecord) {
    return;
  }
  localStorage.setItem('last_attempt_record', JSON.stringify(nextAttemptRecord));
  var unfinishedHintViews = authoredHintUtils.getUnfinishedHints();
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
  authoredHintUtils.recordFinishedHints(finishedHintViews);
};

authoredHintUtils.finalizeHints = function () {
  var finalAttemptRecord = authoredHintUtils.getLastAttemptRecord();
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

authoredHintUtils.submitHints = function (url) {
  // first, finish all unfinished hints
  var unfinishedHints = authoredHintUtils.getUnfinishedHints();
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
  var hints = authoredHintUtils.finalizeHints();

  // now, all hints should be finished and finalized. So submit them all
  // if (hints && hints.length) {
  $.ajax({
    url: url,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({hints: hints}),
    complete: function () {
      authoredHintUtils.clearFinishedHints();
    }
  });
};

