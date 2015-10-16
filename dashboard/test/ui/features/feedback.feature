Feature: Recommended blocks feedback

Background:
  Given I am on "http://learn.code.org/"
  And I am a student

Scenario: Attempt Bee Conditions 4-5 Level 1
  Given I am on "http://learn.code.org/s/course3/stage/7/puzzle/1?noautoplay=true"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I close the dialog

  # the first time, we have to hit hint-request to see the hint
  When I press "runButton"
  And I wait to see "#hint-request-button"

  Then element "#hint-request-button" is visible

  When I press "hint-request-button"
  And I wait to see ".congrats"
  And I wait to see "#feedbackBlocks"

  Then element ".congrats" is visible
  And element ".congrats" has text "Try one or more of the blocks below to solve this puzzle."
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
  And element ".congrats" has text "Try one or more of the blocks below to solve this puzzle."
  And element "#feedbackBlocks" is visible

  # after we fulfill the requirements of the hint, we see a different
  # hint
  When I press "again-button"
  And I wait to see "#resetButton"
  And I press "resetButton"
  And I drag block "1" to block "8"
  And I wait to see "#runButton"
  And I press "runButton"
  And I wait to see "#hint-request-button"

  Then element "#hint-request-button" is visible

  When I press "hint-request-button"
  And I wait to see ".congrats"
  And I wait to see "#feedbackBlocks"

  Then element ".congrats" is visible
  And element ".congrats" has text "Try one or more of the blocks below to solve this puzzle."
  And element "#feedbackBlocks" is visible
