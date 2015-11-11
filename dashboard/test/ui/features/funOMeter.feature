@no_mobile
@no_ie
@no_safari
Feature: Fun-O-Meter

Background:
  Given I am on "http://learn.code.org/"
  And I am a student

Scenario: Rate a Puzzle
  Given I am on "http://learn.code.org/s/allthethings/stage/2/puzzle/3?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog

  When I drag block "1" to block "4"
  And I drag block "1" to block "5"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element "#puzzleRatingButtons" is visible

  When I reload the page
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog
  And I wait to see "#runButton"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element "#puzzleRatingButtons" is visible

  When I press "like"
  And I press "continue-button"

  Then I get redirected to "/s/allthethings/stage/2/puzzle/4" via "none"

  Given I am on "http://learn.code.org/s/allthethings/stage/2/puzzle/3?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog

  When I wait to see "#runButton"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element "#puzzleRatingButtons" does not exist
