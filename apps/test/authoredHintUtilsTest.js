var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

var authoredHintUtils = require('@cdo/apps/authoredHintUtils');

describe("Authored Hint Utils", function () {
  
  var hintOne, hintTwo, record, recordTwo;

  beforeEach(function () {
    localStorage.removeItem('finished_authored_hint_views');
    localStorage.removeItem('unfinished_authored_hint_views');
    localStorage.removeItem('last_attempt_record');

    hintOne = {
      id: 'first',
      prev_time: 'something decent',
      next_time: 'something great',
      final_time: 'something awesome'
    };

    hintTwo ={
      id: 'second',
      prev_test_result: 'something okay',
      next_test_result: 'something fine',
      final_test_result: 'something rather poor'
    };

    record = {
      time: 'something standard',
      test_result: 'something grand',
      activity_id: 0,
      attempt: 1,
      level_source_id: 2
    };
    recordTwo = {
      time: 'something superb',
      test_result: 'something glorious',
      activity_id: 3,
      attempt: 4,
      level_source_id: 5
    };
  });

  describe('getFromLocalStorage_', function () {

    it('returns default when key doesn\' exist', function () {
      var defaultValue = "hello";
      var result = authoredHintUtils.getFromLocalStorage_('nonexistent_key', defaultValue);
      assert.equal(result, defaultValue);
    });

    it('can recover from bad JSON', function () {
      localStorage.setItem('bad_json', "yeah, this'll definitely break123");
      var defaultValue = "hello";
      var result = authoredHintUtils.getFromLocalStorage_('bad_json', defaultValue);
      assert.equal(result, defaultValue);
    });

    it('retrieves the set value if all else goes well', function () {
      var expectedValue = "hello!";
      localStorage.setItem('good_json', JSON.stringify(expectedValue));
      var result = authoredHintUtils.getFromLocalStorage_('good_json', undefined);
      assert.equal(result, expectedValue);
    });

  });

  describe('recordFinishedHints_', function () {
    it('simply appends whatever is given to whatever is in finished_authored_hint_views', function () {
      var hints = [1, 2, 3];
      localStorage.setItem('finished_authored_hint_views', JSON.stringify(hints));
      authoredHintUtils.recordFinishedHints_([4, 5]);
      var newHints = authoredHintUtils.getFinishedHints_();
      assert.deepEqual(newHints,  [1, 2, 3, 4, 5]);
    });
  });

  describe('finalizeHints_', function () {

    it('if no last_attempt_record is set, simply returns the finished hints', function () {
      var hints = [1, 2, 3];
      localStorage.setItem('finished_authored_hint_views', JSON.stringify(hints));
      var finalizedHints = authoredHintUtils.finalizeHints_();
      assert.deepEqual(finalizedHints,  [1, 2, 3]);
    });

    it('if last_attempt_record is set, extends all finished hints without overriding', function () {
      var hints = [hintOne, hintTwo];

      localStorage.setItem('finished_authored_hint_views', JSON.stringify(hints));
      localStorage.setItem('last_attempt_record', JSON.stringify(record));

      var finalizedHints = authoredHintUtils.finalizeHints_();
      assert.deepEqual(finalizedHints, [{
        id: 'first',
        prev_time: 'something decent',
        next_time: 'something great',
        final_time: 'something awesome',
        final_test_result: 'something grand',
        final_activity_id: 0,
        final_attempt: 1,
        final_level_source_id: 2
      }, {
        id: 'second',
        prev_test_result: 'something okay',
        next_test_result: 'something fine',
        final_test_result: 'something rather poor',
        final_time: 'something standard',
        final_activity_id: 0,
        final_attempt: 1,
        final_level_source_id: 2
      }]);
    });

  });

  describe('recordUnfinishedHint', function () {
    it('if no last_attempt_record is set, simply records the given value', function () {
      authoredHintUtils.recordUnfinishedHint(hintOne);
      var unfinishedHints = authoredHintUtils.getUnfinishedHints_();
      assert.deepEqual(unfinishedHints, [hintOne]);
    });

    it('if last_attempt_record is set, extends the given hint without overriding', function () {
      localStorage.setItem('last_attempt_record', JSON.stringify(record));

      authoredHintUtils.recordUnfinishedHint(hintOne);
      var unfinishedHints = authoredHintUtils.getUnfinishedHints_();

      assert.deepEqual(unfinishedHints, [{
        id: 'first',
        prev_time: 'something decent',
        next_time: 'something great',
        final_time: 'something awesome',
        prev_test_result: 'something grand',
        prev_activity_id: 0,
        prev_attempt: 1,
        prev_level_source_id: 2
      }]);
    });


  });

  describe('finishHints', function () {

    it('sets last_attempt_record', function () {
      assert.isNull(localStorage.getItem('last_attempt_record'));
      authoredHintUtils.finishHints(record);
      assert.equal(localStorage.getItem('last_attempt_record'), JSON.stringify(record));
    });

    it('clears unfinished_hints', function () {
      authoredHintUtils.recordUnfinishedHint(hintOne);
      assert.equal(localStorage.getItem('unfinished_authored_hint_views'), JSON.stringify([hintOne]));
      authoredHintUtils.finishHints(record);
      assert.equal(localStorage.getItem('unfinished_authored_hint_views'), JSON.stringify([]));
    });

    it('extends unfinished_hints and moves them to finished_hints', function () {
      authoredHintUtils.recordUnfinishedHint(hintOne);
      assert.equal(localStorage.getItem('unfinished_authored_hint_views'), JSON.stringify([hintOne]));
      authoredHintUtils.finishHints(record);
      var finishedHints = authoredHintUtils.getFinishedHints_();

      assert.deepEqual(finishedHints, [{
        id: 'first',
        prev_time: 'something decent',
        next_time: 'something great',
        final_time: 'something awesome',
        next_test_result: 'something grand',
        next_activity_id: 0,
        next_attempt: 1,
        next_level_source_id: 2
      }]);
    });

  });

  describe('submitHints', function () {

    it('finishes all unfinished hints using the last hint', function () {
      $.ajax = function () {};

      localStorage.setItem('last_attempt_record', JSON.stringify(record));
      authoredHintUtils.recordUnfinishedHint(hintOne);

      localStorage.setItem('last_attempt_record', JSON.stringify(recordTwo));
      authoredHintUtils.recordUnfinishedHint(hintTwo);

      authoredHintUtils.submitHints('/url');

      var finishedHints = authoredHintUtils.getFinishedHints_();

      assert.deepEqual(finishedHints, [{
        id: 'first',
        final_time: 'something awesome',
        next_activity_id: 3,
        next_attempt: 4,
        next_level_source_id: 5,
        next_test_result: 'something okay',
        next_time: 'something great',
        prev_activity_id: 0,
        prev_attempt: 1,
        prev_level_source_id: 2,
        prev_test_result: 'something grand',
        prev_time: 'something decent',
      }, {
        id: 'second',
        final_test_result: 'something rather poor',
        next_activity_id: 3,
        next_attempt: 4,
        next_level_source_id: 5,
        next_test_result: 'something fine',
        next_time: 'something superb',
        prev_activity_id: 3,
        prev_attempt: 4,
        prev_level_source_id: 5,
        prev_test_result: 'something okay',
        prev_time: 'something superb',
      }]);

    });

    it('posts all finalized hints at once', function () {
      var data;
      $.ajax = function (options) {
        data = options.data;
      };
      var hints = [1, 2, 3];
      localStorage.setItem('finished_authored_hint_views', JSON.stringify(hints));
      var finalizedHints = authoredHintUtils.finalizeHints_();

      authoredHintUtils.submitHints('/url');

      assert.deepEqual(data, JSON.stringify({
        hints: finalizedHints
      }));
    });

    it('clears finished hints after successful post', function () {
      $.ajax = function (options) {
        options.complete();
      };
      authoredHintUtils.recordUnfinishedHint(hintOne);
      authoredHintUtils.finishHints(record);
      authoredHintUtils.submitHints('/url');
      var finishedHints = authoredHintUtils.getFinishedHints_();
      assert.deepEqual(finishedHints, []);
    });

  });

});
