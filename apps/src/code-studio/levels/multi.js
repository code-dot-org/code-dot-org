import $ from 'jquery';
import { registerGetResult, onAnswerChanged } from './codeStudioLevels';

var Multi = function (levelId, id, app, standalone, numAnswers, answers, answersFeedback, lastAttemptString, containedMode) {

  // The dashboard levelId.
  this.levelId = levelId;

  // The DOM id.
  this.id = id;

  // The dashboard app name.
  this.app = app;

  // Whether this multi is the only puzzle on a page, or part of a group of them.
  this.standalone = standalone;

  // The index of the last selection.
  this.lastSelectionIndex = -1;

  // How many answers should there be?
  this.numAnswers = numAnswers;

  // A boolean array of the answers.  true is correct.
  this.answers = answers;

  // An array of the feedback strings for each of the answers (correct or incorrect).
  this.answersFeedback = answersFeedback;

  // A string of the last result.  Looks like "1" or "2,3".
  this.lastAttemptString = lastAttemptString;

  // Whether this multi is running in contained mode.
  this.containedMode = containedMode;

  // Tracking which answers are currently selected.
  this.selectedAnswers = [];

  // Tracking which answers have been crossed out.
  this.crossedAnswers = [];

  this.submitAllowed = true;

  $(document).ready(() => this.ready());
};


Multi.prototype.enableButton = function (enable) {
  $("#" + this.id + ' .submitButton').attr('disabled', !enable);
};

Multi.prototype.choiceClicked = function (button) {
  if (!this.submitAllowed) {
    return;
  }

  var index = parseInt($(button).attr('index'));
  window.CDOSounds.play('click');

  this.clickItem(index);

  onAnswerChanged(this.levelId, true);
};


Multi.prototype.clickItem = function (index) {
  // If this button is already crossed, do nothing more.
  if (this.crossedAnswers.indexOf(index) !== -1) {
    return;
  }

  // If single answer, and this button is already selected, do nothing more.
  if (this.numAnswers === 1 && $.inArray(index, this.selectedAnswers) !== -1) {
    return;
  }

  // If multiple answer, and this button is already selected, deselect it.
  if (this.numAnswers > 1 && $.inArray(index, this.selectedAnswers) !== -1) {
    this.unclickItem(index);
    return;
  }

  this.enableButton(true);

  this.lastSelectionIndex = index;

  // Unchecked->checked.
  $("#" + this.id + " #unchecked_" + index).hide();
  $("#" + this.id + " #checked_" + index).show();

  // Add this answer to the list of selected answers.
  this.selectedAnswers.unshift(index);

  // Unselect previously selected answer if there are now too many selected.
  if (this.selectedAnswers.length > this.numAnswers) {
    var unselectIndex = this.selectedAnswers.pop();

    // Although don't uncheck it if it's already crossed out.
    if (this.crossedAnswers.indexOf(unselectIndex) === -1 ) {
      $("#" + this.id + " #unchecked_" + unselectIndex).show();
      $("#" + this.id + " #checked_" + unselectIndex).hide();
    }
  }

  return true;
};

Multi.prototype.unclickItem = function (index) {
  var selectedItemIndex = this.selectedAnswers.indexOf(index);
  this.selectedAnswers.splice(selectedItemIndex, 1);

  // Checked->unchecked.
  $("#" + this.id + " #unchecked_" + index).show();
  $("#" + this.id + " #checked_" + index).hide();
};

