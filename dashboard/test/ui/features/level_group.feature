@no_mobile
@as_student
Feature: Level Group

Background:
  Given I am on "http://studio.code.org/s/allthethings/stage/33/puzzle/1?noautoplay=true"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

Scenario: Submit three answers.
  When element ".level-group-content:nth(1) .multi-question" contains text "The standard QWERTY keyboard has"

  # First, submit answers to all three multis.
  And I press ".level-group-content:nth(0) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(1) .answerbutton[index=1]" using jQuery

  # Pressing 1, 2, 0 should result in 2, 0 being selected.
  And I press ".level-group-content:nth(2) .answerbutton[index=1]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=2]" using jQuery
  And I press ".level-group-content:nth(2) .answerbutton[index=0]" using jQuery

  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"
  And I press ".modal #ok-button" using jQuery to load a new page

  # Go back to the page to see that same options are selected.
  Then I am on "http://studio.code.org/s/allthethings/stage/33/puzzle/1?noautoplay=true"
  And element ".level-group-content:nth(0) #checked_2" is visible
  And element ".level-group-content:nth(1) #checked_1" is visible
  And element ".level-group-content:nth(2) #checked_2" is visible
  And element ".level-group-content:nth(2) #checked_0" is visible
