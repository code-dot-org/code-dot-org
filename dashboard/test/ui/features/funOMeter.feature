@as_student
Feature: Fun-O-Meter

@no_circle
Scenario: Rate a Puzzle
  Given I am on "http://learn.code.org/s/allthethings/stage/4/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog

  When I drag block "4" to block "11" plus offset 35, 30
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

  Then I wait to see a dialog titled "Puzzle 5 of 5"
  And check that I am on "http://learn.code.org/s/allthethings/stage/4/puzzle/5"
  And I wait until "puzzleRatings" in localStorage equals "[]"

  Given I am on "http://learn.code.org/s/allthethings/stage/4/puzzle/4?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog

  When I wait to see "#runButton"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element "#puzzleRatingButtons" does not exist
