Feature: Playing multi levels

Scenario: Loading the level
  Given I am on "http://studio.code.org/courses/course1/units/1/lessons/2/levels/2?noautoplay=true"
  Then I wait to see ".submitButton"
  And element ".submitButton" is visible
  And element ".multi-question" has text "Which algorithm gets the Flurb to the flowers?"

Scenario: Clicking an option enables submit and submitting the correct answer wins
  Given I am on "http://studio.code.org/courses/course1/units/1/lessons/2/levels/2?noautoplay=true"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible
  And element ".submitButton:first" is disabled
  And element ".submitButton:last" is disabled
  And I press ".answerbutton[index=1]" using jQuery
  And element ".submitButton:first" is not disabled
  And element ".submitButton:last" is not disabled
  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"

Scenario: Submitting an incorrect option
  Given I am on "http://studio.code.org/courses/course1/units/1/lessons/2/levels/2/lang/en-US?noautoplay=true"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible
  And element ".submitButton:first" is disabled
  And element ".submitButton:last" is disabled
  And I press ".answerbutton[index=0]" using jQuery
  And element ".submitButton:first" is not disabled
  And element ".submitButton:last" is not disabled
  And I press ".submitButton:last" using jQuery
  And I wait to see ".modal"
  And element ".modal .dialog-title" contains text "Incorrect answer"
  And I press ".modal #ok-button" using jQuery
  And I wait until element "#cross_0" is visible
