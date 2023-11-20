Feature: Teaching Assistant
  Scenario: Student in experiment can make progress on AI-enabled level
    Given I create a teacher-associated student named "AI Student"
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/1"
    And I wait for the page to fully load




