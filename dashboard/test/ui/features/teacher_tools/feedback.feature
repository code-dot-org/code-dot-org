@as_student
Feature: Recommended/Required Blocks Feedback

Scenario: Solve without recommended blocks
  Given I am on "http://studio.code.org/s/allthethings/lessons/4/levels/5?noautoplay=true&blocklyVersion=google"
  And I wait for the lab page to fully load

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
  And I drag block "repeat" to block "whenRun"
  And I connect block "startBlock" inside block "repeat"
  And I delete block "extraBlock"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element ".congrats" is visible
  And element ".congrats" has text "Congratulations! You have completed the final puzzle."
  And element "#hint-request-button" does not exist
