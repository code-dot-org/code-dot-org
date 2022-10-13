Feature: Script overview page

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

  Scenario: Assigning to section
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/s/csp3-2019"
    When I click selector ".uitest-assign-button" once I see it
    And I wait to see ".uitest-unassign-button"
    # Make sure unassign button is in the right state when the page loads
    And I reload the page
    And I wait to see ".uitest-unassign-button"

  Scenario: Script overview contents
    Given I create a student named "Jean"
    And I am on "http://studio.code.org/s/allthethings"
    # make sure we are in summary view and the page has finished loading
    And I wait until element "td:contains(Maze)" is visible
    # verify name format in summary view
    And element "td:contains(2. Maze)" is visible

    And I click selector ".uitest-toggle-detail"
    And I wait until element "td:contains(Maze)" is not visible
    And I wait until element "span:contains(Maze)" is visible
    # verify name format in detail view
    And element "span:contains(Lesson 2: Maze)" is visible

    And I am on "http://studio.code.org/s/mc"
    And I wait until element "td:contains(Minecraft)" is visible
    # verify script name overrides lesson name when there is only one lesson
    And element "td:contains(1. Minecraft Hour of Code)" is visible

  Scenario: Script overview end-of-lesson
    Given I create a student named "Jean"
    # On last level of the lesson
    And I am on "http://studio.code.org/s/csp3-2019/lessons/3/levels/1"
    And I click selector ".submitButton"
    And I wait until element ".uitest-end-of-lesson-header:contains(You finished Lesson 3!)" is visible
    And I reload the page
    And  element ".uitest-end-of-lesson-header:contains(You finished Lesson 3!)" is not visible
