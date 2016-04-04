var TextMatch = function(id, levelId, standalone, answers, lastAttempt)
{
  this.id = id;

  this.levelId = levelId;

  this.standalone = standalone;

  this.lastAttempt = lastAttempt;

  this.answers = answers;

  $(document).ready($.proxy(function() {
    this.ready();
  }, this));
};

// called on $.ready
TextMatch.prototype.ready = function()
{
  // Pre-fill text area with previous response content
  $("#" + this.id + " textarea.response").val(this.lastAttempt);

  // If we are relying on the containing page's submission buttons/dialog, then
  // we need to provide a window.getResult function.
  if (this.standalone)
  {
    window.getResult = $.proxy(this.getResult, this);
  }
};

TextMatch.prototype.getCurrentAnswer = function()
{
  var response = $("#" + this.id + " textarea.response").val();

  return encodeURIComponent(response);
};

TextMatch.prototype.getLevelId = function()
{
  return this.levelId;
};

TextMatch.prototype.getResult = function()
{
  var response = $("#" + this.id + " textarea.response").val();
  var answers = this.answers;
  if (answers && answers.length > 0) {
    response = response.replace(/\s+/g, '');
    var result = answers.some(function(element) {
      return response == element.replace(/\s+/g, '');
    });
    return {
      response: encodeURIComponent(response),
      result: result
    };
  } else {
    // Always succeed for any non-empty response to open-ended question without answer(s)
    return {
      response: encodeURIComponent(response),
      result: response.length > 0
    };
  }
};
