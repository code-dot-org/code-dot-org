@dashboard_db_access
Feature: Script overview page

  Scenario: Viewing student progress
    Given I create an authorized teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access

    # Make progress as student
    And I complete the level on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"

    # Verify progress as student on script overview page
    And I am on "http://studio.code.org/s/allthethings"
    And I wait until element "td:contains(Maze)" is visible
    And I wait until element ".teacher-panel" is not visible
    Then I verify progress for stage 2 level 1 is "perfect"
    Then I verify progress for stage 2 level 2 is "not_tried"
    And I sign out

    # Verify progress as teacher viewing student on script overview page
    When I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/s/allthethings"
    And I wait until element ".teacher-panel" is visible
    When I click selector ".teacher-panel table td:contains(Sally)" once I see it
    And I wait until element "td:contains(Maze)" is visible
    Then I verify progress for stage 2 level 1 is "perfect"
    Then I verify progress for stage 2 level 2 is "not_tried"
