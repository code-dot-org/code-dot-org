Feature: Playing multi levels 4

  Background:
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/10/levels/1?noautoplay=true"
    Then I wait for 3 seconds
    And I wait until element ".submitButton" is visible

  Scenario: Submitting an incorrect option
    And element ".submitButton:first" is disabled
    And element ".submitButton:last" is disabled
    And I press ".answerbutton[index=2]" using jQuery
    And element ".submitButton:first" is not disabled
    And element ".submitButton:last" is not disabled
    And I press ".answerbutton[index=3]" using jQuery
    And I press ".submitButton:last" using jQuery
    And I wait to see ".modal"
    And element ".modal .dialog-title" contains text "Incorrect answer"
    And I press ".modal #ok-button" using jQuery

  Scenario: Pressing three options unselects the oldest
    And element ".submitButton:first" is disabled
    And element ".submitButton:last" is disabled
    And I press ".answerbutton[index=2]" using jQuery
    And element ".submitButton:first" is not disabled
    And element ".submitButton:last" is not disabled
    And I press ".answerbutton[index=1]" using jQuery
    And I press ".answerbutton[index=0]" using jQuery
    And I press ".submitButton:first" using jQuery
    And I wait to see ".modal"

  Scenario: Pressing an option again toggles it
    And element ".submitButton:first" is disabled
    And element ".submitButton:last" is disabled
    And I press ".answerbutton[index=0]" using jQuery
    And element ".submitButton:first" is not disabled
    And element ".submitButton:last" is not disabled
    And element "#checked_0" is visible
    And I press ".answerbutton[index=0]" using jQuery
    And element "#checked_0" is hidden

