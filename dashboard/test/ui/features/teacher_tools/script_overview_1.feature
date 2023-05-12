# 2/13/23: Temporarily disabling in Safari because the 'When I switch tabs' step is failing after
# upgrading to Safari 14.
@no_safari
@no_mobile
Feature: Unit overview page 1

  Scenario: Viewing student progress
    Given I create an authorized teacher-associated student named "Sally"

    # Make progress as student
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"

    # Verify progress as student on script overview page
    And I am on "http://studio.code.org/s/allthethings"
    And I wait until element "td:contains(Maze)" is visible
    And I wait until element ".teacher-panel" is not visible
    Then I verify progress for lesson 2 level 1 is "perfect"
    Then I verify progress for lesson 2 level 2 is "not_tried"
    And I sign out

    # Verify progress as teacher viewing themself and student on script overview page
    When I sign in as "Teacher_Sally"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/29/levels/4?level_name=2-3 Artist 1 new"
    And I am on "http://studio.code.org/s/allthethings"
    And I wait until element ".teacher-panel" is visible
    Then I verify progress for lesson 29 level 4 in detail view is "perfect"
    When I click selector ".teacher-panel table td:contains(Sally)" once I see it
    And I wait until element "td:contains(Maze)" is visible
    # verify name format in summary view
    And element "td:contains(2. Maze)" is visible
    Then I verify progress for lesson 2 level 1 is "perfect"
    Then I verify progress for lesson 2 level 2 is "not_tried"
    # verify when teacher is viewing student, script overview page loads in summary view
    And I reload the page
    And I wait to see ".uitest-summary-progress-table"

    # Make sure we only see student progress, not teacher progress.
    Then I verify progress for lesson 29 level 4 is "not_tried"
