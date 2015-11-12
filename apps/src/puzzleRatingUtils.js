/**
 * @overview A helper class for all actions associated with Puzzle
 * Ratings, aka the Fun-O-Meter.
 */

var PuzzleRatingUtils = {};

module.exports = PuzzleRatingUtils;

var dom = require('./dom');

/**
 * Construct the puzzle rating buttons themselves
 *
 * @returns {jQuery} div containing puzzle ratng buttons with attached
 *          click handlers
 */
PuzzleRatingUtils.buildPuzzleRatingButtons = function () {
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
 * Private getter/localStorage proxy
 * @returns {Array} - ratings
 */
PuzzleRatingUtils.getPuzzleRatings_ = function () {
  var ratings = localStorage.getItem('puzzleRatings');
  try {
    return ratings ? JSON.parse(ratings) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Private setter/localStorage proxy
 * @param {Array} ratings
 */
PuzzleRatingUtils.setPuzzleRatings_ = function (ratings) {
  localStorage.setItem('puzzleRatings', JSON.stringify(ratings));
};

PuzzleRatingUtils.removePuzzleRating_ = function (rating) {
  var ratings = PuzzleRatingUtils.getPuzzleRatings_().filter(function(r){
    return !(r.level_id == rating.level_id && r.script_id == rating.script_id);
  });
  PuzzleRatingUtils.setPuzzleRatings_(ratings);
};

/**
 * Cache the selected rating, to be submitted (possibly with other
 * cached ratings) at some later point
 *
 * @param {jQuery} container - some element that contains the buttons
 * @param {Object} options - other data to be submitted along with the
 *        rating. Usually script_id and level_id
 *
 */
PuzzleRatingUtils.cachePuzzleRating = function (container, options) {
  var selectedButton = container.querySelector('.puzzle-rating-btn.enabled');
  if (selectedButton) {
    options.rating = selectedButton.getAttribute('data-value');
    var ratings = PuzzleRatingUtils.getPuzzleRatings_();
    ratings.push(options);
    PuzzleRatingUtils.setPuzzleRatings_(ratings);
  }
};

/**
 * POST the cached ratings to the given URL and clear the cache
 *
 * @param {string} url 
 */
PuzzleRatingUtils.submitCachedPuzzleRatings = function (url) {
  var ratings = PuzzleRatingUtils.getPuzzleRatings_();
  ratings.forEach(function (rating) {
    $.ajax({
      url: url,
      type: 'POST',
      data: rating,
      complete: function () {
        PuzzleRatingUtils.removePuzzleRating_(rating);
      }
    });
  });
};
