@as_student
Feature: Big Game Remix

  Background:
    Given I am on "http://studio.code.org/s/allthethings/lessons/13/levels/6?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    Then element "#runButton" is visible

  @no_mobile
  Scenario: Big Game Remix
    Then I press the first ".project_remix" element to load a new page
    Then I wait until element ".project_updated_at" contains text "Saved"
    And check that the URL contains "http://studio.code.org/projects/algebra_game"
    Then I am on "http://studio.code.org/projects"
    And I wait until element ".ui-personal-projects-table" is visible
    And the first project in the table is named "Remix: Big Game Template"
