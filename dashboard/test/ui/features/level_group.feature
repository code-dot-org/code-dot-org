@no_mobile
@as_student
Feature: Level Group

Background:
  Given I am on "http://learn.code.org/s/allthethings/stage/22/puzzle/1?noautoplay=true"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

Scenario: Submit three answers.
  When element "#level_1 .multi-question" contains text "The standard QWERTY keyboard has"

  # First, submit answers to all three multis.
  And I press "#level_0 .answerbutton[index=2]" using jQuery
  And I press "#level_1 .answerbutton[index=1]" using jQuery

  # Pressing 1, 2, 0 should result in 2, 0 being selected.
  And I press "#level_2 .answerbutton[index=1]" using jQuery
  And I press "#level_2 .answerbutton[index=2]" using jQuery
  And I press "#level_2 .answerbutton[index=0]" using jQuery

  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"

  # Reload the page to see that same options are selected.
  And I reload the page
  And element "#level_0 #checked_2" is visible
  And element "#level_1 #checked_1" is visible
  And element "#level_2 #checked_2" is visible
  And element "#level_2 #checked_0" is visible
