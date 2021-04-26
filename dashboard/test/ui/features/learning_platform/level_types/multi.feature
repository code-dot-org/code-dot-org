Feature: Playing multi levels

Background:
  Given I am on "http://studio.code.org/s/course1/lessons/2/levels/2?noautoplay=true"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible

Scenario: Loading the level
  And element ".multi-question" has text "Which algorithm gets the Flurb to the flowers?"

Scenario: Clicking an option enables submit and submitting the correct answer wins
  And element ".submitButton:first" is disabled
  And element ".submitButton:last" is disabled
  And I press ".answerbutton[index=1]" using jQuery
  And element ".submitButton:first" is not disabled
  And element ".submitButton:last" is not disabled
  And I press ".submitButton:first" using jQuery
  And I wait to see ".modal"

Scenario: Submitting an incorrect option
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

Scenario: Rendering in another language
  Given I am on "http://studio.code.org/s/course1/lessons/2/levels/2/lang/es-MX"
  Then I rotate to landscape
  And I wait to see ".submitButton"
  And element ".submitButton" is visible
  Then element ".multi h1" has "es-MX" text from key "data.dsls.2-3 Algorithms Multi 1.title"

Scenario: Does not scroll horizontally
  Given I am on "http://studio.code.org/s/allthethings/lessons/9/levels/2?noautoplay=true"
  When I rotate to landscape
  And element ".submitButton" is visible
  Then there is no horizontal scrollbar

Scenario: Can render without a question
  Given I am on "http://studio.code.org/s/allthethings/lessons/9/levels/4?noautoplay=true"
  When I rotate to landscape
  And element ".submitButton" is visible
  Then element ".multi-question" is not visible
