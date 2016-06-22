import $ from 'jquery';

window.levelGroup = window.levelGroup || {levels: {}};

var TextMatch = window.TextMatch = function (levelId, id, app, standalone, answers, lastAttempt) {

  // The dashboard levelId.
  this.levelId = levelId;

  // The DOM id.
  this.id = id;

  // The dashboard app name.
  this.app = app;

  this.standalone = standalone;

  this.lastAttempt = lastAttempt;

  this.answers = answers;

  $(document).ready($.proxy(function () {
    this.ready();
  }, this));
};

// called on $.ready
TextMatch.prototype.ready = function () {
  // Pre-fill text area with previous response content
  $("#" + this.id + " textarea.response").val(this.lastAttempt);

  // If we are relying on the containing page's submission buttons/dialog, then
  // we need to provide a window.getResult function.
  if (this.standalone) {
    window.getResult = $.proxy(this.getResult, this);
  }

  var textarea = $("#" + this.id + " textarea.response");
  textarea.blur(function () {
    if (window.levelGroup && window.levelGroup.answerChangedFn) {
      window.levelGroup.answerChangedFn(this.levelId, true);
    }
  });
  textarea.on("input", null, null, function () {
    if (window.levelGroup && window.levelGroup.answerChangedFn) {
      window.levelGroup.answerChangedFn(this.levelId);
    }
  });
};

TextMatch.prototype.getAppName = function () {
  return this.app;
};

TextMatch.prototype.getResult = function () {
  var response = $("#" + this.id + " textarea.response").val();
  var answers = this.answers;
  if (answers && answers.length > 0) {
    response = response.replace(/\s+/g, '');
    var result = answers.some(function (element) {
      return response === element.replace(/\s+/g, '');
    });
    return {
      response: encodeURIComponent(response),
      result: result,
      valid: response.length > 0
    };
  } else {
    // Always succeed for any non-empty response to open-ended question without answer(s)
    return {
      response: encodeURIComponent(response),
      result: response.length > 0,
      valid: response.length > 0
    };
  }
};

TextMatch.prototype.lockAnswers = function () {
  // Not implemented
};

// called by external code that will display answer feedback
TextMatch.prototype.getCurrentAnswerFeedback = function () {
  // Not implemented
};
