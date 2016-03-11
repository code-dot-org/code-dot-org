@dashboard_db_access
@as_student
Feature: Recommended/Required Blocks Feedback

Scenario: Attempt 2-3 Maze 1
  Given I am on "http://learn.code.org/s/allthethings/stage/2/puzzle/3?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog

  # the first time, we have to hit hint-request to see the hint
  When I press "runButton"
  And I wait to see "#hint-request-button"

  Then element ".congrats" is visible
  And element ".congrats" has text "Not quite. Try using a block you aren’t using yet."
  And element "#hint-request-button" is visible

  When I press "hint-request-button"
  And I wait to see ".congrats"
  And I wait to see "#feedbackBlocks"

  Then element ".congrats" is visible
  And element ".congrats" has text "Try using one of the blocks below:"
  And element "#feedbackBlocks" is visible

  # the second time, we see the hint right away
  When I press "again-button"
  And I wait to see "#resetButton"
  And I press "resetButton"
  And I wait to see "#runButton"
  And I press "runButton"
  And I wait to see ".congrats"
  And I wait to see "#feedbackBlocks"

  Then element ".congrats" is visible
  And element ".congrats" has text "Not quite. Try using a block you aren’t using yet."
  And element "#feedbackBlocks" is visible

  # after we fulfill the requirements of the hint, we see a generic failure
  # message
  When I press "again-button"
  And I wait to see "#resetButton"
  And I press "resetButton"
  And I drag block "1" to block "4"
  And I wait to see "#runButton"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element ".congrats" is visible
  And element ".congrats" has text "Keep coding! Something's not quite right yet."
  And element "#hint-request-button" does not exist
  And element "#feedbackBlocks" does not exist

  # after we have enough required blocks, we still see a generic failure message
  When I press "again-button"
  And I wait to see "#resetButton"
  And I press "resetButton"
  And I drag block "2" to block "7"
  And I drag block "1" to block "8"
  And I wait to see "#runButton"
  And I press "runButton"
  And I wait to see ".congrats"

  Then element ".congrats" is visible
  And element ".congrats" has text "Keep coding! Something's not quite right yet."
  And element "#hint-request-button" does not exist
  And element "#feedbackBlocks" does not exist

Scenario: Solve without recommended blocks
  Given I am on "http://learn.code.org/s/allthethings/stage/4/puzzle/5?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog

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
