/**
 * @overview helper class to manage the state of the Authored Hint UI.
 * Used exclusively by StudioApp.
 */

import React from 'react';
import ReactDOM from 'react-dom';
var authoredHintUtils = require('./authoredHintUtils');
var Lightbulb = require('./templates/Lightbulb');

import { setHasAuthoredHints } from './redux/instructions';
import {
  enqueueHints,
  showNextHint,
  displayMissingBlockHints
} from './redux/authoredHints';

var AuthoredHints = function (studioApp) {
  this.studioApp_ = studioApp;

  /**
   * @type {number}
   */
  this.scriptId_ = undefined;

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
  return this.studioApp_.reduxStore.getState().authoredHints.unseenHints;
};

/**
 * @return {AuthoredHints[]}
 */
AuthoredHints.prototype.getSeenHints = function () {
  return this.studioApp_.reduxStore.getState().authoredHints.seenHints;
};

/**
 * Creates contextual hints for the specified blocks and adds them to
 * the queue of hints to display. Triggers an animation on the hint
 * lightbulb if the queue has changed.
 * @param {Object[]} blocks @see authoredHintUtils.createContextualHintsFromBlocks
 */
AuthoredHints.prototype.displayMissingBlockHints = function (blocks) {
  var newContextualHints = authoredHintUtils.createContextualHintsFromBlocks(blocks);

  let oldNumHints = this.getUnseenHints().length;
  this.studioApp_.reduxStore.dispatch(displayMissingBlockHints(newContextualHints));
  let newNumHints = this.getUnseenHints().length;

  this.updateLightbulbDisplay_(oldNumHints !== newNumHints);

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
  this.scriptId_ = scriptId;
  this.levelId_ = levelId;

  if (hints && hints.length > 0) {
    this.studioApp_.reduxStore.dispatch(enqueueHints(hints));
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

AuthoredHints.prototype.showNextHint = function () {
  if (this.getUnseenHints().length === 0) {
    return;
  }
  const hint = this.getUnseenHints()[0];
  this.recordUserViewedHint_(hint);
  return hint;
};

/**
 * Mostly a passthrough to authoredHintUtils.recordUnfinishedHint. Also
 * marks the given hint as seen.
 * @param {AuthoredHint} hint
 */
AuthoredHints.prototype.recordUserViewedHint_ = function (hint) {
  this.studioApp_.reduxStore.dispatch(showNextHint(hint));
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
  if (hintCount > 0 && !document.body.contains(this.lightbulb) && this.promptIcon) {
    this.promptIcon.parentNode.className += ' authored_hints';
    this.promptIcon.parentNode.insertBefore(this.lightbulb, this.promptIcon);
  }

  ReactDOM.render(
    <Lightbulb
      count={hintCount}
      lit={hintCount > 0}
      shouldAnimate={shouldAnimate}
    />,
    this.lightbulb);
};
