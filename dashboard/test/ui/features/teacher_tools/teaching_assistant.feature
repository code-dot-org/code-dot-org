Feature: Teaching Assistant
  Scenario: Student in experiment can make progress on AI-enabled level
    Given I create a teacher-associated student named "AI Student"
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load
    And I verify progress in the header of the current page is "not_tried" for level 2

    When I ensure droplet is in text mode
    And I append text to droplet "// the quick brown fox jumped over the lazy dog.\n"
    And I click selector "#runButton"
    And I wait until element "#submitButton" is visible
    And I click selector "#submitButton"
    And I wait until element "#confirm-button" is visible
    And I click selector "#confirm-button" to load a new page
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load

    Then I verify progress in the header of the current page is "perfect_assessment" for level 2



