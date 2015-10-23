Feature: Playing multi levels

Background:
  Given I am on "http://learn.code.org/s/course1/stage/2/puzzle/2?noautoplay=true"
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

# This scenario is marked no_mobile because the Browserstack iPhone6 emulator
# has trouble with the "there is no horizontal scrollbar" step every time.
#  It works fine on all other mobile browsers; should re-enable for mobile eventually.
@no_mobile
Scenario: Does not scroll horizontally
  Given I am on "http://learn.code.org/s/allthethings/stage/9/puzzle/2?noautoplay=true"
  When I rotate to landscape
  And element ".submitButton" is visible
  Then there is no horizontal scrollbar
