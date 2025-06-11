Feature: Playing multi2 levels

Background:
  Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/10/levels/1?noautoplay=true"
  Then I wait for 3 seconds
  And I wait until element ".submitButton" is visible

Scenario: Loading the level
  And element ".multi-question" has text "Which lines of code should be removed so the program will work as intended? Select two answers"

Scenario: Clicking an option enables submit but submitting only one answer gets a warning
  And element ".submitButton:first" is disabled
  And element ".submitButton:last" is disabled
  And I press ".answerbutton[index=0]" using jQuery
  And element ".submitButton:first" is not disabled
  And element ".submitButton:last" is not disabled
  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"
  And element ".modal .dialog-title" contains text "Too few answers."
  And I press ".modal #ok-button" using jQuery

Scenario: Clicking an option enables submit and submitting the correct answer (two checkboxes) wins
  And element ".submitButton:first" is disabled
  And element ".submitButton:last" is disabled
  And I press ".answerbutton[index=0]" using jQuery
  And element ".submitButton:first" is not disabled
  And element ".submitButton:last" is not disabled
  And I press ".answerbutton[index=1]" using jQuery
  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"
