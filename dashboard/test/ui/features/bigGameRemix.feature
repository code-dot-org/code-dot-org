@dashboard_db_access
@as_student
Feature: Big Game Remix

  Background:
    Given I am on "http://studio.code.org/s/allthethings/stage/13/puzzle/6?noautoplay=true"
    And I rotate to landscape
    Then I wait to see a dialog titled "Puzzle 6 of 11"
    And I close the dialog
    And element "#runButton" is visible

  @no_mobile
  Scenario: Big Game Remix
    Then I press the first ".project_remix" element
    And I wait for 5 seconds
    Then I wait until element ".project_updated_at" contains text "Saved"
    And check that the URL contains "http://learn.code.org/projects/algebra_game"
    Then I am on "http://learn.code.org/projects"
    And I wait until element ".projects td:eq(0)" contains text "Remix: Big Game Template"
