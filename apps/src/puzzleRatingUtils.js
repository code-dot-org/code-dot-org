/**
 * @overview A helper class for all actions associated with Puzzle
 * Ratings, aka the Fun-O-Meter.
 */

var puzzleRatingUtils = {};

module.exports = puzzleRatingUtils;

var dom = require('./dom');

/**
 * Construct the puzzle rating buttons themselves
 *
 * @returns {Element} div containing puzzle ratng buttons with attached
 *          click handlers
 */
puzzleRatingUtils.buildPuzzleRatingButtons = function () {
  var buttonContainer = document.createElement('div');
  buttonContainer.id = 'puzzleRatingButtons';
  buttonContainer.innerHTML = require('./templates/puzzleRating.html.ejs')();

  var buttons = buttonContainer.querySelectorAll('.puzzle-rating-btn');
  var buttonClickHandler = function () {
    for (var i = 0, button; (button = buttons[i]); i++) {
      if (button != this) {
        $(button).removeClass('enabled');
      }
    }
    $(this).toggleClass('enabled');
  };
  for (var i = 0, button; (button = buttons[i]); i++) {
    dom.addClickTouchEvent(button, buttonClickHandler);
  }

  return buttonContainer;
};

/**
 * @typedef {Object} PuzzleRating
 *
 * @property {number} script_id
 * @property {number} level_id
 * @property {number|string} rating - can be a number or an
 *           integer-parseable string
 */

/**
 * Private getter/localStorage proxy
 * @returns {PuzzleRating[]} - ratings
 */
puzzleRatingUtils.getPuzzleRatings_ = function () {
  var ratings = localStorage.getItem('puzzleRatings');
  try {
    return ratings ? JSON.parse(ratings) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Private setter/localStorage proxy
 * @param {PuzzleRating[]} ratings
 */
puzzleRatingUtils.setPuzzleRatings_ = function (ratings) {
  localStorage.setItem('puzzleRatings', JSON.stringify(ratings));
};

/**
 * Private deleter/localStorage proxy
 * @param {PuzzleRating} rating
 */
puzzleRatingUtils.removePuzzleRating_ = function (rating) {
  var ratings = puzzleRatingUtils.getPuzzleRatings_().filter(function (other) {
    var otherEqualsRating = (rating.level_id === other.level_id &&
      rating.script_id === other.script_id &&
      rating.rating === other.rating);
    return !otherEqualsRating;
  });
  puzzleRatingUtils.setPuzzleRatings_(ratings);
};

/**
 * Cache the selected rating, to be submitted (possibly with other
 * cached ratings) at some later point
 *
 * @param {jQuery} container - some element that contains the buttons
 * @param {Object} options - other data to be submitted along with the
 *        rating. Usually script_id and level_id
 */
puzzleRatingUtils.cachePuzzleRating = function (container, options) {
  var selectedButton = container.querySelector('.puzzle-rating-btn.enabled');
  if (selectedButton) {
    var rating = $.extend({}, options, { rating: selectedButton.getAttribute('data-value') });
    var ratings = puzzleRatingUtils.getPuzzleRatings_();
    ratings.push(rating);
    puzzleRatingUtils.setPuzzleRatings_(ratings);
  }
};

/**
 * POST the cached ratings to the given URL and clear the cache
 * @param {string} url
 */
puzzleRatingUtils.submitCachedPuzzleRatings = function (url) {
  var ratings = puzzleRatingUtils.getPuzzleRatings_();
  ratings.forEach(function (rating) {
    $.ajax({
      url: url,
      type: 'POST',
      data: rating,
      complete: function () {
        puzzleRatingUtils.removePuzzleRating_(rating);
      }
    });
  });
};
