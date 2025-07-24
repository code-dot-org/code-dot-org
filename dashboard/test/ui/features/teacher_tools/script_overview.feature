# 2/13/23: Temporarily disabling in Safari because the 'When I switch tabs' step is failing after
# upgrading to Safari 14.
@no_safari
@no_mobile
Feature: Unit overview page

  @properties_encryption_key
  Scenario: Viewing student progress
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to course "allthethingscourse" unit 1 with teacher "Teacher_Sally"

    # Make progress as student
    And I complete the level on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/2/levels/1"

    # Verify progress as student on script overview page
    And I am on "http://studio.code.org/courses/allthethingscourse/units/1"
    And I wait until element "td:contains(Maze)" is visible
    And I wait until element ".teacher-panel" is not visible
    Then I verify progress for lesson 2 level 1 is "perfect"
    Then I verify progress for lesson 2 level 2 is "not_tried"
    And I sign out

    # Verify progress as teacher viewing themself and student on script overview page
    When I sign in as "Teacher_Sally"
    And I complete the level on "http://studio.code.org/courses/allthethingscourse/units/1/lessons/29/levels/4?level_name=2-3 Artist 1 new"
    And I am on "http://studio.code.org/courses/allthethingscourse/units/1"
    And I wait until element "#uitest-view-as-student-selector" is visible
    Then I verify progress for lesson 29 level 4 in detail view is "perfect"
    Then I select the "Sally" option in dropdown "uitest-view-as-student-selector"
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

  @properties_encryption_key
  Scenario: Unit overview contents
    Given I create a student named "Jean"
    And I am on "http://studio.code.org/courses/allthethingscourse/units/1"
    # make sure we are in summary view and the page has finished loading
    And I wait until element "td:contains(Maze)" is visible
    # verify name format in summary view
    And element "td:contains(2. Maze)" is visible

    And I click selector ".uitest-toggle-detail"
    And I wait until element "td:contains(Maze)" is not visible
    And I wait until element "span:contains(Maze)" is visible
    # verify name format in detail view
    And element "span:contains(Lesson 2: Maze)" is visible

    And I am on "http://studio.code.org/courses/mc/units/1"
    And I wait until element "td:contains(Minecraft)" is visible
    # verify script name overrides lesson name when there is only one lesson
    And element "td:contains(1. Minecraft Hour of Code)" is visible

  Scenario: Unit overview end-of-lesson
    Given I create a student named "Jean"
    # On last level of the lesson
    And I am on "http://studio.code.org/courses/csp-2025/units/1/lessons/7/levels/8"
    And I click selector ".submitButton"
    And I wait until I am on "http://studio.code.org/courses/csp-2025/units/1"
    And I wait for jquery to load
    And I wait until element ".uitest-end-of-lesson-header:contains(You finished Lesson 7!)" is visible
    And I reload the page
    And  element ".uitest-end-of-lesson-header:contains(You finished Lesson 7!)" is not visible

  Scenario: Unit overview new lesson plan
    Given I create an authorized teacher-associated student named "Blake"
    When I sign in as "Teacher_Blake"
    And I am on "http://studio.code.org/courses/allthelessonplans/units/1?no_redirect=true"
    And I click selector "#uitest-lesson-plan" once I see it
    When I switch tabs
    And I wait until current URL contains "/courses/allthelessonplans/units/1/lessons/1"

  Scenario: Unit overview student resources as teacher
    Given I create an authorized teacher-associated student named "Blake"
    When I sign in as "Teacher_Blake"
    And I am on "http://studio.code.org/courses/allthelessonplans/units/1?no_redirect=true"
    And I click selector "#uitest-student-resources" once I see it
    When I switch tabs
    And I wait until current URL contains "courses/allthelessonplans/units/1/lessons/1/student"

  Scenario: Unit overview student resources as student
    Given I create an authorized teacher-associated student named "Blake"
    When I sign in as "Blake"
    And I am on "http://studio.code.org/courses/allthelessonplans/units/1?no_redirect=true"
    And I click selector ".ui-test-lesson-resources" once I see it
    When I switch tabs
    And I wait until current URL contains "courses/allthelessonplans/units/1/lessons/1/student"

  Scenario: Unit overview for unit in single-unit course
    Given I create an authorized teacher-associated student named "Blake"
    When I sign in as "Teacher_Blake"
    And I am on "http://studio.code.org/courses/ui-test-single-unit-course-2025/units/1"
    Then I wait to see ".uitest-summary-progress-table"
    And I wait until I don't see selector ".unit-breadcrumb"
    And I wait until element "#assignment-version-year" contains text "2025"
    And I press "assignment-version-year"
    And I click selector ".assignment-version-title:contains(2026)" once I see it
    Then I get redirected to "/courses/ui-test-single-unit-course-2026/units/1" via "dashboard"
    And I wait until element "#assignment-version-year" contains text "2026"
    And I wait until I don't see selector ".unit-breadcrumb"
