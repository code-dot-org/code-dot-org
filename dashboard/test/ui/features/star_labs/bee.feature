Feature: Complete a bee level

Scenario: Complete Bee Conditions 4-5 Level 3
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/4/levels/4?noautoplay=true"
  And I wait for the lab page to fully load
  When I dismiss the login reminder
  # repeat to when run
  And I've initialized the workspace with bee blocks
  And I press "runButton"
  And I wait to see ".congrats"
  And element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 4."
