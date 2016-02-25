
var Multi = function (id, levelId, standalone, type, answers, lastAttemptString) {

  this.id = id;

  this.levelId = levelId;

  // Whether this multi is the only puzzle on a page, or part of a group of them.
  this.standalone = standalone;

  // The index of the last selection.
  this.lastSelectionIndex = -1;

  // How many answers should there be?
  this.numAnswers = type; // "#{data['type']}" == 'multi2' ? 2 : 1;

  // A boolean array of the answers.  true is correct.
  this.answers = answers; // #{data['answers'].map {|answer| answer['correct']}};

  // A string of the last result.  Looks like "1" or "2,3".
  this.lastAttemptString = lastAttemptString; // #{@last_attempt.to_json};

  // Tracking which answers are currently selected.
  this.selectedAnswers = [];

  // Tracking which answers have been crossed out.
  this.crossedAnswers = [];

  var self = this;

  console.log("init multi", id);

  $(document).ready(function(){
    self.ready();
  });

};


Multi.prototype.enableButton = function(enable)
{
  $("#" + this.id + ' .submitButton').attr('disabled', !enable);
};

Multi.prototype.choiceClicked = function(button)
{
  var index = parseInt($(button).attr('index'));
  CDOSounds.play('click');

  //console.log("choiceclicked", index);

  this.clickItem(index);

  if (!this.standalone)
  {
    this.submitSelection(index);
  }
};

Multi.prototype.submitSelection = function()
{

};


Multi.prototype.clickItem = function(index)
{
  // If this button is already crossed, do nothing more.
  if (this.crossedAnswers.indexOf(index) !== -1)
  {
    return;
  }

  // If single answer, and this button is already selected, do nothing more.
  if (this.numAnswers == 1 && $.inArray(index, this.selectedAnswers) !== -1)
  {
    return;
  }

  // If multiple answer, and this button is already selected, deselect it.
  if (this.numAnswers > 1 && $.inArray(index, this.selectedAnswers) !== -1)
  {
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
  if (this.selectedAnswers.length > this.numAnswers)
  {
    var unselectIndex = this.selectedAnswers.pop();

    // Although don't uncheck it if it's already crossed out.
    if (this.crossedAnswers.indexOf(unselectIndex) === -1 )
    {
      $("#" + this.id + " #unchecked_" + unselectIndex).show();
      $("#" + this.id + " #checked_" + unselectIndex).hide();
    }
  }

  return true;
};

Multi.prototype.unclickItem = function(index)
{
  var selectedItemIndex = this.selectedAnswers.indexOf(index);
  this.selectedAnswers.splice(selectedItemIndex, 1);

  // Checked->unchecked.
  $("#" + this.id + " #unchecked_" + index).show();
  $("#" + this.id + " #checked_" + index).hide();
};

// called on $.ready
Multi.prototype.ready = function()
{
  console.log("multi ready", this.id);

  self = this;

  $("#" + this.id + " span.answerbutton").click($.proxy(function(event) {
    //console.log("answerbutton clicked", this.id);
    this.choiceClicked($(event.currentTarget));
  }, this));

  $("#" + this.id + ' #voteform img').on('dragstart', $.proxy(function(event) {
    // Prevent button images from being dragged, click the button instead.
    var button = $(event.currentTarget).parent().parent().parent();
    this.choiceClicked(button);
    event.preventDefault();
    event.stopPropagation();
  }, this));

  this.enableButton(false);

  // Pre-select previously submitted response if available.
  if (this.lastAttemptString)
  {
    var previousResult = this.lastAttemptString.replace(/[\[\]]/g, "").split(',');

    for (var i = 0; i < previousResult.length; i++)
    {
      this.clickItem(parseInt(previousResult[i]));
    }
  }
};

Multi.prototype.getCurrentAnswer = function()
{
  var answer;

  if (this.numAnswers == 1)
  {
    answer = this.lastSelectionIndex;
  }
  else
  {
    answer = this.selectedAnswers;
  }

  return answer;
};

Multi.prototype.getLevelId = function()
{
  return this.levelId;
};

// called by external result-posting code
Multi.prototype.getResult = function()
{
  var answer;
  var errorType = null;

  if (this.numAnswers > 1 && this.selectedAnswers.length !== this.numAnswers)
  {
    errorType = "toofew";
  }

  if (this.numAnswers == 1)
  {
    answer = this.lastSelectionIndex;
  }
  else
  {
    answer = this.selectedAnswers
  }

  return {
    "response": answer,
    "result": this.validateAnswers(),
    "errorType": errorType
  }
};

// called by $('.submitButton').click
Multi.prototype.submitButtonClick = function()
{
  // If the solution only takes one answer, and it's wrong, and it's not
  // already crossed out, then mark it as answered wrong.
  if (this.numAnswers == 1 &&
      this.crossedAnswers.indexOf(this.lastSelectionIndex) == -1 &&
      ! this.validateAnswers())
  {
    $("#" + this.id + " #checked_" + this.lastSelectionIndex).hide();
    $("#" + this.id + " #cross_" + this.lastSelectionIndex).show();
    this.crossedAnswers.unshift(this.lastSelectionIndex);
  }
};


Multi.prototype.validateAnswers = function()
{
  if (this.selectedAnswers.length == this.numAnswers)
  {
    for (var i = 0; i < this.numAnswers; i++)
    {
      if (! this.answers[this.selectedAnswers[i]])
      {
        return false
      }
    }
    return true;
  }
};
