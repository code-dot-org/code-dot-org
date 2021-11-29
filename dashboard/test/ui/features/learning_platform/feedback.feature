@as_student
Feature: Recommended/Required Blocks Feedback

Scenario: Solve without recommended blocks
  Given I am on "http://studio.code.org/s/allthethings/lessons/4/levels/5?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load

  When I press "runButton"
  And I wait to see ".congrats"

  Then element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Puzzle 5. (But you could use a different block for stronger code.)"
  And element "#hint-request-button" is visible

  When I press "hint-request-button"
  And I wait to see ".congrats"
  And I wait to see "#feedbackBlocks"

  Then element ".congrats" is visible
  And element ".congrats" has text "Try using one of the blocks below:"
  And element "#feedbackBlocks" is visible

  # the second time, we replace the two moveforwards (#10 and #11) with
  # a new for loop (#13)
  When I press "again-button"
  And I wait to see "#resetButton"
  And I press "resetButton"
  And I drag block "6" to block "8"
  And I drag block "10" to block "14" plus offset 35, 30
  And I drag block "9" to offset "-2000, 0"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You completed Bee."
  And element "#hint-request-button" does not exist
