import $ from 'jquery';
import {assert} from '../util/deprecatedChai';

var puzzleRatingUtils = require('@cdo/apps/puzzleRatingUtils');

describe('Puzzle Rating Utils', function() {
  var sampleRatings = [];

  beforeEach(function() {
    localStorage.removeItem('puzzleRatings');
    sampleRatings.push({
      script_id: 1,
      level_id: 1,
      rating: 1
    });
    sampleRatings.push({
      script_id: 1,
      level_id: 1,
      rating: 0
    });
    sampleRatings.push({
      script_id: 1,
      level_id: 2,
      rating: 1
    });
    sampleRatings.push({
      script_id: 1,
      level_id: 2,
      rating: 0
    });
  });

  describe('removePuzzleRating', function() {
    it('only removes the specified rating', function() {
      puzzleRatingUtils.setPuzzleRatings_(sampleRatings);
      for (var i = 0; i < sampleRatings.length; i++) {
        puzzleRatingUtils.removePuzzleRating_(sampleRatings[i]);
        assert.equal(
          localStorage.getItem('puzzleRatings'),
          JSON.stringify(sampleRatings.slice(i + 1))
        );
      }
    });
  });

  describe('cachePuzzleRating', function() {
    var container;
    beforeEach(function() {
      container = puzzleRatingUtils.buildPuzzleRatingButtons();
    });

    it('does nothing if no button is enabled', function() {
      puzzleRatingUtils.cachePuzzleRating(container, {});
      assert.equal(localStorage.getItem('puzzleRatings'), null);
    });

    it('saves the rating if a button is enabled', function() {
      container
        .querySelectorAll('.puzzle-rating-btn')[0]
        .classList.add('enabled');
      puzzleRatingUtils.cachePuzzleRating(container, {});
      assert.equal(
        localStorage.getItem('puzzleRatings'),
        JSON.stringify([{rating: '1'}])
      );
    });

    it("doesn' squash existing ratings", function() {
      puzzleRatingUtils.setPuzzleRatings_(sampleRatings);
      container
        .querySelectorAll('.puzzle-rating-btn')[0]
        .classList.add('enabled');
      puzzleRatingUtils.cachePuzzleRating(container, {});
      assert.equal(
        localStorage.getItem('puzzleRatings'),
        JSON.stringify(sampleRatings.concat([{rating: '1'}]))
      );
    });
  });

  describe('submitCachedPuzzleRatings', function() {
    var postCount, originalAjax;
    beforeEach(function() {
      postCount = 0;
      originalAjax = $.ajax;
    });

    afterEach(function() {
      $.ajax = originalAjax;
    });

    it('can submit multiple ratings', function() {
      $.ajax = function(opts) {
        postCount++;
        opts.complete();
      };
      puzzleRatingUtils.setPuzzleRatings_(sampleRatings);
      assert.equal(
        localStorage.getItem('puzzleRatings'),
        JSON.stringify(sampleRatings)
      );

      puzzleRatingUtils.submitCachedPuzzleRatings('/');
      assert.equal(localStorage.getItem('puzzleRatings'), '[]');
      assert.equal(postCount, sampleRatings.length);
    });

    it('only removes the ratings that have been submitted', function() {
      var complete;
      $.ajax = function(opts) {
        postCount++;
        complete = opts.complete;
      };
      puzzleRatingUtils.setPuzzleRatings_(sampleRatings.slice(0, 1));
      assert.equal(
        localStorage.getItem('puzzleRatings'),
        JSON.stringify(sampleRatings.slice(0, 1))
      );
      puzzleRatingUtils.submitCachedPuzzleRatings('/');
      assert.equal(
        localStorage.getItem('puzzleRatings'),
        JSON.stringify(sampleRatings.slice(0, 1))
      );
      puzzleRatingUtils.setPuzzleRatings_(sampleRatings.slice(0, 2));
      assert.equal(
        localStorage.getItem('puzzleRatings'),
        JSON.stringify(sampleRatings.slice(0, 2))
      );

      complete();
      assert.equal(
        localStorage.getItem('puzzleRatings'),
        JSON.stringify(sampleRatings.slice(1, 2))
      );
      assert.equal(postCount, 1);
    });
  });
});
