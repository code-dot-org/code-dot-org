@no_mobile
Feature: Using Modular Courses
  Background:
    Given I am on "http://studio.code.org/home"
    When I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"

  Scenario: Navigating within modular courses
    Given I create a teacher named "Teacher_Sally"
    And I sign in as "Teacher_Sally" and go home
    And I am on "http://studio.code.org/courses/ui-test-course-2017"
    And element ".uitest-CourseScript" contains text "UI Test Shared Unit"

    # Check that unit overview references the course we came from
    When I click the button in the unit card for unit "UI Test Shared Unit"
    And I wait until element ".unit-overview-top-row" is visible
    And I wait until current URL contains "/courses/ui-test-course-2017/units/"
    And I wait until element ".unit-breadcrumb" contains text "ui-test-course-2017"

     # Check that level references the course we came from
    Then I click "#progress-lesson-1 .progress-bubble-link" to load a new page
    And I wait until element "#level-body" is visible
    And I wait until current URL contains "/courses/ui-test-course-2017/units/"

    # Check that continuing keeps us in the same course
    When I click selector ".submitButton" to load a new page
    And I wait until element "#level-body" is visible
    And I wait until current URL contains "/courses/ui-test-course-2017/units/"

    # Check that I go to the correct unit overview from the progress tab
    And I wait to see ".header_popup_link"
    Then I open the progress drop down of the current page
    And I wait until element "a:contains(View Unit Overview)" is visible
    Then I click selector "a:contains(View Unit Overview)" to load a new page

    # Check that the unit breadcrumb works
    And I wait until element ".unit-overview-top-row" is visible
    And I wait until current URL contains "/courses/ui-test-course-2017/units/"
    Then I click selector ".unit-breadcrumb a" to load a new page

    Then I wait until element "#course_overview" is visible
    And check that I am on "http://studio.code.org/courses/ui-test-course-2017"

    # Check that this is also true for a different course with the same unit
    Given I am on "http://studio.code.org/courses/ui-test-course-2019"
    And element ".uitest-CourseScript" contains text "UI Test Shared Unit"

    # Check that unit overview references the course we came from
    When I click the button in the unit card for unit "UI Test Shared Unit"
    And I wait until element ".unit-overview-top-row" is visible
    And I wait until current URL contains "/courses/ui-test-course-2019/units/"
    And I wait until element ".unit-breadcrumb" contains text "ui-test-course-2019"

     # Check that level references the course we came from
    Then I click "#progress-lesson-1 .progress-bubble-link" to load a new page
    And I wait until element "#level-body" is visible
    And I wait until current URL contains "/courses/ui-test-course-2019/units/"

    # Check that continuing keeps us in the same course
    When I click selector ".submitButton" to load a new page
    And I wait until element "#level-body" is visible
    And I wait until current URL contains "/courses/ui-test-course-2019/units/"

    # Check that I go to the correct unit overview from the progress tab
    And I wait to see ".header_popup_link"
    Then I open the progress drop down of the current page
    And I wait until element "a:contains(View Unit Overview)" is visible
    Then I click selector "a:contains(View Unit Overview)" to load a new page

    # Check that the unit breadcrumb works
    And I wait until element ".unit-overview-top-row" is visible
    And I wait until current URL contains "/courses/ui-test-course-2019/units/"
    Then I click selector ".unit-breadcrumb a" to load a new page

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
    When I click selector ".submitButton" to load a new page

    When I sign out
    And I sign in as "Teacher_Sally" and go home

    And I navigate to the V2 progress dashboard for "Course 2017"
    And I wait until element "#ui-test-progress-table-v2" is visible
    And I wait until element "#unit-selector-v2" is visible
    # TODO: https://codedotorg.atlassian.net/browse/TEACH-2123 remove `*` from the option text
    And I select the "UI Test Shared Unit *" option in dropdown "unit-selector-v2"
    And I wait until element "#ui-test-lesson-header-1" is visible
    And I click selector "#ui-test-lesson-header-1"
    And I wait until element "#ui-test-expanded-progress-column-header-1" is visible
    And element "#ui-test-courses-ui-test-course-2017-units-3-lessons-1-levels-1-cell-data" is visible
    Then I see no difference for "modular course progress - first section"

    Then I select the "Course 2019" option in dropdown "uitest-sidebar-section-dropdown"
    And I wait until element "#ui-test-progress-table-v2" is visible
    And I wait until element "#unit-selector-v2" is visible
    # TODO: https://codedotorg.atlassian.net/browse/TEACH-2123 remove `*` from the option text
    And I select the "UI Test Shared Unit *" option in dropdown "unit-selector-v2"
    And I wait until element "#ui-test-lesson-header-1" is visible
    And I click selector "#ui-test-lesson-header-1"
    And I wait until element "#ui-test-expanded-progress-column-header-1" is visible
    And element "#ui-test-courses-ui-test-course-2019-units-3-lessons-1-levels-1-cell-data" is visible
    Then I see no difference for "modular course progress - second section"

    And I close my eyes
