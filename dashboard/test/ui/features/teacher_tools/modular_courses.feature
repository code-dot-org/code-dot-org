@no_mobile
Feature: Using Modular Courses
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"

  @eyes
  Scenario: Progress is saved across modular courses
    When I open my eyes to test "modular courses - progress"
    Given I create an authorized teacher-associated student named "Sally"
    And I am assigned to course "ui-test-course-2017" with teacher "Teacher_Sally" in a section named "Course 2017"
    And I am assigned to course "ui-test-course-2019" with teacher "Teacher_Sally" in a section named "Course 2019"

    Given I sign in as "Sally" and go home
    When I am on "http://studio.code.org/s/ui-test-shared-unit/lessons/1/levels/1"
    And I click "button[type='submit']" to load a new page

    When I sign out
    And I sign in as "Teacher_Sally" and go home

    And I click selector "a:contains(Course 2017)" once I see it to load a new page
    And I wait until element ".progress-table" is visible
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "ui-test-shared-unit" option in dropdown "uitest-course-dropdown"
    Then I see no difference for "modular course progress - first section"

    Then I select the "Course 2019" option in dropdown "uitest-sidebar-section-dropdown"
    And I wait until element ".progress-table" is visible
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "ui-test-shared-unit" option in dropdown "uitest-course-dropdown"
    Then I see no difference for "modular course progress - second section"

    And I close my eyes
