@no_mobile
Feature: Using Modular Courses
  Background:
    Given I am on "http://studio.code.org/home"
    Given I use a cookie to mock the DCDO key "teacher-local-nav-v2" as "true"

  Scenario: Navigating within modular courses
    Given I create a teacher named "Teacher_Sally"
    And I sign in as "Teacher_Sally" and go home
    And I am on "http://studio.code.org/courses/ui-test-course-2017"
    And element ".uitest-CourseScript" contains text "ui-test-shared-unit"

    # Check that unit overview references the course we came from
    When I click the button in the unit card for unit "ui-test-shared-unit"
    And I wait until element ".unit-overview-top-row" is visible
    And I wait until current URL contains "/courses/ui-test-course-2017/units/"
    And I wait until element ".unit-breadcrumb" contains text "ui-test-course-2017"

     # Check that level references the course we came from
    Then I click ".progress-bubble-link" to load a new page
    And I wait until element "#level-body" is visible
    And I wait until current URL contains "/courses/ui-test-course-2017/units/"

    # Check that the unit breadcrumb works
    Then I go back
    And I wait until element ".unit-overview-top-row" is visible
    And I wait until current URL contains "/courses/ui-test-course-2017/units/"
    Then I click selector ".unit-breadcrumb a"

    Then I wait until element "#course_overview" is visible
    And check that I am on "http://studio.code.org/courses/ui-test-course-2017"

    # Check that this is also true for a different course with the same unit
    Given I am on "http://studio.code.org/courses/ui-test-course-2019"
    And element ".uitest-CourseScript" contains text "ui-test-shared-unit"

    # Check that unit overview references the course we came from
    When I click the button in the unit card for unit "ui-test-shared-unit"
    And I wait until element ".unit-overview-top-row" is visible
    And I wait until current URL contains "/courses/ui-test-course-2019/units/"
    And I wait until element ".unit-breadcrumb" contains text "ui-test-course-2019"

     # Check that level references the course we came from
    Then I click ".progress-bubble-link" to load a new page
    And I wait until element "#level-body" is visible
    And I wait until current URL contains "/courses/ui-test-course-2019/units/"

    # Check that the unit breadcrumb works
    Then I go back
    And I wait until element ".unit-overview-top-row" is visible
    And I wait until current URL contains "/courses/ui-test-course-2019/units/"
    Then I click selector ".unit-breadcrumb a"

    Then I wait until element "#course_overview" is visible
    And check that I am on "http://studio.code.org/courses/ui-test-course-2019"


  @eyes
  Scenario: Progress is saved across modular courses
    When I open my eyes to test "modular courses - progress"
    Given I create an authorized teacher-associated student named "Sally"
    And I am assigned to course "ui-test-course-2017" with teacher "Teacher_Sally" in a section named "Course 2017"
    And I am assigned to course "ui-test-course-2019" with teacher "Teacher_Sally" in a section named "Course 2019"

    Given I sign in as "Sally" and go home
    When I am on "http://studio.code.org/courses/ui-test-course-2017/units/3/lessons/1/levels/1"
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
