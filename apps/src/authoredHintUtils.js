var authoredHintUtils = {};

module.exports = authoredHintUtils;

authoredHintUtils.getUnfinishedHints = function () {
  var unfinishedHintViews = localStorage.getItem('unfinished_authored_hint_views');
  try {
    unfinishedHintViews = unfinishedHintViews ? JSON.parse(unfinishedHintViews) : [];
  } catch (e) {
    unfinishedHintViews = [];
  }
  return unfinishedHintViews;
};

authoredHintUtils.getFinishedHints = function () {
  var finishedHintViews = localStorage.getItem('finished_authored_hint_views');
  try {
    finishedHintViews = finishedHintViews ? JSON.parse(finishedHintViews) : [];
  } catch (e) {
    finishedHintViews = [];
  }
  return finishedHintViews;
};

authoredHintUtils.recordUnfinishedHint = function (hint) {
  var unfinishedHintViews = authoredHintUtils.getUnfinishedHints();
  unfinishedHintViews.push(hint);
  localStorage.setItem('unfinished_authored_hint_views', JSON.stringify(unfinishedHintViews));
};

authoredHintUtils.recordFinishedHints = function (hints) {
  var finishedHintViews = authoredHintUtils.getFinishedHints();
  //finishedHintViews.push.apply(this, hints);
  finishedHintViews = finishedHintViews.concat(hints);
  localStorage.setItem('finished_authored_hint_views', JSON.stringify(finishedHintViews));
};

authoredHintUtils.clearUnfinishedHints = function () {
  localStorage.setItem('unfinished_authored_hint_views', JSON.stringify([]));
};

authoredHintUtils.clearFinishedHints = function () {
  localStorage.setItem('finished_authored_hint_views', JSON.stringify([]));
};

authoredHintUtils.finishHints = function (next) {
  if (!next) {
    return;
  }
  localStorage.setItem('most_recent_final_thing', JSON.stringify(next));
  var unfinishedHintViews = authoredHintUtils.getUnfinishedHints();
  authoredHintUtils.clearUnfinishedHints();
  var finishedHintViews = unfinishedHintViews.map(function(hint){
    hint = $.extend(hint, {
      next_time: next.time,
      next_attempt: next.attempt,
      next_test_result: next.test_result,
      next_activity_id: next.activity_id,
    });
    return hint;
  });
  authoredHintUtils.recordFinishedHints(finishedHintViews);
};

authoredHintUtils.finalizeHints = function () {
  var final_thing;
  try {
    final_thing = JSON.parse(localStorage.getItem('most_recent_final_thing'));
  } catch (e) {
    // pass
  }
  localStorage.removeItem('most_recent_final_thing');
  var hints = authoredHintUtils.getFinishedHints();
  if (final_thing) {
    hints = hints.map(function(hint){
      hint = $.extend(hint, {
        final_time: final_thing.time,
        final_attempt: final_thing.attempt,
        final_test_result: final_thing.test_result,
        final_activity_id: final_thing.activity_id,
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
    authoredHintUtils.finishHints(finalHint);
  }

  // then, finalize all hints
  var hints = authoredHintUtils.finalizeHints();

  // now, all hints should be finished and finalized. So submit them all
  // if (hints && hints.length) {
  $.ajax({
    url: url,
    method: 'POST',
    data: {
      //hints: JSON.stringify(hints)
      hints: hints
    },
    complete: function () {
      authoredHintUtils.clearFinishedHints();
    }
  });
};

