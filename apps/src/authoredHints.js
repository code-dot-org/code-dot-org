/**
 * @overview helper class to manage the state of the Authored Hint UI.
 * Used exclusively by StudioApp.
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
var dom = require('./dom');
var msg = require('./locale');
var HintsDisplay = require('./templates/instructions/HintsDisplay');
var HintDialogContent = require('./templates/instructions/HintDialogContent');
var authoredHintUtils = require('./authoredHintUtils');
var Lightbulb = require('./templates/Lightbulb');
import { setHasAuthoredHints } from './redux/instructions';

/**
 * For some of our skins, our partners don't want the characters appearing to
 * say anything they haven't approved. For these, we will make it so that our
 * hint callout doesnt have a tip
 * @param {string} skin - Name of the skin
 * @returns {boolean}
 */
function shouldDisplayTips(skin) {
  /*eslint-disable no-fallthrough*/
  switch (skin) {
    case 'infinity':
    case 'anna':
    case 'elsa':
    case 'craft':
    // star wars
    case 'hoc2015':
    case 'hoc2015x':
      return false;
  }
  /*eslint-enable no-fallthrough*/
  return true;
}

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
  this.contextualHints_ = [];

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
  var hints = this.contextualHints_.concat(this.hints_ || []);
  return hints.filter(function (hint) {
    return hint.alreadySeen === false;
  });
};

/**
 * @return {AuthoredHints[]}
 */
AuthoredHints.prototype.getSeenHints = function () {
  var hints = this.contextualHints_.concat(this.hints_ || []);
  return hints.filter(function (hint) {
    return hint.alreadySeen === true;
  });
};

/**
 * Creates contextual hints for the specified blocks and adds them to
 * the queue of hints to display. Triggers an animation on the hint
 * lightbulb if the queue has changed.
 * @param {Object[]} blocks @see authoredHintUtils.createContextualHintsFromBlocks
 */
AuthoredHints.prototype.displayMissingBlockHints = function (blocks) {
  var newContextualHints = authoredHintUtils.createContextualHintsFromBlocks(blocks);

  // if the set of contextual hints currently being shown has changed,
  // animate the hint display lightbulb when we update it.
  var oldContextualHints = this.contextualHints_.filter(function (hint) {
    return hint.alreadySeen === false;
  });
  var animateLightbulb = oldContextualHints.length !== newContextualHints.length;

  this.contextualHints_ = newContextualHints;
  this.updateLightbulbDisplay_(animateLightbulb);

  if (newContextualHints.length > 0 && this.getUnseenHints().length > 0) {
    this.studioApp_.reduxStore.dispatch(setHasAuthoredHints(true));
  }
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

  if (hints && hints.length > 0) {
    this.studioApp_.reduxStore.dispatch(setHasAuthoredHints(true));
  }
};

/**
 * Sets up the Authored Hints UI; decorates the specified element with a
 * lightbulb image and hint counter
 *
 * @param {Element} promptIcon - the page element to "decorate" with the
 *        lightbulb
 */
AuthoredHints.prototype.display = function (promptIcon) {
  this.promptIcon = promptIcon;
  this.updateLightbulbDisplay_();
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
 * image if there are no hints. Optionally plays a simple CSS animation
 * to highlight the update.
 * @param {boolean} shouldAnimate defaults to false
 */
AuthoredHints.prototype.updateLightbulbDisplay_ = function (shouldAnimate) {
  shouldAnimate = shouldAnimate || false;

  var hintCount = this.getUnseenHints().length;

  // If we have hints to show, but are not in the DOM, insert ourselves
  // into the DOM. This can happen when contextual hints appear in a
  // level that was initialized with no hints. Note that we can be in
  // the DOM and have zero hints to show, and that's just fine.
  if (hintCount > 0 && !document.body.contains(this.lightbulb)) {
    this.promptIcon.parentNode.className += ' authored_hints';
    this.promptIcon.parentNode.insertBefore(this.lightbulb, this.promptIcon);
  }

  ReactDOM.render(
    <Lightbulb
        count={hintCount}
        lit={hintCount > 0}
        shouldAnimate={shouldAnimate}/>,
    this.lightbulb);
};

/**
 * @returns {React.Element}
 */
AuthoredHints.prototype.getHintsDisplay = function () {
  return (
    <HintsDisplay
      hintReviewTitle={msg.hintReviewTitle()}
      seenHints={this.getSeenHints()}
      unseenHints={this.getUnseenHints()}
      viewHint={this.showNextHint_.bind(this)}/>
  );
};

AuthoredHints.prototype.showNextHint_ = function () {
  this.showHint_(this.getUnseenHints()[0]);
};

/**
 * Render a qtip popup containing an interface which gives the user the
 * option of viewing the instructions for the level (along with all
 * previously-viewed hints) or viewing a new hint.
 * @param {AuthoredHint} hint
 * @param {function} callback
 */
AuthoredHints.prototype.showHint_ = function (hint, callback) {
  let position = {
    my: "bottom left",
    at: "top right"
  };

  if (this.studioApp_.reduxStore.getState().pageConstants.instructionsInTopPane) {
    // adjust position when hints are on top
    position = {
      my: "middle left",
      at: "middle right"
    };
  }

  $('.modal').modal('hide');
  $(this.promptIcon).qtip({
    events: {
      visible: function (event, api) {
        var container = api.get("content.text");

        ReactDOM.render(<HintDialogContent
          content={hint.content}
          block={hint.block}
        />, container, function () {
          api.reposition();
        });

        $(container).find('img').on('load', function (e) {
          api.reposition(e);
        });
        this.recordUserViewedHint_(hint);
      }.bind(this)
    },
    content: {
      text: document.createElement('div'),
      title: {
        button: $('<div class="tooltip-x-close"/>')
      }
    },
    style: {
      classes: "cdo-qtips qtip-authored-hint",
      tip: shouldDisplayTips(this.studioApp_.skin.id) ? {
        width: 20,
        height: 20
      } : false
    },
    position: position,
    hide: {
      event: 'unfocus'
    },
    show: false // don't show on mouseover
  }).qtip('show');
};
