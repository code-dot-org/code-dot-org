@as_student
Feature: Fun-O-Meter

Scenario: Rate a Puzzle
  Given I am on "http://studio.code.org/s/allthethings/lessons/4/levels/4?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load

  When I drag block "4" to block "11" plus offset 35, 30
  And I press "runButton"
  And I wait to see ".congrats"

  Then element "#puzzleRatingButtons" is visible

  When I reload the page
  And I rotate to landscape
  And I wait for the page to fully load
  And I press "runButton"
  And I wait to see ".congrats"

  Then element "#puzzleRatingButtons" is visible

  When I press "like"
  And I press "continue-button"

  Then I wait until I am on "http://studio.code.org/s/allthethings/lessons/4/levels/5"
  And I wait until "puzzleRatings" in localStorage equals "[]"

  Given I am on "http://studio.code.org/s/allthethings/lessons/4/levels/4?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load

  When I press "runButton"
  And I wait to see ".congrats"

  Then element "#puzzleRatingButtons" does not exist
