Feature: Playing multi levels 3

  Scenario: Rendering in another language
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/9/levels/1/lang/es-MX"
    Then I wait to see ".submitButton"
    And element ".submitButton" is visible
    Then element ".multi h1" has "es-MX" text from key "data.dsls.K-1 Happy Maps Multi 1.title"

  Scenario: Does not scroll horizontally
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/9/levels/2?noautoplay=true"
    When element ".submitButton" is visible
    Then there is no horizontal scrollbar

  Scenario: Can render without a question
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/9/levels/4?noautoplay=true"
    When element ".submitButton" is visible
    Then element ".multi-question" is not visible

  Scenario: Standalone level without retries locks after answer is submitted
    Given I create a student named "Sally Student"
    And I sign in as "Sally Student"
    Given I am on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/9/levels/5/lang/en-US?noautoplay=true"
    When I rotate to landscape
    And element ".submitButton" is visible
    And element ".submitButton" is disabled
    When I press ".answerbutton[index=0]" using jQuery
    Then I press ".submitButton" using jQuery
    Then element ".modal .dialog-title" contains text "Incorrect answer"
    And I verify progress in the header of the current page is "perfect" for level 5
    And I press ".modal #ok-button" using jQuery
    Then element ".nextLevelButton" is visible
    And element "#cross_0" is visible
    And element ".answerbutton[index=0]" has class "lock-answers"
    When I reload the page
    Then element ".nextLevelButton" is visible
    And element ".submitButton" is not visible
    And element ".answerbutton[index=0]" has class "lock-answers"
    And element ".answerbutton[index=1]" has class "lock-answers"
    And element ".answerbutton[index=2]" has class "lock-answers"
    And element ".answerbutton[index=3]" has class "lock-answers"