// called on $.ready
Multi.prototype.ready = function () {
  // Are we read-only?  This can be because we're a teacher OR because an answer
  // has been previously submitted.
  if (window.appOptions.readonlyWorkspace && !this.containedMode) {
    // hide the Submit buttons.
    $('.submitButton').hide();

    // grey out the marks
    $("#" + this.id +'.item-mark').css('opacity', 0.5);

    this.submitAllowed = false;

    // Are we a student viewing their own previously-submitted work?
    if (window.appOptions.submitted) {
      // show the Unsubmit button.
      $("#" + this.id +' .unsubmitButton').show();
    }
  }

  $("#" + this.id + " .answerbutton").click($.proxy(function (event) {
    //console.log("answerbutton clicked", this.id);
    this.choiceClicked($(event.currentTarget));
  }, this));

  $("#" + this.id + ' #voteform img').on('dragstart', $.proxy(function (event) {
    // Prevent button images from being dragged, click the button instead.
    var button = $(event.currentTarget).parent().parent().parent();
    this.choiceClicked(button);
    event.preventDefault();
    event.stopPropagation();
  }, this));

  this.enableButton(false);

  // If we are relying on the containing page's submission buttons/dialog, then
  // we need to provide a getResult function.
  if (this.standalone) {
    registerGetResult(this.getResult.bind(this));
  }

  // Pre-select previously submitted response if available.
  if (this.lastAttemptString) {
    var previousResult = this.lastAttemptString.split(',');

    for (var i = 0; i < previousResult.length; i++) {
      this.clickItem(parseInt(previousResult[i]));
    }
  }

  if (this.standalone) {
    $('.submitButton').click($.proxy(this.submitButtonClick, this));
  }
};

Multi.prototype.lockAnswers = function () {
  $("#" + this.id + " .answerbutton").addClass('lock-answers');
};

Multi.prototype.getAppName = function () {
  return this.app;
};

// called by external result-posting code
Multi.prototype.getResult = function (dontAllowSubmit) {
  var answer;
  var errorType = null;
  var valid;

  if (this.numAnswers > 1 && this.selectedAnswers.length !== this.numAnswers) {
    errorType = "toofew";
  }

  if (this.numAnswers === 1) {
    answer = this.lastSelectionIndex;
    valid = answer !== -1;
  } else {
    answer = this.selectedAnswers;
    valid = this.selectedAnswers.length === this.numAnswers;
  }


  var result;
  var submitted;

  if (!dontAllowSubmit && (window.appOptions.level.submittable || this.forceSubmittable)) {
    result = true;
    submitted = true;
  } else {
    result = this.validateAnswers();
    submitted = false;
  }

  return {
    response: answer,
    result: result,
    errorType: errorType,
    submitted: submitted,
    valid: valid
  };
};

// called by external code that will display answer feedback
Multi.prototype.getCurrentAnswerFeedback = function () {
  if (!this.answersFeedback) {
    return;
  }
  if (this.selectedAnswers.length === 0) {
    return;
  }
  var feedbackStrings = [];
  for (var i = 0; i < this.selectedAnswers.length; i++) {
    feedbackStrings.push(this.answersFeedback[this.selectedAnswers[i]]);
  }
  return feedbackStrings.join('\n');
};

// This behavior should only be available when this is a standalone Multi.
Multi.prototype.submitButtonClick = function () {
  // Don't show right/wrong answers for submittable.
  if (window.appOptions.level.submittable || this.forceSubmittable) {
    return;
  }

  // If the solution only takes one answer, and it's wrong, and it's not
  // already crossed out, then mark it as answered wrong.
  if (this.numAnswers === 1 &&
      this.crossedAnswers.indexOf(this.lastSelectionIndex) === -1 &&
      !this.validateAnswers()) {
    $("#" + this.id + " #checked_" + this.lastSelectionIndex).hide();
    $("#" + this.id + " #cross_" + this.lastSelectionIndex).show();
    this.crossedAnswers.unshift(this.lastSelectionIndex);
  }
};

/**
 * @returns {boolean} True if this Multi has been provided with answers, and the
 *   selected answer(s) are the correct one(s).
 */
Multi.prototype.validateAnswers = function () {
  if (!this.answers) {
    return false;
  }

  if (this.selectedAnswers.length === this.numAnswers) {
    for (var i = 0; i < this.numAnswers; i++) {
      if (!this.answers[this.selectedAnswers[i]]) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export default Multi;
