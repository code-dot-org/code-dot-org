var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

var PuzzleRatingUtils = require('@cdo/apps/puzzleRatingUtils');

describe("Puzzle Rating Utils", function () {
  var sampleRatings = [];

  beforeEach(function () {
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

  describe('buildPuzzleRatingButtons', function () {
  });

  describe('getPuzzleRatings', function () {
  });

  describe('setPuzzleRatings', function () {
  });

  describe('removePuzzleRating', function () {
    it('only removes the specified rating', function () {
      PuzzleRatingUtils.setPuzzleRatings_(sampleRatings);
      for (var i = 0; i < sampleRatings.length; i++) {
        PuzzleRatingUtils.removePuzzleRating_(sampleRatings[i]);
        assert.equal(localStorage.getItem('puzzleRatings'), JSON.stringify(sampleRatings.slice(i + 1)));
      }
    });
  });

  describe('cachePuzzleRating', function () {
    var container;
    beforeEach(function () {
      container = PuzzleRatingUtils.buildPuzzleRatingButtons();
    });

    it('does nothing if no button is enabled', function () {
      PuzzleRatingUtils.cachePuzzleRating(container, {});
      assert.equal(localStorage.getItem('puzzleRatings'), null);
    });

    it('saves the rating if a button is enabled', function () {
      container.querySelectorAll('.puzzle-rating-btn')[0].classList.add('enabled');
      PuzzleRatingUtils.cachePuzzleRating(container, {});
      assert.equal(localStorage.getItem('puzzleRatings'), JSON.stringify([{rating: "1"}]));
    });

    it('doesn\' squash existing ratings', function () {
      PuzzleRatingUtils.setPuzzleRatings_(sampleRatings);
      container.querySelectorAll('.puzzle-rating-btn')[0].classList.add('enabled');
      PuzzleRatingUtils.cachePuzzleRating(container, {});
      assert.equal(localStorage.getItem('puzzleRatings'), JSON.stringify(sampleRatings.concat([{rating: "1"}])));
    });
  });

  describe('submitCachedPuzzleRatings', function () {
    var postCount;
    beforeEach(function(){
      postCount = 0;
    });

    it('can submit multiple ratings', function () {
      $.ajax = function(opts) {
        postCount++;
        opts.complete();
      };
      PuzzleRatingUtils.setPuzzleRatings_(sampleRatings);
      assert.equal(localStorage.getItem('puzzleRatings'), JSON.stringify(sampleRatings));

      PuzzleRatingUtils.submitCachedPuzzleRatings("/");
      assert.equal(localStorage.getItem('puzzleRatings'), "[]");
      assert.equal(postCount, sampleRatings.length);
    });

    it('only removes the ratings that have been submitted', function () {
      var complete;
      $.ajax = function(opts) {
        postCount++;
        complete = opts.complete;
      };
      PuzzleRatingUtils.setPuzzleRatings_(sampleRatings.slice(0, 1));
      assert.equal(localStorage.getItem('puzzleRatings'), JSON.stringify(sampleRatings.slice(0, 1)));
      PuzzleRatingUtils.submitCachedPuzzleRatings("/");
      assert.equal(localStorage.getItem('puzzleRatings'), JSON.stringify(sampleRatings.slice(0, 1)));
      PuzzleRatingUtils.setPuzzleRatings_(sampleRatings.slice(0, 2));
      assert.equal(localStorage.getItem('puzzleRatings'), JSON.stringify(sampleRatings.slice(0, 2)));

      complete();
      assert.equal(localStorage.getItem('puzzleRatings'), JSON.stringify(sampleRatings.slice(1, 2)));
      assert.equal(postCount, 1);
    });

  });

});
