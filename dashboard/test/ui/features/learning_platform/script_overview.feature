Feature: Script overview page

  Scenario: Viewing student progress
    Given I create an authorized teacher-associated student named "Sally"

    # Make progress as student
    And I complete the level on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"

    # Verify progress as student on script overview page
    And I am on "http://studio.code.org/s/allthethings"
    And I wait until element "td:contains(Maze)" is visible
    And I wait until element ".teacher-panel" is not visible
    And I wait for 2 seconds
    Then I verify progress for stage 2 level 1 is "perfect"
    Then I verify progress for stage 2 level 2 is "not_tried"
    And I sign out

    # Verify progress as teacher viewing themself and student on script overview page
    When I sign in as "Teacher_Sally"
    And I complete the level on "http://studio.code.org/s/allthethings/stage/29/puzzle/4?level_name=2-3 Artist 1 new"
    And I am on "http://studio.code.org/s/allthethings"
    And I wait until element ".teacher-panel" is visible
    Then I verify progress for stage 29 level 4 is "perfect"
    When I click selector ".teacher-panel table td:contains(Sally)" once I see it
    And I wait until element "td:contains(Maze)" is visible
    And I wait for 2 seconds
    Then I verify progress for stage 2 level 1 is "perfect"
    Then I verify progress for stage 2 level 2 is "not_tried"

    # Make sure we only see student progress, not teacher progress.
    Then I verify progress for stage 29 level 4 is "not_tried"

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
    # verify script name overrides stage name when there is only one stage
    And element "td:contains(1. Minecraft Hour of Code)" is visible
