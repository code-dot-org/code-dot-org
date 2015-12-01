/**
 * @overview helper class to manage the state of the Authored Hint UI.
 * Used exclusively by StudioApp.
 */

var dom = require('./dom');
var HintSelect = require('./templates/hintSelect.jsx');
var authoredHintUtils = require('./authoredHintUtils');
var lightbulbSVG = require('./templates/lightbulb.svg.ejs')();
var lightbulbDimSVG = require('./templates/lightbulb_dim.svg.ejs')();

var AuthoredHints = function (studioApp) {
  this.studioApp_ = studioApp;

  /**
   * @typedef {Object} AuthoredHint
   * @property {string} content
   * @property {string} hintId
   * @property {string} hintClass
   * @property {string} hintType
   * @property {boolean} alreadySeen
   */
  /**
   * @type {!AuthoredHint[]}
   */
  this.hints_ = [];

  /**
   * @type {number}
   */
  this.scrptId_ = undefined;

  /**
   * @type {number}
   */
  this.levelId_ = undefined;

  /**
   * @type {Element}
   */
  this.lightbulb = document.createElement('div');
  this.lightbulb.id = "lightbulb";
};

module.exports = AuthoredHints;

/**
 * @return {AuthoredHints[]}
 */
AuthoredHints.prototype.getUnseenHints = function () {
  var hints = this.hints_ || [];
  return hints.filter(function (hint) {
    return hint.alreadySeen === false;
  });
};

/**
 * @return {AuthoredHints[]}
 */
AuthoredHints.prototype.getSeenHints = function () {
  var hints = this.hints_ || [];
  return hints.filter(function (hint) {
    return hint.alreadySeen === true;
  });
};

/**
 * @param {Object} response
 */
AuthoredHints.prototype.finishHints = function (response) {
  authoredHintUtils.finishHints({
    time: ((new Date().getTime()) - this.studioApp_.initTime),
    attempt: this.studioApp_.attempts,
    testResult: this.studioApp_.lastTestResult,
    activityId: response && response.activity_id,
    levelSourceId: response && response.level_source_id,
  });
};

/**
 * @param {string} url
 */
AuthoredHints.prototype.submitHints = function (url) {
  authoredHintUtils.submitHints(url);
};

/**
 * @param {AuthoredHint[]} hints
 * @param {number} scriptId
 * @param {number} levelId
 */
AuthoredHints.prototype.init = function (hints, scriptId, levelId) {
  this.hints_ = hints;
  this.scriptId_ = scriptId;
  this.levelId_ = levelId;
};

/**
 * Sets up the Authored Hints UI; decorates the specified element with a
 * lightbulb image and hint counter, and adds a click handler to show
 * a qtip for the next unseen hint.
 *
 * @param {Element} promptIcon - the page element to "decorate" with the
 *        lightbulb
 * @param {Element} clickTarget
 * @param {function} callback - a StudioApp function to be treated as
 *        the "default" action when there are no unseen hints. 
 */
AuthoredHints.prototype.display = function (promptIcon, clickTarget, callback) {
  if (this.hints_ && this.hints_.length) {
    $(promptIcon.parentNode).addClass('authored_hints');
    this.updateLightbulbDisplay_();

    promptIcon.parentNode.insertBefore(this.lightbulb, promptIcon);

    clickTarget.addEventListener('click', function () {
      var hintsToShow = this.getUnseenHints(); 
      if (hintsToShow.length > 0) {
        this.showHint_(hintsToShow[0], callback);
      } else {
        callback();
      }
    }.bind(this));
  } else {
    dom.addClickTouchEvent(clickTarget, callback);
  }
};

/**
 * Mostly a passthrough to authoredHintUtils.recordUnfinishedHint. Also
 * marks the given hint as seen.
 * @param {AuthoredHint} hint
 */
AuthoredHints.prototype.recordUserViewedHint_ = function (hint) {
  hint.alreadySeen = true;
  this.updateLightbulbDisplay_();

  authoredHintUtils.recordUnfinishedHint({
    // level info
    scriptId: this.scriptId_,
    levelId: this.levelId_,

    // hint info
    hintId: hint.hintId,
    hintClass: hint.hintClass,
    hintType: hint.hintType,
  });
};

/**
 * Adjusts the displayed number of unseen hints. Dims the lightbulb
 * image if there are no hints.
 */
AuthoredHints.prototype.updateLightbulbDisplay_ = function () {
  var hintCount = this.getUnseenHints().length; 
  if (hintCount === 0) {
    this.lightbulb.innerHTML = lightbulbDimSVG;
  } else {
    this.lightbulb.innerHTML = lightbulbSVG;
    this.lightbulb.querySelector('#hintCount').textContent = hintCount;
  }
};

/**
 * Render a qtip popup containing an interface which gives the user the
 * option of viewing the instructions for the level (along with all
 * previously-viewed hints) or viewing a new hint.
 * @param {AuthoredHint} hint
 * @param {function} callback
 */
AuthoredHints.prototype.showHint_ = function (hint, callback) {
  $('#prompt-icon').qtip({
    content: {
      text: function(html, api) {
        var container = document.createElement('div');

        var element = React.createElement(HintSelect, {
          showInstructions: function () {
            api.destroy();
            callback();
          }.bind(this),
          showHint: function () {
            api.set('content.text', hint.content);
            this.recordUserViewedHint_(hint);
          }.bind(this),
        });

        React.render(element, container);

        return container;
      }.bind(this),
      title: {
        button: $('<div class="tooltip-x-close"/>')
      }
    },
    style: {
      classes: "cdo-qtips",
      tip: {
        width: 20,
        height: 20
      }
    },
    position: {
      my: "bottom left",
      at: "top right"
    },
    hide: {
      event: 'unfocus'
    },
    show: false // don't show on mouseover
  }).qtip('show');
};

